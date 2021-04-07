from unittest.mock import patch

import pytest

from pyzkaccess import ZKAccess
from pyzkaccess.aux_input import AuxInput, AuxInputList
from pyzkaccess.device import ZK400, ZK200, ZK100, ZKDevice
from pyzkaccess.door import Door, DoorList
from pyzkaccess.enums import ControlOperation
from pyzkaccess.event import EventLog
from pyzkaccess.param import DeviceParameters
from pyzkaccess.reader import Reader, ReaderList
from pyzkaccess.relay import Relay, RelayList


class TestZKAccess:
    @pytest.fixture(autouse=True)
    def setup(self):
        zksdk_patcher = patch('pyzkaccess.sdk.ZKSDK', create=True)
        self.sdk_cls = zksdk_patcher.start()
        self.sdk = self.sdk_cls.return_value
        self.connstr = 'protocol=TCP,ipaddress=192.168.1.201,port=4370,timeout=4000,passwd='
        yield
        zksdk_patcher.stop()

    def test_init__if_no_autoconnect__should_initialize_default_attributes(self):
        obj = ZKAccess()

        assert obj.connstr is None
        assert obj.device_model == ZK400
        assert obj.sdk is self.sdk
        assert obj._device is None

    def test_init__if_no_autoconnect__should_initialize_default_event_log_attributes(self):
        obj = ZKAccess()

        assert type(obj._event_log) == EventLog
        assert obj._event_log._sdk is self.sdk
        assert obj._event_log.buffer_size == 4096
        assert obj._event_log.data.maxlen is None
        assert obj._event_log.only_filters == {}

    def test_init__should_call_sdk_with_given_dllpath(self):
        ZKAccess(connstr=self.connstr, dllpath='testdll')

        self.sdk_cls.assert_called_once_with('testdll')

    def test_init__if_device_model_is_passed__should_set_device_model_prop(self):
        obj = ZKAccess(device_model=ZK200)

        assert obj.device_model == ZK200

    def test_init__if_connstr_is_specified__should_automatically_connect(self):
        self.sdk.handle = None
        self.sdk.is_connected = False
        ZKAccess(connstr=self.connstr)

        self.sdk.connect.assert_called_once_with(self.connstr)

    def test_init__if_device_is_specified__should_automatically_connect(self):
        self.sdk.handle = None
        self.sdk.is_connected = False
        device = ZKDevice(mac='00:17:61:C8:EC:17',
                          ip='192.168.1.201',
                          serial_number='DGD9190019050335134',
                          model=ZK100,
                          version='AC Ver 4.3.4 Apr 28 2017')
        expect_connstr = 'protocol=TCP,ipaddress=192.168.1.201,port=4370,timeout=4000,passwd='

        _ = ZKAccess(device=device)

        self.sdk.connect.assert_called_once_with(expect_connstr)

    def test_init__if_device_is_specified__should_override_device_model(self):
        device = ZKDevice(mac='00:17:61:C8:EC:17',
                          ip='192.168.1.201',
                          serial_number='DGD9190019050335134',
                          model=ZK100,
                          version='AC Ver 4.3.4 Apr 28 2017')

        obj = ZKAccess(device=device, device_model=ZK200)

        assert obj.device_model == ZK200

    def test_init__if_both_connstr_and_device_are_specified__connstr_takes_precedence(self):
        self.sdk.handle = None
        self.sdk.is_connected = False
        device = ZKDevice(mac='00:17:61:C8:EC:17',
                          ip='192.168.1.201',
                          serial_number='DGD9190019050335134',
                          model=ZK100,
                          version='AC Ver 4.3.4 Apr 28 2017')
        connstr = 'protocol=TCP,ipaddress=10.0.0.23,port=4370,timeout=4000,passwd='

        _ = ZKAccess(device=device, connstr=connstr)

        self.sdk.connect.assert_called_once_with(connstr)

    @pytest.mark.parametrize('model,doors_count', ((ZK400, 4), (ZK200, 2), (ZK100, 1)))
    def test_doors_prop__should_return_object_sequence(self, model, doors_count):
        obj = ZKAccess(connstr=self.connstr, device_model=model)
        res = obj.doors

        assert len(res) == doors_count
        assert type(res) == DoorList
        assert all(type(x) == Door for x in res)
        assert all(obj.number == num for obj, num in zip(res, model.doors_def))

    @pytest.mark.parametrize('model,relay_count', ((ZK400, 8), (ZK200, 4), (ZK100, 2)))
    def test_relays_prop__should_return_object_sequence(self, model, relay_count):
        obj = ZKAccess(connstr=self.connstr, device_model=model)
        res = obj.relays

        assert len(res) == relay_count
        assert type(res) == RelayList
        assert all(type(x) == Relay for x in res)
        assert all(obj.number == num for obj, num in zip(res, model.relays_def))
        assert all(obj.group == group for obj, group in zip(res, model.groups_def))

    @pytest.mark.parametrize('model,readers_count', ((ZK400, 4), (ZK200, 2), (ZK100, 1)))
    def test_readers_prop__should_return_object_sequence(self, model, readers_count):
        obj = ZKAccess(connstr=self.connstr, device_model=model)
        res = obj.readers

        assert len(res) == readers_count
        assert type(res) == ReaderList
        assert all(type(x) == Reader for x in res)
        assert all(obj.number == num for obj, num in zip(res, model.readers_def))

    @pytest.mark.parametrize('model,aux_input_count', ((ZK400, 4), (ZK200, 2), (ZK100, 1)))
    def test_aux_inputs_prop__should_return_object_sequence(self, model, aux_input_count):
        obj = ZKAccess(connstr=self.connstr, device_model=model)
        res = obj.aux_inputs

        assert len(res) == aux_input_count
        assert type(res) == AuxInputList
        assert all(type(x) == AuxInput for x in res)
        assert all(obj.number == num for obj, num in zip(res, model.aux_inputs_def))

    def test_events_prop__should_return_event_log(self):
        obj = ZKAccess(connstr=self.connstr)
        res = obj.events

        assert res is obj._event_log
        assert res.only_filters == {}

    def test_parameters_prop__should_return_object_of_device_parameters(self):
        obj = ZKAccess(connstr=self.connstr, device_model=ZK200)
        res = obj.parameters

        assert type(res) == DeviceParameters
        assert res._sdk == self.sdk
        assert res.device_model == ZK200

    def test_device_prop__if_device_was_passed_to_init__should_return_it(self):
        device = ZKDevice(mac='00:17:61:C8:EC:17',
                          ip='192.168.1.201',
                          serial_number='DGD9190019050335134',
                          model=ZK100,
                          version='AC Ver 4.3.4 Apr 28 2017')
        obj = ZKAccess(device=device)

        res = obj.device

        assert res is device

    def test_device_prop__if_device_was_not_passed_to_init__should_return_new_object(self):
        def se(parameters, buffer_size):
            choices = {
                'IPAddress': '10.0.0.2',
                '~SerialNumber': 'test serial'
            }
            return {parameters[0]: choices[parameters[0]]}

        self.sdk.get_device_param.side_effect = se
        connstr = 'protocol=TCP,ipaddress=192.168.1.201,port=4370,timeout=4000,passwd='
        obj = ZKAccess(connstr=connstr, device_model=ZK200)

        res = obj.device

        assert obj._device is None
        assert type(res) == ZKDevice
        assert res.mac is None
        assert res.ip == '10.0.0.2'
        assert res.serial_number == 'test serial'
        assert res.model == ZK200
        assert res.version is None

    def test_device_prop__if_not_connected__should_raise_error(self):
        self.sdk.handle = None
        self.sdk.is_connected = False
        obj = ZKAccess()

        with pytest.raises(RuntimeError):
            _ = obj.device

    def test_dll_object_prop__should_return_sdk_dll_object(self):
        obj = ZKAccess(connstr=self.connstr)
        res = obj.dll_object

        assert res is self.sdk.dll

    def test_handle_prop__should_return_sdk_handle(self):
        obj = ZKAccess(connstr=self.connstr)
        res = obj.handle

        assert res is self.sdk.handle

    def test_search_devices__should_call_sdk_function(self):
        self.sdk.search_device.return_value = []

        _ = ZKAccess.search_devices('192.168.1.255')

        self.sdk.search_device.assert_called_once_with('192.168.1.255', 4096)

    def test_search_devices__should_return_list_of_found_device_objects(self):
        self.sdk.search_device.return_value = [
            'MAC=00:17:61:C8:EC:17,IP=192.168.1.201,SN=DGD9190019050335134,'
            'Device=C3-400,Ver=AC Ver 4.3.4 Apr 28 2017',
            'MAC=00:17:61:C8:EC:18,IP=192.168.1.202,SN=DGD9190019050335135,'
            'Device=C3-200,Ver=AC Ver 4.3.4 Apr 28 2017'
        ]
        expect = (
            ZKDevice(mac='00:17:61:C8:EC:17', ip='192.168.1.201',
                     serial_number='DGD9190019050335134', model=ZK400,
                     version='AC Ver 4.3.4 Apr 28 2017'),
            ZKDevice(mac='00:17:61:C8:EC:18', ip='192.168.1.202',
                     serial_number='DGD9190019050335135', model=ZK200,
                     version='AC Ver 4.3.4 Apr 28 2017'),
        )

        res = ZKAccess.search_devices('192.168.1.255')
        assert res == expect

    def test_connect__should_call_sdk_function(self):
        connstr = 'protocol=TCP,ipaddress=192.168.1.201,port=4370,timeout=4000,passwd='
        obj = ZKAccess()
        self.sdk.handle = None
        self.sdk.is_connected = False

        obj.connect(connstr)

        self.sdk.connect.assert_called_once_with(connstr)
        assert obj.connstr == connstr

    def test_connect__if_connected_and_trying_connect_with_same_connstr__should_do_nothing(self):
        obj = ZKAccess(connstr=self.connstr)
        obj.connect(self.connstr)

        self.sdk.connect.assert_not_called()
        assert obj.connstr == self.connstr

    def test_connect__if_connected_and_trying_connect_with_another_connstr__should_raise_error(
            self
    ):
        obj = ZKAccess(connstr=self.connstr)
        connstr2 = 'protocol=TCP,ipaddress=192.168.1.202,port=4370,timeout=4000,passwd='

        with pytest.raises(ValueError):
            obj.connect(connstr2)

    def test_disconnect__should_call_sdk_function(self):
        obj = ZKAccess(connstr=self.connstr)

        obj.disconnect()

        self.sdk.disconnect.assert_called_once_with()
        assert obj.connstr == self.connstr

    def test_restart__should_call_sdk_function(self):
        obj = ZKAccess(connstr=self.connstr)
        obj.restart()

        self.sdk.control_device.assert_called_once_with(ControlOperation.restart.value, 0, 0, 0, 0)
        assert obj.connstr == self.connstr

    def test_context_manager__should_return_self(self):
        obj = ZKAccess(connstr=self.connstr)
        with obj as ctx_obj:
            assert ctx_obj is obj

    def test_context_manager__should_disconnect_after_exit(self):
        obj = ZKAccess(connstr=self.connstr)

        with obj:
            pass

        self.sdk.disconnect.assert_called_once_with()
