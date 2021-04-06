URLS=[
"pyzkaccess/index.html",
"pyzkaccess/relay.html",
"pyzkaccess/sdk.html",
"pyzkaccess/common.html",
"pyzkaccess/reader.html",
"pyzkaccess/param.html",
"pyzkaccess/door.html",
"pyzkaccess/pyzkaccess.html",
"pyzkaccess/exceptions.html",
"pyzkaccess/aux_input.html",
"pyzkaccess/event.html",
"pyzkaccess/enums.html",
"pyzkaccess/ctypes.html",
"pyzkaccess/device.html"
];
INDEX=[
{
"ref":"pyzkaccess",
"url":0,
"doc":""
},
{
"ref":"pyzkaccess.relay",
"url":1,
"doc":""
},
{
"ref":"pyzkaccess.relay.Relay",
"url":1,
"doc":"Concrete relay"
},
{
"ref":"pyzkaccess.relay.Relay.switch_on",
"url":1,
"doc":"Switch on a relay for the given time. If a relay is already switched on then its timeout will be refreshed :param timeout: Timeout in seconds while relay will be enabled. Number between 0 and 255 :return:",
"func":1
},
{
"ref":"pyzkaccess.relay.RelayList",
"url":1,
"doc":"Collection of relay objects which is used to perform group operations over multiple relays"
},
{
"ref":"pyzkaccess.relay.RelayList.switch_on",
"url":1,
"doc":"Switch on all relays in set for a given time :param timeout: Timeout in seconds while relay will be enabled. Number between 0 and 255 :return:",
"func":1
},
{
"ref":"pyzkaccess.relay.RelayList.aux",
"url":1,
"doc":"Return relays only from aux group"
},
{
"ref":"pyzkaccess.relay.RelayList.lock",
"url":1,
"doc":"Return relays only from lock group"
},
{
"ref":"pyzkaccess.relay.RelayList.by_mask",
"url":1,
"doc":"Return only relays starting from 0 which are matched by given mask. E.g. for  mask=[1, 0, 0, 1, 0, 0, 1, 0] the function returns the 1st, the 4th and the 7th of 8 relays. If mask is longer than count of relays, the rest values will be ignored: for 5 relays  mask=[1, 0, 0, 1, 0, 0, 1, 0] will return the 1st and the 4th relays. If mask is shorter than count of relays then the rest relays will be ignored: for 8 relays  mask=[1, 0, 0] will return the 1st relay only. :param mask: mask is a list of ints or bools :return: new instance of RelayList contained needed relays",
"func":1
},
{
"ref":"pyzkaccess.sdk",
"url":2,
"doc":""
},
{
"ref":"pyzkaccess.sdk.ZKSDK",
"url":2,
"doc":"This is machinery class which directly calls SDK functions. This is a wrapper around DLL functions of SDK, it incapsulates working with ctypes, handles errors and holds connection info. :param dllpath: path to a DLL file. Typically \"plcommpro.dll\""
},
{
"ref":"pyzkaccess.sdk.ZKSDK.is_connected",
"url":2,
"doc":"Return True if connection is active"
},
{
"ref":"pyzkaccess.sdk.ZKSDK.connect",
"url":2,
"doc":"Connect to a device. SDK: Connect() :param connstr: connection string, see docs :raises ZKSDKError: :return:",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.disconnect",
"url":2,
"doc":"Disconnect from a device SDK: Disconnect() :return:",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.control_device",
"url":2,
"doc":"Perform an action on a device such as relay switching or reboot. For parameter meaning please see SDK docs. SDK: ControlDevice() :param operation: Number, operation id :param p1: Number, depends on operation id :param p2: Number, depends on operation id :param p3: Number, depends on operation id :param p4: Number, depends on operation id :param options_str: String, depends on operation id :raises ZKSDKError: :return: DLL function result code, 0 or positive number",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.get_rt_log",
"url":2,
"doc":"Retrieve unread realtime events from a device SDK: GetRTLog() :param buffer_size: size in bytes of buffer which is filled with contents :raises ZKSDKError: :return: event string lines",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.search_device",
"url":2,
"doc":"Perform network scan in order to collect available ZK devices SDK: SearchDevice() :param broadcast_address: network broadcast address :param buffer_size: size in bytes of buffer which is filled with contents :raises ZKSDKError: :return: device string lines",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.get_device_param",
"url":2,
"doc":"Fetch given device parameters SDK: GetDeviceParam() :param parameters: sequence with parameter names to be requested :param buffer_size: size in bytes of buffer which is filled with contents :raises ZKSDKError: :return: dict with requested parameters value. Each value is string",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.set_device_param",
"url":2,
"doc":"Set given device parameters SDK: SetDeviceParam() :param parameters: dict with parameter names and values to be set. Every value will be casted to string :raises ZKSDKError: :return:",
"func":1
},
{
"ref":"pyzkaccess.common",
"url":3,
"doc":""
},
{
"ref":"pyzkaccess.common.UserTuple",
"url":3,
"doc":"Immutable version of  collections.UserList from the stdlib"
},
{
"ref":"pyzkaccess.common.UserTuple.copy",
"url":3,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.common.UserTuple.count",
"url":3,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.common.UserTuple.index",
"url":3,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.common.DocDict",
"url":3,
"doc":"DocDict is dictionary, where values are annotated versions of keys. As initial value DocDict accepts a dictionary where dict key is an exposed value and dict value is docstring. >>> d = DocDict({1: 'Docstring 1', '2': 'Docstring 2'}) >>> print(repr(d[1]), repr(d['2'] 1 '2' >>> print(type(d[1]), type(d['2']   >>> print(d[1]  1) True >>> print(d['2']  '2') True >>> print(isinstance(d[1], int), isinstance(d['2'], str True True >>> print(d[1].__doc__, ',', d['2'].__doc__) Docstring 1 , Docstring 2"
},
{
"ref":"pyzkaccess.reader",
"url":4,
"doc":""
},
{
"ref":"pyzkaccess.reader.Reader",
"url":4,
"doc":"Concrete reader"
},
{
"ref":"pyzkaccess.reader.ReaderList",
"url":4,
"doc":"Collection of reader objects which is used to perform group operations over multiple readers"
},
{
"ref":"pyzkaccess.param",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode1",
"url":5,
"doc":"Daylight saving parameters used in mode1 setting (all parameters in one request). See  DLSTMode ,  DaylightSavingTime ,  StandardTime parameters in SDK docs"
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2",
"url":5,
"doc":"Daylight saving parameters used in mode2 setting (each parameter in a separate request). See  DLSTMode ,  WeekOfMonth parameters in SDK docs"
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2.month",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2.week_of_month",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2.day_of_week",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2.hour",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2.minute",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.param.BaseParameters",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.param.BaseParameters.buffer_size",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.param.DeviceParameters",
"url":5,
"doc":"Parameters related to the whole device"
},
{
"ref":"pyzkaccess.param.DeviceParameters.serial_number",
"url":5,
"doc":"Serial number of device (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.lock_count",
"url":5,
"doc":"Doors count (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.reader_count",
"url":5,
"doc":"Readers count (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.aux_in_count",
"url":5,
"doc":"Auxiliary inputs count (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.aux_out_count",
"url":5,
"doc":"Auxiliary output count (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.communication_password",
"url":5,
"doc":"Password to connect to a device. Maximum is 15 symbols (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.ip_address",
"url":5,
"doc":"Device IPv4 address (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.netmask",
"url":5,
"doc":"Subnet mask (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.gateway_ip_address",
"url":5,
"doc":"Gateway IPv4 address (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.rs232_baud_rate",
"url":5,
"doc":"RS232 baud rate (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.watchdog_enabled",
"url":5,
"doc":"MCU watchdog enabled (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.door4_to_door2",
"url":5,
"doc":"4 doors turn 2 doors (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.backup_hour",
"url":5,
"doc":"The time (hour) of backup SD card. Number 1 24 (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.reboot",
"url":5,
"doc":"Reboot a device, accepts only True value (write-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.reader_direction",
"url":5,
"doc":"One-way/Two-way reader (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.fingerprint_version",
"url":5,
"doc":"Device fingerprint identification version. Available values: 9, 10 (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.display_daylight_saving",
"url":5,
"doc":"Display parameters of daylight saving time (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.enable_daylight_saving",
"url":5,
"doc":"Enable time daylight saving (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.daylight_saving_mode",
"url":5,
"doc":"Daylight saving mode, available values 0 (mode 1), 1 (mode 2) (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.anti_passback_rule",
"url":5,
"doc":"Passback rule for doors. Possible values depend on device model. Passback is when the second door can be opened only after the first door has opened, not otherwise. Or a door can be opened only by its readers from one side."
},
{
"ref":"pyzkaccess.param.DeviceParameters.interlock",
"url":5,
"doc":"Interlock rule for doors. Possible values depend on device model. Interlock is when the second door can be opened only after the first door was opened and closed, and vice versa"
},
{
"ref":"pyzkaccess.param.DeviceParameters.spring_daylight_time_mode1",
"url":5,
"doc":"Spring forward daylight saving time (mode 1) (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.fall_daylight_time_mode1",
"url":5,
"doc":"Fall back daylight saving time (mode 1) (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.spring_daylight_time_mode2",
"url":5,
"doc":"Spring forward daylight saving time (mode 2) (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.fall_daylight_time_mode2",
"url":5,
"doc":"Fall back daylight saving time (mode 2) (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.datetime",
"url":5,
"doc":"Current datetime (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters",
"url":5,
"doc":"Parameters related to a concrete door"
},
{
"ref":"pyzkaccess.param.DoorParameters.duress_password",
"url":5,
"doc":"Duress password for door. Maximum length is 8 digits (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.emergency_password",
"url":5,
"doc":"Emergency password for door. Maximum length is 8 digits (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.lock_on_close",
"url":5,
"doc":"Lock on door closing (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.sensor_type",
"url":5,
"doc":"Lock on door closing (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.lock_driver_time",
"url":5,
"doc":"Lock driver time length. 0 - Normal closed, 1-254 - Door opening duration, 255 - Normal open (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.magnet_alarm_duration",
"url":5,
"doc":"Timeout alarm duration of door magnet (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.verify_mode",
"url":5,
"doc":"VerifyMode (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.multi_card_open",
"url":5,
"doc":"Open a door by several cards (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.first_card_open",
"url":5,
"doc":"Open a door by first card (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.active_time_tz",
"url":5,
"doc":"Active time segment for a door (0 - door is inactive) (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.open_time_tz",
"url":5,
"doc":"Normal-open time segment of door (0 - not set) (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.punch_interval",
"url":5,
"doc":"Punch interval in seconds (0 - no interval) (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.cancel_open_day",
"url":5,
"doc":"The date of Cancel Normal Open (read-write)"
},
{
"ref":"pyzkaccess.door",
"url":6,
"doc":""
},
{
"ref":"pyzkaccess.door.Door",
"url":6,
"doc":"Concrete door"
},
{
"ref":"pyzkaccess.door.Door.relays",
"url":6,
"doc":"Relays which belong to this door"
},
{
"ref":"pyzkaccess.door.Door.reader",
"url":6,
"doc":"Reader which belong to this door"
},
{
"ref":"pyzkaccess.door.Door.aux_input",
"url":6,
"doc":"Aux input which belong to this door"
},
{
"ref":"pyzkaccess.door.Door.parameters",
"url":6,
"doc":"Device parameters related to this door"
},
{
"ref":"pyzkaccess.door.DoorList",
"url":6,
"doc":"Collection of door objects which is used to perform group operations over multiple doors"
},
{
"ref":"pyzkaccess.door.DoorList.relays",
"url":6,
"doc":"Relays which belong to this doors"
},
{
"ref":"pyzkaccess.door.DoorList.readers",
"url":6,
"doc":"Readers which belong to this door"
},
{
"ref":"pyzkaccess.door.DoorList.aux_inputs",
"url":6,
"doc":"Aux inputs which belong to this door"
},
{
"ref":"pyzkaccess.pyzkaccess",
"url":7,
"doc":""
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess",
"url":7,
"doc":"Interface to a connected device :param connstr: Connection string. If given then we try to connect automatically to a device. Ex: 'protocol=TCP,ipaddress=192.168.1.201,port=4370,timeout=4000,passwd=' :param device: ZKDevice object to connect with. If given then we try to connect automatically to a device :param device_model: Device model. Default is C3-400 :param dllpath: Full path to plcommpro.dll :param log_capacity: Mixumum capacity of events log. By default size is not limited :raises ZKSDKError: On connection error"
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.buffer_size",
"url":7,
"doc":""
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.doors",
"url":7,
"doc":"Door object list, depends on device model. Door object incapsulates access to appropriate relays, reader, aux input, and also its events and parameters You can work with one object as with a slice. E.g. switch_on all relays of a door ( zk.doors[0].relays.switch_on(5) ) or of a slice ( zk.doors[:2].relays.switch_on(5) )"
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.relays",
"url":7,
"doc":"Relay object list, depends on device model You can work with one object as with a slice. E.g. switch on a single relay ( zk.relays[0].switch_on(5) ) or a slice ( zk.relays[:2].switch_on(5) )"
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.readers",
"url":7,
"doc":"Reader object list, depends on device model You can work with one object as with a slice. E.g. get events of single reader ( zk.readers[0].events ) or a slice ( zk.readers[:2].events )"
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.aux_inputs",
"url":7,
"doc":"Aux input object list, depends on device model You can work with one object as with a slice. E.g. get events of single input ( zk.aux_inputs[0].events ) or a slice ( zk.aux_inputs[:2].events )"
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.events",
"url":7,
"doc":"Device event log. This property returns all records pulled from a device. Keep in mind that log is not filled out automatically and should be refreshed periodically by hand using  refresh() method. This is because working with ZKAccess has request-response nature and cannot up a tunnel which may be used to feed events. But you can use  poll() method which awaits new events from a device and return them if any. Doors, inputs, readers have their own  events property. Those properties just filters the same event log instance and return entries related to requested object."
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.parameters",
"url":7,
"doc":"Parameters related to the whole device such as datetime, connection settings and so forth. Door-specific parameters are accesible by  doors property."
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.device",
"url":7,
"doc":"Current device object we connected with"
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.dll_object",
"url":7,
"doc":"DLL object ( ctypes.WinDLL ). Read only."
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.handle",
"url":7,
"doc":"Device handle.  None if there is no active connection. Read only."
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.search_devices",
"url":7,
"doc":"Classmethod which scans an Ethernet network with given broadcast address and returns all found ZK devices. Please keep in mind that process sends broadcast packets to perform a search which are not passed through routers. So you'll get results only for local network segment. The default broadcast address may not work in some cases, so it's better to specify your local network broadcast address. For example, if your ip is  192.168.22.123 and netmask is  255.255.255.0 or  /24 so address will be  192.168.22.255 . Returned objects can be used as  device= parameter in constructor. :param broadcast_address: your local segment broadcast address as string. Default is '255.255.255.255' :param dllpath: path to a PULL SDK DLL. Default: 'plcommpro.dll' :return: iterable of found ZKDevice",
"func":1
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.connect",
"url":7,
"doc":"Connect to a device using connection string, ex: 'protocol=TCP,ipaddress=192.168.1.201,port=4370,timeout=4000,passwd=' :param connstr: device connection string :return:",
"func":1
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.disconnect",
"url":7,
"doc":"Disconnect from a device",
"func":1
},
{
"ref":"pyzkaccess.pyzkaccess.ZKAccess.restart",
"url":7,
"doc":"Restart a device",
"func":1
},
{
"ref":"pyzkaccess.exceptions",
"url":8,
"doc":""
},
{
"ref":"pyzkaccess.exceptions.ZKSDKError",
"url":8,
"doc":"Error occured in PULL SDK function. Supports description of errors caused by PULL SDK and WINSOCK"
},
{
"ref":"pyzkaccess.aux_input",
"url":9,
"doc":""
},
{
"ref":"pyzkaccess.aux_input.AuxInput",
"url":9,
"doc":"Concrete auxiliary input"
},
{
"ref":"pyzkaccess.aux_input.AuxInputList",
"url":9,
"doc":"Collection of aux input objects which is used to perform group operations over multiple aux inputs"
},
{
"ref":"pyzkaccess.event",
"url":10,
"doc":""
},
{
"ref":"pyzkaccess.event.Event",
"url":10,
"doc":"One realtime event occured on the device Since the device returns event as string we need to parse it to the structured view. This class does this. :param s: Event string to be parsed."
},
{
"ref":"pyzkaccess.event.Event.description",
"url":10,
"doc":""
},
{
"ref":"pyzkaccess.event.Event.parse",
"url":10,
"doc":"Parse raw event string :param event_line: event string :return: parsed string parts of event string",
"func":1
},
{
"ref":"pyzkaccess.event.Event.card",
"url":10,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.door",
"url":10,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.entry_exit",
"url":10,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.event_type",
"url":10,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.pin",
"url":10,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.time",
"url":10,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.verify_mode",
"url":10,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.EventLog",
"url":10,
"doc":"Log of realtime events Keep in mind that log is not filled out automatically and should be refreshed periodically by hand using  refresh() method. This is because working with ZKAccess has request-response nature and cannot up a tunnel which may be used to feed events. But you can use  poll() method which awaits new events from a device and return them if any. Log is implemented at top of deque structure, so accessing by index and filtering could be slow."
},
{
"ref":"pyzkaccess.event.EventLog.refresh",
"url":10,
"doc":"Make a request to a device for new records and append to the end if any. :return: count of records which was added",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.after_time",
"url":10,
"doc":"Return events which was occured after given time :param after_time: datetime object to filter (included) :return:",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.before_time",
"url":10,
"doc":"Return events which was occured before given time :param before_time: datetime object to filter (excluded) :return:",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.between_time",
"url":10,
"doc":"Return events which was occured between two given time moments :param from_time: datetime object to filter (included) :param to_time: datetime object to filter (excluded) :return:",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.poll",
"url":10,
"doc":"Wait for new events by making periodically requests to a device. If events was appeared then return them. If no event was appeared until timeout was expired then return empty iterable. :param timeout: timeout in seconds. Default: 60 seconds :param polling_interval: interval to make a requests in seconds. Default: every 1 second :return: iterable with new events if any or empty iterable if timeout has expired",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.only",
"url":10,
"doc":"Return new EventLog instance with given filters applied. Kwargs names must be the same as Event slots. Event log returned by this method will contain entries in which attribute value is contained in appropriate filter (if any). Filters passed here will be ANDed during comparison. On repeatable call of only, given filters which was also set on previous call will be ORed, i.e. their values will be concatenated. In other words:  log.only(a=2, b=['x', 'y']) => filtering(entry.a  2 AND entry.b in ('x', 'y'   log.only(a=2, b=['x', 'y']).only(a=3, b=5, c=1) => filtering(entry.a in (2, 3) AND entry.b in ('x', 'y', 5) and entry.c  1) Ex:  new_log = log.only(door=1, event_type=221) :param filters: :return: new fitlered EventLog instance",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.clear",
"url":10,
"doc":"Clear log",
"func":1
},
{
"ref":"pyzkaccess.enums",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.ControlOperation",
"url":11,
"doc":"Device control operation. See  ControlOperation SDK func docs"
},
{
"ref":"pyzkaccess.enums.ControlOperation.output",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.ControlOperation.cancel_alarm",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.ControlOperation.restart",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.RelayGroup",
"url":11,
"doc":"Device relay group. There are either lock relays (door output) or aux relays (aux output)"
},
{
"ref":"pyzkaccess.enums.RelayGroup.lock",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.RelayGroup.aux",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.SensorType",
"url":11,
"doc":"Sensor type of door. See DoorXSensorType parameter in SDK docs"
},
{
"ref":"pyzkaccess.enums.SensorType.not_available",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.SensorType.normal_open",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.SensorType.normal_closed",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode",
"url":11,
"doc":"Which methods are used to authenticate user. See  DoorXVerifyType parameter in SDK docs"
},
{
"ref":"pyzkaccess.enums.VerifyMode.not_available",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.only_finger",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.only_password",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.only_card",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.card_or_finger",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.card_and_finger",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.card_and_password",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.others",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.PassageDirection",
"url":11,
"doc":"Whether a user was entered or exited via door See event format description in SDK docs"
},
{
"ref":"pyzkaccess.enums.PassageDirection.entry",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.PassageDirection.exit",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.enums.PassageDirection.none",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.ctypes",
"url":12,
"doc":"This module is intended to safety import Windows-specific features from  ctypes stdlib module on non-windows platform  they are replaced by mock objects. Despite the code which uses that features becomes partially unoperable in this case, we can import it and generate documentation for instance"
},
{
"ref":"pyzkaccess.device",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKModel",
"url":13,
"doc":"Base class for concrete ZK model Contains model-specific definitions"
},
{
"ref":"pyzkaccess.device.ZKModel.name",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKModel.relays",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKModel.relays_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKModel.groups_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKModel.readers_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKModel.doors_dev",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKModel.aux_inputs_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKModel.anti_passback_rules",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKModel.interlock_rules",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK100",
"url":13,
"doc":"ZKAccess C3-100"
},
{
"ref":"pyzkaccess.device.ZK100.name",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK100.relays",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK100.relays_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK100.groups_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK100.readers_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK100.doors_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK100.aux_inputs_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK100.anti_passback_rules",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK100.interlock_rules",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK200",
"url":13,
"doc":"ZKAccess C3-200"
},
{
"ref":"pyzkaccess.device.ZK200.name",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK200.relays",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK200.relays_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK200.groups_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK200.readers_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK200.doors_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK200.aux_inputs_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK200.anti_passback_rules",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK200.interlock_rules",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK400",
"url":13,
"doc":"ZKAccess C3-400 model"
},
{
"ref":"pyzkaccess.device.ZK400.name",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK400.relays",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK400.relays_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK400.groups_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK400.readers_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK400.doors_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK400.aux_inputs_def",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK400.anti_passback_rules",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK400.interlock_rules",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKDevice",
"url":13,
"doc":"Concrete ZK device info"
},
{
"ref":"pyzkaccess.device.ZKDevice.parse_tokens",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKDevice.available_models",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKDevice.parse",
"url":13,
"doc":"Parse and validate raw device string :param device_line: event string :return: dictionary where keys are slots and values are appropriate values extracted from string",
"func":1
},
{
"ref":"pyzkaccess.device.ZKDevice.ip",
"url":13,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.device.ZKDevice.mac",
"url":13,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.device.ZKDevice.model",
"url":13,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.device.ZKDevice.serial_number",
"url":13,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.device.ZKDevice.version",
"url":13,
"doc":"Return an attribute of instance, which is of type owner."
}
]