URLS=[
"pyzkaccess/index.html",
"pyzkaccess/relay.html",
"pyzkaccess/sdk.html",
"pyzkaccess/common.html",
"pyzkaccess/reader.html",
"pyzkaccess/cli.html",
"pyzkaccess/param.html",
"pyzkaccess/door.html",
"pyzkaccess/exceptions.html",
"pyzkaccess/ctypes_.html",
"pyzkaccess/aux_input.html",
"pyzkaccess/event.html",
"pyzkaccess/device_data/index.html",
"pyzkaccess/device_data/queryset.html",
"pyzkaccess/device_data/model.html",
"pyzkaccess/main.html",
"pyzkaccess/enums.html",
"pyzkaccess/tables.html",
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
"doc":"Switch on a relay for the given time. If a relay is already switched on then its timeout will be refreshed Args: timeout (int): Timeout in seconds while relay will be enabled. Number between 0 and 255 Returns: None",
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
"doc":"Switch on all relays in set for a given time Args: timeout (int): Timeout in seconds while relay will be enabled. Number between 0 and 255 Returns: None",
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
"doc":"Return only relays starting from 0 which are matched by given mask. E.g. for  mask=[1, 0, 0, 1, 0, 0, 1, 0] the function returns the 1st, the 4th and the 7th of 8 relays. If mask is longer than count of relays, the rest values will be ignored: for 5 relays  mask=[1, 0, 0, 1, 0, 0, 1, 0] will return the 1st and the 4th relays. If mask is shorter than count of relays then the rest relays will be ignored: for 8 relays  mask=[1, 0, 0] will return the 1st relay only. Args: mask (Iterable[Union[int, bool ): mask is a list of ints or bools Returns: RelayList: new instance of RelayList contained needed relays",
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
"doc":"This is machinery class which directly calls SDK functions. This is a wrapper around DLL functions of SDK, it incapsulates working with ctypes, handles errors and holds connection info. Args: dllpath (str): path to a DLL file. E.g. \"plcommpro.dll\""
},
{
"ref":"pyzkaccess.sdk.ZKSDK.is_connected",
"url":2,
"doc":"Return True if connection is active"
},
{
"ref":"pyzkaccess.sdk.ZKSDK.connect",
"url":2,
"doc":"Connect to a device. SDK: Connect() Args: connstr (str): connection string, see docs Returns: None Raises: ZKSDKError: return:",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.disconnect",
"url":2,
"doc":"Disconnect from a device SDK: Disconnect() Returns: None",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.control_device",
"url":2,
"doc":"Perform an action on a device such as relay switching or reboot. For parameter meaning please see SDK docs. SDK: ControlDevice() Args: operation (int): operation id p1 (int): Number, depends on operation id p2 (int): Number, depends on operation id p3 (int): Number, depends on operation id p4 (int): Number, depends on operation id options_str (str, optional): String, depends on operation id Returns: int: DLL function result code, 0 or positive number Raises: ZKSDKError: on SDK error",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.get_rt_log",
"url":2,
"doc":"Retrieve unread realtime events from a device SDK: GetRTLog() Args: buffer_size (int): size in bytes of buffer which is filled with contents Returns: Sequence[str]: event string lines Raises: ZKSDKError: on SDK error",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.search_device",
"url":2,
"doc":"Perform network scan in order to collect available ZK devices SDK: SearchDevice() Args: broadcast_address (str): network broadcast address buffer_size (int): size in bytes of buffer which is filled with contents Returns: Sequence[str]: device string lines Raises: ZKSDKError: on SDK error",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.get_device_param",
"url":2,
"doc":"Fetch given device parameters SDK: GetDeviceParam() Args: parameters (Sequence[str]): sequence with parameter names to be requested buffer_size (int): size in bytes of buffer which is filled with contents Returns: Mapping[str, str]: dict with requested parameters value. Each value is string Raises: ZKSDKError: on SDK error",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.set_device_param",
"url":2,
"doc":"Set given device parameters SDK: SetDeviceParam() Args: parameters (Mapping[str, Any]): dict with parameter names and values to be set. Every value will be casted to string Returns: None Raises: ZKSDKError: on SDK error",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.get_device_data",
"url":2,
"doc":"Retrieve records from a given data table SDK: GetDeviceData() Args: table_name (str): name of table to retrieve records from fields (Sequence[str]): list of fields to query. Empty sequence is treated as \"all fields\" filters (Mapping[str, str]): query conditions to apply buffer_size (int): size in bytes of buffer which is filled with contents new_records_only (bool, default=False): true means to consider only unread records in table, otherwise all records will be considered Yields: Mapping[str, str]: ordered dicts with table records Raises: ZKSDKError: on SDK error",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.set_device_data",
"url":2,
"doc":"Insert records to a given data table. Records are received through a generator. Example g = sdk.set_device_data('user') g.send(None)  Initialize generator for rec in records: g.send(rec) g.send(None)  Invoke sdk call SDK: SetDeviceData() Args: table_name (str): name of table to write data to Yields: Optional[Mapping[str, str : generator that accepts mappings with records via  .send() method.  .send(None) commits writing Raises: ZKSDKError: on SDK error",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.get_device_data_count",
"url":2,
"doc":"Return records count in a given data table SDK: GetDeviceDataCount() Args: table_name (str): name of table to get records count from Returns: int: count of records in table Raises: ZKSDKError: on SDK error",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.delete_device_data",
"url":2,
"doc":"Delete given records from a data table. Records are received through a generator. Example g = sdk.delete_device_data('user') g.send(None)  Initialize generator for rec in records: g.send(rec) g.send(None)  Invoke sdk call SDK: DeleteDeviceData() Args: table_name (str): name of table to delete data from Yields: Optional[Mapping[str, str : generator that accepts mappings with records via  .send() method.  .send(None) commits deleting Raises: ZKSDKError: on SDK error",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.get_device_file_data",
"url":2,
"doc":"Download file with given remote filename from a device SDK: GetDeviceFileData() Args: remote_filename: file name to download buffer_size: buffer size in bytes for incoming file data Returns: bytes: bytes with file data",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.set_device_file_data",
"url":2,
"doc":"Upload file with given remote filename to a device SDK: SetDeviceFileData() Args: remote_filename (str): file name to upload file_data (bytes): file data bytes size (int): data size in bytes to write Returns:",
"func":1
},
{
"ref":"pyzkaccess.sdk.ZKSDK.modify_ip_address",
"url":2,
"doc":"Change IP address on a device using broadcast method. For security reasons, network settings can only be changed on devices with no password. Args: protocol (str): protocol name to use mac_address (str): mac address of a device new_ip_address (str): new ip address that will be set on a device with given mac address broadcast_address (str): network broadcast address",
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
"ref":"pyzkaccess.common.ZKDatetimeUtils",
"url":3,
"doc":"Utility functions to work with date/time types in ZKAccess SDK. ZK devices has various ways to work with dates and time. In order to make working with dates more convenient in user's code, these functions converts standard python objects from datetime module into a specific format."
},
{
"ref":"pyzkaccess.common.ZKDatetimeUtils.zkctime_to_datetime",
"url":3,
"doc":"Convert ZK-specific ctime integer value to a datetime object. Simply put this ctime is a count of seconds starting from  2000-01-01 00:00:00 without considering leap years/seconds and days count in months (always 31 day) Args: zkctime (Union[str, int]): ZK ctime integer or string value Returns: datetime: converted datetime",
"func":1
},
{
"ref":"pyzkaccess.common.ZKDatetimeUtils.datetime_to_zkctime",
"url":3,
"doc":"Converts datetime object to a ZK-specific ctime value. Such type can be found in device parameters and data tables. Simply put this ctime is a count of seconds starting from  2000-01-01 00:00:00 without considering leap years/seconds and days count in months (always 31 day) Args: dt (datetime): datetime object to convert Returns: int: ZK ctime integer value",
"func":1
},
{
"ref":"pyzkaccess.common.ZKDatetimeUtils.time_string_to_datetime",
"url":3,
"doc":"Parses datetime string and return datetime object. Such value is used in events list. Datetime string has ISO date format. Args: dt_string (str): datetime string, e.g.  2021-04-15 21:21:00 Returns: datetime: converted datetime object",
"func":1
},
{
"ref":"pyzkaccess.common.ZKDatetimeUtils.zktimerange_to_times",
"url":3,
"doc":"Decode 4-byte time range into time objects couple. Such approach is used in Timezone table. Simply put, the higher 2 bytes are \"from\" part of range, the lower 2 bytes are \"to\" part. Time part is encoded as  (hour  100) + minutes . Args: zktr (Union[str, int]): encoded time range as integer or as number in string Returns: Tuple[time, time]: 2-tuple of from-tp time objects (without timezone)",
"func":1
},
{
"ref":"pyzkaccess.common.ZKDatetimeUtils.times_to_zktimerange",
"url":3,
"doc":"Encode time range in time/datetime objects into one 4-byte integer. Such approach is used in Timezone table. Simply put, the higher 2 bytes are \"from\" part of range, the lower 2 bytes are \"to\" part. Time part is encoded as  (hour  100) + minutes . Args: from_t (Union[datetime, time]): time/datetime \"from\" part of time range to_t (Union[datetime, time]): time/datetime \"to\" part of time range Returns: int: encoded 4-byte integer",
"func":1
},
{
"ref":"pyzkaccess.common.ZKDatetimeUtils.zkdate_to_date",
"url":3,
"doc":"Parse date string and return date object. Such format is used in User table. Date format is simple: 'YYYYMMDD' Args: zkd (str): date string Returns: Optional[date]: parsed date object",
"func":1
},
{
"ref":"pyzkaccess.common.ZKDatetimeUtils.date_to_zkdate",
"url":3,
"doc":"Make a date string from a given date/datetime object. Such format is used in User table. Date format is simple: 'YYYYMMDD' Args: d (Union[date, datetime]): date/datetime object Returns: str: date string",
"func":1
},
{
"ref":"pyzkaccess.common.ZKDatetimeUtils.zktimemoment_to_datetime",
"url":3,
"doc":"Decode 4-byte time annual time moment to a datetime with year and timezone ignored. Such approach is used in DaylightSavingTime, StandardTime parameters. Simply put, each byte represents time piece in order: month, day, hour, minute Args: zktm: (Union[str, int]): encoded annual time moment as integer or as number in string Returns: datetime: decoded datetime object",
"func":1
},
{
"ref":"pyzkaccess.common.ZKDatetimeUtils.datetime_to_zktimemoment",
"url":3,
"doc":"Encode time moment in datetime object into a 4-byte integer used in a device as annual time moment representation. Year and timezone will be ignored. Such approach is used in DaylightSavingTime, StandardTime parameters. Args: dt: datetime object Returns: int: encoded annual time moment",
"func":1
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
"ref":"pyzkaccess.cli",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.BaseFormatter",
"url":5,
"doc":"Base class for particular formatters"
},
{
"ref":"pyzkaccess.cli.BaseFormatter.WriterInterface",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.BaseFormatter.get_formatter",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.BaseFormatter.validate_headers",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.BaseFormatter.get_reader",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.BaseFormatter.get_writer",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.CSVFormatter",
"url":5,
"doc":"Formatter for comma-separated values format"
},
{
"ref":"pyzkaccess.cli.CSVFormatter.CSVWriter",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.CSVFormatter.get_reader",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.CSVFormatter.get_writer",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.ASCIITableFormatter",
"url":5,
"doc":"Base class for particular formatters"
},
{
"ref":"pyzkaccess.cli.ASCIITableFormatter.ASCIITableWriter",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.ASCIITableFormatter.get_writer",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.ASCIITableFormatter.get_reader",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.EventsPollFormatter",
"url":5,
"doc":"Formatter special for events.poll iterative function output for 'ascii_table' mode"
},
{
"ref":"pyzkaccess.cli.EventsPollFormatter.ASCIITableWriter",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.EventsPollFormatter.get_writer",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.BaseConverter",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.BaseConverter.read_records",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.BaseConverter.write_records",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.TextConverter",
"url":5,
"doc":"Converter which simply prints and reads text field values without any transformations"
},
{
"ref":"pyzkaccess.cli.TextConverter.read_records",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.TextConverter.write_records",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.TypedFieldConverter",
"url":5,
"doc":"Converter performs text input/output for field values of any non-string types. Convertion does based on given field-type mapping"
},
{
"ref":"pyzkaccess.cli.TypedFieldConverter.TUPLE_SEPARATOR",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.TypedFieldConverter.read_records",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.TypedFieldConverter.write_records",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.TypedFieldConverter.to_record_dict",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.TypedFieldConverter.to_string_dict",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.ModelConverter",
"url":5,
"doc":"Converter performs text input/output for a Model objects"
},
{
"ref":"pyzkaccess.cli.ModelConverter.TUPLE_SEPARATOR",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.ModelConverter.read_records",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.ModelConverter.write_records",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.ModelConverter.to_record_dict",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.ModelConverter.to_string_dict",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.cli.parse_array_index",
"url":5,
"doc":"Parse index/range cli parameter and return appropriate int or slice >>> assert parse_array_index(None)  slice(None, None, None) >>> assert parse_array_index(1)  int(1) >>> assert parse_array_index('1-2')  slice(1, 2, None) Args: opt_indexes(Union[int, str], optional): index or range Returns: Union[int, slice]: int or slice suitable for sequences indexing",
"func":1
},
{
"ref":"pyzkaccess.cli.Query",
"url":5,
"doc":"This command object helps to make read/write queries to a particular device data table. Some of usage examples: Select all records from the User table: $  . table User Select records from the User table with card=123456 AND group=4: $  . table User where  card=123456  group=4 Get table records count: $  . table User count Upsert records to the User table from stdin: $ cat records.csv |  . table User upsert Delete records, which come from stdin, from the User table: $ cat records.csv |  . table User delete Delete records from the User table with card=123456 AND group=4: $  . table User where  card=123456  group=4 delete_all"
},
{
"ref":"pyzkaccess.cli.Query.where",
"url":5,
"doc":"Add filtering by fields to a query. Filtering conditions are set by flags. Several conditions will be AND'ed. For example, select Users records with card=123456 AND group=4: $  . table User where  card=123456  group=4 Args: filters: flags are fields to do filtering by. Such filters are concatenated by AND. For example,   . where  field1=value1  field2=value2  . ",
"func":1
},
{
"ref":"pyzkaccess.cli.Query.unread",
"url":5,
"doc":"Add condition to print unread records only. Some tables on device has a pointer which is set to the last record on each query. If no records have been inserted to a table since last read, the \"unread\" query will return nothing For example, select only unread Users records with card=123456 $  . table User where  card=123456 unread",
"func":1
},
{
"ref":"pyzkaccess.cli.Query.upsert",
"url":5,
"doc":"Upsert (update or insert) operation. If given record already exists in a table, then it will be updated. Otherwise it will be inserted. Consumes input data from stdin/file. For example, upsert records to the User table from stdin: $ cat records.csv |  . table User upsert",
"func":1
},
{
"ref":"pyzkaccess.cli.Query.delete",
"url":5,
"doc":"Delete given records from a table. If given record does not exist in a table, then it is skipped. Consumes input data from stdin/file. For example, delete records, which come from stdin, from the User table: $ cat records.csv |  . table User delete",
"func":1
},
{
"ref":"pyzkaccess.cli.Query.delete_all",
"url":5,
"doc":"Delete records satisfied to a query. For example, Delete records from the User table with card=123456 AND group=4: $  . table User where  card=123456  group=4 delete_all Or delete all records from the User table: $  . table User delete_all",
"func":1
},
{
"ref":"pyzkaccess.cli.Query.count",
"url":5,
"doc":"Return records count in a table. Executes quickly since it is implemented by a separate device request. For example, get records count in the User table: $  . table User count",
"func":1
},
{
"ref":"pyzkaccess.cli.Doors",
"url":5,
"doc":"This group gives access to inputs and outputs related to a given door or doors"
},
{
"ref":"pyzkaccess.cli.Doors.select",
"url":5,
"doc":"Select doors to operate Args: indexes: Doors to select. You can select a single door by passing an index  select 1 . Or select a range by passing a list as  select 0-2 (doors 0, 1 and 2 will be selected). Indexes are started from 0.",
"func":1
},
{
"ref":"pyzkaccess.cli.Doors.relays",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.Doors.readers",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.Doors.aux_inputs",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.Doors.parameters",
"url":5,
"doc":"Parameters related to a current door. Valid only if a single door was requested"
},
{
"ref":"pyzkaccess.cli.Doors.events",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.Relays",
"url":5,
"doc":"This group provides actions to do with a given relay or relays"
},
{
"ref":"pyzkaccess.cli.Relays.select",
"url":5,
"doc":"Select relays to operate Args: indexes: Relays to select. You can select a single relay by passing an index  select 1 . Or select a range by passing a list as  select 0-2 (relays 0, 1 and 2 will be selected). Indexes are started from 0.",
"func":1
},
{
"ref":"pyzkaccess.cli.Relays.switch_on",
"url":5,
"doc":"Switch on a relay for given time. Args: timeout: Timeout in seconds in which a relay(s) will be switched on. Default is 5 seconds",
"func":1
},
{
"ref":"pyzkaccess.cli.Readers",
"url":5,
"doc":"This group represents a given reader or readers"
},
{
"ref":"pyzkaccess.cli.Readers.select",
"url":5,
"doc":"Select doors to operate Args: indexes: Readers to select. You can select a single reader by passing an index  select 1 . Or select a range by passing a list as  select 0-2 (readers 0, 1 and 2 will be selected). Indexes are started from 0.",
"func":1
},
{
"ref":"pyzkaccess.cli.Readers.events",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.AuxInputs",
"url":5,
"doc":"This group represents a given aux input or inputs"
},
{
"ref":"pyzkaccess.cli.AuxInputs.select",
"url":5,
"doc":"Select doors to operate Args: indexes: Aux input to select. You can select a single aux input by passing an index  select 1 . Or select a range by passing a list as  select 0-2 (aux inputs 0, 1 and 2 will be selected). Indexes are started from 0.",
"func":1
},
{
"ref":"pyzkaccess.cli.AuxInputs.events",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.Events",
"url":5,
"doc":"This group is intended for working with event log"
},
{
"ref":"pyzkaccess.cli.Events.poll",
"url":5,
"doc":"Wait for an event to be appeared on a device and prints them if any. If no events has been appeared during timeout, then exit by timeout. Filters that has been set are also matter. Args: timeout: Time in seconds the command waits events to appear and then finishes if no events has been appeared. Default is 60 seconds first_only: If this flag is set then the command will exit after the first event has came",
"func":1
},
{
"ref":"pyzkaccess.cli.Events.only",
"url":5,
"doc":"Add filtering by field value to an event log For example, select events with card=123456 AND event_type=221: $  . events only  card=123456  event_type=221 Args: filters: flags are fields to do filtering by. Such filters are concatenated by AND. For example,   . only  field1=value1  field2=value2  . ",
"func":1
},
{
"ref":"pyzkaccess.cli.Parameters",
"url":5,
"doc":"This group helps to get and set device and door parameters Some of usage examples: List all door parameter names: $  . doors  numbers=1 parameters list List all device parameter names: $  . parameters list Get all device parameters with values: $  . parameters Get particular device parameters with values (could be faster than requesting all ones): $  . parameters  names=datetime,ip_address,serial_number Set device parameters: $  . parameters set  datetime=\"2021-05-08 00:04:00\"  ip_address=\"192.168.128.1\" Args: names: Comma-separated list of parameter names to request from a device. If omitted, then all parameters will be requested. For example,  names=param1,param2,param3"
},
{
"ref":"pyzkaccess.cli.Parameters.list",
"url":5,
"doc":"List of all valid parameter names",
"func":1
},
{
"ref":"pyzkaccess.cli.Parameters.set",
"url":5,
"doc":"Set given parameters Args: parameters: Flags are parameters with values to be set. For example,   . parameters set  param1=value1  param2=value2  . ",
"func":1
},
{
"ref":"pyzkaccess.cli.ZKCommand",
"url":5,
"doc":""
},
{
"ref":"pyzkaccess.cli.ZKCommand.table",
"url":5,
"doc":"Make a query to a device table with given name Args: name: table name. Possible values are: 'User', 'UserAuthorize', 'Holiday', 'Timezone', 'Transaction', 'FirstCard', 'MultiCard', 'InOutFun', 'TemplateV10'",
"func":1
},
{
"ref":"pyzkaccess.cli.ZKCommand.read_raw",
"url":5,
"doc":"Return raw data from a given table. ZKAccess device keeps table values as strings, many of these fields are encoded (some date fields, for instance). This command returns data as it stores on a device, without applying any type convertions or decoding, like  table command does. This command works on low level. So, it accepts buffer size for storing a result. If you are observed that results are cut, its makes sense to increase buffer size. Args: name: table name. Possible values are: 'User', 'UserAuthorize', 'Holiday', 'Timezone', 'Transaction', 'FirstCard', 'MultiCard', 'InOutFun', 'TemplateV10' buffer_size: buffer size in bytes to store a result. Default is 32Kb",
"func":1
},
{
"ref":"pyzkaccess.cli.ZKCommand.write_raw",
"url":5,
"doc":"Write raw data to a given table. ZKAccess device keeps table values as strings, many of these fields are encoded (some date fields, for instance). This command expects input data as it stores on a device, without applying any type convertions or decoding (like  table command does). Args: name: table name. Possible values are: 'User', 'UserAuthorize', 'Holiday', 'Timezone', 'Transaction', 'FirstCard', 'MultiCard', 'InOutFun', 'TemplateV10'",
"func":1
},
{
"ref":"pyzkaccess.cli.ZKCommand.upload_file",
"url":5,
"doc":"Upload data to a file with given name on a device. By default, this command reads data from stdin, use   file cli option to set a file Args: remote_filename: name of file on a device to write",
"func":1
},
{
"ref":"pyzkaccess.cli.ZKCommand.download_file",
"url":5,
"doc":"Download a file with given name from a device. By default, this command prints data to stdin, use   file cli option to set a file Args: remote_filename: name of file on a device to download",
"func":1
},
{
"ref":"pyzkaccess.cli.ZKCommand.cancel_alarm",
"url":5,
"doc":"Move a device from alarm mode to normal mode. Returns nothing",
"func":1
},
{
"ref":"pyzkaccess.cli.ZKCommand.doors",
"url":5,
"doc":"Select doors to operate. This command gives access to operate with relays, reader and aux input related to selected doors. By default, all doors are selected. Doors count depends on a device model."
},
{
"ref":"pyzkaccess.cli.ZKCommand.relays",
"url":5,
"doc":"Select relays to operate. By default, all relays are seleted. Relays count depends on a device model."
},
{
"ref":"pyzkaccess.cli.ZKCommand.readers",
"url":5,
"doc":"Select readers to operate. By default, all readers are seleted. Readers count depends on a device model."
},
{
"ref":"pyzkaccess.cli.ZKCommand.aux_inputs",
"url":5,
"doc":"Aux inputs to operate. By default, all aux inputs are seleted. Aux inputs count depends on a device model."
},
{
"ref":"pyzkaccess.cli.ZKCommand.events",
"url":5,
"doc":"Events on a device."
},
{
"ref":"pyzkaccess.cli.ZKCommand.parameters",
"url":5,
"doc":"Device parameters. They does not include door parameters that are available via  doors command."
},
{
"ref":"pyzkaccess.cli.ZKCommand.restart",
"url":5,
"doc":"Restart a device.",
"func":1
},
{
"ref":"pyzkaccess.cli.CLI",
"url":5,
"doc":"PyZKAccess command-line interface Typical CLI usage: Commands for a connected device: $ pyzkaccess connect   [parameters] [ [parameters] .] Commands not related to a particular device: $ pyzkaccess  [parameters] Every command, group and subcommand has its own help contents, just type them and append   help at the end. For example, getting help for  connect command: $ pyzkaccess connect  help Or for  where subcommand of  table subcommand: $ pyzkaccess connect 192.168.1.201 table User where  help Args: format: format for input/output. Possible values are: ascii_table, csv. Default is ascii_table. file: read and write to/from this file instead of stdin/stdout dllpath: path to PULL SDK dll file. Default is just \"plcommpro.dll\""
},
{
"ref":"pyzkaccess.cli.CLI.connect",
"url":5,
"doc":"Connect to a device with given ip. Args: ip (str): IP address of a device model (DeviceModels): device model. Possible values are: ZK100, ZK200, ZK400",
"func":1
},
{
"ref":"pyzkaccess.cli.CLI.search_devices",
"url":5,
"doc":"Search devices online by scanning an IP local network with given broadcast address Args: broadcast_address: Address for broadcast IP packets. Default: 255.255.255.255",
"func":1
},
{
"ref":"pyzkaccess.cli.CLI.change_ip",
"url":5,
"doc":"Classmethod that changes IP address on a device without making a connection to it  by sending broadcast packets to the given broadcast address. For security reasons, network settings can be changed by this command on devices with no password only. Args: mac_address: MAC address of a device new_ip: new IP address to be set on a device broadcast_address: broadcast network address to send broadcast packets to",
"func":1
},
{
"ref":"pyzkaccess.cli.main",
"url":5,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.param",
"url":6,
"doc":""
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode1",
"url":6,
"doc":"Daylight saving parameters used in mode1 setting (all parameters in one request). See  DLSTMode ,  DaylightSavingTime ,  StandardTime parameters in SDK docs"
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode1.to_datetime",
"url":6,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode1.from_datetime",
"url":6,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2",
"url":6,
"doc":"Daylight saving parameters used in mode2 setting (each parameter in a separate request). See  DLSTMode ,  WeekOfMonth parameters in SDK docs"
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2.month",
"url":6,
"doc":""
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2.week_of_month",
"url":6,
"doc":""
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2.day_of_week",
"url":6,
"doc":""
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2.hour",
"url":6,
"doc":""
},
{
"ref":"pyzkaccess.param.DaylightSavingMomentMode2.minute",
"url":6,
"doc":""
},
{
"ref":"pyzkaccess.param.BaseParameters",
"url":6,
"doc":""
},
{
"ref":"pyzkaccess.param.BaseParameters.buffer_size",
"url":6,
"doc":"Size in bytes of c-string buffer which is used to accept text data from PULL SDK functions"
},
{
"ref":"pyzkaccess.param.DeviceParameters",
"url":6,
"doc":""
},
{
"ref":"pyzkaccess.param.DeviceParameters.serial_number",
"url":6,
"doc":"Serial number of device (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.lock_count",
"url":6,
"doc":"Doors count (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.reader_count",
"url":6,
"doc":"Readers count (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.aux_in_count",
"url":6,
"doc":"Auxiliary inputs count (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.aux_out_count",
"url":6,
"doc":"Auxiliary output count (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.communication_password",
"url":6,
"doc":"Password to connect to a device. Maximum is 15 symbols (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.ip_address",
"url":6,
"doc":"Device IPv4 address (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.netmask",
"url":6,
"doc":"Subnet mask (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.gateway_ip_address",
"url":6,
"doc":"Gateway IPv4 address (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.rs232_baud_rate",
"url":6,
"doc":"RS232 baud rate (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.watchdog_enabled",
"url":6,
"doc":"MCU watchdog enabled (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.door4_to_door2",
"url":6,
"doc":"4 doors turn 2 doors (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.backup_hour",
"url":6,
"doc":"The time (hour) of backup SD card. Number 1 24 (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.reboot",
"url":6,
"doc":"Reboot a device, accepts only True value (write-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.reader_direction",
"url":6,
"doc":"One-way/Two-way reader (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.display_daylight_saving",
"url":6,
"doc":"Display parameters of daylight saving time (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.enable_daylight_saving",
"url":6,
"doc":"Enable time daylight saving (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.daylight_saving_mode",
"url":6,
"doc":"Daylight saving mode, available values 0 (mode 1), 1 (mode 2) (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.fingerprint_version",
"url":6,
"doc":"Device fingerprint identification version. Available values: 9, 10 (read-only)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.anti_passback_rule",
"url":6,
"doc":"Passback rule for doors. Possible values depend on device model. Passback is when the second door can be opened only after the first door has opened, not otherwise. Or a door can be opened only by its readers from one side. See  __doc__ value attribute to get a value meaning, ex rule = zk.parameters.anti_passback_rule print(rule, 'means', rule.__doc__)  Prints \"0 means Anti-passback disabled\""
},
{
"ref":"pyzkaccess.param.DeviceParameters.interlock",
"url":6,
"doc":"Interlock rule for doors. Possible values depend on device model. Interlock is when the second door can be opened only after the first door was opened and closed, and vice versa See  __doc__ value attribute to get a value meaning, ex rule = zk.parameters.anti_passback_rule print(rule, 'means', rule.__doc__)  Prints \"0 means Anti-passback disabled\""
},
{
"ref":"pyzkaccess.param.DeviceParameters.spring_daylight_time_mode1",
"url":6,
"doc":"Spring forward daylight saving time (mode 1) (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.fall_daylight_time_mode1",
"url":6,
"doc":"Fall back daylight saving time (mode 1) (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.spring_daylight_time_mode2",
"url":6,
"doc":"Spring forward daylight saving time (mode 2) (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.fall_daylight_time_mode2",
"url":6,
"doc":"Fall back daylight saving time (mode 2) (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.datetime",
"url":6,
"doc":"Current datetime (read-write)"
},
{
"ref":"pyzkaccess.param.DeviceParameters.buffer_size",
"url":6,
"doc":"Size in bytes of c-string buffer which is used to accept text data from PULL SDK functions"
},
{
"ref":"pyzkaccess.param.DoorParameters",
"url":6,
"doc":"Parameters related to a concrete door"
},
{
"ref":"pyzkaccess.param.DoorParameters.duress_password",
"url":6,
"doc":"Duress password for door. Maximum length is 8 digits (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.emergency_password",
"url":6,
"doc":"Emergency password for door. Maximum length is 8 digits (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.lock_on_close",
"url":6,
"doc":"Lock on door closing (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.sensor_type",
"url":6,
"doc":"Lock on door closing (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.lock_driver_time",
"url":6,
"doc":"Lock driver time length. 0 - Normal closed, 1-254 - Door opening duration, 255 - Normal open (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.magnet_alarm_duration",
"url":6,
"doc":"Timeout alarm duration of door magnet (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.verify_mode",
"url":6,
"doc":"VerifyMode (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.multi_card_open",
"url":6,
"doc":"Open a door by several cards (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.first_card_open",
"url":6,
"doc":"Open a door by first card (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.active_time_tz",
"url":6,
"doc":"Active time segment for a door (0 - door is inactive) (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.open_time_tz",
"url":6,
"doc":"Normal-open time segment of door (0 - not set) (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.punch_interval",
"url":6,
"doc":"Punch interval in seconds (0 - no interval) (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.cancel_open_day",
"url":6,
"doc":"The date of Cancel Normal Open (read-write)"
},
{
"ref":"pyzkaccess.param.DoorParameters.buffer_size",
"url":6,
"doc":"Size in bytes of c-string buffer which is used to accept text data from PULL SDK functions"
},
{
"ref":"pyzkaccess.door",
"url":7,
"doc":""
},
{
"ref":"pyzkaccess.door.Door",
"url":7,
"doc":"Concrete door"
},
{
"ref":"pyzkaccess.door.Door.relays",
"url":7,
"doc":"Relays which belong to this door"
},
{
"ref":"pyzkaccess.door.Door.reader",
"url":7,
"doc":"Reader which belong to this door"
},
{
"ref":"pyzkaccess.door.Door.aux_input",
"url":7,
"doc":"Aux input which belong to this door"
},
{
"ref":"pyzkaccess.door.Door.parameters",
"url":7,
"doc":"Device parameters related to this door"
},
{
"ref":"pyzkaccess.door.DoorList",
"url":7,
"doc":"Collection of door objects which is used to perform group operations over multiple doors"
},
{
"ref":"pyzkaccess.door.DoorList.relays",
"url":7,
"doc":"Relays which belong to this doors"
},
{
"ref":"pyzkaccess.door.DoorList.readers",
"url":7,
"doc":"Readers which belong to this door"
},
{
"ref":"pyzkaccess.door.DoorList.aux_inputs",
"url":7,
"doc":"Aux inputs which belong to this door"
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
"ref":"pyzkaccess.ctypes_",
"url":9,
"doc":"This module is intended to safety import Windows-specific features from  ctypes stdlib module on non-windows platform  they are replaced by mock objects. Despite the code which uses that features becomes partially unoperable in this case, we can import it and generate documentation for instance"
},
{
"ref":"pyzkaccess.aux_input",
"url":10,
"doc":""
},
{
"ref":"pyzkaccess.aux_input.AuxInput",
"url":10,
"doc":"Concrete auxiliary input"
},
{
"ref":"pyzkaccess.aux_input.AuxInputList",
"url":10,
"doc":"Collection of aux input objects which is used to perform group operations over multiple aux inputs"
},
{
"ref":"pyzkaccess.event",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.event.Event",
"url":11,
"doc":"One realtime event occured on the device Since the device returns event as string we need to parse it to the structured view. This class does this. Args: s (str): Event string to be parsed."
},
{
"ref":"pyzkaccess.event.Event.description",
"url":11,
"doc":""
},
{
"ref":"pyzkaccess.event.Event.parse",
"url":11,
"doc":"Parse raw event string Args: event_line (str): event string to parse Returns: Sequence[str]: parsed string parts of event string",
"func":1
},
{
"ref":"pyzkaccess.event.Event.card",
"url":11,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.door",
"url":11,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.entry_exit",
"url":11,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.event_type",
"url":11,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.pin",
"url":11,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.time",
"url":11,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.Event.verify_mode",
"url":11,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.event.EventLog",
"url":11,
"doc":"Log of realtime events Keep in mind that log is not filled out automatically and should be refreshed periodically by hand using  refresh() method. This is because working with ZKAccess has request-response nature and cannot up a tunnel which may be used to feed events. But you can use  poll() method which awaits new events from a device and return them if any. Log is implemented at top of deque structure, so accessing by index and filtering could be slow."
},
{
"ref":"pyzkaccess.event.EventLog.refresh",
"url":11,
"doc":"Make a request to a device for new records and append to the end if any. Args: Returns: int: count of records which was added",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.after_time",
"url":11,
"doc":"Return events which was occured after given time Args: after_time (datetime): datetime object to filter (included) Returns: Iterable[Event]: events",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.before_time",
"url":11,
"doc":"Return events which was occured before given time Args: before_time (datetime): datetime object to filter (excluded) Returns: Iterable[Event]: events",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.between_time",
"url":11,
"doc":"Return events which was occured between two given time moments Args: from_time (datetime): datetime object to filter (included) to_time (datetime): datetime object to filter (excluded) Returns: Iterable[Event]: events",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.poll",
"url":11,
"doc":"Wait for new events by making periodically requests to a device. If events was appeared then return them. If no event was appeared until timeout was expired then return empty iterable. Args: timeout (float, default=60): timeout in seconds polling_interval (float, default=1): interval to make a requests in seconds Returns: Iterable[Event]: events iterable with new events if any or empty iterable if timeout has expired",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.only",
"url":11,
"doc":"Return new EventLog instance with given filters applied. Kwargs names must be the same as Event slots. Event log returned by this method will contain entries in which attribute value is contained in appropriate filter (if any). Filters passed here will be ANDed during comparison. On repeatable call of only, given filters which was also set on previous call will be ORed, i.e. their values will be concatenated. In other words  filtering(entry.a  2 AND entry.b in ('x', 'y' log.only(a=2, b=['x', 'y'])  filtering(entry.a in (2, 3) AND entry.b in ('x', 'y', 5) and entry.c  1) log.only(a=2, b=['x', 'y']).only(a=3, b=5, c=1) Example new_log = log.only(door=1, event_type=221) Args:  filters (Union[str, Sequence[str ): filter values or list of them Returns: EventLog: new fitlered EventLog instance",
"func":1
},
{
"ref":"pyzkaccess.event.EventLog.clear",
"url":11,
"doc":"Clear log",
"func":1
},
{
"ref":"pyzkaccess.device_data",
"url":12,
"doc":""
},
{
"ref":"pyzkaccess.device_data.queryset",
"url":13,
"doc":""
},
{
"ref":"pyzkaccess.device_data.queryset.QuerySet",
"url":13,
"doc":"Interface to perform queries to data tables, iterate over results and insert/delete records in tables QuerySet using \"fluent interface\" in most of its methods. Many ORMs use this approach, so working with tables and records may look familiar. Example records = zk.table('User').where(card='123456').only_fields('card', 'password').unread() for record in records: print(record.password) For table and fields you can use either objects or their names. For example, the following code has the same meaning as the previous one from zkaccess.tables import User records = zk.table(User).where(card='123456').only_fields(User.card, User.password).unread() for record in records: print(record.password) Also QuerySet can do upsert/delete operations Args: sdk (ZKSDK): ZKSDK object table (Type[Model]): model class buffer_size (int, optional): size of c-string buffer to keep query results from a device. If omitted, then buffer size will be guessed automatically"
},
{
"ref":"pyzkaccess.device_data.queryset.QuerySet.only_fields",
"url":13,
"doc":"Query given fields only from a table. Arguments can be field instances or their names Example zk.table(Table1).only_fields('field1', Table1.field2) Args:  fields (Union[Field, str]): fields to select Returns: QuerySet: new  QuerySet object with conditions",
"func":1
},
{
"ref":"pyzkaccess.device_data.queryset.QuerySet.where",
"url":13,
"doc":"Return a new QuerySet instance with given fields filters. If current QuerySet already has some filters with the same fields as given, they will be rewritten with new values. Only \"equal\" compare operation is available. In example below filters will be  card  '111' AND super_authorize  False  zk.table('User').where(card='123456').where(card='111', super_authorize=False) Args:  kwargs (Mapping[str, Any]): field conditions Returns: QuerySet: new QuerySet object with conditions",
"func":1
},
{
"ref":"pyzkaccess.device_data.queryset.QuerySet.unread",
"url":13,
"doc":"Return only unread records instead of all. Some tables on device has a pointer which is set to the last record on each query. If no records have been inserted to a table since last read, the \"unread\" query will return nothing Args: Returns: QuerySet: new QuerySet object with conditions",
"func":1
},
{
"ref":"pyzkaccess.device_data.queryset.QuerySet.upsert",
"url":13,
"doc":"Update/insert given records (or upsert) to a table. Every table on a device has primary key. Typically, it is \"pin\" field. Upsert means that when you try to upsert a record with primary key field which does not contain in table, then this record will be inserted. Otherwise it will be updated. Examples zk.table(User).upsert({'pin': '0', 'card': '123456'}) zk.table(User).upsert([{'pin': '0', 'card': '123456'}, {'pin': '1', 'card': '654321'}]) zk.table(User).upsert(User(pin='0', card='123456' zk.table(User).upsert([User(pin='0', card='123456'), User(pin='1', card='654321')]) Args: records (Union[Iterable[_ModelArgT], _ModelArgT]): record dict, Model instance or a sequence of those Returns: None",
"func":1
},
{
"ref":"pyzkaccess.device_data.queryset.QuerySet.delete",
"url":13,
"doc":"Delete given records from a table. Every table on a device has primary key. Typically, it is \"pin\" field. Deletion of record is performed by a field which is primary key for this table. Other fields seems are ignored. Examples zk.table(User).delete({'pin': '0', 'card': '123456'}) zk.table(User).delete([{'pin': '0', 'card': '123456'}, {'pin': '1', 'card': '654321'}]) zk.table(User).delete(User(pin='0', card='123456' zk.table(User).delete([User(pin='0', card='123456'), User(pin='1', card='654321')]) Args: records (Union[Sequence[_ModelArgT], _ModelArgT]): record dict, Model instance or a sequence of those Returns: None",
"func":1
},
{
"ref":"pyzkaccess.device_data.queryset.QuerySet.delete_all",
"url":13,
"doc":"Make a query to a table using this QuerySet and delete all matched records. Query in example below deletes records with  password='123'  zk.table('User').where(password='123').delete_all() Args: Returns: None",
"func":1
},
{
"ref":"pyzkaccess.device_data.queryset.QuerySet.count",
"url":13,
"doc":"Return just a number of records in table without considering filters. Unlike len(qs) this method does not fetch data, but makes simple request, like  SELECT COUNT( ) in SQL. Args: Returns: int: data table size",
"func":1
},
{
"ref":"pyzkaccess.device_data.queryset.QuerySet.copy",
"url":13,
"doc":"Return a copy of current QuerySet with empty cache",
"func":1
},
{
"ref":"pyzkaccess.device_data.queryset.QuerySet.ModelIterator",
"url":13,
"doc":"Iterator for iterating over QuerySet results"
},
{
"ref":"pyzkaccess.device_data.model",
"url":14,
"doc":""
},
{
"ref":"pyzkaccess.device_data.model.Field",
"url":14,
"doc":"This class is used to define a field in Model. The property it assignes to will be used to access to an appropriate table field. In other words it provides object access to that field. Every field in device tables stores as a string, but some of them have a certain data format which could be represented with python types. Also some of them may have value restrictions. All of these parameters may be specified in Field definition as data type, convertion and validation callbacks. By default a field is treated as string with no restrictions. On getting a field value from Model record, the process is: 1. Retrieve raw field value of  raw_name . If nothing then just return None 2. If  get_cb is set then call it and use its result as value 3. If value is not instance of  field_datatype then try to cast it to this type 4. Return value as field value On setting a field value in Model record, the process is: 1. Check if value has  field_datatype type, raise an error if not 2. If  validation_cb is set then call it, if result is false then raise an error 3. Extract Enum value if value is Enum 4. If  set_cb is set then call it and use its result as value 5. Write  str(value) to raw field value of  raw_name Args: raw_name (str): field name in device table which this field associated to field_datatype (Type): type of data of this field.  str by default get_cb (Callable str], Any], optional): callback that is called on field get before a raw string value will be converted to  field_datatype set_cb (Callable Any], Any], optional): callback that is called on field set after value will be checked against  field_datatype and validated by  validation_cb validation_cb (Callable FieldDataT], bool], optional): this is a callback that is called on field set after value will be checked against  field_datatype . If returns false then validation will be failed"
},
{
"ref":"pyzkaccess.device_data.model.Field.raw_name",
"url":14,
"doc":"Raw field name in device table which this field associated to"
},
{
"ref":"pyzkaccess.device_data.model.Field.field_datatype",
"url":14,
"doc":"Field data type"
},
{
"ref":"pyzkaccess.device_data.model.Field.to_raw_value",
"url":14,
"doc":"Convert value of  field_datatype to a raw string value. This function typically calls on field set. Checks incoming value against  field_datatype , validates it using  validation_cb (if any) and converts it using  set_cb (if any). Args: value (Any): value of  field_datatype Returns: str: raw value string representation",
"func":1
},
{
"ref":"pyzkaccess.device_data.model.Field.to_field_value",
"url":14,
"doc":"Convert raw string value to a value of  field_datatype . This function typically calls on field get. Converts incoming value using  get_cb (if any). If type of value after that is not an instance of  field_datatype , then tries to cast value to  field_datatype (if specified). Args: value (str): raw string representation Returns: value of  field_datatype ",
"func":1
},
{
"ref":"pyzkaccess.device_data.model.ModelMeta",
"url":14,
"doc":"type(object_or_name, bases, dict) type(object) -> the object's type type(name, bases, dict) -> a new type"
},
{
"ref":"pyzkaccess.device_data.model.Model",
"url":14,
"doc":"Base class for models that represent device data tables. A concrete model contains device table name and field definitions. Also it provides interface to access to these fields in a concrete row and to manipulate that row. Accepts initial fields data in kwargs"
},
{
"ref":"pyzkaccess.device_data.model.Model.table_name",
"url":14,
"doc":"Raw table name on device"
},
{
"ref":"pyzkaccess.device_data.model.Model.dict",
"url":14,
"doc":""
},
{
"ref":"pyzkaccess.device_data.model.Model.raw_data",
"url":14,
"doc":"Return the raw data that we read from or write to a device"
},
{
"ref":"pyzkaccess.device_data.model.Model.fields_mapping",
"url":14,
"doc":"Mapping between model fields and their raw fields",
"func":1
},
{
"ref":"pyzkaccess.device_data.model.Model.delete",
"url":14,
"doc":"Delete this record from a table",
"func":1
},
{
"ref":"pyzkaccess.device_data.model.Model.save",
"url":14,
"doc":"Save changes in this record",
"func":1
},
{
"ref":"pyzkaccess.device_data.model.Model.with_raw_data",
"url":14,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.device_data.model.Model.with_sdk",
"url":14,
"doc":"",
"func":1
},
{
"ref":"pyzkaccess.device_data.model.Model.with_zk",
"url":14,
"doc":"Bind current object with ZKAccess connection Args: zk (ZKAccess): ZKAccess object Returns: Model: self",
"func":1
},
{
"ref":"pyzkaccess.main",
"url":15,
"doc":""
},
{
"ref":"pyzkaccess.main.ZKAccess",
"url":15,
"doc":"Interface to a connected ZKAccess device Args: connstr (str, optional): Connection string. If given then we try to connect automatically to a device. Ex: 'protocol=TCP,ipaddress=192.168.1.201,port=4370,timeout=4000,passwd=' device (ZKDevice, optional): ZKDevice object to connect to. If given then we try to connect automatically to a device device_model (Type[ZKModel], default=ZK400): Device model. dllpath (str, default=plcommpro.dll): Full path to plcommpro.dll log_capacity (int, optional): Mixumum capacity of events log. By default size is not limited Raises: ZKSDKError: On connection error"
},
{
"ref":"pyzkaccess.main.ZKAccess.buffer_size",
"url":15,
"doc":"Size in bytes of c-string buffer which is used to accept text data from PULL SDK functions"
},
{
"ref":"pyzkaccess.main.ZKAccess.query_buffer_size",
"url":15,
"doc":"Size in bytes of c-string buffer for result of query to data tables. If None then size will be guessed automatically"
},
{
"ref":"pyzkaccess.main.ZKAccess.queryset_class",
"url":15,
"doc":"Interface to perform queries to data tables, iterate over results and insert/delete records in tables QuerySet using \"fluent interface\" in most of its methods. Many ORMs use this approach, so working with tables and records may look familiar. Example records = zk.table('User').where(card='123456').only_fields('card', 'password').unread() for record in records: print(record.password) For table and fields you can use either objects or their names. For example, the following code has the same meaning as the previous one from zkaccess.tables import User records = zk.table(User).where(card='123456').only_fields(User.card, User.password).unread() for record in records: print(record.password) Also QuerySet can do upsert/delete operations"
},
{
"ref":"pyzkaccess.main.ZKAccess.table",
"url":15,
"doc":"Return a QuerySet object for a given table Args: table (Union[Type[Model], str]): data table name or Model object/class Returns: QuerySet: new empty QuerySet object binded with a given table",
"func":1
},
{
"ref":"pyzkaccess.main.ZKAccess.upload_file",
"url":15,
"doc":"Upload a file with given name to a device Args: remote_filename (str): filename to upload data (BinaryIO): file data binary stream",
"func":1
},
{
"ref":"pyzkaccess.main.ZKAccess.download_file",
"url":15,
"doc":"Download file with given name from a device. Args: remote_filename (str): filename to download from a device buffer_size (int, optional): size of buffer for downloading file data. If omitted, then it will be guessed automatically Returns: BinaryIO: file data binary stream",
"func":1
},
{
"ref":"pyzkaccess.main.ZKAccess.cancel_alarm",
"url":15,
"doc":"Move a device from alarm state to a normal state",
"func":1
},
{
"ref":"pyzkaccess.main.ZKAccess.doors",
"url":15,
"doc":"Door object list, depends on device model. Door object incapsulates access to appropriate relays, reader, aux input, and also its events and parameters You can work with one object as with a slice. E.g. switch_on all relays of a door zk.doors[0].relays.switch_on(5) or a slice zk.doors[:2].relays.switch_on(5) Returns: DoorList: list of all doors"
},
{
"ref":"pyzkaccess.main.ZKAccess.relays",
"url":15,
"doc":"Relay object list, depends on device model You can work with one object as with a slice. E.g. switch on a single relay zk.relays[0].switch_on(5) or a slice zk.relays[:2].switch_on(5) Returns: RelayList: list of all relays"
},
{
"ref":"pyzkaccess.main.ZKAccess.readers",
"url":15,
"doc":"Reader object list, depends on device model You can work with one object as with a slice. E.g. get events of single reader zk.readers[0].events or a slice zk.readers[:2].events Returns: ReaderList: list of all readers"
},
{
"ref":"pyzkaccess.main.ZKAccess.aux_inputs",
"url":15,
"doc":"Aux input object list, depends on device model You can work with one object as with a slice. E.g. get events of single input zk.aux_inputs[0].events or a slice zk.aux_inputs[:2].events Returns: AuxInputList: list of all aux inputs"
},
{
"ref":"pyzkaccess.main.ZKAccess.events",
"url":15,
"doc":"Device event log. This property returns all records pulled from a device. Keep in mind that log is not filled out automatically and should be refreshed periodically by hand using  refresh() method. This is because working with ZKAccess has request-response nature and cannot up a tunnel which may be used to feed events. But you can use  poll() method which awaits new events from a device and return them if any. Doors, inputs, readers have their own  events property. Those properties just filters the same event log instance and return entries related to requested object. Returns: EventLog: unfiltered event log object"
},
{
"ref":"pyzkaccess.main.ZKAccess.parameters",
"url":15,
"doc":"Parameters related to the whole device such as datetime, connection settings and so forth. Door-specific parameters are accesible by  doors property. Returns: DeviceParameters: parameters object"
},
{
"ref":"pyzkaccess.main.ZKAccess.device",
"url":15,
"doc":"Current device object we connected with"
},
{
"ref":"pyzkaccess.main.ZKAccess.dll_object",
"url":15,
"doc":"DLL object ( ctypes.WinDLL ). Read only."
},
{
"ref":"pyzkaccess.main.ZKAccess.handle",
"url":15,
"doc":"Device handle.  None if there is no active connection. Read only."
},
{
"ref":"pyzkaccess.main.ZKAccess.search_devices",
"url":15,
"doc":"Classmethod which scans an Ethernet network with given broadcast address and returns all found ZK devices. Please keep in mind that process sends broadcast packets to perform a search which are not passed through routers. So you'll get results only for local network segment. The default broadcast address may not work in some cases, so it's better to specify your local network broadcast address. For example, if your ip is  192.168.22.123 and netmask is  255.255.255.0 or  /24 so address will be  192.168.22.255 . Returned objects can be used as  device= parameter in constructor. Args: broadcast_address (str, default=255.255.255.255): your local segment broadcast address as string dllpath (str, default=plcommpro.dll): path to a PULL SDK DLL Returns: Sequence[ZKDevice]: iterable with found devices",
"func":1
},
{
"ref":"pyzkaccess.main.ZKAccess.change_ip",
"url":15,
"doc":"Classmethod that changes IP address on a device by sending broadcast packets to the given broadcast address. For security reasons, network settings can only be changed on devices with no password. The default broadcast address may not work in some cases, so it's better to specify your local network broadcast address. For example, if your ip is  192.168.22.123 and netmask is  255.255.255.0 or  /24 so address will be  192.168.22.255 . Args: mac_address (str): MAC address of a device new_ip_address (str): new IP address to be set on a device broadcast_address (str, default=255.255.255.255): broadcast network address protocol (ChangeIPProtocol, default=ChangeIPProtocol.udp): a protocol to use for sending broadcast packets dllpath (str, default=plcommpro.dll): path to a PULL SDK DLL Returns: bool: True if operation was successful",
"func":1
},
{
"ref":"pyzkaccess.main.ZKAccess.connect",
"url":15,
"doc":"Connect to a device using connection string, ex: 'protocol=TCP,ipaddress=192.168.1.201,port=4370,timeout=4000,passwd=' Args: connstr (str): device connection string Returns: None",
"func":1
},
{
"ref":"pyzkaccess.main.ZKAccess.disconnect",
"url":15,
"doc":"Disconnect from a device",
"func":1
},
{
"ref":"pyzkaccess.main.ZKAccess.restart",
"url":15,
"doc":"Restart a device",
"func":1
},
{
"ref":"pyzkaccess.enums",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.ControlOperation",
"url":16,
"doc":"Device control operation. See  ControlOperation SDK func docs"
},
{
"ref":"pyzkaccess.enums.ControlOperation.output",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.ControlOperation.cancel_alarm",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.ControlOperation.restart",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.RelayGroup",
"url":16,
"doc":"Device relay group. There are either lock relays (door output) or aux relays (aux output)"
},
{
"ref":"pyzkaccess.enums.RelayGroup.lock",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.RelayGroup.aux",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.SensorType",
"url":16,
"doc":"Sensor type of door. See DoorXSensorType parameter in SDK docs"
},
{
"ref":"pyzkaccess.enums.SensorType.not_available",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.SensorType.normal_open",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.SensorType.normal_closed",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode",
"url":16,
"doc":"Methods are used to authenticate a user. See  DoorXVerifyType parameter in SDK docs"
},
{
"ref":"pyzkaccess.enums.VerifyMode.not_available",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.only_finger",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.only_password",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.only_card",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.card_or_finger",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.card_and_finger",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.card_and_password",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.VerifyMode.others",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.PassageDirection",
"url":16,
"doc":"Whether a user was entered or exited via door. See event format description in SDK docs"
},
{
"ref":"pyzkaccess.enums.PassageDirection.entry",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.PassageDirection.exit",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.PassageDirection.none",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.HolidayLoop",
"url":16,
"doc":"Holiday type  annual or not"
},
{
"ref":"pyzkaccess.enums.HolidayLoop.unknown",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.HolidayLoop.annual",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.HolidayLoop.not_annual",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.InOutFunRelayGroup",
"url":16,
"doc":"Device relay group which was triggered  lock relays (door output) or aux relays (aux output)"
},
{
"ref":"pyzkaccess.enums.InOutFunRelayGroup.lock",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.InOutFunRelayGroup.aux",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.ChangeIPProtocol",
"url":16,
"doc":"Protocol to work with during emergency resetting ip address on a device"
},
{
"ref":"pyzkaccess.enums.ChangeIPProtocol.udp",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.ChangeIPProtocol.ethernet",
"url":16,
"doc":""
},
{
"ref":"pyzkaccess.enums.INOUTFUN_INPUT",
"url":16,
"doc":"Input number which triggered the log event"
},
{
"ref":"pyzkaccess.enums.INOUTFUN_OUTPUT",
"url":16,
"doc":"Output number which was became active in log event"
},
{
"ref":"pyzkaccess.enums.EVENT_TYPES",
"url":16,
"doc":"Type of event which is returned by GetRTLog function. See event format description in SDK docs"
},
{
"ref":"pyzkaccess.enums.PULL_SDK_ERRORS",
"url":16,
"doc":"Errors which SDK functions may return. See errors description in SDK"
},
{
"ref":"pyzkaccess.enums.WSA_ERROR_CODES",
"url":16,
"doc":"SDK functions can also return WINSOCK errors using  PullLastError function. See SDK docs and MSDN"
},
{
"ref":"pyzkaccess.tables",
"url":17,
"doc":""
},
{
"ref":"pyzkaccess.tables.User",
"url":17,
"doc":"Card number information table Accepts initial fields data in kwargs"
},
{
"ref":"pyzkaccess.tables.User.table_name",
"url":17,
"doc":"Raw table name on device"
},
{
"ref":"pyzkaccess.tables.User.card",
"url":17,
"doc":"User.card"
},
{
"ref":"pyzkaccess.tables.User.pin",
"url":17,
"doc":"User.pin"
},
{
"ref":"pyzkaccess.tables.User.password",
"url":17,
"doc":"User.password"
},
{
"ref":"pyzkaccess.tables.User.group",
"url":17,
"doc":"User.group"
},
{
"ref":"pyzkaccess.tables.User.start_time",
"url":17,
"doc":"User.start_time"
},
{
"ref":"pyzkaccess.tables.User.end_time",
"url":17,
"doc":"User.end_time"
},
{
"ref":"pyzkaccess.tables.User.super_authorize",
"url":17,
"doc":"User.super_authorize"
},
{
"ref":"pyzkaccess.tables.User.raw_data",
"url":14,
"doc":"Return the raw data that we read from or write to a device"
},
{
"ref":"pyzkaccess.tables.User.fields_mapping",
"url":14,
"doc":"Mapping between model fields and their raw fields",
"func":1
},
{
"ref":"pyzkaccess.tables.User.delete",
"url":14,
"doc":"Delete this record from a table",
"func":1
},
{
"ref":"pyzkaccess.tables.User.save",
"url":14,
"doc":"Save changes in this record",
"func":1
},
{
"ref":"pyzkaccess.tables.User.with_zk",
"url":14,
"doc":"Bind current object with ZKAccess connection Args: zk (ZKAccess): ZKAccess object Returns: Model: self",
"func":1
},
{
"ref":"pyzkaccess.tables.UserAuthorize",
"url":17,
"doc":"Access privilege list Accepts initial fields data in kwargs"
},
{
"ref":"pyzkaccess.tables.UserAuthorize.table_name",
"url":17,
"doc":"Raw table name on device"
},
{
"ref":"pyzkaccess.tables.UserAuthorize.pin",
"url":17,
"doc":"UserAuthorize.pin"
},
{
"ref":"pyzkaccess.tables.UserAuthorize.timezone_id",
"url":17,
"doc":"UserAuthorize.timezone_id"
},
{
"ref":"pyzkaccess.tables.UserAuthorize.doors",
"url":17,
"doc":"UserAuthorize.doors"
},
{
"ref":"pyzkaccess.tables.UserAuthorize.raw_data",
"url":14,
"doc":"Return the raw data that we read from or write to a device"
},
{
"ref":"pyzkaccess.tables.UserAuthorize.fields_mapping",
"url":14,
"doc":"Mapping between model fields and their raw fields",
"func":1
},
{
"ref":"pyzkaccess.tables.UserAuthorize.delete",
"url":14,
"doc":"Delete this record from a table",
"func":1
},
{
"ref":"pyzkaccess.tables.UserAuthorize.save",
"url":14,
"doc":"Save changes in this record",
"func":1
},
{
"ref":"pyzkaccess.tables.UserAuthorize.with_zk",
"url":14,
"doc":"Bind current object with ZKAccess connection Args: zk (ZKAccess): ZKAccess object Returns: Model: self",
"func":1
},
{
"ref":"pyzkaccess.tables.Holiday",
"url":17,
"doc":"Holiday table Accepts initial fields data in kwargs"
},
{
"ref":"pyzkaccess.tables.Holiday.table_name",
"url":17,
"doc":"Raw table name on device"
},
{
"ref":"pyzkaccess.tables.Holiday.holiday",
"url":17,
"doc":"Holiday.holiday"
},
{
"ref":"pyzkaccess.tables.Holiday.holiday_type",
"url":17,
"doc":"Holiday.holiday_type"
},
{
"ref":"pyzkaccess.tables.Holiday.loop",
"url":17,
"doc":"Holiday.loop"
},
{
"ref":"pyzkaccess.tables.Holiday.raw_data",
"url":14,
"doc":"Return the raw data that we read from or write to a device"
},
{
"ref":"pyzkaccess.tables.Holiday.fields_mapping",
"url":14,
"doc":"Mapping between model fields and their raw fields",
"func":1
},
{
"ref":"pyzkaccess.tables.Holiday.delete",
"url":14,
"doc":"Delete this record from a table",
"func":1
},
{
"ref":"pyzkaccess.tables.Holiday.save",
"url":14,
"doc":"Save changes in this record",
"func":1
},
{
"ref":"pyzkaccess.tables.Holiday.with_zk",
"url":14,
"doc":"Bind current object with ZKAccess connection Args: zk (ZKAccess): ZKAccess object Returns: Model: self",
"func":1
},
{
"ref":"pyzkaccess.tables.Timezone",
"url":17,
"doc":"Time zone table Accepts initial fields data in kwargs"
},
{
"ref":"pyzkaccess.tables.Timezone.table_name",
"url":17,
"doc":"Raw table name on device"
},
{
"ref":"pyzkaccess.tables.Timezone.timezone_id",
"url":17,
"doc":"Timezone.timezone_id"
},
{
"ref":"pyzkaccess.tables.Timezone.sun_time1",
"url":17,
"doc":"Timezone.sun_time1"
},
{
"ref":"pyzkaccess.tables.Timezone.mon_time1",
"url":17,
"doc":"Timezone.mon_time1"
},
{
"ref":"pyzkaccess.tables.Timezone.tue_time1",
"url":17,
"doc":"Timezone.tue_time1"
},
{
"ref":"pyzkaccess.tables.Timezone.wed_time1",
"url":17,
"doc":"Timezone.wed_time1"
},
{
"ref":"pyzkaccess.tables.Timezone.thu_time1",
"url":17,
"doc":"Timezone.thu_time1"
},
{
"ref":"pyzkaccess.tables.Timezone.fri_time1",
"url":17,
"doc":"Timezone.fri_time1"
},
{
"ref":"pyzkaccess.tables.Timezone.sat_time1",
"url":17,
"doc":"Timezone.sat_time1"
},
{
"ref":"pyzkaccess.tables.Timezone.hol1_time1",
"url":17,
"doc":"Timezone.hol1_time1"
},
{
"ref":"pyzkaccess.tables.Timezone.hol2_time1",
"url":17,
"doc":"Timezone.hol2_time1"
},
{
"ref":"pyzkaccess.tables.Timezone.hol3_time1",
"url":17,
"doc":"Timezone.hol3_time1"
},
{
"ref":"pyzkaccess.tables.Timezone.sun_time2",
"url":17,
"doc":"Timezone.sun_time2"
},
{
"ref":"pyzkaccess.tables.Timezone.mon_time2",
"url":17,
"doc":"Timezone.mon_time2"
},
{
"ref":"pyzkaccess.tables.Timezone.tue_time2",
"url":17,
"doc":"Timezone.tue_time2"
},
{
"ref":"pyzkaccess.tables.Timezone.wed_time2",
"url":17,
"doc":"Timezone.wed_time2"
},
{
"ref":"pyzkaccess.tables.Timezone.thu_time2",
"url":17,
"doc":"Timezone.thu_time2"
},
{
"ref":"pyzkaccess.tables.Timezone.fri_time2",
"url":17,
"doc":"Timezone.fri_time2"
},
{
"ref":"pyzkaccess.tables.Timezone.sat_time2",
"url":17,
"doc":"Timezone.sat_time2"
},
{
"ref":"pyzkaccess.tables.Timezone.hol1_time2",
"url":17,
"doc":"Timezone.hol1_time2"
},
{
"ref":"pyzkaccess.tables.Timezone.hol2_time2",
"url":17,
"doc":"Timezone.hol2_time2"
},
{
"ref":"pyzkaccess.tables.Timezone.hol3_time2",
"url":17,
"doc":"Timezone.hol3_time2"
},
{
"ref":"pyzkaccess.tables.Timezone.sun_time3",
"url":17,
"doc":"Timezone.sun_time3"
},
{
"ref":"pyzkaccess.tables.Timezone.mon_time3",
"url":17,
"doc":"Timezone.mon_time3"
},
{
"ref":"pyzkaccess.tables.Timezone.tue_time3",
"url":17,
"doc":"Timezone.tue_time3"
},
{
"ref":"pyzkaccess.tables.Timezone.wed_time3",
"url":17,
"doc":"Timezone.wed_time3"
},
{
"ref":"pyzkaccess.tables.Timezone.thu_time3",
"url":17,
"doc":"Timezone.thu_time3"
},
{
"ref":"pyzkaccess.tables.Timezone.fri_time3",
"url":17,
"doc":"Timezone.fri_time3"
},
{
"ref":"pyzkaccess.tables.Timezone.sat_time3",
"url":17,
"doc":"Timezone.sat_time3"
},
{
"ref":"pyzkaccess.tables.Timezone.hol1_time3",
"url":17,
"doc":"Timezone.hol1_time3"
},
{
"ref":"pyzkaccess.tables.Timezone.hol2_time3",
"url":17,
"doc":"Timezone.hol2_time3"
},
{
"ref":"pyzkaccess.tables.Timezone.hol3_time3",
"url":17,
"doc":"Timezone.hol3_time3"
},
{
"ref":"pyzkaccess.tables.Timezone.raw_data",
"url":14,
"doc":"Return the raw data that we read from or write to a device"
},
{
"ref":"pyzkaccess.tables.Timezone.fields_mapping",
"url":14,
"doc":"Mapping between model fields and their raw fields",
"func":1
},
{
"ref":"pyzkaccess.tables.Timezone.delete",
"url":14,
"doc":"Delete this record from a table",
"func":1
},
{
"ref":"pyzkaccess.tables.Timezone.save",
"url":14,
"doc":"Save changes in this record",
"func":1
},
{
"ref":"pyzkaccess.tables.Timezone.with_zk",
"url":14,
"doc":"Bind current object with ZKAccess connection Args: zk (ZKAccess): ZKAccess object Returns: Model: self",
"func":1
},
{
"ref":"pyzkaccess.tables.Transaction",
"url":17,
"doc":"Access control record table Accepts initial fields data in kwargs"
},
{
"ref":"pyzkaccess.tables.Transaction.table_name",
"url":17,
"doc":"Raw table name on device"
},
{
"ref":"pyzkaccess.tables.Transaction.card",
"url":17,
"doc":"Transaction.card"
},
{
"ref":"pyzkaccess.tables.Transaction.pin",
"url":17,
"doc":"Transaction.pin"
},
{
"ref":"pyzkaccess.tables.Transaction.verify_mode",
"url":17,
"doc":"Transaction.verify_mode"
},
{
"ref":"pyzkaccess.tables.Transaction.door",
"url":17,
"doc":"Transaction.door"
},
{
"ref":"pyzkaccess.tables.Transaction.event_type",
"url":17,
"doc":"Transaction.event_type"
},
{
"ref":"pyzkaccess.tables.Transaction.entry_exit",
"url":17,
"doc":"Transaction.entry_exit"
},
{
"ref":"pyzkaccess.tables.Transaction.time",
"url":17,
"doc":"Transaction.time"
},
{
"ref":"pyzkaccess.tables.Transaction.raw_data",
"url":14,
"doc":"Return the raw data that we read from or write to a device"
},
{
"ref":"pyzkaccess.tables.Transaction.fields_mapping",
"url":14,
"doc":"Mapping between model fields and their raw fields",
"func":1
},
{
"ref":"pyzkaccess.tables.Transaction.delete",
"url":14,
"doc":"Delete this record from a table",
"func":1
},
{
"ref":"pyzkaccess.tables.Transaction.save",
"url":14,
"doc":"Save changes in this record",
"func":1
},
{
"ref":"pyzkaccess.tables.Transaction.with_zk",
"url":14,
"doc":"Bind current object with ZKAccess connection Args: zk (ZKAccess): ZKAccess object Returns: Model: self",
"func":1
},
{
"ref":"pyzkaccess.tables.FirstCard",
"url":17,
"doc":"First-card door opening Accepts initial fields data in kwargs"
},
{
"ref":"pyzkaccess.tables.FirstCard.table_name",
"url":17,
"doc":"Raw table name on device"
},
{
"ref":"pyzkaccess.tables.FirstCard.door",
"url":17,
"doc":"FirstCard.door"
},
{
"ref":"pyzkaccess.tables.FirstCard.pin",
"url":17,
"doc":"FirstCard.pin"
},
{
"ref":"pyzkaccess.tables.FirstCard.timezone_id",
"url":17,
"doc":"FirstCard.timezone_id"
},
{
"ref":"pyzkaccess.tables.FirstCard.raw_data",
"url":14,
"doc":"Return the raw data that we read from or write to a device"
},
{
"ref":"pyzkaccess.tables.FirstCard.fields_mapping",
"url":14,
"doc":"Mapping between model fields and their raw fields",
"func":1
},
{
"ref":"pyzkaccess.tables.FirstCard.delete",
"url":14,
"doc":"Delete this record from a table",
"func":1
},
{
"ref":"pyzkaccess.tables.FirstCard.save",
"url":14,
"doc":"Save changes in this record",
"func":1
},
{
"ref":"pyzkaccess.tables.FirstCard.with_zk",
"url":14,
"doc":"Bind current object with ZKAccess connection Args: zk (ZKAccess): ZKAccess object Returns: Model: self",
"func":1
},
{
"ref":"pyzkaccess.tables.MultiCard",
"url":17,
"doc":"Multi-card door opening Accepts initial fields data in kwargs"
},
{
"ref":"pyzkaccess.tables.MultiCard.table_name",
"url":17,
"doc":"Raw table name on device"
},
{
"ref":"pyzkaccess.tables.MultiCard.index",
"url":17,
"doc":"MultiCard.index"
},
{
"ref":"pyzkaccess.tables.MultiCard.door",
"url":17,
"doc":"MultiCard.door"
},
{
"ref":"pyzkaccess.tables.MultiCard.group1",
"url":17,
"doc":"MultiCard.group1"
},
{
"ref":"pyzkaccess.tables.MultiCard.group2",
"url":17,
"doc":"MultiCard.group2"
},
{
"ref":"pyzkaccess.tables.MultiCard.group3",
"url":17,
"doc":"MultiCard.group3"
},
{
"ref":"pyzkaccess.tables.MultiCard.group4",
"url":17,
"doc":"MultiCard.group4"
},
{
"ref":"pyzkaccess.tables.MultiCard.group5",
"url":17,
"doc":"MultiCard.group5"
},
{
"ref":"pyzkaccess.tables.MultiCard.raw_data",
"url":14,
"doc":"Return the raw data that we read from or write to a device"
},
{
"ref":"pyzkaccess.tables.MultiCard.fields_mapping",
"url":14,
"doc":"Mapping between model fields and their raw fields",
"func":1
},
{
"ref":"pyzkaccess.tables.MultiCard.delete",
"url":14,
"doc":"Delete this record from a table",
"func":1
},
{
"ref":"pyzkaccess.tables.MultiCard.save",
"url":14,
"doc":"Save changes in this record",
"func":1
},
{
"ref":"pyzkaccess.tables.MultiCard.with_zk",
"url":14,
"doc":"Bind current object with ZKAccess connection Args: zk (ZKAccess): ZKAccess object Returns: Model: self",
"func":1
},
{
"ref":"pyzkaccess.tables.InOutFun",
"url":17,
"doc":"Linkage control I/O table Accepts initial fields data in kwargs"
},
{
"ref":"pyzkaccess.tables.InOutFun.table_name",
"url":17,
"doc":"Raw table name on device"
},
{
"ref":"pyzkaccess.tables.InOutFun.index",
"url":17,
"doc":"InOutFun.index"
},
{
"ref":"pyzkaccess.tables.InOutFun.event_type",
"url":17,
"doc":"InOutFun.event_type"
},
{
"ref":"pyzkaccess.tables.InOutFun.input_index",
"url":17,
"doc":"InOutFun.input_index"
},
{
"ref":"pyzkaccess.tables.InOutFun.is_output",
"url":17,
"doc":"InOutFun.is_output"
},
{
"ref":"pyzkaccess.tables.InOutFun.output_index",
"url":17,
"doc":"InOutFun.output_index"
},
{
"ref":"pyzkaccess.tables.InOutFun.time",
"url":17,
"doc":"InOutFun.time"
},
{
"ref":"pyzkaccess.tables.InOutFun.reserved",
"url":17,
"doc":"InOutFun.reserved"
},
{
"ref":"pyzkaccess.tables.InOutFun.raw_data",
"url":14,
"doc":"Return the raw data that we read from or write to a device"
},
{
"ref":"pyzkaccess.tables.InOutFun.fields_mapping",
"url":14,
"doc":"Mapping between model fields and their raw fields",
"func":1
},
{
"ref":"pyzkaccess.tables.InOutFun.delete",
"url":14,
"doc":"Delete this record from a table",
"func":1
},
{
"ref":"pyzkaccess.tables.InOutFun.save",
"url":14,
"doc":"Save changes in this record",
"func":1
},
{
"ref":"pyzkaccess.tables.InOutFun.with_zk",
"url":14,
"doc":"Bind current object with ZKAccess connection Args: zk (ZKAccess): ZKAccess object Returns: Model: self",
"func":1
},
{
"ref":"pyzkaccess.tables.TemplateV10",
"url":17,
"doc":"templatev10 table. No information Accepts initial fields data in kwargs"
},
{
"ref":"pyzkaccess.tables.TemplateV10.table_name",
"url":17,
"doc":"Raw table name on device"
},
{
"ref":"pyzkaccess.tables.TemplateV10.size",
"url":17,
"doc":"TemplateV10.size"
},
{
"ref":"pyzkaccess.tables.TemplateV10.uid",
"url":17,
"doc":"TemplateV10.uid"
},
{
"ref":"pyzkaccess.tables.TemplateV10.pin",
"url":17,
"doc":"TemplateV10.pin"
},
{
"ref":"pyzkaccess.tables.TemplateV10.finger_id",
"url":17,
"doc":"TemplateV10.finger_id"
},
{
"ref":"pyzkaccess.tables.TemplateV10.valid",
"url":17,
"doc":"TemplateV10.valid"
},
{
"ref":"pyzkaccess.tables.TemplateV10.template",
"url":17,
"doc":"TemplateV10.template"
},
{
"ref":"pyzkaccess.tables.TemplateV10.resverd",
"url":17,
"doc":"TemplateV10.resverd"
},
{
"ref":"pyzkaccess.tables.TemplateV10.end_tag",
"url":17,
"doc":"TemplateV10.end_tag"
},
{
"ref":"pyzkaccess.tables.TemplateV10.raw_data",
"url":14,
"doc":"Return the raw data that we read from or write to a device"
},
{
"ref":"pyzkaccess.tables.TemplateV10.fields_mapping",
"url":14,
"doc":"Mapping between model fields and their raw fields",
"func":1
},
{
"ref":"pyzkaccess.tables.TemplateV10.delete",
"url":14,
"doc":"Delete this record from a table",
"func":1
},
{
"ref":"pyzkaccess.tables.TemplateV10.save",
"url":14,
"doc":"Save changes in this record",
"func":1
},
{
"ref":"pyzkaccess.tables.TemplateV10.with_zk",
"url":14,
"doc":"Bind current object with ZKAccess connection Args: zk (ZKAccess): ZKAccess object Returns: Model: self",
"func":1
},
{
"ref":"pyzkaccess.device",
"url":18,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKModel",
"url":18,
"doc":"Base class for concrete ZK model Contains model-specific definitions."
},
{
"ref":"pyzkaccess.device.ZKModel.name",
"url":18,
"doc":"Device model name"
},
{
"ref":"pyzkaccess.device.ZKModel.relays",
"url":18,
"doc":"Relays count"
},
{
"ref":"pyzkaccess.device.ZKModel.relays_def",
"url":18,
"doc":"Definition of relay numbers (count must be equal to  relays )"
},
{
"ref":"pyzkaccess.device.ZKModel.groups_def",
"url":18,
"doc":"Definition of relay groups (count must be equal to  relays )"
},
{
"ref":"pyzkaccess.device.ZKModel.readers_def",
"url":18,
"doc":"Definition of reader numbers"
},
{
"ref":"pyzkaccess.device.ZKModel.doors_dev",
"url":18,
"doc":"Definition of door numbers"
},
{
"ref":"pyzkaccess.device.ZKModel.aux_inputs_def",
"url":18,
"doc":"Definition of aux input numbers"
},
{
"ref":"pyzkaccess.device.ZKModel.anti_passback_rules",
"url":18,
"doc":"Anti-passback rules available on concrete device model"
},
{
"ref":"pyzkaccess.device.ZKModel.interlock_rules",
"url":18,
"doc":"Interlock rules available on concrete device model"
},
{
"ref":"pyzkaccess.device.ZK100",
"url":18,
"doc":"ZKAccess C3-100"
},
{
"ref":"pyzkaccess.device.ZK100.name",
"url":18,
"doc":"Device model name"
},
{
"ref":"pyzkaccess.device.ZK100.relays",
"url":18,
"doc":"Relays count"
},
{
"ref":"pyzkaccess.device.ZK100.relays_def",
"url":18,
"doc":"Definition of relay numbers (count must be equal to  relays )"
},
{
"ref":"pyzkaccess.device.ZK100.groups_def",
"url":18,
"doc":"Definition of relay groups (count must be equal to  relays )"
},
{
"ref":"pyzkaccess.device.ZK100.readers_def",
"url":18,
"doc":"Definition of reader numbers"
},
{
"ref":"pyzkaccess.device.ZK100.doors_def",
"url":18,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK100.aux_inputs_def",
"url":18,
"doc":"Definition of aux input numbers"
},
{
"ref":"pyzkaccess.device.ZK100.anti_passback_rules",
"url":18,
"doc":"Anti-passback rules available on concrete device model"
},
{
"ref":"pyzkaccess.device.ZK100.interlock_rules",
"url":18,
"doc":"Interlock rules available on concrete device model"
},
{
"ref":"pyzkaccess.device.ZK100.doors_dev",
"url":18,
"doc":"Definition of door numbers"
},
{
"ref":"pyzkaccess.device.ZK200",
"url":18,
"doc":"ZKAccess C3-200"
},
{
"ref":"pyzkaccess.device.ZK200.name",
"url":18,
"doc":"Device model name"
},
{
"ref":"pyzkaccess.device.ZK200.relays",
"url":18,
"doc":"Relays count"
},
{
"ref":"pyzkaccess.device.ZK200.relays_def",
"url":18,
"doc":"Definition of relay numbers (count must be equal to  relays )"
},
{
"ref":"pyzkaccess.device.ZK200.groups_def",
"url":18,
"doc":"Definition of relay groups (count must be equal to  relays )"
},
{
"ref":"pyzkaccess.device.ZK200.readers_def",
"url":18,
"doc":"Definition of reader numbers"
},
{
"ref":"pyzkaccess.device.ZK200.doors_def",
"url":18,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK200.aux_inputs_def",
"url":18,
"doc":"Definition of aux input numbers"
},
{
"ref":"pyzkaccess.device.ZK200.anti_passback_rules",
"url":18,
"doc":"Anti-passback rules available on concrete device model"
},
{
"ref":"pyzkaccess.device.ZK200.interlock_rules",
"url":18,
"doc":"Interlock rules available on concrete device model"
},
{
"ref":"pyzkaccess.device.ZK200.doors_dev",
"url":18,
"doc":"Definition of door numbers"
},
{
"ref":"pyzkaccess.device.ZK400",
"url":18,
"doc":"ZKAccess C3-400 model"
},
{
"ref":"pyzkaccess.device.ZK400.name",
"url":18,
"doc":"Device model name"
},
{
"ref":"pyzkaccess.device.ZK400.relays",
"url":18,
"doc":"Relays count"
},
{
"ref":"pyzkaccess.device.ZK400.relays_def",
"url":18,
"doc":"Definition of relay numbers (count must be equal to  relays )"
},
{
"ref":"pyzkaccess.device.ZK400.groups_def",
"url":18,
"doc":"Definition of relay groups (count must be equal to  relays )"
},
{
"ref":"pyzkaccess.device.ZK400.readers_def",
"url":18,
"doc":"Definition of reader numbers"
},
{
"ref":"pyzkaccess.device.ZK400.doors_def",
"url":18,
"doc":""
},
{
"ref":"pyzkaccess.device.ZK400.aux_inputs_def",
"url":18,
"doc":"Definition of aux input numbers"
},
{
"ref":"pyzkaccess.device.ZK400.anti_passback_rules",
"url":18,
"doc":"Anti-passback rules available on concrete device model"
},
{
"ref":"pyzkaccess.device.ZK400.interlock_rules",
"url":18,
"doc":"Interlock rules available on concrete device model"
},
{
"ref":"pyzkaccess.device.ZK400.doors_dev",
"url":18,
"doc":"Definition of door numbers"
},
{
"ref":"pyzkaccess.device.ZKDevice",
"url":18,
"doc":"Concrete ZK device info"
},
{
"ref":"pyzkaccess.device.ZKDevice.parse_tokens",
"url":18,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKDevice.available_models",
"url":18,
"doc":""
},
{
"ref":"pyzkaccess.device.ZKDevice.parse",
"url":18,
"doc":"Parse and validate raw device string Args: device_line (str): event string to parse Returns: Mapping[str, str]: dictionary where keys are slots and values are appropriate values extracted from string",
"func":1
},
{
"ref":"pyzkaccess.device.ZKDevice.ip",
"url":18,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.device.ZKDevice.mac",
"url":18,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.device.ZKDevice.model",
"url":18,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.device.ZKDevice.serial_number",
"url":18,
"doc":"Return an attribute of instance, which is of type owner."
},
{
"ref":"pyzkaccess.device.ZKDevice.version",
"url":18,
"doc":"Return an attribute of instance, which is of type owner."
}
]