/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');
goog.exportSymbol('proto.terrasmart.cloud.AccumulatorUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.AccumulatorUpdate.UpdateType', null, global);
goog.exportSymbol('proto.terrasmart.cloud.Alert', null, global);
goog.exportSymbol('proto.terrasmart.cloud.Alert.AlertType', null, global);
goog.exportSymbol('proto.terrasmart.cloud.AngleUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.AngleUpdate.TrackingStatus', null, global);
goog.exportSymbol('proto.terrasmart.cloud.AssetPresetChanged', null, global);
goog.exportSymbol('proto.terrasmart.cloud.AssetRadioRestarted', null, global);
goog.exportSymbol('proto.terrasmart.cloud.AssetRadioUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.AssetRestarted', null, global);
goog.exportSymbol('proto.terrasmart.cloud.AssetUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.BatteryUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.CellDailyUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.CellUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.ChargerUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.ClearLogEntry', null, global);
goog.exportSymbol('proto.terrasmart.cloud.CloudAccuWeatherUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.CloudUpdates', null, global);
goog.exportSymbol('proto.terrasmart.cloud.CommandStatusUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.ConfigUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.ConfiguredVersions', null, global);
goog.exportSymbol('proto.terrasmart.cloud.FirmwareUpgradeReport', null, global);
goog.exportSymbol('proto.terrasmart.cloud.FirmwareUpgradeReportUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.GpsUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.IncreaseWeatherReporting', null, global);
goog.exportSymbol('proto.terrasmart.cloud.InputVoltage', null, global);
goog.exportSymbol('proto.terrasmart.cloud.IrradianceUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.LogEntry', null, global);
goog.exportSymbol('proto.terrasmart.cloud.LogEntry.EventType', null, global);
goog.exportSymbol('proto.terrasmart.cloud.MotorCurrentUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.MotorCurrentUpdate.TrackingStatus', null, global);
goog.exportSymbol('proto.terrasmart.cloud.NCParametersUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.NetworkControllerBridgeUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.PanelUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.QaQcReportUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.RackAngles', null, global);
goog.exportSymbol('proto.terrasmart.cloud.SiteConfigUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.SiteParameters', null, global);
goog.exportSymbol('proto.terrasmart.cloud.SnowSheddingReport', null, global);
goog.exportSymbol('proto.terrasmart.cloud.SnowSheddingReport.Asset', null, global);
goog.exportSymbol('proto.terrasmart.cloud.SnowSheddingReport.SheddingStatus', null, global);
goog.exportSymbol('proto.terrasmart.cloud.SnowSheddingReportUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.SnowSheddingUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.SnowSheddingUpdate.SheddingState', null, global);
goog.exportSymbol('proto.terrasmart.cloud.SolarInfoUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.StartUpData', null, global);
goog.exportSymbol('proto.terrasmart.cloud.ToggleFastTrakUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.TrackerControllerHourUpdates', null, global);
goog.exportSymbol('proto.terrasmart.cloud.TrackerControllerInstantUpdates', null, global);
goog.exportSymbol('proto.terrasmart.cloud.TrackerControllerInstantUpdates.AssetStatus', null, global);
goog.exportSymbol('proto.terrasmart.cloud.TrackerControllerUpdates', null, global);
goog.exportSymbol('proto.terrasmart.cloud.TrackingChange', null, global);
goog.exportSymbol('proto.terrasmart.cloud.TrackingState', null, global);
goog.exportSymbol('proto.terrasmart.cloud.VegetationUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.WeatherParameters', null, global);
goog.exportSymbol('proto.terrasmart.cloud.WeatherReportingUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.WeatherStowUpdate', null, global);
goog.exportSymbol('proto.terrasmart.cloud.WeatherUpdate', null, global);

/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.AccumulatorUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.AccumulatorUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.AccumulatorUpdate.displayName = 'proto.terrasmart.cloud.AccumulatorUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.AccumulatorUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.AccumulatorUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.AccumulatorUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AccumulatorUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, 0),
    value: +jspb.Message.getFieldWithDefault(msg, 2, 0.0),
    partialData: jspb.Message.getFieldWithDefault(msg, 3, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.AccumulatorUpdate}
 */
proto.terrasmart.cloud.AccumulatorUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.AccumulatorUpdate;
  return proto.terrasmart.cloud.AccumulatorUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.AccumulatorUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.AccumulatorUpdate}
 */
proto.terrasmart.cloud.AccumulatorUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.terrasmart.cloud.AccumulatorUpdate.UpdateType} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setValue(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPartialData(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AccumulatorUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.AccumulatorUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.AccumulatorUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AccumulatorUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getValue();
  if (f !== 0.0) {
    writer.writeFloat(
      2,
      f
    );
  }
  f = message.getPartialData();
  if (f) {
    writer.writeBool(
      3,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.terrasmart.cloud.AccumulatorUpdate.UpdateType = {
  UNKNOWN: 0,
  BATT: 1,
  PANEL: 2,
  MOTOR: 3,
  ANGULAR_ERROR: 4,
  CHARGER: 5,
  EXTERNAL_INPUT_2: 6,
  MOTOR_RUNTIME: 7
};

/**
 * optional UpdateType type = 1;
 * @return {!proto.terrasmart.cloud.AccumulatorUpdate.UpdateType}
 */
proto.terrasmart.cloud.AccumulatorUpdate.prototype.getType = function() {
  return /** @type {!proto.terrasmart.cloud.AccumulatorUpdate.UpdateType} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {!proto.terrasmart.cloud.AccumulatorUpdate.UpdateType} value */
proto.terrasmart.cloud.AccumulatorUpdate.prototype.setType = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional float value = 2;
 * @return {number}
 */
proto.terrasmart.cloud.AccumulatorUpdate.prototype.getValue = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 2, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.AccumulatorUpdate.prototype.setValue = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional bool partial_data = 3;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.AccumulatorUpdate.prototype.getPartialData = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 3, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.AccumulatorUpdate.prototype.setPartialData = function(value) {
  jspb.Message.setField(this, 3, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.TrackerControllerUpdates = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.terrasmart.cloud.TrackerControllerUpdates.repeatedFields_, null);
};
goog.inherits(proto.terrasmart.cloud.TrackerControllerUpdates, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.TrackerControllerUpdates.displayName = 'proto.terrasmart.cloud.TrackerControllerUpdates';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.terrasmart.cloud.TrackerControllerUpdates.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.TrackerControllerUpdates.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.TrackerControllerUpdates} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.TrackerControllerUpdates.toObject = function(includeInstance, msg) {
  var f, obj = {
    tcSnapAddr: msg.getTcSnapAddr_asB64(),
    updatesList: jspb.Message.toObjectList(msg.getUpdatesList(),
    proto.terrasmart.cloud.AccumulatorUpdate.toObject, includeInstance),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    pollsSent: jspb.Message.getFieldWithDefault(msg, 4, 0),
    pollsReceived: jspb.Message.getFieldWithDefault(msg, 5, 0),
    linkQuality: jspb.Message.getFieldWithDefault(msg, 6, 0),
    meshDepth: jspb.Message.getFieldWithDefault(msg, 7, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.TrackerControllerUpdates}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.TrackerControllerUpdates;
  return proto.terrasmart.cloud.TrackerControllerUpdates.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.TrackerControllerUpdates} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.TrackerControllerUpdates}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTcSnapAddr(value);
      break;
    case 2:
      var value = new proto.terrasmart.cloud.AccumulatorUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.AccumulatorUpdate.deserializeBinaryFromReader);
      msg.addUpdates(value);
      break;
    case 3:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPollsSent(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPollsReceived(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLinkQuality(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setMeshDepth(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.TrackerControllerUpdates.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.TrackerControllerUpdates} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.TrackerControllerUpdates.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTcSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getUpdatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.terrasmart.cloud.AccumulatorUpdate.serializeBinaryToWriter
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getPollsSent();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = message.getPollsReceived();
  if (f !== 0) {
    writer.writeUint32(
      5,
      f
    );
  }
  f = message.getLinkQuality();
  if (f !== 0) {
    writer.writeUint32(
      6,
      f
    );
  }
  f = message.getMeshDepth();
  if (f !== 0) {
    writer.writeUint32(
      7,
      f
    );
  }
};


/**
 * optional bytes tc_snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.getTcSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes tc_snap_addr = 1;
 * This is a type-conversion wrapper around `getTcSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.getTcSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTcSnapAddr()));
};


/**
 * optional bytes tc_snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTcSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.getTcSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTcSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.setTcSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * repeated AccumulatorUpdate updates = 2;
 * @return {!Array.<!proto.terrasmart.cloud.AccumulatorUpdate>}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.getUpdatesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.AccumulatorUpdate>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.AccumulatorUpdate, 2));
};


/** @param {!Array.<!proto.terrasmart.cloud.AccumulatorUpdate>} value */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.setUpdatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.terrasmart.cloud.AccumulatorUpdate=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.AccumulatorUpdate}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.addUpdates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.terrasmart.cloud.AccumulatorUpdate, opt_index);
};


proto.terrasmart.cloud.TrackerControllerUpdates.prototype.clearUpdatesList = function() {
  this.setUpdatesList([]);
};


/**
 * optional google.protobuf.Timestamp when = 3;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 3));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.terrasmart.cloud.TrackerControllerUpdates.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional uint32 polls_sent = 4;
 * @return {number}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.getPollsSent = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.setPollsSent = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional uint32 polls_received = 5;
 * @return {number}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.getPollsReceived = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.setPollsReceived = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional uint32 link_quality = 6;
 * @return {number}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.getLinkQuality = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.setLinkQuality = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional uint32 mesh_depth = 7;
 * @return {number}
 */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.getMeshDepth = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.TrackerControllerUpdates.prototype.setMeshDepth = function(value) {
  jspb.Message.setField(this, 7, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.TrackerControllerHourUpdates, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.TrackerControllerHourUpdates.displayName = 'proto.terrasmart.cloud.TrackerControllerHourUpdates';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.TrackerControllerHourUpdates.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.TrackerControllerHourUpdates} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates.toObject = function(includeInstance, msg) {
  var f, obj = {
    tcUpdate: (f = msg.getTcUpdate()) && proto.terrasmart.cloud.TrackerControllerUpdates.toObject(includeInstance, f),
    hour: jspb.Message.getFieldWithDefault(msg, 2, 0),
    day: (f = msg.getDay()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.TrackerControllerHourUpdates}
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.TrackerControllerHourUpdates;
  return proto.terrasmart.cloud.TrackerControllerHourUpdates.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.TrackerControllerHourUpdates} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.TrackerControllerHourUpdates}
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.terrasmart.cloud.TrackerControllerUpdates;
      reader.readMessage(value,proto.terrasmart.cloud.TrackerControllerUpdates.deserializeBinaryFromReader);
      msg.setTcUpdate(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setHour(value);
      break;
    case 3:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setDay(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.TrackerControllerHourUpdates.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.TrackerControllerHourUpdates} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTcUpdate();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.terrasmart.cloud.TrackerControllerUpdates.serializeBinaryToWriter
    );
  }
  f = message.getHour();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getDay();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional TrackerControllerUpdates tc_update = 1;
 * @return {?proto.terrasmart.cloud.TrackerControllerUpdates}
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.getTcUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.TrackerControllerUpdates} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.TrackerControllerUpdates, 1));
};


/** @param {?proto.terrasmart.cloud.TrackerControllerUpdates|undefined} value */
proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.setTcUpdate = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.clearTcUpdate = function() {
  this.setTcUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.hasTcUpdate = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional uint32 hour = 2;
 * @return {number}
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.getHour = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.setHour = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional google.protobuf.Timestamp day = 3;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.getDay = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 3));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.setDay = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.clearDay = function() {
  this.setDay(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.TrackerControllerHourUpdates.prototype.hasDay = function() {
  return jspb.Message.getField(this, 3) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.TrackingChange = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.TrackingChange, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.TrackingChange.displayName = 'proto.terrasmart.cloud.TrackingChange';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.TrackingChange.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.TrackingChange.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.TrackingChange} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.TrackingChange.toObject = function(includeInstance, msg) {
  var f, obj = {
    updatedState: jspb.Message.getFieldWithDefault(msg, 1, 0),
    stateChangedAt: (f = msg.getStateChangedAt()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    commandedPreset: jspb.Message.getFieldWithDefault(msg, 3, 0),
    userName: jspb.Message.getFieldWithDefault(msg, 4, ""),
    userEmail: jspb.Message.getFieldWithDefault(msg, 5, ""),
    source: jspb.Message.getFieldWithDefault(msg, 6, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.TrackingChange}
 */
proto.terrasmart.cloud.TrackingChange.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.TrackingChange;
  return proto.terrasmart.cloud.TrackingChange.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.TrackingChange} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.TrackingChange}
 */
proto.terrasmart.cloud.TrackingChange.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.terrasmart.cloud.TrackingState} */ (reader.readEnum());
      msg.setUpdatedState(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setStateChangedAt(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setCommandedPreset(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserName(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserEmail(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setSource(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.TrackingChange.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.TrackingChange.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.TrackingChange} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.TrackingChange.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUpdatedState();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getStateChangedAt();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getCommandedPreset();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getUserName();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getUserEmail();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getSource();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
};


/**
 * optional TrackingState updated_state = 1;
 * @return {!proto.terrasmart.cloud.TrackingState}
 */
proto.terrasmart.cloud.TrackingChange.prototype.getUpdatedState = function() {
  return /** @type {!proto.terrasmart.cloud.TrackingState} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {!proto.terrasmart.cloud.TrackingState} value */
proto.terrasmart.cloud.TrackingChange.prototype.setUpdatedState = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp state_changed_at = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.TrackingChange.prototype.getStateChangedAt = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.TrackingChange.prototype.setStateChangedAt = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.TrackingChange.prototype.clearStateChangedAt = function() {
  this.setStateChangedAt(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.TrackingChange.prototype.hasStateChangedAt = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint32 commanded_preset = 3;
 * @return {number}
 */
proto.terrasmart.cloud.TrackingChange.prototype.getCommandedPreset = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.TrackingChange.prototype.setCommandedPreset = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional string user_name = 4;
 * @return {string}
 */
proto.terrasmart.cloud.TrackingChange.prototype.getUserName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.TrackingChange.prototype.setUserName = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional string user_email = 5;
 * @return {string}
 */
proto.terrasmart.cloud.TrackingChange.prototype.getUserEmail = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.TrackingChange.prototype.setUserEmail = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional string source = 6;
 * @return {string}
 */
proto.terrasmart.cloud.TrackingChange.prototype.getSource = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.TrackingChange.prototype.setSource = function(value) {
  jspb.Message.setField(this, 6, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.AngleUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.AngleUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.AngleUpdate.displayName = 'proto.terrasmart.cloud.AngleUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.AngleUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.AngleUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AngleUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    currentAngle: +jspb.Message.getFieldWithDefault(msg, 2, 0.0),
    requestedAngle: +jspb.Message.getFieldWithDefault(msg, 3, 0.0),
    commandedState: jspb.Message.getFieldWithDefault(msg, 4, 0),
    trackingStatus: jspb.Message.getFieldWithDefault(msg, 5, 0),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    commandedStateDetail: jspb.Message.getFieldWithDefault(msg, 7, 0),
    panelIndex: jspb.Message.getFieldWithDefault(msg, 8, 0),
    panelCommandState: jspb.Message.getFieldWithDefault(msg, 9, 0),
    motorCurrent: +jspb.Message.getFieldWithDefault(msg, 10, 0.0),
    lastRequestedAngle: +jspb.Message.getFieldWithDefault(msg, 11, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.AngleUpdate}
 */
proto.terrasmart.cloud.AngleUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.AngleUpdate;
  return proto.terrasmart.cloud.AngleUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.AngleUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.AngleUpdate}
 */
proto.terrasmart.cloud.AngleUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 2:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCurrentAngle(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setRequestedAngle(value);
      break;
    case 4:
      var value = /** @type {!proto.terrasmart.cloud.TrackingState} */ (reader.readEnum());
      msg.setCommandedState(value);
      break;
    case 5:
      var value = /** @type {!proto.terrasmart.cloud.AngleUpdate.TrackingStatus} */ (reader.readEnum());
      msg.setTrackingStatus(value);
      break;
    case 6:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setCommandedStateDetail(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPanelIndex(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPanelCommandState(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setMotorCurrent(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setLastRequestedAngle(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.AngleUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.AngleUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AngleUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCurrentAngle();
  if (f !== 0.0) {
    writer.writeFloat(
      2,
      f
    );
  }
  f = message.getRequestedAngle();
  if (f !== 0.0) {
    writer.writeFloat(
      3,
      f
    );
  }
  f = message.getCommandedState();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getTrackingStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      6,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getCommandedStateDetail();
  if (f !== 0) {
    writer.writeUint32(
      7,
      f
    );
  }
  f = message.getPanelIndex();
  if (f !== 0) {
    writer.writeUint32(
      8,
      f
    );
  }
  f = message.getPanelCommandState();
  if (f !== 0) {
    writer.writeUint32(
      9,
      f
    );
  }
  f = message.getMotorCurrent();
  if (f !== 0.0) {
    writer.writeFloat(
      10,
      f
    );
  }
  f = message.getLastRequestedAngle();
  if (f !== 0.0) {
    writer.writeFloat(
      11,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.terrasmart.cloud.AngleUpdate.TrackingStatus = {
  UNKNOWN: 0,
  MANUAL: 1,
  TRACKING_ONLY: 2,
  TRACKING_WITH_BACKTRACKING: 3,
  LOW_BATTERY_AUTO_STOW: 4,
  LOCAL_ESTOP: 5,
  INDIVIDUAL_ROW_CONTROL: 6,
  GROUP_ROW_CONTROL: 7,
  HANDHELD_ROW_CONTROL: 8,
  HIGH_TEMPERATURE_MOTOR_CUTOFF: 9,
  QC_ROW_CONTROL: 10,
  TRACKING_WITH_DIFFUSE: 11,
  QAQC_ROW_CONTROL: 12,
  SNOW_SHEDDING: 13,
  AUTO_SNOW_SHEDDING: 14,
  SNOW_SHEDDING_RETRY: 15,
  MQC_ROW_CONTROL: 16
};

/**
 * optional float current_angle = 2;
 * @return {number}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.getCurrentAngle = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 2, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.AngleUpdate.prototype.setCurrentAngle = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional float requested_angle = 3;
 * @return {number}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.getRequestedAngle = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.AngleUpdate.prototype.setRequestedAngle = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional TrackingState commanded_state = 4;
 * @return {!proto.terrasmart.cloud.TrackingState}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.getCommandedState = function() {
  return /** @type {!proto.terrasmart.cloud.TrackingState} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {!proto.terrasmart.cloud.TrackingState} value */
proto.terrasmart.cloud.AngleUpdate.prototype.setCommandedState = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional TrackingStatus tracking_status = 5;
 * @return {!proto.terrasmart.cloud.AngleUpdate.TrackingStatus}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.getTrackingStatus = function() {
  return /** @type {!proto.terrasmart.cloud.AngleUpdate.TrackingStatus} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {!proto.terrasmart.cloud.AngleUpdate.TrackingStatus} value */
proto.terrasmart.cloud.AngleUpdate.prototype.setTrackingStatus = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional google.protobuf.Timestamp when = 6;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 6));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.AngleUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 6, value);
};


proto.terrasmart.cloud.AngleUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 6) != null;
};


/**
 * optional uint32 commanded_state_detail = 7;
 * @return {number}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.getCommandedStateDetail = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.AngleUpdate.prototype.setCommandedStateDetail = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional uint32 panel_index = 8;
 * @return {number}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.getPanelIndex = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.AngleUpdate.prototype.setPanelIndex = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional uint32 panel_command_state = 9;
 * @return {number}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.getPanelCommandState = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.AngleUpdate.prototype.setPanelCommandState = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional float motor_current = 10;
 * @return {number}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.getMotorCurrent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 10, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.AngleUpdate.prototype.setMotorCurrent = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional float last_requested_angle = 11;
 * @return {number}
 */
proto.terrasmart.cloud.AngleUpdate.prototype.getLastRequestedAngle = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 11, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.AngleUpdate.prototype.setLastRequestedAngle = function(value) {
  jspb.Message.setField(this, 11, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.RackAngles = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.terrasmart.cloud.RackAngles.repeatedFields_, null);
};
goog.inherits(proto.terrasmart.cloud.RackAngles, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.RackAngles.displayName = 'proto.terrasmart.cloud.RackAngles';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.terrasmart.cloud.RackAngles.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.RackAngles.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.RackAngles.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.RackAngles} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.RackAngles.toObject = function(includeInstance, msg) {
  var f, obj = {
    tcSnapAddr: msg.getTcSnapAddr_asB64(),
    anglesList: jspb.Message.toObjectList(msg.getAnglesList(),
    proto.terrasmart.cloud.AngleUpdate.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.RackAngles}
 */
proto.terrasmart.cloud.RackAngles.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.RackAngles;
  return proto.terrasmart.cloud.RackAngles.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.RackAngles} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.RackAngles}
 */
proto.terrasmart.cloud.RackAngles.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTcSnapAddr(value);
      break;
    case 2:
      var value = new proto.terrasmart.cloud.AngleUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.AngleUpdate.deserializeBinaryFromReader);
      msg.addAngles(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.RackAngles.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.RackAngles.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.RackAngles} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.RackAngles.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTcSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getAnglesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.terrasmart.cloud.AngleUpdate.serializeBinaryToWriter
    );
  }
};


/**
 * optional bytes tc_snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.RackAngles.prototype.getTcSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes tc_snap_addr = 1;
 * This is a type-conversion wrapper around `getTcSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.RackAngles.prototype.getTcSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTcSnapAddr()));
};


/**
 * optional bytes tc_snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTcSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.RackAngles.prototype.getTcSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTcSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.RackAngles.prototype.setTcSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * repeated AngleUpdate angles = 2;
 * @return {!Array.<!proto.terrasmart.cloud.AngleUpdate>}
 */
proto.terrasmart.cloud.RackAngles.prototype.getAnglesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.AngleUpdate>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.AngleUpdate, 2));
};


/** @param {!Array.<!proto.terrasmart.cloud.AngleUpdate>} value */
proto.terrasmart.cloud.RackAngles.prototype.setAnglesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.terrasmart.cloud.AngleUpdate=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.AngleUpdate}
 */
proto.terrasmart.cloud.RackAngles.prototype.addAngles = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.terrasmart.cloud.AngleUpdate, opt_index);
};


proto.terrasmart.cloud.RackAngles.prototype.clearAnglesList = function() {
  this.setAnglesList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.TrackerControllerInstantUpdates, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.TrackerControllerInstantUpdates.displayName = 'proto.terrasmart.cloud.TrackerControllerInstantUpdates';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.TrackerControllerInstantUpdates.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.TrackerControllerInstantUpdates} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.toObject = function(includeInstance, msg) {
  var f, obj = {
    tcSnapAddr: msg.getTcSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    statusBits: jspb.Message.getFieldWithDefault(msg, 3, 0),
    assetStatus: jspb.Message.getFieldWithDefault(msg, 4, 0),
    lastReported: (f = msg.getLastReported()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.TrackerControllerInstantUpdates}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.TrackerControllerInstantUpdates;
  return proto.terrasmart.cloud.TrackerControllerInstantUpdates.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.TrackerControllerInstantUpdates} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.TrackerControllerInstantUpdates}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTcSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setStatusBits(value);
      break;
    case 4:
      var value = /** @type {!proto.terrasmart.cloud.TrackerControllerInstantUpdates.AssetStatus} */ (reader.readEnum());
      msg.setAssetStatus(value);
      break;
    case 5:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setLastReported(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.TrackerControllerInstantUpdates.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.TrackerControllerInstantUpdates} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTcSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getStatusBits();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getAssetStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
  f = message.getLastReported();
  if (f != null) {
    writer.writeMessage(
      5,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * @enum {number}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.AssetStatus = {
  OFFLINE: 0,
  ONLINE: 1,
  UNDER_FCS_CONTROL: 2,
  UNKNOWN: 3,
  UNDER_MANUAL_CONTROL: 4,
  UNDER_HHC_CONTROL: 5,
  UNDER_GROUP_CONTROL: 6,
  UNDER_QC_CONTROL: 7,
  UNDER_QAQC_CONTROL: 8,
  UNDER_MQC_CONTROL: 9
};

/**
 * optional bytes tc_snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.getTcSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes tc_snap_addr = 1;
 * This is a type-conversion wrapper around `getTcSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.getTcSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTcSnapAddr()));
};


/**
 * optional bytes tc_snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTcSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.getTcSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTcSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.setTcSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint32 status_bits = 3;
 * @return {number}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.getStatusBits = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.setStatusBits = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional AssetStatus asset_status = 4;
 * @return {!proto.terrasmart.cloud.TrackerControllerInstantUpdates.AssetStatus}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.getAssetStatus = function() {
  return /** @type {!proto.terrasmart.cloud.TrackerControllerInstantUpdates.AssetStatus} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {!proto.terrasmart.cloud.TrackerControllerInstantUpdates.AssetStatus} value */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.setAssetStatus = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional google.protobuf.Timestamp last_reported = 5;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.getLastReported = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 5));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.setLastReported = function(value) {
  jspb.Message.setWrapperField(this, 5, value);
};


proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.clearLastReported = function() {
  this.setLastReported(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.TrackerControllerInstantUpdates.prototype.hasLastReported = function() {
  return jspb.Message.getField(this, 5) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.LogEntry = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.LogEntry, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.LogEntry.displayName = 'proto.terrasmart.cloud.LogEntry';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.LogEntry.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.LogEntry.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.LogEntry} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.LogEntry.toObject = function(includeInstance, msg) {
  var f, obj = {
    created: (f = msg.getCreated()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    levelno: jspb.Message.getFieldWithDefault(msg, 2, 0),
    logger: jspb.Message.getFieldWithDefault(msg, 3, ""),
    message: jspb.Message.getFieldWithDefault(msg, 4, ""),
    type: jspb.Message.getFieldWithDefault(msg, 5, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.LogEntry}
 */
proto.terrasmart.cloud.LogEntry.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.LogEntry;
  return proto.terrasmart.cloud.LogEntry.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.LogEntry} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.LogEntry}
 */
proto.terrasmart.cloud.LogEntry.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setCreated(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLevelno(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setLogger(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setMessage(value);
      break;
    case 5:
      var value = /** @type {!proto.terrasmart.cloud.LogEntry.EventType} */ (reader.readEnum());
      msg.setType(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.LogEntry.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.LogEntry.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.LogEntry} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.LogEntry.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCreated();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getLevelno();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
  f = message.getLogger();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getMessage();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.terrasmart.cloud.LogEntry.EventType = {
  SITE_OVERVIEW: 0,
  NETWORK_CONTROLLER: 1,
  INDIVIDUAL_ASSET: 2,
  ACCESS_CONTROL: 3,
  FIRMWARE_UPDATE: 4,
  UNKNOWN: 5,
  CONFIG_UPDATE: 6,
  UNIT_TESTING: 7,
  ASSET_UN_PROVISION: 8,
  ASSET_PROVISION: 9
};

/**
 * optional google.protobuf.Timestamp created = 1;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.LogEntry.prototype.getCreated = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 1));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.LogEntry.prototype.setCreated = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.terrasmart.cloud.LogEntry.prototype.clearCreated = function() {
  this.setCreated(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.LogEntry.prototype.hasCreated = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional uint32 levelno = 2;
 * @return {number}
 */
proto.terrasmart.cloud.LogEntry.prototype.getLevelno = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.LogEntry.prototype.setLevelno = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional string logger = 3;
 * @return {string}
 */
proto.terrasmart.cloud.LogEntry.prototype.getLogger = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.LogEntry.prototype.setLogger = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional string message = 4;
 * @return {string}
 */
proto.terrasmart.cloud.LogEntry.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.LogEntry.prototype.setMessage = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional EventType type = 5;
 * @return {!proto.terrasmart.cloud.LogEntry.EventType}
 */
proto.terrasmart.cloud.LogEntry.prototype.getType = function() {
  return /** @type {!proto.terrasmart.cloud.LogEntry.EventType} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {!proto.terrasmart.cloud.LogEntry.EventType} value */
proto.terrasmart.cloud.LogEntry.prototype.setType = function(value) {
  jspb.Message.setField(this, 5, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.ClearLogEntry = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.ClearLogEntry, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.ClearLogEntry.displayName = 'proto.terrasmart.cloud.ClearLogEntry';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.ClearLogEntry.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.ClearLogEntry.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.ClearLogEntry} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.ClearLogEntry.toObject = function(includeInstance, msg) {
  var f, obj = {
    created: (f = msg.getCreated()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    cleared: (f = msg.getCleared()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.ClearLogEntry}
 */
proto.terrasmart.cloud.ClearLogEntry.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.ClearLogEntry;
  return proto.terrasmart.cloud.ClearLogEntry.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.ClearLogEntry} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.ClearLogEntry}
 */
proto.terrasmart.cloud.ClearLogEntry.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setCreated(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setCleared(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.ClearLogEntry.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.ClearLogEntry.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.ClearLogEntry} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.ClearLogEntry.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCreated();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getCleared();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
};


/**
 * optional google.protobuf.Timestamp created = 1;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.ClearLogEntry.prototype.getCreated = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 1));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.ClearLogEntry.prototype.setCreated = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.terrasmart.cloud.ClearLogEntry.prototype.clearCreated = function() {
  this.setCreated(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.ClearLogEntry.prototype.hasCreated = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional google.protobuf.Timestamp cleared = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.ClearLogEntry.prototype.getCleared = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.ClearLogEntry.prototype.setCleared = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.ClearLogEntry.prototype.clearCleared = function() {
  this.setCleared(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.ClearLogEntry.prototype.hasCleared = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.Alert = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.Alert, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.Alert.displayName = 'proto.terrasmart.cloud.Alert';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.Alert.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.Alert.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.Alert} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.Alert.toObject = function(includeInstance, msg) {
  var f, obj = {
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    active: jspb.Message.getFieldWithDefault(msg, 2, false),
    type: jspb.Message.getFieldWithDefault(msg, 3, 0),
    message: jspb.Message.getFieldWithDefault(msg, 4, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.Alert}
 */
proto.terrasmart.cloud.Alert.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.Alert;
  return proto.terrasmart.cloud.Alert.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.Alert} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.Alert}
 */
proto.terrasmart.cloud.Alert.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setActive(value);
      break;
    case 3:
      var value = /** @type {!proto.terrasmart.cloud.Alert.AlertType} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setMessage(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.Alert.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.Alert.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.Alert} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.Alert.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getActive();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      3,
      f
    );
  }
  f = message.getMessage();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.terrasmart.cloud.Alert.AlertType = {
  UNKNOWN: 0,
  ESTOP: 1,
  ASSETS_REPORTING: 2,
  GPS: 3,
  CLOCK: 4,
  MODEM: 5,
  NTP: 6
};

/**
 * optional google.protobuf.Timestamp when = 1;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.Alert.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 1));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.Alert.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.terrasmart.cloud.Alert.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.Alert.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bool active = 2;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.Alert.prototype.getActive = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 2, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.Alert.prototype.setActive = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional AlertType type = 3;
 * @return {!proto.terrasmart.cloud.Alert.AlertType}
 */
proto.terrasmart.cloud.Alert.prototype.getType = function() {
  return /** @type {!proto.terrasmart.cloud.Alert.AlertType} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {!proto.terrasmart.cloud.Alert.AlertType} value */
proto.terrasmart.cloud.Alert.prototype.setType = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional string message = 4;
 * @return {string}
 */
proto.terrasmart.cloud.Alert.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.Alert.prototype.setMessage = function(value) {
  jspb.Message.setField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.BatteryUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.BatteryUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.BatteryUpdate.displayName = 'proto.terrasmart.cloud.BatteryUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.BatteryUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.BatteryUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.BatteryUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    tcSnapAddr: msg.getTcSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    voltage: +jspb.Message.getFieldWithDefault(msg, 3, 0.0),
    current: +jspb.Message.getFieldWithDefault(msg, 4, 0.0),
    charged: +jspb.Message.getFieldWithDefault(msg, 5, 0.0),
    health: +jspb.Message.getFieldWithDefault(msg, 6, 0.0),
    battTemp: +jspb.Message.getFieldWithDefault(msg, 7, 0.0),
    heaterTemp: +jspb.Message.getFieldWithDefault(msg, 8, 0.0),
    miscStatusBits: jspb.Message.getFieldWithDefault(msg, 9, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.BatteryUpdate}
 */
proto.terrasmart.cloud.BatteryUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.BatteryUpdate;
  return proto.terrasmart.cloud.BatteryUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.BatteryUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.BatteryUpdate}
 */
proto.terrasmart.cloud.BatteryUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTcSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setVoltage(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCurrent(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCharged(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setHealth(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setBattTemp(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setHeaterTemp(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setMiscStatusBits(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.BatteryUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.BatteryUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.BatteryUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTcSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      3,
      f
    );
  }
  f = message.getCurrent();
  if (f !== 0.0) {
    writer.writeFloat(
      4,
      f
    );
  }
  f = message.getCharged();
  if (f !== 0.0) {
    writer.writeFloat(
      5,
      f
    );
  }
  f = message.getHealth();
  if (f !== 0.0) {
    writer.writeFloat(
      6,
      f
    );
  }
  f = message.getBattTemp();
  if (f !== 0.0) {
    writer.writeFloat(
      7,
      f
    );
  }
  f = message.getHeaterTemp();
  if (f !== 0.0) {
    writer.writeFloat(
      8,
      f
    );
  }
  f = message.getMiscStatusBits();
  if (f !== 0) {
    writer.writeUint32(
      9,
      f
    );
  }
};


/**
 * optional bytes tc_snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.getTcSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes tc_snap_addr = 1;
 * This is a type-conversion wrapper around `getTcSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.getTcSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTcSnapAddr()));
};


/**
 * optional bytes tc_snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTcSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.getTcSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTcSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.BatteryUpdate.prototype.setTcSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.BatteryUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.BatteryUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional float voltage = 3;
 * @return {number}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.getVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.BatteryUpdate.prototype.setVoltage = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional float current = 4;
 * @return {number}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.getCurrent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 4, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.BatteryUpdate.prototype.setCurrent = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional float charged = 5;
 * @return {number}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.getCharged = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 5, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.BatteryUpdate.prototype.setCharged = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional float health = 6;
 * @return {number}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.getHealth = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 6, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.BatteryUpdate.prototype.setHealth = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional float batt_temp = 7;
 * @return {number}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.getBattTemp = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 7, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.BatteryUpdate.prototype.setBattTemp = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional float heater_temp = 8;
 * @return {number}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.getHeaterTemp = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 8, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.BatteryUpdate.prototype.setHeaterTemp = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional uint32 misc_status_bits = 9;
 * @return {number}
 */
proto.terrasmart.cloud.BatteryUpdate.prototype.getMiscStatusBits = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.BatteryUpdate.prototype.setMiscStatusBits = function(value) {
  jspb.Message.setField(this, 9, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.PanelUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.PanelUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.PanelUpdate.displayName = 'proto.terrasmart.cloud.PanelUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.PanelUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.PanelUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.PanelUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.PanelUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    tcSnapAddr: msg.getTcSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    solarVoltage: +jspb.Message.getFieldWithDefault(msg, 3, 0.0),
    solarCurrent: +jspb.Message.getFieldWithDefault(msg, 4, 0.0),
    externalInput2Voltage: +jspb.Message.getFieldWithDefault(msg, 5, 0.0),
    externalInput2Current: +jspb.Message.getFieldWithDefault(msg, 6, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.PanelUpdate}
 */
proto.terrasmart.cloud.PanelUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.PanelUpdate;
  return proto.terrasmart.cloud.PanelUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.PanelUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.PanelUpdate}
 */
proto.terrasmart.cloud.PanelUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setTcSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSolarVoltage(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSolarCurrent(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setExternalInput2Voltage(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setExternalInput2Current(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.PanelUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.PanelUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.PanelUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.PanelUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTcSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getSolarVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      3,
      f
    );
  }
  f = message.getSolarCurrent();
  if (f !== 0.0) {
    writer.writeFloat(
      4,
      f
    );
  }
  f = message.getExternalInput2Voltage();
  if (f !== 0.0) {
    writer.writeFloat(
      5,
      f
    );
  }
  f = message.getExternalInput2Current();
  if (f !== 0.0) {
    writer.writeFloat(
      6,
      f
    );
  }
};


/**
 * optional bytes tc_snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.PanelUpdate.prototype.getTcSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes tc_snap_addr = 1;
 * This is a type-conversion wrapper around `getTcSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.PanelUpdate.prototype.getTcSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getTcSnapAddr()));
};


/**
 * optional bytes tc_snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getTcSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.PanelUpdate.prototype.getTcSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getTcSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.PanelUpdate.prototype.setTcSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.PanelUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.PanelUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.PanelUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.PanelUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional float solar_voltage = 3;
 * @return {number}
 */
proto.terrasmart.cloud.PanelUpdate.prototype.getSolarVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.PanelUpdate.prototype.setSolarVoltage = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional float solar_current = 4;
 * @return {number}
 */
proto.terrasmart.cloud.PanelUpdate.prototype.getSolarCurrent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 4, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.PanelUpdate.prototype.setSolarCurrent = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional float external_input_2_voltage = 5;
 * @return {number}
 */
proto.terrasmart.cloud.PanelUpdate.prototype.getExternalInput2Voltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 5, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.PanelUpdate.prototype.setExternalInput2Voltage = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional float external_input_2_current = 6;
 * @return {number}
 */
proto.terrasmart.cloud.PanelUpdate.prototype.getExternalInput2Current = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 6, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.PanelUpdate.prototype.setExternalInput2Current = function(value) {
  jspb.Message.setField(this, 6, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.WeatherUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.WeatherUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.WeatherUpdate.displayName = 'proto.terrasmart.cloud.WeatherUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.WeatherUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.WeatherUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.WeatherUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    windSpeed: +jspb.Message.getFieldWithDefault(msg, 3, 0.0),
    windDirection: +jspb.Message.getFieldWithDefault(msg, 4, 0.0),
    averageWindSpeed: +jspb.Message.getFieldWithDefault(msg, 5, 0.0),
    peakWindSpeed: +jspb.Message.getFieldWithDefault(msg, 6, 0.0),
    temperature: +jspb.Message.getFieldWithDefault(msg, 7, 0.0),
    snowDepth: +jspb.Message.getFieldWithDefault(msg, 8, 0.0),
    increaseAvgWindReporting: jspb.Message.getFieldWithDefault(msg, 9, 0),
    increaseWindGustReporting: jspb.Message.getFieldWithDefault(msg, 10, 0),
    timestamp: jspb.Message.getFieldWithDefault(msg, 11, ""),
    dataType: jspb.Message.getFieldWithDefault(msg, 12, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.WeatherUpdate}
 */
proto.terrasmart.cloud.WeatherUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.WeatherUpdate;
  return proto.terrasmart.cloud.WeatherUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.WeatherUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.WeatherUpdate}
 */
proto.terrasmart.cloud.WeatherUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setWindSpeed(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setWindDirection(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setAverageWindSpeed(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setPeakWindSpeed(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setTemperature(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSnowDepth(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setIncreaseAvgWindReporting(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setIncreaseWindGustReporting(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setTimestamp(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readString());
      msg.setDataType(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.WeatherUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.WeatherUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.WeatherUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getWindSpeed();
  if (f !== 0.0) {
    writer.writeFloat(
      3,
      f
    );
  }
  f = message.getWindDirection();
  if (f !== 0.0) {
    writer.writeFloat(
      4,
      f
    );
  }
  f = message.getAverageWindSpeed();
  if (f !== 0.0) {
    writer.writeFloat(
      5,
      f
    );
  }
  f = message.getPeakWindSpeed();
  if (f !== 0.0) {
    writer.writeFloat(
      6,
      f
    );
  }
  f = message.getTemperature();
  if (f !== 0.0) {
    writer.writeFloat(
      7,
      f
    );
  }
  f = message.getSnowDepth();
  if (f !== 0.0) {
    writer.writeFloat(
      8,
      f
    );
  }
  f = message.getIncreaseAvgWindReporting();
  if (f !== 0) {
    writer.writeSint32(
      9,
      f
    );
  }
  f = message.getIncreaseWindGustReporting();
  if (f !== 0) {
    writer.writeSint32(
      10,
      f
    );
  }
  f = message.getTimestamp();
  if (f.length > 0) {
    writer.writeString(
      11,
      f
    );
  }
  f = message.getDataType();
  if (f.length > 0) {
    writer.writeString(
      12,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.WeatherUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional float wind_speed = 3;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getWindSpeed = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setWindSpeed = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional float wind_direction = 4;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getWindDirection = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 4, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setWindDirection = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional float average_wind_speed = 5;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getAverageWindSpeed = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 5, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setAverageWindSpeed = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional float peak_wind_speed = 6;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getPeakWindSpeed = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 6, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setPeakWindSpeed = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional float temperature = 7;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getTemperature = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 7, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setTemperature = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional float snow_depth = 8;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getSnowDepth = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 8, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setSnowDepth = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional sint32 increase_avg_wind_reporting = 9;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getIncreaseAvgWindReporting = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setIncreaseAvgWindReporting = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional sint32 increase_wind_gust_reporting = 10;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getIncreaseWindGustReporting = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setIncreaseWindGustReporting = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional string timestamp = 11;
 * @return {string}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getTimestamp = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setTimestamp = function(value) {
  jspb.Message.setField(this, 11, value);
};


/**
 * optional string data_type = 12;
 * @return {string}
 */
proto.terrasmart.cloud.WeatherUpdate.prototype.getDataType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 12, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.WeatherUpdate.prototype.setDataType = function(value) {
  jspb.Message.setField(this, 12, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.StartUpData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.StartUpData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.StartUpData.displayName = 'proto.terrasmart.cloud.StartUpData';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.StartUpData.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.StartUpData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.StartUpData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.StartUpData.toObject = function(includeInstance, msg) {
  var f, obj = {
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    fwVersion: jspb.Message.getFieldWithDefault(msg, 2, ""),
    nccbUptime: jspb.Message.getFieldWithDefault(msg, 3, ""),
    linuxUptime: jspb.Message.getFieldWithDefault(msg, 4, ""),
    applicationUptime: jspb.Message.getFieldWithDefault(msg, 5, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.StartUpData}
 */
proto.terrasmart.cloud.StartUpData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.StartUpData;
  return proto.terrasmart.cloud.StartUpData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.StartUpData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.StartUpData}
 */
proto.terrasmart.cloud.StartUpData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setFwVersion(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setNccbUptime(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setLinuxUptime(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setApplicationUptime(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.StartUpData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.StartUpData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.StartUpData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.StartUpData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getFwVersion();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getNccbUptime();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getLinuxUptime();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getApplicationUptime();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional google.protobuf.Timestamp when = 1;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.StartUpData.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 1));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.StartUpData.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.terrasmart.cloud.StartUpData.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.StartUpData.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string FW_Version = 2;
 * @return {string}
 */
proto.terrasmart.cloud.StartUpData.prototype.getFwVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.StartUpData.prototype.setFwVersion = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional string NCCB_Uptime = 3;
 * @return {string}
 */
proto.terrasmart.cloud.StartUpData.prototype.getNccbUptime = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.StartUpData.prototype.setNccbUptime = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional string Linux_Uptime = 4;
 * @return {string}
 */
proto.terrasmart.cloud.StartUpData.prototype.getLinuxUptime = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.StartUpData.prototype.setLinuxUptime = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional string Application_Uptime = 5;
 * @return {string}
 */
proto.terrasmart.cloud.StartUpData.prototype.getApplicationUptime = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.StartUpData.prototype.setApplicationUptime = function(value) {
  jspb.Message.setField(this, 5, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.ConfigUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.ConfigUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.ConfigUpdate.displayName = 'proto.terrasmart.cloud.ConfigUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.ConfigUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.ConfigUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.ConfigUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    modelDevice: jspb.Message.getFieldWithDefault(msg, 3, 0),
    locationLat: +jspb.Message.getFieldWithDefault(msg, 4, 0.0),
    locationLng: +jspb.Message.getFieldWithDefault(msg, 5, 0.0),
    locationText: jspb.Message.getFieldWithDefault(msg, 6, ""),
    hardwareRev: jspb.Message.getFieldWithDefault(msg, 7, 0),
    firmwareRev: jspb.Message.getFieldWithDefault(msg, 8, 0),
    configLabel: jspb.Message.getFieldWithDefault(msg, 9, ""),
    configTimestamp: jspb.Message.getFieldWithDefault(msg, 10, 0),
    siteName: jspb.Message.getFieldWithDefault(msg, 11, ""),
    panelHorizontalCalAngle: jspb.Message.getFieldWithDefault(msg, 12, 0),
    panelMinCalAngle: jspb.Message.getFieldWithDefault(msg, 13, 0),
    panelMaxCalAngle: jspb.Message.getFieldWithDefault(msg, 14, 0),
    configFlags: jspb.Message.getFieldWithDefault(msg, 15, 0),
    segments0PanelArrayWidth: jspb.Message.getFieldWithDefault(msg, 16, 0),
    segments0SpacingToEast: jspb.Message.getFieldWithDefault(msg, 17, 0),
    segments0SpacingToWest: jspb.Message.getFieldWithDefault(msg, 18, 0),
    segments0DeltaHeightEast: jspb.Message.getFieldWithDefault(msg, 19, 0),
    segments0DeltaHeightWest: jspb.Message.getFieldWithDefault(msg, 20, 0),
    segments1PanelArrayWidth: jspb.Message.getFieldWithDefault(msg, 21, 0),
    segments1SpacingToEast: jspb.Message.getFieldWithDefault(msg, 22, 0),
    segments1SpacingToWest: jspb.Message.getFieldWithDefault(msg, 23, 0),
    segments1DeltaHeightEast: jspb.Message.getFieldWithDefault(msg, 24, 0),
    segments1DeltaHeightWest: jspb.Message.getFieldWithDefault(msg, 25, 0),
    presetAngles0PresetAngle: jspb.Message.getFieldWithDefault(msg, 26, 0),
    presetAngles0NearestEnabled: jspb.Message.getFieldWithDefault(msg, 27, false),
    presetAngles1PresetAngle: jspb.Message.getFieldWithDefault(msg, 28, 0),
    presetAngles1NearestEnabled: jspb.Message.getFieldWithDefault(msg, 29, false),
    presetAngles2PresetAngle: jspb.Message.getFieldWithDefault(msg, 30, 0),
    presetAngles2NearestEnabled: jspb.Message.getFieldWithDefault(msg, 31, false),
    presetAngles3PresetAngle: jspb.Message.getFieldWithDefault(msg, 32, 0),
    presetAngles3NearestEnabled: jspb.Message.getFieldWithDefault(msg, 33, false),
    presetAngles4PresetAngle: jspb.Message.getFieldWithDefault(msg, 34, 0),
    presetAngles4NearestEnabled: jspb.Message.getFieldWithDefault(msg, 35, false),
    presetAngles5PresetAngle: jspb.Message.getFieldWithDefault(msg, 36, 0),
    presetAngles5NearestEnabled: jspb.Message.getFieldWithDefault(msg, 37, false),
    presetAngles6PresetAngle: jspb.Message.getFieldWithDefault(msg, 38, 0),
    presetAngles6NearestEnabled: jspb.Message.getFieldWithDefault(msg, 39, false),
    presetAngles7PresetAngle: jspb.Message.getFieldWithDefault(msg, 40, 0),
    presetAngles7NearestEnabled: jspb.Message.getFieldWithDefault(msg, 41, false),
    presetAngles8PresetAngle: jspb.Message.getFieldWithDefault(msg, 42, 0),
    presetAngles8NearestEnabled: jspb.Message.getFieldWithDefault(msg, 43, false),
    presetAngles9PresetAngle: jspb.Message.getFieldWithDefault(msg, 44, 0),
    presetAngles9NearestEnabled: jspb.Message.getFieldWithDefault(msg, 45, false),
    presetAngles10PresetAngle: jspb.Message.getFieldWithDefault(msg, 46, 0),
    presetAngles10NearestEnabled: jspb.Message.getFieldWithDefault(msg, 47, false),
    presetAngles11PresetAngle: jspb.Message.getFieldWithDefault(msg, 48, 0),
    presetAngles11NearestEnabled: jspb.Message.getFieldWithDefault(msg, 49, false),
    presetAngles12PresetAngle: jspb.Message.getFieldWithDefault(msg, 50, 0),
    presetAngles12NearestEnabled: jspb.Message.getFieldWithDefault(msg, 51, false),
    presetAngles13PresetAngle: jspb.Message.getFieldWithDefault(msg, 52, 0),
    presetAngles13NearestEnabled: jspb.Message.getFieldWithDefault(msg, 53, false),
    presetAngles14PresetAngle: jspb.Message.getFieldWithDefault(msg, 54, 0),
    presetAngles14NearestEnabled: jspb.Message.getFieldWithDefault(msg, 55, false),
    presetAngles15PresetAngle: jspb.Message.getFieldWithDefault(msg, 56, 0),
    presetAngles15NearestEnabled: jspb.Message.getFieldWithDefault(msg, 57, false),
    swocRequiredDuration: +jspb.Message.getFieldWithDefault(msg, 58, 0.0),
    swocThreshold: +jspb.Message.getFieldWithDefault(msg, 59, 0.0),
    encodedHardLimitRegister: jspb.Message.getFieldWithDefault(msg, 60, 0),
    encodedSoftLimitRegister: jspb.Message.getFieldWithDefault(msg, 61, 0),
    batteryRev: jspb.Message.getFieldWithDefault(msg, 62, ""),
    scriptRev: jspb.Message.getFieldWithDefault(msg, 63, ""),
    radioRev: jspb.Message.getFieldWithDefault(msg, 64, ""),
    macAddress: jspb.Message.getFieldWithDefault(msg, 65, ""),
    stmRev: jspb.Message.getFieldWithDefault(msg, 66, ""),
    batteryFlashRev: jspb.Message.getFieldWithDefault(msg, 67, ""),
    snowSensorHeight: +jspb.Message.getFieldWithDefault(msg, 68, 0.0),
    windDirOffset: +jspb.Message.getFieldWithDefault(msg, 69, 0.0),
    trackingMinAngle: jspb.Message.getFieldWithDefault(msg, 70, 0),
    trackingMaxAngle: jspb.Message.getFieldWithDefault(msg, 71, 0),
    dynamicMinAngle: jspb.Message.getFieldWithDefault(msg, 72, 0),
    dynamicMaxAngle: jspb.Message.getFieldWithDefault(msg, 73, 0),
    simulationFlags: jspb.Message.getFieldWithDefault(msg, 74, 0),
    heaterK: +jspb.Message.getFieldWithDefault(msg, 75, 0.0),
    preheatingBatteryThreshold: jspb.Message.getFieldWithDefault(msg, 76, 0),
    preheatingTemperatureThreshold: +jspb.Message.getFieldWithDefault(msg, 77, 0.0),
    snowSheddingDeadbandAngle: +jspb.Message.getFieldWithDefault(msg, 78, 0.0),
    snowSheddingDuration: jspb.Message.getFieldWithDefault(msg, 79, 0),
    autoshedTemperatureThreshold: +jspb.Message.getFieldWithDefault(msg, 80, 0.0),
    autoshedMinutesThreshold: jspb.Message.getFieldWithDefault(msg, 81, 0),
    autoshedBatteryThreshold: jspb.Message.getFieldWithDefault(msg, 82, 0),
    lbasEntryThreshold: jspb.Message.getFieldWithDefault(msg, 83, 0),
    lbasExitThreshold: jspb.Message.getFieldWithDefault(msg, 84, 0),
    medianFilterLength: jspb.Message.getFieldWithDefault(msg, 85, 0),
    wxDataRecordFrequency: jspb.Message.getFieldWithDefault(msg, 86, 0),
    snowSensorType: jspb.Message.getFieldWithDefault(msg, 87, 0),
    avgWindSpeedCorrectionFactor: +jspb.Message.getFieldWithDefault(msg, 88, 0.0),
    peakWindSpeedCorrectionFactor: +jspb.Message.getFieldWithDefault(msg, 89, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.ConfigUpdate}
 */
proto.terrasmart.cloud.ConfigUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.ConfigUpdate;
  return proto.terrasmart.cloud.ConfigUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.ConfigUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.ConfigUpdate}
 */
proto.terrasmart.cloud.ConfigUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setModelDevice(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLocationLat(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readDouble());
      msg.setLocationLng(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setLocationText(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setHardwareRev(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setFirmwareRev(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setConfigLabel(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setConfigTimestamp(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setSiteName(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPanelHorizontalCalAngle(value);
      break;
    case 13:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPanelMinCalAngle(value);
      break;
    case 14:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPanelMaxCalAngle(value);
      break;
    case 15:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setConfigFlags(value);
      break;
    case 16:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setSegments0PanelArrayWidth(value);
      break;
    case 17:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setSegments0SpacingToEast(value);
      break;
    case 18:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setSegments0SpacingToWest(value);
      break;
    case 19:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setSegments0DeltaHeightEast(value);
      break;
    case 20:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setSegments0DeltaHeightWest(value);
      break;
    case 21:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setSegments1PanelArrayWidth(value);
      break;
    case 22:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setSegments1SpacingToEast(value);
      break;
    case 23:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setSegments1SpacingToWest(value);
      break;
    case 24:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setSegments1DeltaHeightEast(value);
      break;
    case 25:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setSegments1DeltaHeightWest(value);
      break;
    case 26:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles0PresetAngle(value);
      break;
    case 27:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles0NearestEnabled(value);
      break;
    case 28:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles1PresetAngle(value);
      break;
    case 29:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles1NearestEnabled(value);
      break;
    case 30:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles2PresetAngle(value);
      break;
    case 31:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles2NearestEnabled(value);
      break;
    case 32:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles3PresetAngle(value);
      break;
    case 33:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles3NearestEnabled(value);
      break;
    case 34:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles4PresetAngle(value);
      break;
    case 35:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles4NearestEnabled(value);
      break;
    case 36:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles5PresetAngle(value);
      break;
    case 37:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles5NearestEnabled(value);
      break;
    case 38:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles6PresetAngle(value);
      break;
    case 39:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles6NearestEnabled(value);
      break;
    case 40:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles7PresetAngle(value);
      break;
    case 41:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles7NearestEnabled(value);
      break;
    case 42:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles8PresetAngle(value);
      break;
    case 43:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles8NearestEnabled(value);
      break;
    case 44:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles9PresetAngle(value);
      break;
    case 45:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles9NearestEnabled(value);
      break;
    case 46:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles10PresetAngle(value);
      break;
    case 47:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles10NearestEnabled(value);
      break;
    case 48:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles11PresetAngle(value);
      break;
    case 49:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles11NearestEnabled(value);
      break;
    case 50:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles12PresetAngle(value);
      break;
    case 51:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles12NearestEnabled(value);
      break;
    case 52:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles13PresetAngle(value);
      break;
    case 53:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles13NearestEnabled(value);
      break;
    case 54:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles14PresetAngle(value);
      break;
    case 55:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles14NearestEnabled(value);
      break;
    case 56:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setPresetAngles15PresetAngle(value);
      break;
    case 57:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setPresetAngles15NearestEnabled(value);
      break;
    case 58:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSwocRequiredDuration(value);
      break;
    case 59:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSwocThreshold(value);
      break;
    case 60:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setEncodedHardLimitRegister(value);
      break;
    case 61:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setEncodedSoftLimitRegister(value);
      break;
    case 62:
      var value = /** @type {string} */ (reader.readString());
      msg.setBatteryRev(value);
      break;
    case 63:
      var value = /** @type {string} */ (reader.readString());
      msg.setScriptRev(value);
      break;
    case 64:
      var value = /** @type {string} */ (reader.readString());
      msg.setRadioRev(value);
      break;
    case 65:
      var value = /** @type {string} */ (reader.readString());
      msg.setMacAddress(value);
      break;
    case 66:
      var value = /** @type {string} */ (reader.readString());
      msg.setStmRev(value);
      break;
    case 67:
      var value = /** @type {string} */ (reader.readString());
      msg.setBatteryFlashRev(value);
      break;
    case 68:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSnowSensorHeight(value);
      break;
    case 69:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setWindDirOffset(value);
      break;
    case 70:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setTrackingMinAngle(value);
      break;
    case 71:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setTrackingMaxAngle(value);
      break;
    case 72:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setDynamicMinAngle(value);
      break;
    case 73:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setDynamicMaxAngle(value);
      break;
    case 74:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setSimulationFlags(value);
      break;
    case 75:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setHeaterK(value);
      break;
    case 76:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPreheatingBatteryThreshold(value);
      break;
    case 77:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setPreheatingTemperatureThreshold(value);
      break;
    case 78:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSnowSheddingDeadbandAngle(value);
      break;
    case 79:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setSnowSheddingDuration(value);
      break;
    case 80:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setAutoshedTemperatureThreshold(value);
      break;
    case 81:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAutoshedMinutesThreshold(value);
      break;
    case 82:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setAutoshedBatteryThreshold(value);
      break;
    case 83:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLbasEntryThreshold(value);
      break;
    case 84:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setLbasExitThreshold(value);
      break;
    case 85:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setMedianFilterLength(value);
      break;
    case 86:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setWxDataRecordFrequency(value);
      break;
    case 87:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setSnowSensorType(value);
      break;
    case 88:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setAvgWindSpeedCorrectionFactor(value);
      break;
    case 89:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setPeakWindSpeedCorrectionFactor(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.ConfigUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.ConfigUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.ConfigUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getModelDevice();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getLocationLat();
  if (f !== 0.0) {
    writer.writeDouble(
      4,
      f
    );
  }
  f = message.getLocationLng();
  if (f !== 0.0) {
    writer.writeDouble(
      5,
      f
    );
  }
  f = message.getLocationText();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getHardwareRev();
  if (f !== 0) {
    writer.writeUint32(
      7,
      f
    );
  }
  f = message.getFirmwareRev();
  if (f !== 0) {
    writer.writeUint32(
      8,
      f
    );
  }
  f = message.getConfigLabel();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
  f = message.getConfigTimestamp();
  if (f !== 0) {
    writer.writeUint64(
      10,
      f
    );
  }
  f = message.getSiteName();
  if (f.length > 0) {
    writer.writeString(
      11,
      f
    );
  }
  f = message.getPanelHorizontalCalAngle();
  if (f !== 0) {
    writer.writeSint32(
      12,
      f
    );
  }
  f = message.getPanelMinCalAngle();
  if (f !== 0) {
    writer.writeSint32(
      13,
      f
    );
  }
  f = message.getPanelMaxCalAngle();
  if (f !== 0) {
    writer.writeSint32(
      14,
      f
    );
  }
  f = message.getConfigFlags();
  if (f !== 0) {
    writer.writeUint32(
      15,
      f
    );
  }
  f = message.getSegments0PanelArrayWidth();
  if (f !== 0) {
    writer.writeSint32(
      16,
      f
    );
  }
  f = message.getSegments0SpacingToEast();
  if (f !== 0) {
    writer.writeSint32(
      17,
      f
    );
  }
  f = message.getSegments0SpacingToWest();
  if (f !== 0) {
    writer.writeSint32(
      18,
      f
    );
  }
  f = message.getSegments0DeltaHeightEast();
  if (f !== 0) {
    writer.writeSint32(
      19,
      f
    );
  }
  f = message.getSegments0DeltaHeightWest();
  if (f !== 0) {
    writer.writeSint32(
      20,
      f
    );
  }
  f = message.getSegments1PanelArrayWidth();
  if (f !== 0) {
    writer.writeSint32(
      21,
      f
    );
  }
  f = message.getSegments1SpacingToEast();
  if (f !== 0) {
    writer.writeSint32(
      22,
      f
    );
  }
  f = message.getSegments1SpacingToWest();
  if (f !== 0) {
    writer.writeSint32(
      23,
      f
    );
  }
  f = message.getSegments1DeltaHeightEast();
  if (f !== 0) {
    writer.writeSint32(
      24,
      f
    );
  }
  f = message.getSegments1DeltaHeightWest();
  if (f !== 0) {
    writer.writeSint32(
      25,
      f
    );
  }
  f = message.getPresetAngles0PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      26,
      f
    );
  }
  f = message.getPresetAngles0NearestEnabled();
  if (f) {
    writer.writeBool(
      27,
      f
    );
  }
  f = message.getPresetAngles1PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      28,
      f
    );
  }
  f = message.getPresetAngles1NearestEnabled();
  if (f) {
    writer.writeBool(
      29,
      f
    );
  }
  f = message.getPresetAngles2PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      30,
      f
    );
  }
  f = message.getPresetAngles2NearestEnabled();
  if (f) {
    writer.writeBool(
      31,
      f
    );
  }
  f = message.getPresetAngles3PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      32,
      f
    );
  }
  f = message.getPresetAngles3NearestEnabled();
  if (f) {
    writer.writeBool(
      33,
      f
    );
  }
  f = message.getPresetAngles4PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      34,
      f
    );
  }
  f = message.getPresetAngles4NearestEnabled();
  if (f) {
    writer.writeBool(
      35,
      f
    );
  }
  f = message.getPresetAngles5PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      36,
      f
    );
  }
  f = message.getPresetAngles5NearestEnabled();
  if (f) {
    writer.writeBool(
      37,
      f
    );
  }
  f = message.getPresetAngles6PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      38,
      f
    );
  }
  f = message.getPresetAngles6NearestEnabled();
  if (f) {
    writer.writeBool(
      39,
      f
    );
  }
  f = message.getPresetAngles7PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      40,
      f
    );
  }
  f = message.getPresetAngles7NearestEnabled();
  if (f) {
    writer.writeBool(
      41,
      f
    );
  }
  f = message.getPresetAngles8PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      42,
      f
    );
  }
  f = message.getPresetAngles8NearestEnabled();
  if (f) {
    writer.writeBool(
      43,
      f
    );
  }
  f = message.getPresetAngles9PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      44,
      f
    );
  }
  f = message.getPresetAngles9NearestEnabled();
  if (f) {
    writer.writeBool(
      45,
      f
    );
  }
  f = message.getPresetAngles10PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      46,
      f
    );
  }
  f = message.getPresetAngles10NearestEnabled();
  if (f) {
    writer.writeBool(
      47,
      f
    );
  }
  f = message.getPresetAngles11PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      48,
      f
    );
  }
  f = message.getPresetAngles11NearestEnabled();
  if (f) {
    writer.writeBool(
      49,
      f
    );
  }
  f = message.getPresetAngles12PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      50,
      f
    );
  }
  f = message.getPresetAngles12NearestEnabled();
  if (f) {
    writer.writeBool(
      51,
      f
    );
  }
  f = message.getPresetAngles13PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      52,
      f
    );
  }
  f = message.getPresetAngles13NearestEnabled();
  if (f) {
    writer.writeBool(
      53,
      f
    );
  }
  f = message.getPresetAngles14PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      54,
      f
    );
  }
  f = message.getPresetAngles14NearestEnabled();
  if (f) {
    writer.writeBool(
      55,
      f
    );
  }
  f = message.getPresetAngles15PresetAngle();
  if (f !== 0) {
    writer.writeSint32(
      56,
      f
    );
  }
  f = message.getPresetAngles15NearestEnabled();
  if (f) {
    writer.writeBool(
      57,
      f
    );
  }
  f = message.getSwocRequiredDuration();
  if (f !== 0.0) {
    writer.writeFloat(
      58,
      f
    );
  }
  f = message.getSwocThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      59,
      f
    );
  }
  f = message.getEncodedHardLimitRegister();
  if (f !== 0) {
    writer.writeSint32(
      60,
      f
    );
  }
  f = message.getEncodedSoftLimitRegister();
  if (f !== 0) {
    writer.writeSint32(
      61,
      f
    );
  }
  f = message.getBatteryRev();
  if (f.length > 0) {
    writer.writeString(
      62,
      f
    );
  }
  f = message.getScriptRev();
  if (f.length > 0) {
    writer.writeString(
      63,
      f
    );
  }
  f = message.getRadioRev();
  if (f.length > 0) {
    writer.writeString(
      64,
      f
    );
  }
  f = message.getMacAddress();
  if (f.length > 0) {
    writer.writeString(
      65,
      f
    );
  }
  f = message.getStmRev();
  if (f.length > 0) {
    writer.writeString(
      66,
      f
    );
  }
  f = message.getBatteryFlashRev();
  if (f.length > 0) {
    writer.writeString(
      67,
      f
    );
  }
  f = message.getSnowSensorHeight();
  if (f !== 0.0) {
    writer.writeFloat(
      68,
      f
    );
  }
  f = message.getWindDirOffset();
  if (f !== 0.0) {
    writer.writeFloat(
      69,
      f
    );
  }
  f = message.getTrackingMinAngle();
  if (f !== 0) {
    writer.writeSint32(
      70,
      f
    );
  }
  f = message.getTrackingMaxAngle();
  if (f !== 0) {
    writer.writeSint32(
      71,
      f
    );
  }
  f = message.getDynamicMinAngle();
  if (f !== 0) {
    writer.writeSint32(
      72,
      f
    );
  }
  f = message.getDynamicMaxAngle();
  if (f !== 0) {
    writer.writeSint32(
      73,
      f
    );
  }
  f = message.getSimulationFlags();
  if (f !== 0) {
    writer.writeUint32(
      74,
      f
    );
  }
  f = message.getHeaterK();
  if (f !== 0.0) {
    writer.writeFloat(
      75,
      f
    );
  }
  f = message.getPreheatingBatteryThreshold();
  if (f !== 0) {
    writer.writeUint32(
      76,
      f
    );
  }
  f = message.getPreheatingTemperatureThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      77,
      f
    );
  }
  f = message.getSnowSheddingDeadbandAngle();
  if (f !== 0.0) {
    writer.writeFloat(
      78,
      f
    );
  }
  f = message.getSnowSheddingDuration();
  if (f !== 0) {
    writer.writeUint32(
      79,
      f
    );
  }
  f = message.getAutoshedTemperatureThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      80,
      f
    );
  }
  f = message.getAutoshedMinutesThreshold();
  if (f !== 0) {
    writer.writeUint32(
      81,
      f
    );
  }
  f = message.getAutoshedBatteryThreshold();
  if (f !== 0) {
    writer.writeUint32(
      82,
      f
    );
  }
  f = message.getLbasEntryThreshold();
  if (f !== 0) {
    writer.writeUint32(
      83,
      f
    );
  }
  f = message.getLbasExitThreshold();
  if (f !== 0) {
    writer.writeUint32(
      84,
      f
    );
  }
  f = message.getMedianFilterLength();
  if (f !== 0) {
    writer.writeUint32(
      85,
      f
    );
  }
  f = message.getWxDataRecordFrequency();
  if (f !== 0) {
    writer.writeUint32(
      86,
      f
    );
  }
  f = message.getSnowSensorType();
  if (f !== 0) {
    writer.writeUint32(
      87,
      f
    );
  }
  f = message.getAvgWindSpeedCorrectionFactor();
  if (f !== 0.0) {
    writer.writeFloat(
      88,
      f
    );
  }
  f = message.getPeakWindSpeedCorrectionFactor();
  if (f !== 0.0) {
    writer.writeFloat(
      89,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.ConfigUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint32 model_device = 3;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getModelDevice = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setModelDevice = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional double location_lat = 4;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getLocationLat = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 4, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setLocationLat = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional double location_lng = 5;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getLocationLng = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 5, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setLocationLng = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional string location_text = 6;
 * @return {string}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getLocationText = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setLocationText = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional uint32 hardware_rev = 7;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getHardwareRev = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setHardwareRev = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional uint32 firmware_rev = 8;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getFirmwareRev = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setFirmwareRev = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional string config_label = 9;
 * @return {string}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getConfigLabel = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setConfigLabel = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional uint64 config_timestamp = 10;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getConfigTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setConfigTimestamp = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional string site_name = 11;
 * @return {string}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSiteName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSiteName = function(value) {
  jspb.Message.setField(this, 11, value);
};


/**
 * optional sint32 panel_horizontal_cal_angle = 12;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPanelHorizontalCalAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPanelHorizontalCalAngle = function(value) {
  jspb.Message.setField(this, 12, value);
};


/**
 * optional sint32 panel_min_cal_angle = 13;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPanelMinCalAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 13, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPanelMinCalAngle = function(value) {
  jspb.Message.setField(this, 13, value);
};


/**
 * optional sint32 panel_max_cal_angle = 14;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPanelMaxCalAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 14, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPanelMaxCalAngle = function(value) {
  jspb.Message.setField(this, 14, value);
};


/**
 * optional uint32 config_flags = 15;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getConfigFlags = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 15, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setConfigFlags = function(value) {
  jspb.Message.setField(this, 15, value);
};


/**
 * optional sint32 segments_0_panel_array_width = 16;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSegments0PanelArrayWidth = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 16, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSegments0PanelArrayWidth = function(value) {
  jspb.Message.setField(this, 16, value);
};


/**
 * optional sint32 segments_0_spacing_to_east = 17;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSegments0SpacingToEast = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 17, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSegments0SpacingToEast = function(value) {
  jspb.Message.setField(this, 17, value);
};


/**
 * optional sint32 segments_0_spacing_to_west = 18;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSegments0SpacingToWest = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 18, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSegments0SpacingToWest = function(value) {
  jspb.Message.setField(this, 18, value);
};


/**
 * optional sint32 segments_0_delta_height_east = 19;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSegments0DeltaHeightEast = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 19, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSegments0DeltaHeightEast = function(value) {
  jspb.Message.setField(this, 19, value);
};


/**
 * optional sint32 segments_0_delta_height_west = 20;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSegments0DeltaHeightWest = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 20, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSegments0DeltaHeightWest = function(value) {
  jspb.Message.setField(this, 20, value);
};


/**
 * optional sint32 segments_1_panel_array_width = 21;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSegments1PanelArrayWidth = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 21, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSegments1PanelArrayWidth = function(value) {
  jspb.Message.setField(this, 21, value);
};


/**
 * optional sint32 segments_1_spacing_to_east = 22;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSegments1SpacingToEast = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 22, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSegments1SpacingToEast = function(value) {
  jspb.Message.setField(this, 22, value);
};


/**
 * optional sint32 segments_1_spacing_to_west = 23;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSegments1SpacingToWest = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 23, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSegments1SpacingToWest = function(value) {
  jspb.Message.setField(this, 23, value);
};


/**
 * optional sint32 segments_1_delta_height_east = 24;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSegments1DeltaHeightEast = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 24, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSegments1DeltaHeightEast = function(value) {
  jspb.Message.setField(this, 24, value);
};


/**
 * optional sint32 segments_1_delta_height_west = 25;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSegments1DeltaHeightWest = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 25, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSegments1DeltaHeightWest = function(value) {
  jspb.Message.setField(this, 25, value);
};


/**
 * optional sint32 preset_angles_0_preset_angle = 26;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles0PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 26, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles0PresetAngle = function(value) {
  jspb.Message.setField(this, 26, value);
};


/**
 * optional bool preset_angles_0_nearest_enabled = 27;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles0NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 27, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles0NearestEnabled = function(value) {
  jspb.Message.setField(this, 27, value);
};


/**
 * optional sint32 preset_angles_1_preset_angle = 28;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles1PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 28, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles1PresetAngle = function(value) {
  jspb.Message.setField(this, 28, value);
};


/**
 * optional bool preset_angles_1_nearest_enabled = 29;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles1NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 29, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles1NearestEnabled = function(value) {
  jspb.Message.setField(this, 29, value);
};


/**
 * optional sint32 preset_angles_2_preset_angle = 30;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles2PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 30, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles2PresetAngle = function(value) {
  jspb.Message.setField(this, 30, value);
};


/**
 * optional bool preset_angles_2_nearest_enabled = 31;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles2NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 31, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles2NearestEnabled = function(value) {
  jspb.Message.setField(this, 31, value);
};


/**
 * optional sint32 preset_angles_3_preset_angle = 32;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles3PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 32, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles3PresetAngle = function(value) {
  jspb.Message.setField(this, 32, value);
};


/**
 * optional bool preset_angles_3_nearest_enabled = 33;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles3NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 33, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles3NearestEnabled = function(value) {
  jspb.Message.setField(this, 33, value);
};


/**
 * optional sint32 preset_angles_4_preset_angle = 34;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles4PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 34, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles4PresetAngle = function(value) {
  jspb.Message.setField(this, 34, value);
};


/**
 * optional bool preset_angles_4_nearest_enabled = 35;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles4NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 35, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles4NearestEnabled = function(value) {
  jspb.Message.setField(this, 35, value);
};


/**
 * optional sint32 preset_angles_5_preset_angle = 36;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles5PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 36, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles5PresetAngle = function(value) {
  jspb.Message.setField(this, 36, value);
};


/**
 * optional bool preset_angles_5_nearest_enabled = 37;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles5NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 37, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles5NearestEnabled = function(value) {
  jspb.Message.setField(this, 37, value);
};


/**
 * optional sint32 preset_angles_6_preset_angle = 38;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles6PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 38, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles6PresetAngle = function(value) {
  jspb.Message.setField(this, 38, value);
};


/**
 * optional bool preset_angles_6_nearest_enabled = 39;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles6NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 39, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles6NearestEnabled = function(value) {
  jspb.Message.setField(this, 39, value);
};


/**
 * optional sint32 preset_angles_7_preset_angle = 40;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles7PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 40, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles7PresetAngle = function(value) {
  jspb.Message.setField(this, 40, value);
};


/**
 * optional bool preset_angles_7_nearest_enabled = 41;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles7NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 41, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles7NearestEnabled = function(value) {
  jspb.Message.setField(this, 41, value);
};


/**
 * optional sint32 preset_angles_8_preset_angle = 42;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles8PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 42, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles8PresetAngle = function(value) {
  jspb.Message.setField(this, 42, value);
};


/**
 * optional bool preset_angles_8_nearest_enabled = 43;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles8NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 43, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles8NearestEnabled = function(value) {
  jspb.Message.setField(this, 43, value);
};


/**
 * optional sint32 preset_angles_9_preset_angle = 44;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles9PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 44, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles9PresetAngle = function(value) {
  jspb.Message.setField(this, 44, value);
};


/**
 * optional bool preset_angles_9_nearest_enabled = 45;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles9NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 45, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles9NearestEnabled = function(value) {
  jspb.Message.setField(this, 45, value);
};


/**
 * optional sint32 preset_angles_10_preset_angle = 46;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles10PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 46, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles10PresetAngle = function(value) {
  jspb.Message.setField(this, 46, value);
};


/**
 * optional bool preset_angles_10_nearest_enabled = 47;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles10NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 47, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles10NearestEnabled = function(value) {
  jspb.Message.setField(this, 47, value);
};


/**
 * optional sint32 preset_angles_11_preset_angle = 48;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles11PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 48, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles11PresetAngle = function(value) {
  jspb.Message.setField(this, 48, value);
};


/**
 * optional bool preset_angles_11_nearest_enabled = 49;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles11NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 49, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles11NearestEnabled = function(value) {
  jspb.Message.setField(this, 49, value);
};


/**
 * optional sint32 preset_angles_12_preset_angle = 50;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles12PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 50, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles12PresetAngle = function(value) {
  jspb.Message.setField(this, 50, value);
};


/**
 * optional bool preset_angles_12_nearest_enabled = 51;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles12NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 51, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles12NearestEnabled = function(value) {
  jspb.Message.setField(this, 51, value);
};


/**
 * optional sint32 preset_angles_13_preset_angle = 52;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles13PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 52, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles13PresetAngle = function(value) {
  jspb.Message.setField(this, 52, value);
};


/**
 * optional bool preset_angles_13_nearest_enabled = 53;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles13NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 53, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles13NearestEnabled = function(value) {
  jspb.Message.setField(this, 53, value);
};


/**
 * optional sint32 preset_angles_14_preset_angle = 54;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles14PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 54, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles14PresetAngle = function(value) {
  jspb.Message.setField(this, 54, value);
};


/**
 * optional bool preset_angles_14_nearest_enabled = 55;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles14NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 55, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles14NearestEnabled = function(value) {
  jspb.Message.setField(this, 55, value);
};


/**
 * optional sint32 preset_angles_15_preset_angle = 56;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles15PresetAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 56, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles15PresetAngle = function(value) {
  jspb.Message.setField(this, 56, value);
};


/**
 * optional bool preset_angles_15_nearest_enabled = 57;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPresetAngles15NearestEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 57, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPresetAngles15NearestEnabled = function(value) {
  jspb.Message.setField(this, 57, value);
};


/**
 * optional float swoc_required_duration = 58;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSwocRequiredDuration = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 58, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSwocRequiredDuration = function(value) {
  jspb.Message.setField(this, 58, value);
};


/**
 * optional float swoc_threshold = 59;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSwocThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 59, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSwocThreshold = function(value) {
  jspb.Message.setField(this, 59, value);
};


/**
 * optional sint32 encoded_hard_limit_register = 60;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getEncodedHardLimitRegister = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 60, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setEncodedHardLimitRegister = function(value) {
  jspb.Message.setField(this, 60, value);
};


/**
 * optional sint32 encoded_soft_limit_register = 61;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getEncodedSoftLimitRegister = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 61, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setEncodedSoftLimitRegister = function(value) {
  jspb.Message.setField(this, 61, value);
};


/**
 * optional string battery_rev = 62;
 * @return {string}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getBatteryRev = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 62, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setBatteryRev = function(value) {
  jspb.Message.setField(this, 62, value);
};


/**
 * optional string script_rev = 63;
 * @return {string}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getScriptRev = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 63, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setScriptRev = function(value) {
  jspb.Message.setField(this, 63, value);
};


/**
 * optional string radio_rev = 64;
 * @return {string}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getRadioRev = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 64, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setRadioRev = function(value) {
  jspb.Message.setField(this, 64, value);
};


/**
 * optional string mac_address = 65;
 * @return {string}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getMacAddress = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 65, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setMacAddress = function(value) {
  jspb.Message.setField(this, 65, value);
};


/**
 * optional string stm_rev = 66;
 * @return {string}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getStmRev = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 66, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setStmRev = function(value) {
  jspb.Message.setField(this, 66, value);
};


/**
 * optional string battery_flash_rev = 67;
 * @return {string}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getBatteryFlashRev = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 67, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setBatteryFlashRev = function(value) {
  jspb.Message.setField(this, 67, value);
};


/**
 * optional float snow_sensor_height = 68;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSnowSensorHeight = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 68, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSnowSensorHeight = function(value) {
  jspb.Message.setField(this, 68, value);
};


/**
 * optional float wind_dir_offset = 69;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getWindDirOffset = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 69, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setWindDirOffset = function(value) {
  jspb.Message.setField(this, 69, value);
};


/**
 * optional sint32 tracking_min_angle = 70;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getTrackingMinAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 70, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setTrackingMinAngle = function(value) {
  jspb.Message.setField(this, 70, value);
};


/**
 * optional sint32 tracking_max_angle = 71;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getTrackingMaxAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 71, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setTrackingMaxAngle = function(value) {
  jspb.Message.setField(this, 71, value);
};


/**
 * optional sint32 dynamic_min_angle = 72;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getDynamicMinAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 72, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setDynamicMinAngle = function(value) {
  jspb.Message.setField(this, 72, value);
};


/**
 * optional sint32 dynamic_max_angle = 73;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getDynamicMaxAngle = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 73, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setDynamicMaxAngle = function(value) {
  jspb.Message.setField(this, 73, value);
};


/**
 * optional uint32 simulation_flags = 74;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSimulationFlags = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 74, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSimulationFlags = function(value) {
  jspb.Message.setField(this, 74, value);
};


/**
 * optional float heater_k = 75;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getHeaterK = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 75, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setHeaterK = function(value) {
  jspb.Message.setField(this, 75, value);
};


/**
 * optional uint32 preheating_battery_threshold = 76;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPreheatingBatteryThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 76, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPreheatingBatteryThreshold = function(value) {
  jspb.Message.setField(this, 76, value);
};


/**
 * optional float preheating_temperature_threshold = 77;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPreheatingTemperatureThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 77, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPreheatingTemperatureThreshold = function(value) {
  jspb.Message.setField(this, 77, value);
};


/**
 * optional float snow_shedding_deadband_angle = 78;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSnowSheddingDeadbandAngle = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 78, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSnowSheddingDeadbandAngle = function(value) {
  jspb.Message.setField(this, 78, value);
};


/**
 * optional uint32 snow_shedding_duration = 79;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSnowSheddingDuration = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 79, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSnowSheddingDuration = function(value) {
  jspb.Message.setField(this, 79, value);
};


/**
 * optional float autoshed_temperature_threshold = 80;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getAutoshedTemperatureThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 80, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setAutoshedTemperatureThreshold = function(value) {
  jspb.Message.setField(this, 80, value);
};


/**
 * optional uint32 autoshed_minutes_threshold = 81;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getAutoshedMinutesThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 81, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setAutoshedMinutesThreshold = function(value) {
  jspb.Message.setField(this, 81, value);
};


/**
 * optional uint32 autoshed_battery_threshold = 82;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getAutoshedBatteryThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 82, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setAutoshedBatteryThreshold = function(value) {
  jspb.Message.setField(this, 82, value);
};


/**
 * optional uint32 lbas_entry_threshold = 83;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getLbasEntryThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 83, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setLbasEntryThreshold = function(value) {
  jspb.Message.setField(this, 83, value);
};


/**
 * optional uint32 lbas_exit_threshold = 84;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getLbasExitThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 84, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setLbasExitThreshold = function(value) {
  jspb.Message.setField(this, 84, value);
};


/**
 * optional uint32 median_filter_length = 85;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getMedianFilterLength = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 85, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setMedianFilterLength = function(value) {
  jspb.Message.setField(this, 85, value);
};


/**
 * optional uint32 wx_data_record_frequency = 86;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getWxDataRecordFrequency = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 86, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setWxDataRecordFrequency = function(value) {
  jspb.Message.setField(this, 86, value);
};


/**
 * optional uint32 snow_sensor_type = 87;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getSnowSensorType = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 87, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setSnowSensorType = function(value) {
  jspb.Message.setField(this, 87, value);
};


/**
 * optional float avg_wind_speed_correction_factor = 88;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getAvgWindSpeedCorrectionFactor = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 88, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setAvgWindSpeedCorrectionFactor = function(value) {
  jspb.Message.setField(this, 88, value);
};


/**
 * optional float peak_wind_speed_correction_factor = 89;
 * @return {number}
 */
proto.terrasmart.cloud.ConfigUpdate.prototype.getPeakWindSpeedCorrectionFactor = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 89, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ConfigUpdate.prototype.setPeakWindSpeedCorrectionFactor = function(value) {
  jspb.Message.setField(this, 89, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.AssetUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.AssetUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.AssetUpdate.displayName = 'proto.terrasmart.cloud.AssetUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.AssetUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.AssetUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.AssetUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AssetUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    unitTemperature: +jspb.Message.getFieldWithDefault(msg, 3, 0.0),
    upTime: +jspb.Message.getFieldWithDefault(msg, 4, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.AssetUpdate}
 */
proto.terrasmart.cloud.AssetUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.AssetUpdate;
  return proto.terrasmart.cloud.AssetUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.AssetUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.AssetUpdate}
 */
proto.terrasmart.cloud.AssetUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setUnitTemperature(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setUpTime(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AssetUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.AssetUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.AssetUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AssetUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getUnitTemperature();
  if (f !== 0.0) {
    writer.writeFloat(
      3,
      f
    );
  }
  f = message.getUpTime();
  if (f !== 0.0) {
    writer.writeFloat(
      4,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.AssetUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.AssetUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AssetUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.AssetUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.AssetUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.AssetUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.AssetUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.AssetUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional float unit_temperature = 3;
 * @return {number}
 */
proto.terrasmart.cloud.AssetUpdate.prototype.getUnitTemperature = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.AssetUpdate.prototype.setUnitTemperature = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional float up_time = 4;
 * @return {number}
 */
proto.terrasmart.cloud.AssetUpdate.prototype.getUpTime = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 4, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.AssetUpdate.prototype.setUpTime = function(value) {
  jspb.Message.setField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.CellUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.CellUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.CellUpdate.displayName = 'proto.terrasmart.cloud.CellUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.CellUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.CellUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.CellUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.CellUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    ncSnapAddr: msg.getNcSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    uptime: jspb.Message.getFieldWithDefault(msg, 3, 0),
    rssiDbm: jspb.Message.getFieldWithDefault(msg, 4, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.CellUpdate}
 */
proto.terrasmart.cloud.CellUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.CellUpdate;
  return proto.terrasmart.cloud.CellUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.CellUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.CellUpdate}
 */
proto.terrasmart.cloud.CellUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setNcSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setUptime(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setRssiDbm(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.CellUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.CellUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.CellUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.CellUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNcSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getUptime();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getRssiDbm();
  if (f !== 0) {
    writer.writeSint32(
      4,
      f
    );
  }
};


/**
 * optional bytes nc_snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.CellUpdate.prototype.getNcSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes nc_snap_addr = 1;
 * This is a type-conversion wrapper around `getNcSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.CellUpdate.prototype.getNcSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getNcSnapAddr()));
};


/**
 * optional bytes nc_snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getNcSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.CellUpdate.prototype.getNcSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getNcSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.CellUpdate.prototype.setNcSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.CellUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.CellUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.CellUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CellUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint32 uptime = 3;
 * @return {number}
 */
proto.terrasmart.cloud.CellUpdate.prototype.getUptime = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.CellUpdate.prototype.setUptime = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional sint32 rssi_dbm = 4;
 * @return {number}
 */
proto.terrasmart.cloud.CellUpdate.prototype.getRssiDbm = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.CellUpdate.prototype.setRssiDbm = function(value) {
  jspb.Message.setField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.CellDailyUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.CellDailyUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.CellDailyUpdate.displayName = 'proto.terrasmart.cloud.CellDailyUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.CellDailyUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.CellDailyUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.CellDailyUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    ncSnapAddr: msg.getNcSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    imei: jspb.Message.getFieldWithDefault(msg, 3, ""),
    roaming: jspb.Message.getFieldWithDefault(msg, 4, false),
    mdn: jspb.Message.getFieldWithDefault(msg, 5, ""),
    lanIp: jspb.Message.getFieldWithDefault(msg, 6, ""),
    wanIp: jspb.Message.getFieldWithDefault(msg, 7, ""),
    linkStatus: jspb.Message.getFieldWithDefault(msg, 8, ""),
    txDataUsage: jspb.Message.getFieldWithDefault(msg, 9, ""),
    rxDataUsage: jspb.Message.getFieldWithDefault(msg, 10, ""),
    towerId: jspb.Message.getFieldWithDefault(msg, 11, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.CellDailyUpdate}
 */
proto.terrasmart.cloud.CellDailyUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.CellDailyUpdate;
  return proto.terrasmart.cloud.CellDailyUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.CellDailyUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.CellDailyUpdate}
 */
proto.terrasmart.cloud.CellDailyUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setNcSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setImei(value);
      break;
    case 4:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setRoaming(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setMdn(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setLanIp(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setWanIp(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setLinkStatus(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setTxDataUsage(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.setRxDataUsage(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setTowerId(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.CellDailyUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.CellDailyUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.CellDailyUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNcSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getImei();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getRoaming();
  if (f) {
    writer.writeBool(
      4,
      f
    );
  }
  f = message.getMdn();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getLanIp();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getWanIp();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getLinkStatus();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
  f = message.getTxDataUsage();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
  f = message.getRxDataUsage();
  if (f.length > 0) {
    writer.writeString(
      10,
      f
    );
  }
  f = message.getTowerId();
  if (f.length > 0) {
    writer.writeString(
      11,
      f
    );
  }
};


/**
 * optional bytes nc_snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getNcSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes nc_snap_addr = 1;
 * This is a type-conversion wrapper around `getNcSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getNcSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getNcSnapAddr()));
};


/**
 * optional bytes nc_snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getNcSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getNcSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getNcSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.CellDailyUpdate.prototype.setNcSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.CellDailyUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.CellDailyUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string imei = 3;
 * @return {string}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getImei = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.CellDailyUpdate.prototype.setImei = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional bool roaming = 4;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getRoaming = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 4, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.CellDailyUpdate.prototype.setRoaming = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional string mdn = 5;
 * @return {string}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getMdn = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.CellDailyUpdate.prototype.setMdn = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional string lan_ip = 6;
 * @return {string}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getLanIp = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.CellDailyUpdate.prototype.setLanIp = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional string wan_ip = 7;
 * @return {string}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getWanIp = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.CellDailyUpdate.prototype.setWanIp = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional string link_status = 8;
 * @return {string}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getLinkStatus = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.CellDailyUpdate.prototype.setLinkStatus = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional string tx_data_usage = 9;
 * @return {string}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getTxDataUsage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.CellDailyUpdate.prototype.setTxDataUsage = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional string rx_data_usage = 10;
 * @return {string}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getRxDataUsage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.CellDailyUpdate.prototype.setRxDataUsage = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional string tower_id = 11;
 * @return {string}
 */
proto.terrasmart.cloud.CellDailyUpdate.prototype.getTowerId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.CellDailyUpdate.prototype.setTowerId = function(value) {
  jspb.Message.setField(this, 11, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.WeatherStowUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.WeatherStowUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.WeatherStowUpdate.displayName = 'proto.terrasmart.cloud.WeatherStowUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.WeatherStowUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.WeatherStowUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.WeatherStowUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    stowType: jspb.Message.getFieldWithDefault(msg, 3, 0),
    value: +jspb.Message.getFieldWithDefault(msg, 4, 0.0),
    threshold: +jspb.Message.getFieldWithDefault(msg, 5, 0.0),
    lowerThreshold: +jspb.Message.getFieldWithDefault(msg, 6, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.WeatherStowUpdate}
 */
proto.terrasmart.cloud.WeatherStowUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.WeatherStowUpdate;
  return proto.terrasmart.cloud.WeatherStowUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.WeatherStowUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.WeatherStowUpdate}
 */
proto.terrasmart.cloud.WeatherStowUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setStowType(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setValue(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setThreshold(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setLowerThreshold(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.WeatherStowUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.WeatherStowUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.WeatherStowUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getStowType();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getValue();
  if (f !== 0.0) {
    writer.writeFloat(
      4,
      f
    );
  }
  f = message.getThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      5,
      f
    );
  }
  f = message.getLowerThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      6,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.WeatherStowUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint32 stow_type = 3;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.getStowType = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.setStowType = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional float value = 4;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.getValue = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 4, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.setValue = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional float threshold = 5;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.getThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 5, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.setThreshold = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional float lower_threshold = 6;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.getLowerThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 6, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherStowUpdate.prototype.setLowerThreshold = function(value) {
  jspb.Message.setField(this, 6, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.SiteConfigUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.SiteConfigUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.SiteConfigUpdate.displayName = 'proto.terrasmart.cloud.SiteConfigUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.SiteConfigUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.SiteConfigUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SiteConfigUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    siteName: jspb.Message.getFieldWithDefault(msg, 3, ""),
    siteContact: jspb.Message.getFieldWithDefault(msg, 4, ""),
    siteOrganization: jspb.Message.getFieldWithDefault(msg, 5, ""),
    gpsLat: +jspb.Message.getFieldWithDefault(msg, 6, 0.0),
    gpsLng: +jspb.Message.getFieldWithDefault(msg, 7, 0.0),
    gpsAlt: +jspb.Message.getFieldWithDefault(msg, 8, 0.0),
    enableNightlyShutdown: jspb.Message.getFieldWithDefault(msg, 9, false),
    powerOff: jspb.Message.getFieldWithDefault(msg, 10, 0),
    powerOn: jspb.Message.getFieldWithDefault(msg, 11, 0),
    enableLowPowerShutdown: jspb.Message.getFieldWithDefault(msg, 12, false),
    cellModemWarningVoltage: +jspb.Message.getFieldWithDefault(msg, 13, 0.0),
    cellModemCutoffVoltage: +jspb.Message.getFieldWithDefault(msg, 14, 0.0),
    cellModemCutonVoltage: +jspb.Message.getFieldWithDefault(msg, 15, 0.0),
    gatewayWarningVoltage: +jspb.Message.getFieldWithDefault(msg, 16, 0.0),
    gatewayCutoffVoltage: +jspb.Message.getFieldWithDefault(msg, 17, 0.0),
    windSpeedThreshold: +jspb.Message.getFieldWithDefault(msg, 18, 0.0),
    windGustThreshold: +jspb.Message.getFieldWithDefault(msg, 19, 0.0),
    snowDepthThreshold: +jspb.Message.getFieldWithDefault(msg, 20, 0.0),
    panelSnowDepthThreshold: +jspb.Message.getFieldWithDefault(msg, 21, 0.0),
    enableWindSpeedStow: jspb.Message.getFieldWithDefault(msg, 22, false),
    enableWindGustStow: jspb.Message.getFieldWithDefault(msg, 23, false),
    enableSnowDepthStow: jspb.Message.getFieldWithDefault(msg, 24, false),
    enablePanelSnowDepthStow: jspb.Message.getFieldWithDefault(msg, 25, false),
    minimumStationsRequired: jspb.Message.getFieldWithDefault(msg, 26, 0),
    windSpeedDurationRequired: +jspb.Message.getFieldWithDefault(msg, 27, 0.0),
    resumeTrackingAfterWindTimeout: +jspb.Message.getFieldWithDefault(msg, 28, 0.0),
    resumeTrackingAfterSnowTimeout: +jspb.Message.getFieldWithDefault(msg, 29, 0.0),
    resumeTrackingAfterPanelSnowTimeout: +jspb.Message.getFieldWithDefault(msg, 30, 0.0),
    enableSnowDepthAveraging: jspb.Message.getFieldWithDefault(msg, 31, false),
    enablePanelSnowDepthAveraging: jspb.Message.getFieldWithDefault(msg, 32, false),
    windReportingClosePercentage: jspb.Message.getFieldWithDefault(msg, 33, 0),
    windReportingCloseInterval: jspb.Message.getFieldWithDefault(msg, 34, 0),
    windReportingOverInterval: jspb.Message.getFieldWithDefault(msg, 35, 0),
    snowReportingClosePercentage: jspb.Message.getFieldWithDefault(msg, 36, 0),
    snowReportingCloseInterval: jspb.Message.getFieldWithDefault(msg, 37, 0),
    snowReportingOverInterval: jspb.Message.getFieldWithDefault(msg, 38, 0),
    enableDiffuseMode: jspb.Message.getFieldWithDefault(msg, 39, false),
    enterDiffuseModeDuration: +jspb.Message.getFieldWithDefault(msg, 40, 0.0),
    exitDiffuseModeDuration: +jspb.Message.getFieldWithDefault(msg, 41, 0.0),
    enableTooColdToMoveStow: jspb.Message.getFieldWithDefault(msg, 42, false),
    tooColdToMoveStowTempThreshold: +jspb.Message.getFieldWithDefault(msg, 43, 0.0),
    tooColdToMoveStowTempLowThreshold: +jspb.Message.getFieldWithDefault(msg, 44, 0.0),
    resumeTrackingAfterTooColdToMoveTimeout: +jspb.Message.getFieldWithDefault(msg, 45, 0.0),
    enableSpecfileFromSlui: jspb.Message.getFieldWithDefault(msg, 46, false),
    siteType: jspb.Message.getFieldWithDefault(msg, 47, ""),
    enableSnowShedding: jspb.Message.getFieldWithDefault(msg, 48, false),
    snowSheddingThreshold: +jspb.Message.getFieldWithDefault(msg, 49, 0.0),
    snowSheddingDuration: +jspb.Message.getFieldWithDefault(msg, 50, 0.0),
    medianFilterLength: jspb.Message.getFieldWithDefault(msg, 51, 0),
    stowLogic: jspb.Message.getFieldWithDefault(msg, 52, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.SiteConfigUpdate}
 */
proto.terrasmart.cloud.SiteConfigUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.SiteConfigUpdate;
  return proto.terrasmart.cloud.SiteConfigUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.SiteConfigUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.SiteConfigUpdate}
 */
proto.terrasmart.cloud.SiteConfigUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setSiteName(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setSiteContact(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setSiteOrganization(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setGpsLat(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setGpsLng(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setGpsAlt(value);
      break;
    case 9:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableNightlyShutdown(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPowerOff(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPowerOn(value);
      break;
    case 12:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableLowPowerShutdown(value);
      break;
    case 13:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCellModemWarningVoltage(value);
      break;
    case 14:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCellModemCutoffVoltage(value);
      break;
    case 15:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCellModemCutonVoltage(value);
      break;
    case 16:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setGatewayWarningVoltage(value);
      break;
    case 17:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setGatewayCutoffVoltage(value);
      break;
    case 18:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setWindSpeedThreshold(value);
      break;
    case 19:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setWindGustThreshold(value);
      break;
    case 20:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSnowDepthThreshold(value);
      break;
    case 21:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setPanelSnowDepthThreshold(value);
      break;
    case 22:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableWindSpeedStow(value);
      break;
    case 23:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableWindGustStow(value);
      break;
    case 24:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableSnowDepthStow(value);
      break;
    case 25:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnablePanelSnowDepthStow(value);
      break;
    case 26:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setMinimumStationsRequired(value);
      break;
    case 27:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setWindSpeedDurationRequired(value);
      break;
    case 28:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setResumeTrackingAfterWindTimeout(value);
      break;
    case 29:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setResumeTrackingAfterSnowTimeout(value);
      break;
    case 30:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setResumeTrackingAfterPanelSnowTimeout(value);
      break;
    case 31:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableSnowDepthAveraging(value);
      break;
    case 32:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnablePanelSnowDepthAveraging(value);
      break;
    case 33:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setWindReportingClosePercentage(value);
      break;
    case 34:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setWindReportingCloseInterval(value);
      break;
    case 35:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setWindReportingOverInterval(value);
      break;
    case 36:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setSnowReportingClosePercentage(value);
      break;
    case 37:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setSnowReportingCloseInterval(value);
      break;
    case 38:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setSnowReportingOverInterval(value);
      break;
    case 39:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableDiffuseMode(value);
      break;
    case 40:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setEnterDiffuseModeDuration(value);
      break;
    case 41:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setExitDiffuseModeDuration(value);
      break;
    case 42:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableTooColdToMoveStow(value);
      break;
    case 43:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setTooColdToMoveStowTempThreshold(value);
      break;
    case 44:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setTooColdToMoveStowTempLowThreshold(value);
      break;
    case 45:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setResumeTrackingAfterTooColdToMoveTimeout(value);
      break;
    case 46:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableSpecfileFromSlui(value);
      break;
    case 47:
      var value = /** @type {string} */ (reader.readString());
      msg.setSiteType(value);
      break;
    case 48:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableSnowShedding(value);
      break;
    case 49:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSnowSheddingThreshold(value);
      break;
    case 50:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSnowSheddingDuration(value);
      break;
    case 51:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setMedianFilterLength(value);
      break;
    case 52:
      var value = /** @type {string} */ (reader.readString());
      msg.setStowLogic(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.SiteConfigUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.SiteConfigUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SiteConfigUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getSiteName();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getSiteContact();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getSiteOrganization();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getGpsLat();
  if (f !== 0.0) {
    writer.writeFloat(
      6,
      f
    );
  }
  f = message.getGpsLng();
  if (f !== 0.0) {
    writer.writeFloat(
      7,
      f
    );
  }
  f = message.getGpsAlt();
  if (f !== 0.0) {
    writer.writeFloat(
      8,
      f
    );
  }
  f = message.getEnableNightlyShutdown();
  if (f) {
    writer.writeBool(
      9,
      f
    );
  }
  f = message.getPowerOff();
  if (f !== 0) {
    writer.writeUint32(
      10,
      f
    );
  }
  f = message.getPowerOn();
  if (f !== 0) {
    writer.writeUint32(
      11,
      f
    );
  }
  f = message.getEnableLowPowerShutdown();
  if (f) {
    writer.writeBool(
      12,
      f
    );
  }
  f = message.getCellModemWarningVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      13,
      f
    );
  }
  f = message.getCellModemCutoffVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      14,
      f
    );
  }
  f = message.getCellModemCutonVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      15,
      f
    );
  }
  f = message.getGatewayWarningVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      16,
      f
    );
  }
  f = message.getGatewayCutoffVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      17,
      f
    );
  }
  f = message.getWindSpeedThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      18,
      f
    );
  }
  f = message.getWindGustThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      19,
      f
    );
  }
  f = message.getSnowDepthThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      20,
      f
    );
  }
  f = message.getPanelSnowDepthThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      21,
      f
    );
  }
  f = message.getEnableWindSpeedStow();
  if (f) {
    writer.writeBool(
      22,
      f
    );
  }
  f = message.getEnableWindGustStow();
  if (f) {
    writer.writeBool(
      23,
      f
    );
  }
  f = message.getEnableSnowDepthStow();
  if (f) {
    writer.writeBool(
      24,
      f
    );
  }
  f = message.getEnablePanelSnowDepthStow();
  if (f) {
    writer.writeBool(
      25,
      f
    );
  }
  f = message.getMinimumStationsRequired();
  if (f !== 0) {
    writer.writeUint32(
      26,
      f
    );
  }
  f = message.getWindSpeedDurationRequired();
  if (f !== 0.0) {
    writer.writeFloat(
      27,
      f
    );
  }
  f = message.getResumeTrackingAfterWindTimeout();
  if (f !== 0.0) {
    writer.writeFloat(
      28,
      f
    );
  }
  f = message.getResumeTrackingAfterSnowTimeout();
  if (f !== 0.0) {
    writer.writeFloat(
      29,
      f
    );
  }
  f = message.getResumeTrackingAfterPanelSnowTimeout();
  if (f !== 0.0) {
    writer.writeFloat(
      30,
      f
    );
  }
  f = message.getEnableSnowDepthAveraging();
  if (f) {
    writer.writeBool(
      31,
      f
    );
  }
  f = message.getEnablePanelSnowDepthAveraging();
  if (f) {
    writer.writeBool(
      32,
      f
    );
  }
  f = message.getWindReportingClosePercentage();
  if (f !== 0) {
    writer.writeUint32(
      33,
      f
    );
  }
  f = message.getWindReportingCloseInterval();
  if (f !== 0) {
    writer.writeUint32(
      34,
      f
    );
  }
  f = message.getWindReportingOverInterval();
  if (f !== 0) {
    writer.writeUint32(
      35,
      f
    );
  }
  f = message.getSnowReportingClosePercentage();
  if (f !== 0) {
    writer.writeUint32(
      36,
      f
    );
  }
  f = message.getSnowReportingCloseInterval();
  if (f !== 0) {
    writer.writeUint32(
      37,
      f
    );
  }
  f = message.getSnowReportingOverInterval();
  if (f !== 0) {
    writer.writeUint32(
      38,
      f
    );
  }
  f = message.getEnableDiffuseMode();
  if (f) {
    writer.writeBool(
      39,
      f
    );
  }
  f = message.getEnterDiffuseModeDuration();
  if (f !== 0.0) {
    writer.writeFloat(
      40,
      f
    );
  }
  f = message.getExitDiffuseModeDuration();
  if (f !== 0.0) {
    writer.writeFloat(
      41,
      f
    );
  }
  f = message.getEnableTooColdToMoveStow();
  if (f) {
    writer.writeBool(
      42,
      f
    );
  }
  f = message.getTooColdToMoveStowTempThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      43,
      f
    );
  }
  f = message.getTooColdToMoveStowTempLowThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      44,
      f
    );
  }
  f = message.getResumeTrackingAfterTooColdToMoveTimeout();
  if (f !== 0.0) {
    writer.writeFloat(
      45,
      f
    );
  }
  f = message.getEnableSpecfileFromSlui();
  if (f) {
    writer.writeBool(
      46,
      f
    );
  }
  f = message.getSiteType();
  if (f.length > 0) {
    writer.writeString(
      47,
      f
    );
  }
  f = message.getEnableSnowShedding();
  if (f) {
    writer.writeBool(
      48,
      f
    );
  }
  f = message.getSnowSheddingThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      49,
      f
    );
  }
  f = message.getSnowSheddingDuration();
  if (f !== 0.0) {
    writer.writeFloat(
      50,
      f
    );
  }
  f = message.getMedianFilterLength();
  if (f !== 0) {
    writer.writeUint32(
      51,
      f
    );
  }
  f = message.getStowLogic();
  if (f.length > 0) {
    writer.writeString(
      52,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.SiteConfigUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string site_name = 3;
 * @return {string}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSiteName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setSiteName = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional string site_contact = 4;
 * @return {string}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSiteContact = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setSiteContact = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional string site_organization = 5;
 * @return {string}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSiteOrganization = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setSiteOrganization = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional float gps_lat = 6;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getGpsLat = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 6, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setGpsLat = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional float gps_lng = 7;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getGpsLng = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 7, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setGpsLng = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional float gps_alt = 8;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getGpsAlt = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 8, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setGpsAlt = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional bool enable_nightly_shutdown = 9;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnableNightlyShutdown = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 9, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnableNightlyShutdown = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional uint32 power_off = 10;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getPowerOff = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setPowerOff = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional uint32 power_on = 11;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getPowerOn = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 11, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setPowerOn = function(value) {
  jspb.Message.setField(this, 11, value);
};


/**
 * optional bool enable_low_power_shutdown = 12;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnableLowPowerShutdown = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 12, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnableLowPowerShutdown = function(value) {
  jspb.Message.setField(this, 12, value);
};


/**
 * optional float cell_modem_warning_voltage = 13;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getCellModemWarningVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 13, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setCellModemWarningVoltage = function(value) {
  jspb.Message.setField(this, 13, value);
};


/**
 * optional float cell_modem_cutoff_voltage = 14;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getCellModemCutoffVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 14, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setCellModemCutoffVoltage = function(value) {
  jspb.Message.setField(this, 14, value);
};


/**
 * optional float cell_modem_cuton_voltage = 15;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getCellModemCutonVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 15, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setCellModemCutonVoltage = function(value) {
  jspb.Message.setField(this, 15, value);
};


/**
 * optional float gateway_warning_voltage = 16;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getGatewayWarningVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 16, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setGatewayWarningVoltage = function(value) {
  jspb.Message.setField(this, 16, value);
};


/**
 * optional float gateway_cutoff_voltage = 17;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getGatewayCutoffVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 17, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setGatewayCutoffVoltage = function(value) {
  jspb.Message.setField(this, 17, value);
};


/**
 * optional float wind_speed_threshold = 18;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getWindSpeedThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 18, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setWindSpeedThreshold = function(value) {
  jspb.Message.setField(this, 18, value);
};


/**
 * optional float wind_gust_threshold = 19;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getWindGustThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 19, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setWindGustThreshold = function(value) {
  jspb.Message.setField(this, 19, value);
};


/**
 * optional float snow_depth_threshold = 20;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSnowDepthThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 20, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setSnowDepthThreshold = function(value) {
  jspb.Message.setField(this, 20, value);
};


/**
 * optional float panel_snow_depth_threshold = 21;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getPanelSnowDepthThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 21, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setPanelSnowDepthThreshold = function(value) {
  jspb.Message.setField(this, 21, value);
};


/**
 * optional bool enable_wind_speed_stow = 22;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnableWindSpeedStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 22, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnableWindSpeedStow = function(value) {
  jspb.Message.setField(this, 22, value);
};


/**
 * optional bool enable_wind_gust_stow = 23;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnableWindGustStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 23, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnableWindGustStow = function(value) {
  jspb.Message.setField(this, 23, value);
};


/**
 * optional bool enable_snow_depth_stow = 24;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnableSnowDepthStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 24, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnableSnowDepthStow = function(value) {
  jspb.Message.setField(this, 24, value);
};


/**
 * optional bool enable_panel_snow_depth_stow = 25;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnablePanelSnowDepthStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 25, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnablePanelSnowDepthStow = function(value) {
  jspb.Message.setField(this, 25, value);
};


/**
 * optional uint32 minimum_stations_required = 26;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getMinimumStationsRequired = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 26, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setMinimumStationsRequired = function(value) {
  jspb.Message.setField(this, 26, value);
};


/**
 * optional float wind_speed_duration_required = 27;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getWindSpeedDurationRequired = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 27, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setWindSpeedDurationRequired = function(value) {
  jspb.Message.setField(this, 27, value);
};


/**
 * optional float resume_tracking_after_wind_timeout = 28;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getResumeTrackingAfterWindTimeout = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 28, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setResumeTrackingAfterWindTimeout = function(value) {
  jspb.Message.setField(this, 28, value);
};


/**
 * optional float resume_tracking_after_snow_timeout = 29;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getResumeTrackingAfterSnowTimeout = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 29, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setResumeTrackingAfterSnowTimeout = function(value) {
  jspb.Message.setField(this, 29, value);
};


/**
 * optional float resume_tracking_after_panel_snow_timeout = 30;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getResumeTrackingAfterPanelSnowTimeout = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 30, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setResumeTrackingAfterPanelSnowTimeout = function(value) {
  jspb.Message.setField(this, 30, value);
};


/**
 * optional bool enable_snow_depth_averaging = 31;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnableSnowDepthAveraging = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 31, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnableSnowDepthAveraging = function(value) {
  jspb.Message.setField(this, 31, value);
};


/**
 * optional bool enable_panel_snow_depth_averaging = 32;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnablePanelSnowDepthAveraging = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 32, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnablePanelSnowDepthAveraging = function(value) {
  jspb.Message.setField(this, 32, value);
};


/**
 * optional uint32 wind_reporting_close_percentage = 33;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getWindReportingClosePercentage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 33, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setWindReportingClosePercentage = function(value) {
  jspb.Message.setField(this, 33, value);
};


/**
 * optional uint32 wind_reporting_close_interval = 34;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getWindReportingCloseInterval = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 34, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setWindReportingCloseInterval = function(value) {
  jspb.Message.setField(this, 34, value);
};


/**
 * optional uint32 wind_reporting_over_interval = 35;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getWindReportingOverInterval = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 35, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setWindReportingOverInterval = function(value) {
  jspb.Message.setField(this, 35, value);
};


/**
 * optional uint32 snow_reporting_close_percentage = 36;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSnowReportingClosePercentage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 36, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setSnowReportingClosePercentage = function(value) {
  jspb.Message.setField(this, 36, value);
};


/**
 * optional uint32 snow_reporting_close_interval = 37;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSnowReportingCloseInterval = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 37, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setSnowReportingCloseInterval = function(value) {
  jspb.Message.setField(this, 37, value);
};


/**
 * optional uint32 snow_reporting_over_interval = 38;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSnowReportingOverInterval = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 38, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setSnowReportingOverInterval = function(value) {
  jspb.Message.setField(this, 38, value);
};


/**
 * optional bool enable_diffuse_mode = 39;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnableDiffuseMode = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 39, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnableDiffuseMode = function(value) {
  jspb.Message.setField(this, 39, value);
};


/**
 * optional float enter_diffuse_mode_duration = 40;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnterDiffuseModeDuration = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 40, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnterDiffuseModeDuration = function(value) {
  jspb.Message.setField(this, 40, value);
};


/**
 * optional float exit_diffuse_mode_duration = 41;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getExitDiffuseModeDuration = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 41, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setExitDiffuseModeDuration = function(value) {
  jspb.Message.setField(this, 41, value);
};


/**
 * optional bool enable_too_cold_to_move_stow = 42;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnableTooColdToMoveStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 42, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnableTooColdToMoveStow = function(value) {
  jspb.Message.setField(this, 42, value);
};


/**
 * optional float too_cold_to_move_stow_temp_threshold = 43;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getTooColdToMoveStowTempThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 43, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setTooColdToMoveStowTempThreshold = function(value) {
  jspb.Message.setField(this, 43, value);
};


/**
 * optional float too_cold_to_move_stow_temp_low_threshold = 44;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getTooColdToMoveStowTempLowThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 44, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setTooColdToMoveStowTempLowThreshold = function(value) {
  jspb.Message.setField(this, 44, value);
};


/**
 * optional float resume_tracking_after_too_cold_to_move_timeout = 45;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getResumeTrackingAfterTooColdToMoveTimeout = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 45, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setResumeTrackingAfterTooColdToMoveTimeout = function(value) {
  jspb.Message.setField(this, 45, value);
};


/**
 * optional bool enable_specfile_from_slui = 46;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnableSpecfileFromSlui = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 46, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnableSpecfileFromSlui = function(value) {
  jspb.Message.setField(this, 46, value);
};


/**
 * optional string site_type = 47;
 * @return {string}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSiteType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 47, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setSiteType = function(value) {
  jspb.Message.setField(this, 47, value);
};


/**
 * optional bool enable_snow_shedding = 48;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getEnableSnowShedding = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 48, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setEnableSnowShedding = function(value) {
  jspb.Message.setField(this, 48, value);
};


/**
 * optional float snow_shedding_threshold = 49;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSnowSheddingThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 49, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setSnowSheddingThreshold = function(value) {
  jspb.Message.setField(this, 49, value);
};


/**
 * optional float snow_shedding_duration = 50;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getSnowSheddingDuration = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 50, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setSnowSheddingDuration = function(value) {
  jspb.Message.setField(this, 50, value);
};


/**
 * optional uint32 median_filter_length = 51;
 * @return {number}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getMedianFilterLength = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 51, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setMedianFilterLength = function(value) {
  jspb.Message.setField(this, 51, value);
};


/**
 * optional string stow_logic = 52;
 * @return {string}
 */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.getStowLogic = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 52, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteConfigUpdate.prototype.setStowLogic = function(value) {
  jspb.Message.setField(this, 52, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.GpsUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.GpsUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.GpsUpdate.displayName = 'proto.terrasmart.cloud.GpsUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.GpsUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.GpsUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.GpsUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    latitude: +jspb.Message.getFieldWithDefault(msg, 3, 0.0),
    longitude: +jspb.Message.getFieldWithDefault(msg, 4, 0.0),
    altitude: +jspb.Message.getFieldWithDefault(msg, 5, 0.0),
    numSats: jspb.Message.getFieldWithDefault(msg, 6, 0),
    quality: jspb.Message.getFieldWithDefault(msg, 7, 0),
    fixTime: (f = msg.getFixTime()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    isResponding: jspb.Message.getFieldWithDefault(msg, 9, false),
    altitudeUnits: jspb.Message.getFieldWithDefault(msg, 10, ""),
    isClockQuestionable: jspb.Message.getFieldWithDefault(msg, 11, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.GpsUpdate}
 */
proto.terrasmart.cloud.GpsUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.GpsUpdate;
  return proto.terrasmart.cloud.GpsUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.GpsUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.GpsUpdate}
 */
proto.terrasmart.cloud.GpsUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setLatitude(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setLongitude(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setAltitude(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setNumSats(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setQuality(value);
      break;
    case 8:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setFixTime(value);
      break;
    case 9:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsResponding(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.setAltitudeUnits(value);
      break;
    case 11:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsClockQuestionable(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.GpsUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.GpsUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.GpsUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getLatitude();
  if (f !== 0.0) {
    writer.writeFloat(
      3,
      f
    );
  }
  f = message.getLongitude();
  if (f !== 0.0) {
    writer.writeFloat(
      4,
      f
    );
  }
  f = message.getAltitude();
  if (f !== 0.0) {
    writer.writeFloat(
      5,
      f
    );
  }
  f = message.getNumSats();
  if (f !== 0) {
    writer.writeUint32(
      6,
      f
    );
  }
  f = message.getQuality();
  if (f !== 0) {
    writer.writeUint32(
      7,
      f
    );
  }
  f = message.getFixTime();
  if (f != null) {
    writer.writeMessage(
      8,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getIsResponding();
  if (f) {
    writer.writeBool(
      9,
      f
    );
  }
  f = message.getAltitudeUnits();
  if (f.length > 0) {
    writer.writeString(
      10,
      f
    );
  }
  f = message.getIsClockQuestionable();
  if (f) {
    writer.writeBool(
      11,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.GpsUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.GpsUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.GpsUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional float latitude = 3;
 * @return {number}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getLatitude = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.GpsUpdate.prototype.setLatitude = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional float longitude = 4;
 * @return {number}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getLongitude = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 4, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.GpsUpdate.prototype.setLongitude = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional float altitude = 5;
 * @return {number}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getAltitude = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 5, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.GpsUpdate.prototype.setAltitude = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional uint32 num_sats = 6;
 * @return {number}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getNumSats = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.GpsUpdate.prototype.setNumSats = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional uint32 quality = 7;
 * @return {number}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getQuality = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.GpsUpdate.prototype.setQuality = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional google.protobuf.Timestamp fix_time = 8;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getFixTime = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 8));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.GpsUpdate.prototype.setFixTime = function(value) {
  jspb.Message.setWrapperField(this, 8, value);
};


proto.terrasmart.cloud.GpsUpdate.prototype.clearFixTime = function() {
  this.setFixTime(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.hasFixTime = function() {
  return jspb.Message.getField(this, 8) != null;
};


/**
 * optional bool is_responding = 9;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getIsResponding = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 9, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.GpsUpdate.prototype.setIsResponding = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional string altitude_units = 10;
 * @return {string}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getAltitudeUnits = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.GpsUpdate.prototype.setAltitudeUnits = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional bool is_clock_questionable = 11;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.GpsUpdate.prototype.getIsClockQuestionable = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 11, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.GpsUpdate.prototype.setIsClockQuestionable = function(value) {
  jspb.Message.setField(this, 11, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.AssetRadioUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.AssetRadioUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.AssetRadioUpdate.displayName = 'proto.terrasmart.cloud.AssetRadioUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.AssetRadioUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.AssetRadioUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AssetRadioUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    radioMacAddr: jspb.Message.getFieldWithDefault(msg, 3, ""),
    radioChannel: jspb.Message.getFieldWithDefault(msg, 4, ""),
    radioNetworkId: jspb.Message.getFieldWithDefault(msg, 5, ""),
    radioFirmware: jspb.Message.getFieldWithDefault(msg, 6, ""),
    radioScriptVersion: jspb.Message.getFieldWithDefault(msg, 7, ""),
    radioScriptCrc: jspb.Message.getFieldWithDefault(msg, 8, ""),
    radioLinkQuality: jspb.Message.getFieldWithDefault(msg, 9, ""),
    radioMeshDepth: jspb.Message.getFieldWithDefault(msg, 10, ""),
    radioPollsSent: jspb.Message.getFieldWithDefault(msg, 11, ""),
    radioPollResponses: jspb.Message.getFieldWithDefault(msg, 12, ""),
    isARepeater: jspb.Message.getFieldWithDefault(msg, 13, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.AssetRadioUpdate}
 */
proto.terrasmart.cloud.AssetRadioUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.AssetRadioUpdate;
  return proto.terrasmart.cloud.AssetRadioUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.AssetRadioUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.AssetRadioUpdate}
 */
proto.terrasmart.cloud.AssetRadioUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setRadioMacAddr(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setRadioChannel(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setRadioNetworkId(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setRadioFirmware(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setRadioScriptVersion(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setRadioScriptCrc(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setRadioLinkQuality(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.setRadioMeshDepth(value);
      break;
    case 11:
      var value = /** @type {string} */ (reader.readString());
      msg.setRadioPollsSent(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readString());
      msg.setRadioPollResponses(value);
      break;
    case 13:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsARepeater(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.AssetRadioUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.AssetRadioUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AssetRadioUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getRadioMacAddr();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getRadioChannel();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getRadioNetworkId();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getRadioFirmware();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getRadioScriptVersion();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getRadioScriptCrc();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
  f = message.getRadioLinkQuality();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
  f = message.getRadioMeshDepth();
  if (f.length > 0) {
    writer.writeString(
      10,
      f
    );
  }
  f = message.getRadioPollsSent();
  if (f.length > 0) {
    writer.writeString(
      11,
      f
    );
  }
  f = message.getRadioPollResponses();
  if (f.length > 0) {
    writer.writeString(
      12,
      f
    );
  }
  f = message.getIsARepeater();
  if (f) {
    writer.writeBool(
      13,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.AssetRadioUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string radio_mac_addr = 3;
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getRadioMacAddr = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setRadioMacAddr = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional string radio_channel = 4;
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getRadioChannel = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setRadioChannel = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional string radio_network_id = 5;
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getRadioNetworkId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setRadioNetworkId = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional string radio_firmware = 6;
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getRadioFirmware = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setRadioFirmware = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional string radio_script_version = 7;
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getRadioScriptVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setRadioScriptVersion = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional string radio_script_crc = 8;
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getRadioScriptCrc = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setRadioScriptCrc = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional string radio_link_quality = 9;
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getRadioLinkQuality = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setRadioLinkQuality = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional string radio_mesh_depth = 10;
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getRadioMeshDepth = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setRadioMeshDepth = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional string radio_polls_sent = 11;
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getRadioPollsSent = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 11, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setRadioPollsSent = function(value) {
  jspb.Message.setField(this, 11, value);
};


/**
 * optional string radio_poll_responses = 12;
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getRadioPollResponses = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 12, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setRadioPollResponses = function(value) {
  jspb.Message.setField(this, 12, value);
};


/**
 * optional bool is_a_repeater = 13;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.getIsARepeater = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 13, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.AssetRadioUpdate.prototype.setIsARepeater = function(value) {
  jspb.Message.setField(this, 13, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.ChargerUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.ChargerUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.ChargerUpdate.displayName = 'proto.terrasmart.cloud.ChargerUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.ChargerUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.ChargerUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.ChargerUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.ChargerUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    voltage: +jspb.Message.getFieldWithDefault(msg, 3, 0.0),
    current: +jspb.Message.getFieldWithDefault(msg, 4, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.ChargerUpdate}
 */
proto.terrasmart.cloud.ChargerUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.ChargerUpdate;
  return proto.terrasmart.cloud.ChargerUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.ChargerUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.ChargerUpdate}
 */
proto.terrasmart.cloud.ChargerUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setVoltage(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCurrent(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.ChargerUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.ChargerUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.ChargerUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.ChargerUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      3,
      f
    );
  }
  f = message.getCurrent();
  if (f !== 0.0) {
    writer.writeFloat(
      4,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.ChargerUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.ChargerUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.ChargerUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.ChargerUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.ChargerUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.ChargerUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.ChargerUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.ChargerUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional float voltage = 3;
 * @return {number}
 */
proto.terrasmart.cloud.ChargerUpdate.prototype.getVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ChargerUpdate.prototype.setVoltage = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional float current = 4;
 * @return {number}
 */
proto.terrasmart.cloud.ChargerUpdate.prototype.getCurrent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 4, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.ChargerUpdate.prototype.setCurrent = function(value) {
  jspb.Message.setField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.AssetRestarted = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.AssetRestarted, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.AssetRestarted.displayName = 'proto.terrasmart.cloud.AssetRestarted';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.AssetRestarted.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.AssetRestarted.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.AssetRestarted} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AssetRestarted.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    upTime: +jspb.Message.getFieldWithDefault(msg, 3, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.AssetRestarted}
 */
proto.terrasmart.cloud.AssetRestarted.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.AssetRestarted;
  return proto.terrasmart.cloud.AssetRestarted.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.AssetRestarted} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.AssetRestarted}
 */
proto.terrasmart.cloud.AssetRestarted.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setUpTime(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AssetRestarted.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.AssetRestarted.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.AssetRestarted} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AssetRestarted.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getUpTime();
  if (f !== 0.0) {
    writer.writeFloat(
      3,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.AssetRestarted.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.AssetRestarted.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AssetRestarted.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.AssetRestarted.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.AssetRestarted.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.AssetRestarted.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.AssetRestarted.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.AssetRestarted.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional float up_time = 3;
 * @return {number}
 */
proto.terrasmart.cloud.AssetRestarted.prototype.getUpTime = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.AssetRestarted.prototype.setUpTime = function(value) {
  jspb.Message.setField(this, 3, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.SolarInfoUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.SolarInfoUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.SolarInfoUpdate.displayName = 'proto.terrasmart.cloud.SolarInfoUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.SolarInfoUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.SolarInfoUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SolarInfoUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    sunrise: (f = msg.getSunrise()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    sunset: (f = msg.getSunset()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    wakeupTime: jspb.Message.getFieldWithDefault(msg, 5, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.SolarInfoUpdate}
 */
proto.terrasmart.cloud.SolarInfoUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.SolarInfoUpdate;
  return proto.terrasmart.cloud.SolarInfoUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.SolarInfoUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.SolarInfoUpdate}
 */
proto.terrasmart.cloud.SolarInfoUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setSunrise(value);
      break;
    case 4:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setSunset(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setWakeupTime(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.SolarInfoUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.SolarInfoUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SolarInfoUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getSunrise();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getSunset();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getWakeupTime();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.SolarInfoUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional google.protobuf.Timestamp sunrise = 3;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.getSunrise = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 3));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.setSunrise = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.terrasmart.cloud.SolarInfoUpdate.prototype.clearSunrise = function() {
  this.setSunrise(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.hasSunrise = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional google.protobuf.Timestamp sunset = 4;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.getSunset = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 4));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.setSunset = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


proto.terrasmart.cloud.SolarInfoUpdate.prototype.clearSunset = function() {
  this.setSunset(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.hasSunset = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional string wakeup_time = 5;
 * @return {string}
 */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.getWakeupTime = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SolarInfoUpdate.prototype.setWakeupTime = function(value) {
  jspb.Message.setField(this, 5, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.NetworkControllerBridgeUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.NetworkControllerBridgeUpdate.displayName = 'proto.terrasmart.cloud.NetworkControllerBridgeUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.NetworkControllerBridgeUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.NetworkControllerBridgeUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    scriptVersion: jspb.Message.getFieldWithDefault(msg, 3, ""),
    firmwareVersion: jspb.Message.getFieldWithDefault(msg, 4, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.NetworkControllerBridgeUpdate}
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.NetworkControllerBridgeUpdate;
  return proto.terrasmart.cloud.NetworkControllerBridgeUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.NetworkControllerBridgeUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.NetworkControllerBridgeUpdate}
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setScriptVersion(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setFirmwareVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.NetworkControllerBridgeUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.NetworkControllerBridgeUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getScriptVersion();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getFirmwareVersion();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string script_version = 3;
 * @return {string}
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.getScriptVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.setScriptVersion = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional string firmware_version = 4;
 * @return {string}
 */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.getFirmwareVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.NetworkControllerBridgeUpdate.prototype.setFirmwareVersion = function(value) {
  jspb.Message.setField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.AssetPresetChanged = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.AssetPresetChanged, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.AssetPresetChanged.displayName = 'proto.terrasmart.cloud.AssetPresetChanged';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.AssetPresetChanged.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.AssetPresetChanged.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.AssetPresetChanged} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AssetPresetChanged.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    panelIndex: jspb.Message.getFieldWithDefault(msg, 3, 0),
    panelCommandState: jspb.Message.getFieldWithDefault(msg, 4, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.AssetPresetChanged}
 */
proto.terrasmart.cloud.AssetPresetChanged.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.AssetPresetChanged;
  return proto.terrasmart.cloud.AssetPresetChanged.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.AssetPresetChanged} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.AssetPresetChanged}
 */
proto.terrasmart.cloud.AssetPresetChanged.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPanelIndex(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPanelCommandState(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AssetPresetChanged.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.AssetPresetChanged.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.AssetPresetChanged} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AssetPresetChanged.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getPanelIndex();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getPanelCommandState();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.AssetPresetChanged.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.AssetPresetChanged.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AssetPresetChanged.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.AssetPresetChanged.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.AssetPresetChanged.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.AssetPresetChanged.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.AssetPresetChanged.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.AssetPresetChanged.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint32 panel_index = 3;
 * @return {number}
 */
proto.terrasmart.cloud.AssetPresetChanged.prototype.getPanelIndex = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.AssetPresetChanged.prototype.setPanelIndex = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional uint32 panel_command_state = 4;
 * @return {number}
 */
proto.terrasmart.cloud.AssetPresetChanged.prototype.getPanelCommandState = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.AssetPresetChanged.prototype.setPanelCommandState = function(value) {
  jspb.Message.setField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.CommandStatusUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.CommandStatusUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.CommandStatusUpdate.displayName = 'proto.terrasmart.cloud.CommandStatusUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.CommandStatusUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.CommandStatusUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.CommandStatusUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    command: jspb.Message.getFieldWithDefault(msg, 3, 0),
    status: jspb.Message.getFieldWithDefault(msg, 4, 0),
    errorCode: jspb.Message.getFieldWithDefault(msg, 5, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.CommandStatusUpdate}
 */
proto.terrasmart.cloud.CommandStatusUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.CommandStatusUpdate;
  return proto.terrasmart.cloud.CommandStatusUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.CommandStatusUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.CommandStatusUpdate}
 */
proto.terrasmart.cloud.CommandStatusUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setCommand(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setStatus(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setErrorCode(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.CommandStatusUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.CommandStatusUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.CommandStatusUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getCommand();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getStatus();
  if (f !== 0) {
    writer.writeUint32(
      4,
      f
    );
  }
  f = message.getErrorCode();
  if (f !== 0) {
    writer.writeUint32(
      5,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.CommandStatusUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional uint32 command = 3;
 * @return {number}
 */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.getCommand = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.setCommand = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional uint32 status = 4;
 * @return {number}
 */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.getStatus = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.setStatus = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional uint32 error_code = 5;
 * @return {number}
 */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.getErrorCode = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.CommandStatusUpdate.prototype.setErrorCode = function(value) {
  jspb.Message.setField(this, 5, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.CloudAccuWeatherUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.CloudAccuWeatherUpdate.displayName = 'proto.terrasmart.cloud.CloudAccuWeatherUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.CloudAccuWeatherUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.CloudAccuWeatherUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    needAccuWeatherUpdate: jspb.Message.getFieldWithDefault(msg, 3, false),
    accuStow: jspb.Message.getFieldWithDefault(msg, 4, false),
    stowType: jspb.Message.getFieldWithDefault(msg, 5, ""),
    stowStartTime: jspb.Message.getFieldWithDefault(msg, 6, ""),
    stowEndTime: jspb.Message.getFieldWithDefault(msg, 7, ""),
    errorCodes: jspb.Message.getFieldWithDefault(msg, 8, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.CloudAccuWeatherUpdate}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.CloudAccuWeatherUpdate;
  return proto.terrasmart.cloud.CloudAccuWeatherUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.CloudAccuWeatherUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.CloudAccuWeatherUpdate}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setNeedAccuWeatherUpdate(value);
      break;
    case 4:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setAccuStow(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setStowType(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setStowStartTime(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setStowEndTime(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setErrorCodes(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.CloudAccuWeatherUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.CloudAccuWeatherUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getNeedAccuWeatherUpdate();
  if (f) {
    writer.writeBool(
      3,
      f
    );
  }
  f = message.getAccuStow();
  if (f) {
    writer.writeBool(
      4,
      f
    );
  }
  f = message.getStowType();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getStowStartTime();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getStowEndTime();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getErrorCodes();
  if (f !== 0) {
    writer.writeUint32(
      8,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional bool need_accu_weather_update = 3;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.getNeedAccuWeatherUpdate = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 3, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.setNeedAccuWeatherUpdate = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional bool accu_stow = 4;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.getAccuStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 4, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.setAccuStow = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional string stow_type = 5;
 * @return {string}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.getStowType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.setStowType = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional string stow_start_time = 6;
 * @return {string}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.getStowStartTime = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.setStowStartTime = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional string stow_end_time = 7;
 * @return {string}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.getStowEndTime = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.setStowEndTime = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional uint32 error_codes = 8;
 * @return {number}
 */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.getErrorCodes = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.CloudAccuWeatherUpdate.prototype.setErrorCodes = function(value) {
  jspb.Message.setField(this, 8, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.MotorCurrentUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.MotorCurrentUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.MotorCurrentUpdate.displayName = 'proto.terrasmart.cloud.MotorCurrentUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.MotorCurrentUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.MotorCurrentUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.MotorCurrentUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    peakMotorInrushCurrent: +jspb.Message.getFieldWithDefault(msg, 3, 0.0),
    peakMotorCurrent: +jspb.Message.getFieldWithDefault(msg, 4, 0.0),
    averageMotorCurrent: +jspb.Message.getFieldWithDefault(msg, 5, 0.0),
    endingMotorCurrent: +jspb.Message.getFieldWithDefault(msg, 6, 0.0),
    currentAngle: +jspb.Message.getFieldWithDefault(msg, 7, 0.0),
    trackingStatus: jspb.Message.getFieldWithDefault(msg, 8, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.MotorCurrentUpdate}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.MotorCurrentUpdate;
  return proto.terrasmart.cloud.MotorCurrentUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.MotorCurrentUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.MotorCurrentUpdate}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setPeakMotorInrushCurrent(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setPeakMotorCurrent(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setAverageMotorCurrent(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setEndingMotorCurrent(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCurrentAngle(value);
      break;
    case 8:
      var value = /** @type {!proto.terrasmart.cloud.MotorCurrentUpdate.TrackingStatus} */ (reader.readEnum());
      msg.setTrackingStatus(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.MotorCurrentUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.MotorCurrentUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.MotorCurrentUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getPeakMotorInrushCurrent();
  if (f !== 0.0) {
    writer.writeFloat(
      3,
      f
    );
  }
  f = message.getPeakMotorCurrent();
  if (f !== 0.0) {
    writer.writeFloat(
      4,
      f
    );
  }
  f = message.getAverageMotorCurrent();
  if (f !== 0.0) {
    writer.writeFloat(
      5,
      f
    );
  }
  f = message.getEndingMotorCurrent();
  if (f !== 0.0) {
    writer.writeFloat(
      6,
      f
    );
  }
  f = message.getCurrentAngle();
  if (f !== 0.0) {
    writer.writeFloat(
      7,
      f
    );
  }
  f = message.getTrackingStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      8,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.TrackingStatus = {
  UNKNOWN: 0,
  MANUAL: 1,
  TRACKING_ONLY: 2,
  TRACKING_WITH_BACKTRACKING: 3,
  LOW_BATTERY_AUTO_STOW: 4,
  LOCAL_ESTOP: 5,
  INDIVIDUAL_ROW_CONTROL: 6,
  GROUP_ROW_CONTROL: 7,
  HANDHELD_ROW_CONTROL: 8,
  HIGH_TEMPERATURE_MOTOR_CUTOFF: 9,
  QC_ROW_CONTROL: 10,
  TRACKING_WITH_DIFFUSE: 11,
  QAQC_ROW_CONTROL: 12,
  MQC_ROW_CONTROL: 13
};

/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.MotorCurrentUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional float peak_motor_inrush_current = 3;
 * @return {number}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.getPeakMotorInrushCurrent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.setPeakMotorInrushCurrent = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional float peak_motor_current = 4;
 * @return {number}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.getPeakMotorCurrent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 4, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.setPeakMotorCurrent = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional float average_motor_current = 5;
 * @return {number}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.getAverageMotorCurrent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 5, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.setAverageMotorCurrent = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional float ending_motor_current = 6;
 * @return {number}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.getEndingMotorCurrent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 6, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.setEndingMotorCurrent = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional float current_angle = 7;
 * @return {number}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.getCurrentAngle = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 7, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.setCurrentAngle = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional TrackingStatus tracking_status = 8;
 * @return {!proto.terrasmart.cloud.MotorCurrentUpdate.TrackingStatus}
 */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.getTrackingStatus = function() {
  return /** @type {!proto.terrasmart.cloud.MotorCurrentUpdate.TrackingStatus} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/** @param {!proto.terrasmart.cloud.MotorCurrentUpdate.TrackingStatus} value */
proto.terrasmart.cloud.MotorCurrentUpdate.prototype.setTrackingStatus = function(value) {
  jspb.Message.setField(this, 8, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.WeatherReportingUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.WeatherReportingUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.WeatherReportingUpdate.displayName = 'proto.terrasmart.cloud.WeatherReportingUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.WeatherReportingUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.WeatherReportingUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.WeatherReportingUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    assetSnapAddr: msg.getAssetSnapAddr_asB64(),
    increaseAvgWindReporting: jspb.Message.getFieldWithDefault(msg, 4, 0),
    increaseWindGustReporting: jspb.Message.getFieldWithDefault(msg, 5, 0),
    increaseAvgSnowReporting: jspb.Message.getFieldWithDefault(msg, 6, 0),
    increasePanelSnowReporting: jspb.Message.getFieldWithDefault(msg, 7, 0),
    increaseType: jspb.Message.getFieldWithDefault(msg, 8, 0),
    increaseFlag: jspb.Message.getFieldWithDefault(msg, 9, 0),
    assetValue: +jspb.Message.getFieldWithDefault(msg, 10, 0.0),
    threshold: +jspb.Message.getFieldWithDefault(msg, 11, 0.0),
    closePercentage: jspb.Message.getFieldWithDefault(msg, 12, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.WeatherReportingUpdate}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.WeatherReportingUpdate;
  return proto.terrasmart.cloud.WeatherReportingUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.WeatherReportingUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.WeatherReportingUpdate}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAssetSnapAddr(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setIncreaseAvgWindReporting(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setIncreaseWindGustReporting(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setIncreaseAvgSnowReporting(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setIncreasePanelSnowReporting(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setIncreaseType(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setIncreaseFlag(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setAssetValue(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setThreshold(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setClosePercentage(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.WeatherReportingUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.WeatherReportingUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.WeatherReportingUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getAssetSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
  f = message.getIncreaseAvgWindReporting();
  if (f !== 0) {
    writer.writeSint32(
      4,
      f
    );
  }
  f = message.getIncreaseWindGustReporting();
  if (f !== 0) {
    writer.writeSint32(
      5,
      f
    );
  }
  f = message.getIncreaseAvgSnowReporting();
  if (f !== 0) {
    writer.writeSint32(
      6,
      f
    );
  }
  f = message.getIncreasePanelSnowReporting();
  if (f !== 0) {
    writer.writeSint32(
      7,
      f
    );
  }
  f = message.getIncreaseType();
  if (f !== 0) {
    writer.writeUint32(
      8,
      f
    );
  }
  f = message.getIncreaseFlag();
  if (f !== 0) {
    writer.writeSint32(
      9,
      f
    );
  }
  f = message.getAssetValue();
  if (f !== 0.0) {
    writer.writeFloat(
      10,
      f
    );
  }
  f = message.getThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      11,
      f
    );
  }
  f = message.getClosePercentage();
  if (f !== 0) {
    writer.writeUint32(
      12,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.WeatherReportingUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional bytes asset_snap_addr = 3;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getAssetSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes asset_snap_addr = 3;
 * This is a type-conversion wrapper around `getAssetSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getAssetSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAssetSnapAddr()));
};


/**
 * optional bytes asset_snap_addr = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAssetSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getAssetSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAssetSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setAssetSnapAddr = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional sint32 increase_avg_wind_reporting = 4;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getIncreaseAvgWindReporting = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setIncreaseAvgWindReporting = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional sint32 increase_wind_gust_reporting = 5;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getIncreaseWindGustReporting = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setIncreaseWindGustReporting = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional sint32 increase_avg_snow_reporting = 6;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getIncreaseAvgSnowReporting = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setIncreaseAvgSnowReporting = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional sint32 increase_panel_snow_reporting = 7;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getIncreasePanelSnowReporting = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setIncreasePanelSnowReporting = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional uint32 increase_type = 8;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getIncreaseType = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 8, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setIncreaseType = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional sint32 increase_flag = 9;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getIncreaseFlag = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 9, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setIncreaseFlag = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional float asset_value = 10;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getAssetValue = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 10, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setAssetValue = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional float threshold = 11;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 11, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setThreshold = function(value) {
  jspb.Message.setField(this, 11, value);
};


/**
 * optional uint32 close_percentage = 12;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.getClosePercentage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherReportingUpdate.prototype.setClosePercentage = function(value) {
  jspb.Message.setField(this, 12, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.AssetRadioRestarted = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.AssetRadioRestarted, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.AssetRadioRestarted.displayName = 'proto.terrasmart.cloud.AssetRadioRestarted';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.AssetRadioRestarted.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.AssetRadioRestarted.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.AssetRadioRestarted} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AssetRadioRestarted.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    assetRadioUpTime: +jspb.Message.getFieldWithDefault(msg, 3, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.AssetRadioRestarted}
 */
proto.terrasmart.cloud.AssetRadioRestarted.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.AssetRadioRestarted;
  return proto.terrasmart.cloud.AssetRadioRestarted.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.AssetRadioRestarted} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.AssetRadioRestarted}
 */
proto.terrasmart.cloud.AssetRadioRestarted.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setAssetRadioUpTime(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AssetRadioRestarted.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.AssetRadioRestarted.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.AssetRadioRestarted} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.AssetRadioRestarted.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getAssetRadioUpTime();
  if (f !== 0.0) {
    writer.writeFloat(
      3,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.AssetRadioRestarted.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.AssetRadioRestarted.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.AssetRadioRestarted.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.AssetRadioRestarted.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.AssetRadioRestarted.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.AssetRadioRestarted.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.AssetRadioRestarted.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.AssetRadioRestarted.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional float asset_radio_up_time = 3;
 * @return {number}
 */
proto.terrasmart.cloud.AssetRadioRestarted.prototype.getAssetRadioUpTime = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.AssetRadioRestarted.prototype.setAssetRadioUpTime = function(value) {
  jspb.Message.setField(this, 3, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.ConfiguredVersions = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.ConfiguredVersions, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.ConfiguredVersions.displayName = 'proto.terrasmart.cloud.ConfiguredVersions';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.ConfiguredVersions.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.ConfiguredVersions} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.ConfiguredVersions.toObject = function(includeInstance, msg) {
  var f, obj = {
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    ncVersion: jspb.Message.getFieldWithDefault(msg, 2, ""),
    ncScriptVersion: jspb.Message.getFieldWithDefault(msg, 3, ""),
    ncRadioVersion: jspb.Message.getFieldWithDefault(msg, 4, ""),
    ncStm32Version: jspb.Message.getFieldWithDefault(msg, 5, ""),
    ncGasGuageVersion: jspb.Message.getFieldWithDefault(msg, 6, ""),
    assetScriptVersion: jspb.Message.getFieldWithDefault(msg, 7, ""),
    assetRadioVersion: jspb.Message.getFieldWithDefault(msg, 8, ""),
    assetStm32Version: jspb.Message.getFieldWithDefault(msg, 9, ""),
    assetGasGuageVersion: jspb.Message.getFieldWithDefault(msg, 10, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.ConfiguredVersions}
 */
proto.terrasmart.cloud.ConfiguredVersions.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.ConfiguredVersions;
  return proto.terrasmart.cloud.ConfiguredVersions.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.ConfiguredVersions} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.ConfiguredVersions}
 */
proto.terrasmart.cloud.ConfiguredVersions.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setNcVersion(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setNcScriptVersion(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setNcRadioVersion(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setNcStm32Version(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setNcGasGuageVersion(value);
      break;
    case 7:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssetScriptVersion(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssetRadioVersion(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssetStm32Version(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.setAssetGasGuageVersion(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.ConfiguredVersions.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.ConfiguredVersions} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.ConfiguredVersions.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getNcVersion();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getNcScriptVersion();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getNcRadioVersion();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getNcStm32Version();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getNcGasGuageVersion();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
  f = message.getAssetScriptVersion();
  if (f.length > 0) {
    writer.writeString(
      7,
      f
    );
  }
  f = message.getAssetRadioVersion();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
  f = message.getAssetStm32Version();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
  f = message.getAssetGasGuageVersion();
  if (f.length > 0) {
    writer.writeString(
      10,
      f
    );
  }
};


/**
 * optional google.protobuf.Timestamp when = 1;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 1));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.ConfiguredVersions.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.terrasmart.cloud.ConfiguredVersions.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string nc_version = 2;
 * @return {string}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.getNcVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfiguredVersions.prototype.setNcVersion = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional string nc_script_version = 3;
 * @return {string}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.getNcScriptVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfiguredVersions.prototype.setNcScriptVersion = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional string nc_radio_version = 4;
 * @return {string}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.getNcRadioVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfiguredVersions.prototype.setNcRadioVersion = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional string nc_stm32_version = 5;
 * @return {string}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.getNcStm32Version = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfiguredVersions.prototype.setNcStm32Version = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional string nc_gas_guage_version = 6;
 * @return {string}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.getNcGasGuageVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfiguredVersions.prototype.setNcGasGuageVersion = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional string asset_script_version = 7;
 * @return {string}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.getAssetScriptVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 7, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfiguredVersions.prototype.setAssetScriptVersion = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional string asset_radio_version = 8;
 * @return {string}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.getAssetRadioVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfiguredVersions.prototype.setAssetRadioVersion = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional string asset_stm32_version = 9;
 * @return {string}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.getAssetStm32Version = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfiguredVersions.prototype.setAssetStm32Version = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional string asset_gas_guage_version = 10;
 * @return {string}
 */
proto.terrasmart.cloud.ConfiguredVersions.prototype.getAssetGasGuageVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.ConfiguredVersions.prototype.setAssetGasGuageVersion = function(value) {
  jspb.Message.setField(this, 10, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.VegetationUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.terrasmart.cloud.VegetationUpdate.repeatedFields_, null);
};
goog.inherits(proto.terrasmart.cloud.VegetationUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.VegetationUpdate.displayName = 'proto.terrasmart.cloud.VegetationUpdate';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.terrasmart.cloud.VegetationUpdate.repeatedFields_ = [5,6,7];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.VegetationUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.VegetationUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.VegetationUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    assetSnapAddr: msg.getAssetSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    vegetationModeStatus: jspb.Message.getFieldWithDefault(msg, 3, false),
    temperatureThreshold: jspb.Message.getFieldWithDefault(msg, 4, 0),
    daysHistoryList: jspb.Message.getRepeatedField(msg, 5),
    assetSnapAddressesList: msg.getAssetSnapAddressesList_asB64(),
    newlyAddedSnapAddressesList: msg.getNewlyAddedSnapAddressesList_asB64(),
    isStartupUpdate: jspb.Message.getFieldWithDefault(msg, 8, false),
    who: jspb.Message.getFieldWithDefault(msg, 9, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.VegetationUpdate}
 */
proto.terrasmart.cloud.VegetationUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.VegetationUpdate;
  return proto.terrasmart.cloud.VegetationUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.VegetationUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.VegetationUpdate}
 */
proto.terrasmart.cloud.VegetationUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAssetSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setVegetationModeStatus(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setTemperatureThreshold(value);
      break;
    case 5:
      var value = /** @type {!Array.<number>} */ (reader.readPackedSint32());
      msg.setDaysHistoryList(value);
      break;
    case 6:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.addAssetSnapAddresses(value);
      break;
    case 7:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.addNewlyAddedSnapAddresses(value);
      break;
    case 8:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsStartupUpdate(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setWho(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.VegetationUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.VegetationUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.VegetationUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAssetSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getVegetationModeStatus();
  if (f) {
    writer.writeBool(
      3,
      f
    );
  }
  f = message.getTemperatureThreshold();
  if (f !== 0) {
    writer.writeSint32(
      4,
      f
    );
  }
  f = message.getDaysHistoryList();
  if (f.length > 0) {
    writer.writePackedSint32(
      5,
      f
    );
  }
  f = message.getAssetSnapAddressesList_asU8();
  if (f.length > 0) {
    writer.writeRepeatedBytes(
      6,
      f
    );
  }
  f = message.getNewlyAddedSnapAddressesList_asU8();
  if (f.length > 0) {
    writer.writeRepeatedBytes(
      7,
      f
    );
  }
  f = message.getIsStartupUpdate();
  if (f) {
    writer.writeBool(
      8,
      f
    );
  }
  f = message.getWho();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
};


/**
 * optional bytes asset_snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getAssetSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes asset_snap_addr = 1;
 * This is a type-conversion wrapper around `getAssetSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getAssetSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAssetSnapAddr()));
};


/**
 * optional bytes asset_snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAssetSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getAssetSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAssetSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.VegetationUpdate.prototype.setAssetSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.VegetationUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.VegetationUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional bool vegetation_mode_status = 3;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getVegetationModeStatus = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 3, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.VegetationUpdate.prototype.setVegetationModeStatus = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional sint32 temperature_threshold = 4;
 * @return {number}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getTemperatureThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.VegetationUpdate.prototype.setTemperatureThreshold = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * repeated sint32 days_history = 5;
 * @return {!Array.<number>}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getDaysHistoryList = function() {
  return /** @type {!Array.<number>} */ (jspb.Message.getRepeatedField(this, 5));
};


/** @param {!Array.<number>} value */
proto.terrasmart.cloud.VegetationUpdate.prototype.setDaysHistoryList = function(value) {
  jspb.Message.setField(this, 5, value || []);
};


/**
 * @param {!number} value
 * @param {number=} opt_index
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.addDaysHistory = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 5, value, opt_index);
};


proto.terrasmart.cloud.VegetationUpdate.prototype.clearDaysHistoryList = function() {
  this.setDaysHistoryList([]);
};


/**
 * repeated bytes asset_snap_addresses = 6;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getAssetSnapAddressesList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 6));
};


/**
 * repeated bytes asset_snap_addresses = 6;
 * This is a type-conversion wrapper around `getAssetSnapAddressesList()`
 * @return {!Array.<string>}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getAssetSnapAddressesList_asB64 = function() {
  return /** @type {!Array.<string>} */ (jspb.Message.bytesListAsB64(
      this.getAssetSnapAddressesList()));
};


/**
 * repeated bytes asset_snap_addresses = 6;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAssetSnapAddressesList()`
 * @return {!Array.<!Uint8Array>}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getAssetSnapAddressesList_asU8 = function() {
  return /** @type {!Array.<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getAssetSnapAddressesList()));
};


/** @param {!(Array<!Uint8Array>|Array<string>)} value */
proto.terrasmart.cloud.VegetationUpdate.prototype.setAssetSnapAddressesList = function(value) {
  jspb.Message.setField(this, 6, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.addAssetSnapAddresses = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 6, value, opt_index);
};


proto.terrasmart.cloud.VegetationUpdate.prototype.clearAssetSnapAddressesList = function() {
  this.setAssetSnapAddressesList([]);
};


/**
 * repeated bytes newly_added_snap_addresses = 7;
 * @return {!(Array<!Uint8Array>|Array<string>)}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getNewlyAddedSnapAddressesList = function() {
  return /** @type {!(Array<!Uint8Array>|Array<string>)} */ (jspb.Message.getRepeatedField(this, 7));
};


/**
 * repeated bytes newly_added_snap_addresses = 7;
 * This is a type-conversion wrapper around `getNewlyAddedSnapAddressesList()`
 * @return {!Array.<string>}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getNewlyAddedSnapAddressesList_asB64 = function() {
  return /** @type {!Array.<string>} */ (jspb.Message.bytesListAsB64(
      this.getNewlyAddedSnapAddressesList()));
};


/**
 * repeated bytes newly_added_snap_addresses = 7;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getNewlyAddedSnapAddressesList()`
 * @return {!Array.<!Uint8Array>}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getNewlyAddedSnapAddressesList_asU8 = function() {
  return /** @type {!Array.<!Uint8Array>} */ (jspb.Message.bytesListAsU8(
      this.getNewlyAddedSnapAddressesList()));
};


/** @param {!(Array<!Uint8Array>|Array<string>)} value */
proto.terrasmart.cloud.VegetationUpdate.prototype.setNewlyAddedSnapAddressesList = function(value) {
  jspb.Message.setField(this, 7, value || []);
};


/**
 * @param {!(string|Uint8Array)} value
 * @param {number=} opt_index
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.addNewlyAddedSnapAddresses = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 7, value, opt_index);
};


proto.terrasmart.cloud.VegetationUpdate.prototype.clearNewlyAddedSnapAddressesList = function() {
  this.setNewlyAddedSnapAddressesList([]);
};


/**
 * optional bool is_startup_update = 8;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getIsStartupUpdate = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 8, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.VegetationUpdate.prototype.setIsStartupUpdate = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional string who = 9;
 * @return {string}
 */
proto.terrasmart.cloud.VegetationUpdate.prototype.getWho = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.VegetationUpdate.prototype.setWho = function(value) {
  jspb.Message.setField(this, 9, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.IrradianceUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.IrradianceUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.IrradianceUpdate.displayName = 'proto.terrasmart.cloud.IrradianceUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.IrradianceUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.IrradianceUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.IrradianceUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.IrradianceUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    siteGhi: +jspb.Message.getFieldWithDefault(msg, 2, 0.0),
    sitePoa: +jspb.Message.getFieldWithDefault(msg, 3, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.IrradianceUpdate}
 */
proto.terrasmart.cloud.IrradianceUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.IrradianceUpdate;
  return proto.terrasmart.cloud.IrradianceUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.IrradianceUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.IrradianceUpdate}
 */
proto.terrasmart.cloud.IrradianceUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSiteGhi(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSitePoa(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.IrradianceUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.IrradianceUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.IrradianceUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.IrradianceUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getSiteGhi();
  if (f !== 0.0) {
    writer.writeFloat(
      2,
      f
    );
  }
  f = message.getSitePoa();
  if (f !== 0.0) {
    writer.writeFloat(
      3,
      f
    );
  }
};


/**
 * optional google.protobuf.Timestamp when = 1;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.IrradianceUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 1));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.IrradianceUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.terrasmart.cloud.IrradianceUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.IrradianceUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional float site_ghi = 2;
 * @return {number}
 */
proto.terrasmart.cloud.IrradianceUpdate.prototype.getSiteGhi = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 2, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.IrradianceUpdate.prototype.setSiteGhi = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional float site_poa = 3;
 * @return {number}
 */
proto.terrasmart.cloud.IrradianceUpdate.prototype.getSitePoa = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 3, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.IrradianceUpdate.prototype.setSitePoa = function(value) {
  jspb.Message.setField(this, 3, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.InputVoltage = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.InputVoltage, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.InputVoltage.displayName = 'proto.terrasmart.cloud.InputVoltage';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.InputVoltage.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.InputVoltage.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.InputVoltage} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.InputVoltage.toObject = function(includeInstance, msg) {
  var f, obj = {
    min: +jspb.Message.getFieldWithDefault(msg, 1, 0.0),
    max: +jspb.Message.getFieldWithDefault(msg, 2, 0.0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.InputVoltage}
 */
proto.terrasmart.cloud.InputVoltage.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.InputVoltage;
  return proto.terrasmart.cloud.InputVoltage.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.InputVoltage} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.InputVoltage}
 */
proto.terrasmart.cloud.InputVoltage.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setMin(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setMax(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.InputVoltage.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.InputVoltage.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.InputVoltage} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.InputVoltage.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getMin();
  if (f !== 0.0) {
    writer.writeFloat(
      1,
      f
    );
  }
  f = message.getMax();
  if (f !== 0.0) {
    writer.writeFloat(
      2,
      f
    );
  }
};


/**
 * optional float min = 1;
 * @return {number}
 */
proto.terrasmart.cloud.InputVoltage.prototype.getMin = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 1, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.InputVoltage.prototype.setMin = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional float max = 2;
 * @return {number}
 */
proto.terrasmart.cloud.InputVoltage.prototype.getMax = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 2, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.InputVoltage.prototype.setMax = function(value) {
  jspb.Message.setField(this, 2, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.QaQcReportUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.QaQcReportUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.QaQcReportUpdate.displayName = 'proto.terrasmart.cloud.QaQcReportUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.QaQcReportUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.QaQcReportUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.QaQcReportUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    timestamp: (f = msg.getTimestamp()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    stage: jspb.Message.getFieldWithDefault(msg, 3, ""),
    maxPeakMotorInrushCurrent: +jspb.Message.getFieldWithDefault(msg, 4, 0.0),
    maxPeakMotorCurrent: +jspb.Message.getFieldWithDefault(msg, 5, 0.0),
    maxAverageMotorCurrent: +jspb.Message.getFieldWithDefault(msg, 6, 0.0),
    statusBits: jspb.Message.getFieldWithDefault(msg, 7, 0),
    label: jspb.Message.getFieldWithDefault(msg, 8, ""),
    userName: jspb.Message.getFieldWithDefault(msg, 9, ""),
    userEmail: jspb.Message.getFieldWithDefault(msg, 10, ""),
    charged: +jspb.Message.getFieldWithDefault(msg, 11, 0.0),
    minTemperature: +jspb.Message.getFieldWithDefault(msg, 12, 0.0),
    maxWindGust: +jspb.Message.getFieldWithDefault(msg, 13, 0.0),
    maxAverageWind: +jspb.Message.getFieldWithDefault(msg, 14, 0.0),
    siteMode: jspb.Message.getFieldWithDefault(msg, 15, 0),
    pv1: (f = msg.getPv1()) && proto.terrasmart.cloud.InputVoltage.toObject(includeInstance, f),
    pv2: (f = msg.getPv2()) && proto.terrasmart.cloud.InputVoltage.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.QaQcReportUpdate}
 */
proto.terrasmart.cloud.QaQcReportUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.QaQcReportUpdate;
  return proto.terrasmart.cloud.QaQcReportUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.QaQcReportUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.QaQcReportUpdate}
 */
proto.terrasmart.cloud.QaQcReportUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setTimestamp(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setStage(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setMaxPeakMotorInrushCurrent(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setMaxPeakMotorCurrent(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setMaxAverageMotorCurrent(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setStatusBits(value);
      break;
    case 8:
      var value = /** @type {string} */ (reader.readString());
      msg.setLabel(value);
      break;
    case 9:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserName(value);
      break;
    case 10:
      var value = /** @type {string} */ (reader.readString());
      msg.setUserEmail(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCharged(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setMinTemperature(value);
      break;
    case 13:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setMaxWindGust(value);
      break;
    case 14:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setMaxAverageWind(value);
      break;
    case 15:
      var value = /** @type {!proto.terrasmart.cloud.TrackingState} */ (reader.readEnum());
      msg.setSiteMode(value);
      break;
    case 16:
      var value = new proto.terrasmart.cloud.InputVoltage;
      reader.readMessage(value,proto.terrasmart.cloud.InputVoltage.deserializeBinaryFromReader);
      msg.setPv1(value);
      break;
    case 17:
      var value = new proto.terrasmart.cloud.InputVoltage;
      reader.readMessage(value,proto.terrasmart.cloud.InputVoltage.deserializeBinaryFromReader);
      msg.setPv2(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.QaQcReportUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.QaQcReportUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.QaQcReportUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getTimestamp();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getStage();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getMaxPeakMotorInrushCurrent();
  if (f !== 0.0) {
    writer.writeFloat(
      4,
      f
    );
  }
  f = message.getMaxPeakMotorCurrent();
  if (f !== 0.0) {
    writer.writeFloat(
      5,
      f
    );
  }
  f = message.getMaxAverageMotorCurrent();
  if (f !== 0.0) {
    writer.writeFloat(
      6,
      f
    );
  }
  f = message.getStatusBits();
  if (f !== 0) {
    writer.writeUint32(
      7,
      f
    );
  }
  f = message.getLabel();
  if (f.length > 0) {
    writer.writeString(
      8,
      f
    );
  }
  f = message.getUserName();
  if (f.length > 0) {
    writer.writeString(
      9,
      f
    );
  }
  f = message.getUserEmail();
  if (f.length > 0) {
    writer.writeString(
      10,
      f
    );
  }
  f = message.getCharged();
  if (f !== 0.0) {
    writer.writeFloat(
      11,
      f
    );
  }
  f = message.getMinTemperature();
  if (f !== 0.0) {
    writer.writeFloat(
      12,
      f
    );
  }
  f = message.getMaxWindGust();
  if (f !== 0.0) {
    writer.writeFloat(
      13,
      f
    );
  }
  f = message.getMaxAverageWind();
  if (f !== 0.0) {
    writer.writeFloat(
      14,
      f
    );
  }
  f = message.getSiteMode();
  if (f !== 0.0) {
    writer.writeEnum(
      15,
      f
    );
  }
  f = message.getPv1();
  if (f != null) {
    writer.writeMessage(
      16,
      f,
      proto.terrasmart.cloud.InputVoltage.serializeBinaryToWriter
    );
  }
  f = message.getPv2();
  if (f != null) {
    writer.writeMessage(
      17,
      f,
      proto.terrasmart.cloud.InputVoltage.serializeBinaryToWriter
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp timestamp = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getTimestamp = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setTimestamp = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.QaQcReportUpdate.prototype.clearTimestamp = function() {
  this.setTimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.hasTimestamp = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional string stage = 3;
 * @return {string}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getStage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setStage = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional float max_peak_motor_inrush_current = 4;
 * @return {number}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getMaxPeakMotorInrushCurrent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 4, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setMaxPeakMotorInrushCurrent = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional float max_peak_motor_current = 5;
 * @return {number}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getMaxPeakMotorCurrent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 5, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setMaxPeakMotorCurrent = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional float max_average_motor_current = 6;
 * @return {number}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getMaxAverageMotorCurrent = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 6, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setMaxAverageMotorCurrent = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional uint32 status_bits = 7;
 * @return {number}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getStatusBits = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setStatusBits = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional string label = 8;
 * @return {string}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getLabel = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 8, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setLabel = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional string user_name = 9;
 * @return {string}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getUserName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 9, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setUserName = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional string user_email = 10;
 * @return {string}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getUserEmail = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 10, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setUserEmail = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional float charged = 11;
 * @return {number}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getCharged = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 11, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setCharged = function(value) {
  jspb.Message.setField(this, 11, value);
};


/**
 * optional float min_temperature = 12;
 * @return {number}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getMinTemperature = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 12, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setMinTemperature = function(value) {
  jspb.Message.setField(this, 12, value);
};


/**
 * optional float max_wind_gust = 13;
 * @return {number}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getMaxWindGust = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 13, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setMaxWindGust = function(value) {
  jspb.Message.setField(this, 13, value);
};


/**
 * optional float max_average_wind = 14;
 * @return {number}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getMaxAverageWind = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 14, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setMaxAverageWind = function(value) {
  jspb.Message.setField(this, 14, value);
};


/**
 * optional TrackingState site_mode = 15;
 * @return {!proto.terrasmart.cloud.TrackingState}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getSiteMode = function() {
  return /** @type {!proto.terrasmart.cloud.TrackingState} */ (jspb.Message.getFieldWithDefault(this, 15, 0));
};


/** @param {!proto.terrasmart.cloud.TrackingState} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setSiteMode = function(value) {
  jspb.Message.setField(this, 15, value);
};


/**
 * optional InputVoltage pv1 = 16;
 * @return {?proto.terrasmart.cloud.InputVoltage}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getPv1 = function() {
  return /** @type{?proto.terrasmart.cloud.InputVoltage} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.InputVoltage, 16));
};


/** @param {?proto.terrasmart.cloud.InputVoltage|undefined} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setPv1 = function(value) {
  jspb.Message.setWrapperField(this, 16, value);
};


proto.terrasmart.cloud.QaQcReportUpdate.prototype.clearPv1 = function() {
  this.setPv1(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.hasPv1 = function() {
  return jspb.Message.getField(this, 16) != null;
};


/**
 * optional InputVoltage pv2 = 17;
 * @return {?proto.terrasmart.cloud.InputVoltage}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.getPv2 = function() {
  return /** @type{?proto.terrasmart.cloud.InputVoltage} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.InputVoltage, 17));
};


/** @param {?proto.terrasmart.cloud.InputVoltage|undefined} value */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.setPv2 = function(value) {
  jspb.Message.setWrapperField(this, 17, value);
};


proto.terrasmart.cloud.QaQcReportUpdate.prototype.clearPv2 = function() {
  this.setPv2(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.QaQcReportUpdate.prototype.hasPv2 = function() {
  return jspb.Message.getField(this, 17) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.IncreaseWeatherReporting = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.IncreaseWeatherReporting, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.IncreaseWeatherReporting.displayName = 'proto.terrasmart.cloud.IncreaseWeatherReporting';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.IncreaseWeatherReporting.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.IncreaseWeatherReporting} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.toObject = function(includeInstance, msg) {
  var f, obj = {
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    snapAddr: msg.getSnapAddr_asB64(),
    reportingType: jspb.Message.getFieldWithDefault(msg, 3, 0),
    reportingFlag: jspb.Message.getFieldWithDefault(msg, 4, 0),
    reportingValue: +jspb.Message.getFieldWithDefault(msg, 5, 0.0),
    reportingThreshold: +jspb.Message.getFieldWithDefault(msg, 6, 0.0),
    closePercentage: jspb.Message.getFieldWithDefault(msg, 7, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.IncreaseWeatherReporting}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.IncreaseWeatherReporting;
  return proto.terrasmart.cloud.IncreaseWeatherReporting.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.IncreaseWeatherReporting} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.IncreaseWeatherReporting}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setReportingType(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readSint32());
      msg.setReportingFlag(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setReportingValue(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setReportingThreshold(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setClosePercentage(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.IncreaseWeatherReporting.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.IncreaseWeatherReporting} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getReportingType();
  if (f !== 0) {
    writer.writeUint32(
      3,
      f
    );
  }
  f = message.getReportingFlag();
  if (f !== 0) {
    writer.writeSint32(
      4,
      f
    );
  }
  f = message.getReportingValue();
  if (f !== 0.0) {
    writer.writeFloat(
      5,
      f
    );
  }
  f = message.getReportingThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      6,
      f
    );
  }
  f = message.getClosePercentage();
  if (f !== 0) {
    writer.writeUint32(
      7,
      f
    );
  }
};


/**
 * optional google.protobuf.Timestamp when = 1;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 1));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bytes snap_addr = 2;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes snap_addr = 2;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional uint32 reporting_type = 3;
 * @return {number}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.getReportingType = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.setReportingType = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional sint32 reporting_flag = 4;
 * @return {number}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.getReportingFlag = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.setReportingFlag = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional float reporting_value = 5;
 * @return {number}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.getReportingValue = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 5, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.setReportingValue = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional float reporting_threshold = 6;
 * @return {number}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.getReportingThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 6, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.setReportingThreshold = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional uint32 close_percentage = 7;
 * @return {number}
 */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.getClosePercentage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 7, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.IncreaseWeatherReporting.prototype.setClosePercentage = function(value) {
  jspb.Message.setField(this, 7, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.ToggleFastTrakUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.ToggleFastTrakUpdate.displayName = 'proto.terrasmart.cloud.ToggleFastTrakUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.ToggleFastTrakUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.ToggleFastTrakUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    status: jspb.Message.getFieldWithDefault(msg, 3, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.ToggleFastTrakUpdate}
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.ToggleFastTrakUpdate;
  return proto.terrasmart.cloud.ToggleFastTrakUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.ToggleFastTrakUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.ToggleFastTrakUpdate}
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setStatus(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.ToggleFastTrakUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.ToggleFastTrakUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getStatus();
  if (f) {
    writer.writeBool(
      3,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional bool status = 3;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.getStatus = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 3, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.ToggleFastTrakUpdate.prototype.setStatus = function(value) {
  jspb.Message.setField(this, 3, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.SnowSheddingUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.SnowSheddingUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.SnowSheddingUpdate.displayName = 'proto.terrasmart.cloud.SnowSheddingUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.SnowSheddingUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.SnowSheddingUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SnowSheddingUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    snapAddr: msg.getSnapAddr_asB64(),
    timestamp: (f = msg.getTimestamp()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    depth: +jspb.Message.getFieldWithDefault(msg, 4, 0.0),
    baseline: +jspb.Message.getFieldWithDefault(msg, 5, 0.0),
    snowOnGroundNow: +jspb.Message.getFieldWithDefault(msg, 6, 0.0),
    estimate: +jspb.Message.getFieldWithDefault(msg, 7, 0.0),
    trigger: +jspb.Message.getFieldWithDefault(msg, 8, 0.0),
    threshold: +jspb.Message.getFieldWithDefault(msg, 9, 0.0),
    active: jspb.Message.getFieldWithDefault(msg, 10, false),
    state: jspb.Message.getFieldWithDefault(msg, 11, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.SnowSheddingUpdate}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.SnowSheddingUpdate;
  return proto.terrasmart.cloud.SnowSheddingUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.SnowSheddingUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.SnowSheddingUpdate}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 3:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setTimestamp(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setDepth(value);
      break;
    case 5:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setBaseline(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSnowOnGroundNow(value);
      break;
    case 7:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setEstimate(value);
      break;
    case 8:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setTrigger(value);
      break;
    case 9:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setThreshold(value);
      break;
    case 10:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setActive(value);
      break;
    case 11:
      var value = /** @type {!proto.terrasmart.cloud.SnowSheddingUpdate.SheddingState} */ (reader.readEnum());
      msg.setState(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.SnowSheddingUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.SnowSheddingUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SnowSheddingUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getTimestamp();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getDepth();
  if (f !== 0.0) {
    writer.writeFloat(
      4,
      f
    );
  }
  f = message.getBaseline();
  if (f !== 0.0) {
    writer.writeFloat(
      5,
      f
    );
  }
  f = message.getSnowOnGroundNow();
  if (f !== 0.0) {
    writer.writeFloat(
      6,
      f
    );
  }
  f = message.getEstimate();
  if (f !== 0.0) {
    writer.writeFloat(
      7,
      f
    );
  }
  f = message.getTrigger();
  if (f !== 0.0) {
    writer.writeFloat(
      8,
      f
    );
  }
  f = message.getThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      9,
      f
    );
  }
  f = message.getActive();
  if (f) {
    writer.writeBool(
      10,
      f
    );
  }
  f = message.getState();
  if (f !== 0.0) {
    writer.writeEnum(
      11,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.SheddingState = {
  SNOW_SHEDDING_STARTED: 0,
  SNOW_SHEDDING_STOPPED: 1,
  SNOW_SHEDDING_DELAYED: 2,
  SNOW_SHEDDING_STARTED_WITH_DELAY: 3
};

/**
 * optional google.protobuf.Timestamp when = 1;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 1));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 1, value);
};


proto.terrasmart.cloud.SnowSheddingUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bytes snap_addr = 2;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes snap_addr = 2;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional google.protobuf.Timestamp timestamp = 3;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getTimestamp = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 3));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.setTimestamp = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.terrasmart.cloud.SnowSheddingUpdate.prototype.clearTimestamp = function() {
  this.setTimestamp(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.hasTimestamp = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional float depth = 4;
 * @return {number}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getDepth = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 4, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.setDepth = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional float baseline = 5;
 * @return {number}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getBaseline = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 5, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.setBaseline = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional float snow_on_ground_now = 6;
 * @return {number}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getSnowOnGroundNow = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 6, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.setSnowOnGroundNow = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional float estimate = 7;
 * @return {number}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getEstimate = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 7, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.setEstimate = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional float trigger = 8;
 * @return {number}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getTrigger = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 8, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.setTrigger = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional float threshold = 9;
 * @return {number}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 9, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.setThreshold = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional bool active = 10;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getActive = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 10, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.setActive = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional SheddingState state = 11;
 * @return {!proto.terrasmart.cloud.SnowSheddingUpdate.SheddingState}
 */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.getState = function() {
  return /** @type {!proto.terrasmart.cloud.SnowSheddingUpdate.SheddingState} */ (jspb.Message.getFieldWithDefault(this, 11, 0));
};


/** @param {!proto.terrasmart.cloud.SnowSheddingUpdate.SheddingState} value */
proto.terrasmart.cloud.SnowSheddingUpdate.prototype.setState = function(value) {
  jspb.Message.setField(this, 11, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.SnowSheddingReport = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.terrasmart.cloud.SnowSheddingReport.repeatedFields_, null);
};
goog.inherits(proto.terrasmart.cloud.SnowSheddingReport, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.SnowSheddingReport.displayName = 'proto.terrasmart.cloud.SnowSheddingReport';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.terrasmart.cloud.SnowSheddingReport.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.SnowSheddingReport.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.SnowSheddingReport.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.SnowSheddingReport} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SnowSheddingReport.toObject = function(includeInstance, msg) {
  var f, obj = {
    status: jspb.Message.getFieldWithDefault(msg, 1, 0),
    assetsList: jspb.Message.toObjectList(msg.getAssetsList(),
    proto.terrasmart.cloud.SnowSheddingReport.Asset.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.SnowSheddingReport}
 */
proto.terrasmart.cloud.SnowSheddingReport.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.SnowSheddingReport;
  return proto.terrasmart.cloud.SnowSheddingReport.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.SnowSheddingReport} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.SnowSheddingReport}
 */
proto.terrasmart.cloud.SnowSheddingReport.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.terrasmart.cloud.SnowSheddingReport.SheddingStatus} */ (reader.readEnum());
      msg.setStatus(value);
      break;
    case 2:
      var value = new proto.terrasmart.cloud.SnowSheddingReport.Asset;
      reader.readMessage(value,proto.terrasmart.cloud.SnowSheddingReport.Asset.deserializeBinaryFromReader);
      msg.addAssets(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SnowSheddingReport.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.SnowSheddingReport.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.SnowSheddingReport} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SnowSheddingReport.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getStatus();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getAssetsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.terrasmart.cloud.SnowSheddingReport.Asset.serializeBinaryToWriter
    );
  }
};


/**
 * @enum {number}
 */
proto.terrasmart.cloud.SnowSheddingReport.SheddingStatus = {
  UNRESPONSIVE: 0,
  PENDING: 1,
  FAILED: 2,
  RETRIED: 3,
  COMPLETED: 4
};


/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.SnowSheddingReport.Asset = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.SnowSheddingReport.Asset, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.SnowSheddingReport.Asset.displayName = 'proto.terrasmart.cloud.SnowSheddingReport.Asset';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.SnowSheddingReport.Asset.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.SnowSheddingReport.Asset.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.SnowSheddingReport.Asset} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SnowSheddingReport.Asset.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    snowSheddingRetries: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.SnowSheddingReport.Asset}
 */
proto.terrasmart.cloud.SnowSheddingReport.Asset.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.SnowSheddingReport.Asset;
  return proto.terrasmart.cloud.SnowSheddingReport.Asset.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.SnowSheddingReport.Asset} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.SnowSheddingReport.Asset}
 */
proto.terrasmart.cloud.SnowSheddingReport.Asset.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setSnowSheddingRetries(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SnowSheddingReport.Asset.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.SnowSheddingReport.Asset.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.SnowSheddingReport.Asset} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SnowSheddingReport.Asset.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getSnowSheddingRetries();
  if (f !== 0) {
    writer.writeUint32(
      2,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.SnowSheddingReport.Asset.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.SnowSheddingReport.Asset.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SnowSheddingReport.Asset.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.SnowSheddingReport.Asset.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional uint32 snow_shedding_retries = 2;
 * @return {number}
 */
proto.terrasmart.cloud.SnowSheddingReport.Asset.prototype.getSnowSheddingRetries = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SnowSheddingReport.Asset.prototype.setSnowSheddingRetries = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional SheddingStatus status = 1;
 * @return {!proto.terrasmart.cloud.SnowSheddingReport.SheddingStatus}
 */
proto.terrasmart.cloud.SnowSheddingReport.prototype.getStatus = function() {
  return /** @type {!proto.terrasmart.cloud.SnowSheddingReport.SheddingStatus} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/** @param {!proto.terrasmart.cloud.SnowSheddingReport.SheddingStatus} value */
proto.terrasmart.cloud.SnowSheddingReport.prototype.setStatus = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * repeated Asset assets = 2;
 * @return {!Array.<!proto.terrasmart.cloud.SnowSheddingReport.Asset>}
 */
proto.terrasmart.cloud.SnowSheddingReport.prototype.getAssetsList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.SnowSheddingReport.Asset>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.SnowSheddingReport.Asset, 2));
};


/** @param {!Array.<!proto.terrasmart.cloud.SnowSheddingReport.Asset>} value */
proto.terrasmart.cloud.SnowSheddingReport.prototype.setAssetsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.terrasmart.cloud.SnowSheddingReport.Asset=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.SnowSheddingReport.Asset}
 */
proto.terrasmart.cloud.SnowSheddingReport.prototype.addAssets = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.terrasmart.cloud.SnowSheddingReport.Asset, opt_index);
};


proto.terrasmart.cloud.SnowSheddingReport.prototype.clearAssetsList = function() {
  this.setAssetsList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.terrasmart.cloud.SnowSheddingReportUpdate.repeatedFields_, null);
};
goog.inherits(proto.terrasmart.cloud.SnowSheddingReportUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.SnowSheddingReportUpdate.displayName = 'proto.terrasmart.cloud.SnowSheddingReportUpdate';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.repeatedFields_ = [3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.SnowSheddingReportUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.SnowSheddingReportUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    reportList: jspb.Message.toObjectList(msg.getReportList(),
    proto.terrasmart.cloud.SnowSheddingReport.toObject, includeInstance),
    delayed: jspb.Message.getFieldWithDefault(msg, 4, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.SnowSheddingReportUpdate}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.SnowSheddingReportUpdate;
  return proto.terrasmart.cloud.SnowSheddingReportUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.SnowSheddingReportUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.SnowSheddingReportUpdate}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = new proto.terrasmart.cloud.SnowSheddingReport;
      reader.readMessage(value,proto.terrasmart.cloud.SnowSheddingReport.deserializeBinaryFromReader);
      msg.addReport(value);
      break;
    case 4:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setDelayed(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.SnowSheddingReportUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.SnowSheddingReportUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getReportList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.terrasmart.cloud.SnowSheddingReport.serializeBinaryToWriter
    );
  }
  f = message.getDelayed();
  if (f) {
    writer.writeBool(
      4,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * repeated SnowSheddingReport report = 3;
 * @return {!Array.<!proto.terrasmart.cloud.SnowSheddingReport>}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.getReportList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.SnowSheddingReport>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.SnowSheddingReport, 3));
};


/** @param {!Array.<!proto.terrasmart.cloud.SnowSheddingReport>} value */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.setReportList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.terrasmart.cloud.SnowSheddingReport=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.SnowSheddingReport}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.addReport = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.terrasmart.cloud.SnowSheddingReport, opt_index);
};


proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.clearReportList = function() {
  this.setReportList([]);
};


/**
 * optional bool delayed = 4;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.getDelayed = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 4, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SnowSheddingReportUpdate.prototype.setDelayed = function(value) {
  jspb.Message.setField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.FirmwareUpgradeReport = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.terrasmart.cloud.FirmwareUpgradeReport.repeatedFields_, null);
};
goog.inherits(proto.terrasmart.cloud.FirmwareUpgradeReport, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.FirmwareUpgradeReport.displayName = 'proto.terrasmart.cloud.FirmwareUpgradeReport';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.repeatedFields_ = [3,4,5];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.FirmwareUpgradeReport.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.FirmwareUpgradeReport} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.toObject = function(includeInstance, msg) {
  var f, obj = {
    firmware: jspb.Message.getFieldWithDefault(msg, 1, ""),
    startTime: (f = msg.getStartTime()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    attemptedList: jspb.Message.getRepeatedField(msg, 3),
    succeededList: jspb.Message.getRepeatedField(msg, 4),
    failedList: jspb.Message.getRepeatedField(msg, 5)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.FirmwareUpgradeReport}
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.FirmwareUpgradeReport;
  return proto.terrasmart.cloud.FirmwareUpgradeReport.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.FirmwareUpgradeReport} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.FirmwareUpgradeReport}
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setFirmware(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setStartTime(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.addAttempted(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.addSucceeded(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.addFailed(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.FirmwareUpgradeReport.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.FirmwareUpgradeReport} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFirmware();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getStartTime();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getAttemptedList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      3,
      f
    );
  }
  f = message.getSucceededList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      4,
      f
    );
  }
  f = message.getFailedList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      5,
      f
    );
  }
};


/**
 * optional string firmware = 1;
 * @return {string}
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.getFirmware = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.setFirmware = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp start_time = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.getStartTime = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.setStartTime = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.clearStartTime = function() {
  this.setStartTime(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.hasStartTime = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * repeated string attempted = 3;
 * @return {!Array.<string>}
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.getAttemptedList = function() {
  return /** @type {!Array.<string>} */ (jspb.Message.getRepeatedField(this, 3));
};


/** @param {!Array.<string>} value */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.setAttemptedList = function(value) {
  jspb.Message.setField(this, 3, value || []);
};


/**
 * @param {!string} value
 * @param {number=} opt_index
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.addAttempted = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 3, value, opt_index);
};


proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.clearAttemptedList = function() {
  this.setAttemptedList([]);
};


/**
 * repeated string succeeded = 4;
 * @return {!Array.<string>}
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.getSucceededList = function() {
  return /** @type {!Array.<string>} */ (jspb.Message.getRepeatedField(this, 4));
};


/** @param {!Array.<string>} value */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.setSucceededList = function(value) {
  jspb.Message.setField(this, 4, value || []);
};


/**
 * @param {!string} value
 * @param {number=} opt_index
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.addSucceeded = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 4, value, opt_index);
};


proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.clearSucceededList = function() {
  this.setSucceededList([]);
};


/**
 * repeated string failed = 5;
 * @return {!Array.<string>}
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.getFailedList = function() {
  return /** @type {!Array.<string>} */ (jspb.Message.getRepeatedField(this, 5));
};


/** @param {!Array.<string>} value */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.setFailedList = function(value) {
  jspb.Message.setField(this, 5, value || []);
};


/**
 * @param {!string} value
 * @param {number=} opt_index
 */
proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.addFailed = function(value, opt_index) {
  jspb.Message.addToRepeatedField(this, 5, value, opt_index);
};


proto.terrasmart.cloud.FirmwareUpgradeReport.prototype.clearFailedList = function() {
  this.setFailedList([]);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.FirmwareUpgradeReportUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.displayName = 'proto.terrasmart.cloud.FirmwareUpgradeReportUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.FirmwareUpgradeReportUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    report: (f = msg.getReport()) && proto.terrasmart.cloud.FirmwareUpgradeReport.toObject(includeInstance, f),
    finished: jspb.Message.getFieldWithDefault(msg, 4, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.FirmwareUpgradeReportUpdate}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.FirmwareUpgradeReportUpdate;
  return proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.FirmwareUpgradeReportUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.FirmwareUpgradeReportUpdate}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = new proto.terrasmart.cloud.FirmwareUpgradeReport;
      reader.readMessage(value,proto.terrasmart.cloud.FirmwareUpgradeReport.deserializeBinaryFromReader);
      msg.setReport(value);
      break;
    case 4:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setFinished(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.FirmwareUpgradeReportUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getReport();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.terrasmart.cloud.FirmwareUpgradeReport.serializeBinaryToWriter
    );
  }
  f = message.getFinished();
  if (f) {
    writer.writeBool(
      4,
      f
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional FirmwareUpgradeReport report = 3;
 * @return {?proto.terrasmart.cloud.FirmwareUpgradeReport}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.getReport = function() {
  return /** @type{?proto.terrasmart.cloud.FirmwareUpgradeReport} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.FirmwareUpgradeReport, 3));
};


/** @param {?proto.terrasmart.cloud.FirmwareUpgradeReport|undefined} value */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.setReport = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.clearReport = function() {
  this.setReport(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.hasReport = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional bool finished = 4;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.getFinished = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 4, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.prototype.setFinished = function(value) {
  jspb.Message.setField(this, 4, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.SiteParameters = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.SiteParameters, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.SiteParameters.displayName = 'proto.terrasmart.cloud.SiteParameters';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.SiteParameters.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.SiteParameters.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.SiteParameters} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SiteParameters.toObject = function(includeInstance, msg) {
  var f, obj = {
    enableNightlyShutdown: jspb.Message.getFieldWithDefault(msg, 1, false),
    enableNightlyRestart: jspb.Message.getFieldWithDefault(msg, 2, false),
    trackingEnable: jspb.Message.getFieldWithDefault(msg, 3, false),
    enableCpuLogging: jspb.Message.getFieldWithDefault(msg, 4, false),
    enableWeatherDataRecording: jspb.Message.getFieldWithDefault(msg, 5, false),
    includeSunriseWithNightlyStow: jspb.Message.getFieldWithDefault(msg, 6, false),
    mqttEnabled: jspb.Message.getFieldWithDefault(msg, 7, false),
    enableMovementPrediction: jspb.Message.getFieldWithDefault(msg, 8, false),
    enableLowPowerShutdown: jspb.Message.getFieldWithDefault(msg, 9, false),
    backtrackingEnable: jspb.Message.getFieldWithDefault(msg, 10, false),
    enableMemLogging: jspb.Message.getFieldWithDefault(msg, 11, false),
    powerOff: jspb.Message.getFieldWithDefault(msg, 12, 0),
    powerOn: jspb.Message.getFieldWithDefault(msg, 13, 0),
    restartBeforeSunrise: jspb.Message.getFieldWithDefault(msg, 14, 0),
    rqcResponseTimeout: jspb.Message.getFieldWithDefault(msg, 15, 0),
    rqcBatchSize: jspb.Message.getFieldWithDefault(msg, 16, 0),
    operationalMode: jspb.Message.getFieldWithDefault(msg, 17, 0),
    cpuThreshold: jspb.Message.getFieldWithDefault(msg, 18, 0),
    stowAvgDuration: jspb.Message.getFieldWithDefault(msg, 19, 0),
    memThreshold: jspb.Message.getFieldWithDefault(msg, 20, 0),
    siteImageUlLat: +jspb.Message.getFieldWithDefault(msg, 21, 0.0),
    siteImageUlLng: +jspb.Message.getFieldWithDefault(msg, 22, 0.0),
    siteImageLlLat: +jspb.Message.getFieldWithDefault(msg, 23, 0.0),
    siteImageLlLng: +jspb.Message.getFieldWithDefault(msg, 24, 0.0),
    gpsAlt: +jspb.Message.getFieldWithDefault(msg, 25, 0.0),
    gpsLat: +jspb.Message.getFieldWithDefault(msg, 26, 0.0),
    gpsLng: +jspb.Message.getFieldWithDefault(msg, 27, 0.0),
    gatewayCutoffVoltage: +jspb.Message.getFieldWithDefault(msg, 28, 0.0),
    cellModemCutonVoltage: +jspb.Message.getFieldWithDefault(msg, 29, 0.0),
    cellModemWarningVoltage: +jspb.Message.getFieldWithDefault(msg, 30, 0.0),
    cellModemCutoffVoltage: +jspb.Message.getFieldWithDefault(msg, 31, 0.0),
    gatewayWarningVoltage: +jspb.Message.getFieldWithDefault(msg, 32, 0.0),
    siteName: jspb.Message.getFieldWithDefault(msg, 33, ""),
    siteOrganization: jspb.Message.getFieldWithDefault(msg, 34, ""),
    siteContact: jspb.Message.getFieldWithDefault(msg, 35, ""),
    siteType: jspb.Message.getFieldWithDefault(msg, 36, ""),
    siteImage: jspb.Message.getFieldWithDefault(msg, 37, ""),
    previousStowLogic: jspb.Message.getFieldWithDefault(msg, 38, ""),
    stowLogic: jspb.Message.getFieldWithDefault(msg, 39, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.SiteParameters}
 */
proto.terrasmart.cloud.SiteParameters.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.SiteParameters;
  return proto.terrasmart.cloud.SiteParameters.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.SiteParameters} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.SiteParameters}
 */
proto.terrasmart.cloud.SiteParameters.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableNightlyShutdown(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableNightlyRestart(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setTrackingEnable(value);
      break;
    case 4:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableCpuLogging(value);
      break;
    case 5:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableWeatherDataRecording(value);
      break;
    case 6:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIncludeSunriseWithNightlyStow(value);
      break;
    case 7:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setMqttEnabled(value);
      break;
    case 8:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableMovementPrediction(value);
      break;
    case 9:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableLowPowerShutdown(value);
      break;
    case 10:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setBacktrackingEnable(value);
      break;
    case 11:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableMemLogging(value);
      break;
    case 12:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPowerOff(value);
      break;
    case 13:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setPowerOn(value);
      break;
    case 14:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRestartBeforeSunrise(value);
      break;
    case 15:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRqcResponseTimeout(value);
      break;
    case 16:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setRqcBatchSize(value);
      break;
    case 17:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setOperationalMode(value);
      break;
    case 18:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setCpuThreshold(value);
      break;
    case 19:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setStowAvgDuration(value);
      break;
    case 20:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setMemThreshold(value);
      break;
    case 21:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSiteImageUlLat(value);
      break;
    case 22:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSiteImageUlLng(value);
      break;
    case 23:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSiteImageLlLat(value);
      break;
    case 24:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSiteImageLlLng(value);
      break;
    case 25:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setGpsAlt(value);
      break;
    case 26:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setGpsLat(value);
      break;
    case 27:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setGpsLng(value);
      break;
    case 28:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setGatewayCutoffVoltage(value);
      break;
    case 29:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCellModemCutonVoltage(value);
      break;
    case 30:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCellModemWarningVoltage(value);
      break;
    case 31:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setCellModemCutoffVoltage(value);
      break;
    case 32:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setGatewayWarningVoltage(value);
      break;
    case 33:
      var value = /** @type {string} */ (reader.readString());
      msg.setSiteName(value);
      break;
    case 34:
      var value = /** @type {string} */ (reader.readString());
      msg.setSiteOrganization(value);
      break;
    case 35:
      var value = /** @type {string} */ (reader.readString());
      msg.setSiteContact(value);
      break;
    case 36:
      var value = /** @type {string} */ (reader.readString());
      msg.setSiteType(value);
      break;
    case 37:
      var value = /** @type {string} */ (reader.readString());
      msg.setSiteImage(value);
      break;
    case 38:
      var value = /** @type {string} */ (reader.readString());
      msg.setPreviousStowLogic(value);
      break;
    case 39:
      var value = /** @type {string} */ (reader.readString());
      msg.setStowLogic(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.SiteParameters.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.SiteParameters.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.SiteParameters} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.SiteParameters.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getEnableNightlyShutdown();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getEnableNightlyRestart();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
  f = message.getTrackingEnable();
  if (f) {
    writer.writeBool(
      3,
      f
    );
  }
  f = message.getEnableCpuLogging();
  if (f) {
    writer.writeBool(
      4,
      f
    );
  }
  f = message.getEnableWeatherDataRecording();
  if (f) {
    writer.writeBool(
      5,
      f
    );
  }
  f = message.getIncludeSunriseWithNightlyStow();
  if (f) {
    writer.writeBool(
      6,
      f
    );
  }
  f = message.getMqttEnabled();
  if (f) {
    writer.writeBool(
      7,
      f
    );
  }
  f = message.getEnableMovementPrediction();
  if (f) {
    writer.writeBool(
      8,
      f
    );
  }
  f = message.getEnableLowPowerShutdown();
  if (f) {
    writer.writeBool(
      9,
      f
    );
  }
  f = message.getBacktrackingEnable();
  if (f) {
    writer.writeBool(
      10,
      f
    );
  }
  f = message.getEnableMemLogging();
  if (f) {
    writer.writeBool(
      11,
      f
    );
  }
  f = message.getPowerOff();
  if (f !== 0) {
    writer.writeUint32(
      12,
      f
    );
  }
  f = message.getPowerOn();
  if (f !== 0) {
    writer.writeUint32(
      13,
      f
    );
  }
  f = message.getRestartBeforeSunrise();
  if (f !== 0) {
    writer.writeUint32(
      14,
      f
    );
  }
  f = message.getRqcResponseTimeout();
  if (f !== 0) {
    writer.writeUint32(
      15,
      f
    );
  }
  f = message.getRqcBatchSize();
  if (f !== 0) {
    writer.writeUint32(
      16,
      f
    );
  }
  f = message.getOperationalMode();
  if (f !== 0) {
    writer.writeUint32(
      17,
      f
    );
  }
  f = message.getCpuThreshold();
  if (f !== 0) {
    writer.writeUint32(
      18,
      f
    );
  }
  f = message.getStowAvgDuration();
  if (f !== 0) {
    writer.writeUint32(
      19,
      f
    );
  }
  f = message.getMemThreshold();
  if (f !== 0) {
    writer.writeUint32(
      20,
      f
    );
  }
  f = message.getSiteImageUlLat();
  if (f !== 0.0) {
    writer.writeFloat(
      21,
      f
    );
  }
  f = message.getSiteImageUlLng();
  if (f !== 0.0) {
    writer.writeFloat(
      22,
      f
    );
  }
  f = message.getSiteImageLlLat();
  if (f !== 0.0) {
    writer.writeFloat(
      23,
      f
    );
  }
  f = message.getSiteImageLlLng();
  if (f !== 0.0) {
    writer.writeFloat(
      24,
      f
    );
  }
  f = message.getGpsAlt();
  if (f !== 0.0) {
    writer.writeFloat(
      25,
      f
    );
  }
  f = message.getGpsLat();
  if (f !== 0.0) {
    writer.writeFloat(
      26,
      f
    );
  }
  f = message.getGpsLng();
  if (f !== 0.0) {
    writer.writeFloat(
      27,
      f
    );
  }
  f = message.getGatewayCutoffVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      28,
      f
    );
  }
  f = message.getCellModemCutonVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      29,
      f
    );
  }
  f = message.getCellModemWarningVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      30,
      f
    );
  }
  f = message.getCellModemCutoffVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      31,
      f
    );
  }
  f = message.getGatewayWarningVoltage();
  if (f !== 0.0) {
    writer.writeFloat(
      32,
      f
    );
  }
  f = message.getSiteName();
  if (f.length > 0) {
    writer.writeString(
      33,
      f
    );
  }
  f = message.getSiteOrganization();
  if (f.length > 0) {
    writer.writeString(
      34,
      f
    );
  }
  f = message.getSiteContact();
  if (f.length > 0) {
    writer.writeString(
      35,
      f
    );
  }
  f = message.getSiteType();
  if (f.length > 0) {
    writer.writeString(
      36,
      f
    );
  }
  f = message.getSiteImage();
  if (f.length > 0) {
    writer.writeString(
      37,
      f
    );
  }
  f = message.getPreviousStowLogic();
  if (f.length > 0) {
    writer.writeString(
      38,
      f
    );
  }
  f = message.getStowLogic();
  if (f.length > 0) {
    writer.writeString(
      39,
      f
    );
  }
};


/**
 * optional bool enable_nightly_shutdown = 1;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getEnableNightlyShutdown = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 1, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteParameters.prototype.setEnableNightlyShutdown = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional bool enable_nightly_restart = 2;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getEnableNightlyRestart = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 2, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteParameters.prototype.setEnableNightlyRestart = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional bool tracking_enable = 3;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getTrackingEnable = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 3, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteParameters.prototype.setTrackingEnable = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional bool enable_cpu_logging = 4;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getEnableCpuLogging = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 4, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteParameters.prototype.setEnableCpuLogging = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional bool enable_weather_data_recording = 5;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getEnableWeatherDataRecording = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 5, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteParameters.prototype.setEnableWeatherDataRecording = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional bool include_sunrise_with_nightly_stow = 6;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getIncludeSunriseWithNightlyStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 6, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteParameters.prototype.setIncludeSunriseWithNightlyStow = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional bool mqtt_enabled = 7;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getMqttEnabled = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 7, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteParameters.prototype.setMqttEnabled = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional bool enable_movement_prediction = 8;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getEnableMovementPrediction = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 8, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteParameters.prototype.setEnableMovementPrediction = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional bool enable_low_power_shutdown = 9;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getEnableLowPowerShutdown = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 9, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteParameters.prototype.setEnableLowPowerShutdown = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional bool backtracking_enable = 10;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getBacktrackingEnable = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 10, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteParameters.prototype.setBacktrackingEnable = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional bool enable_mem_logging = 11;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getEnableMemLogging = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 11, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.SiteParameters.prototype.setEnableMemLogging = function(value) {
  jspb.Message.setField(this, 11, value);
};


/**
 * optional uint32 power_off = 12;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getPowerOff = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 12, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setPowerOff = function(value) {
  jspb.Message.setField(this, 12, value);
};


/**
 * optional uint32 power_on = 13;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getPowerOn = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 13, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setPowerOn = function(value) {
  jspb.Message.setField(this, 13, value);
};


/**
 * optional uint32 restart_before_sunrise = 14;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getRestartBeforeSunrise = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 14, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setRestartBeforeSunrise = function(value) {
  jspb.Message.setField(this, 14, value);
};


/**
 * optional uint32 rqc_response_timeout = 15;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getRqcResponseTimeout = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 15, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setRqcResponseTimeout = function(value) {
  jspb.Message.setField(this, 15, value);
};


/**
 * optional uint32 rqc_batch_size = 16;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getRqcBatchSize = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 16, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setRqcBatchSize = function(value) {
  jspb.Message.setField(this, 16, value);
};


/**
 * optional uint32 operational_mode = 17;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getOperationalMode = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 17, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setOperationalMode = function(value) {
  jspb.Message.setField(this, 17, value);
};


/**
 * optional uint32 cpu_threshold = 18;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getCpuThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 18, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setCpuThreshold = function(value) {
  jspb.Message.setField(this, 18, value);
};


/**
 * optional uint32 stow_avg_duration = 19;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getStowAvgDuration = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 19, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setStowAvgDuration = function(value) {
  jspb.Message.setField(this, 19, value);
};


/**
 * optional uint32 mem_threshold = 20;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getMemThreshold = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 20, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setMemThreshold = function(value) {
  jspb.Message.setField(this, 20, value);
};


/**
 * optional float site_image_ul_lat = 21;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getSiteImageUlLat = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 21, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setSiteImageUlLat = function(value) {
  jspb.Message.setField(this, 21, value);
};


/**
 * optional float site_image_ul_lng = 22;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getSiteImageUlLng = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 22, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setSiteImageUlLng = function(value) {
  jspb.Message.setField(this, 22, value);
};


/**
 * optional float site_image_ll_lat = 23;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getSiteImageLlLat = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 23, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setSiteImageLlLat = function(value) {
  jspb.Message.setField(this, 23, value);
};


/**
 * optional float site_image_ll_lng = 24;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getSiteImageLlLng = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 24, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setSiteImageLlLng = function(value) {
  jspb.Message.setField(this, 24, value);
};


/**
 * optional float gps_alt = 25;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getGpsAlt = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 25, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setGpsAlt = function(value) {
  jspb.Message.setField(this, 25, value);
};


/**
 * optional float gps_lat = 26;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getGpsLat = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 26, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setGpsLat = function(value) {
  jspb.Message.setField(this, 26, value);
};


/**
 * optional float gps_lng = 27;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getGpsLng = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 27, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setGpsLng = function(value) {
  jspb.Message.setField(this, 27, value);
};


/**
 * optional float gateway_cutoff_voltage = 28;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getGatewayCutoffVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 28, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setGatewayCutoffVoltage = function(value) {
  jspb.Message.setField(this, 28, value);
};


/**
 * optional float cell_modem_cuton_voltage = 29;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getCellModemCutonVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 29, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setCellModemCutonVoltage = function(value) {
  jspb.Message.setField(this, 29, value);
};


/**
 * optional float cell_modem_warning_voltage = 30;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getCellModemWarningVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 30, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setCellModemWarningVoltage = function(value) {
  jspb.Message.setField(this, 30, value);
};


/**
 * optional float cell_modem_cutoff_voltage = 31;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getCellModemCutoffVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 31, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setCellModemCutoffVoltage = function(value) {
  jspb.Message.setField(this, 31, value);
};


/**
 * optional float gateway_warning_voltage = 32;
 * @return {number}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getGatewayWarningVoltage = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 32, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.SiteParameters.prototype.setGatewayWarningVoltage = function(value) {
  jspb.Message.setField(this, 32, value);
};


/**
 * optional string site_name = 33;
 * @return {string}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getSiteName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 33, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteParameters.prototype.setSiteName = function(value) {
  jspb.Message.setField(this, 33, value);
};


/**
 * optional string site_organization = 34;
 * @return {string}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getSiteOrganization = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 34, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteParameters.prototype.setSiteOrganization = function(value) {
  jspb.Message.setField(this, 34, value);
};


/**
 * optional string site_contact = 35;
 * @return {string}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getSiteContact = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 35, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteParameters.prototype.setSiteContact = function(value) {
  jspb.Message.setField(this, 35, value);
};


/**
 * optional string site_type = 36;
 * @return {string}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getSiteType = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 36, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteParameters.prototype.setSiteType = function(value) {
  jspb.Message.setField(this, 36, value);
};


/**
 * optional string site_image = 37;
 * @return {string}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getSiteImage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 37, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteParameters.prototype.setSiteImage = function(value) {
  jspb.Message.setField(this, 37, value);
};


/**
 * optional string previous_stow_logic = 38;
 * @return {string}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getPreviousStowLogic = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 38, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteParameters.prototype.setPreviousStowLogic = function(value) {
  jspb.Message.setField(this, 38, value);
};


/**
 * optional string stow_logic = 39;
 * @return {string}
 */
proto.terrasmart.cloud.SiteParameters.prototype.getStowLogic = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 39, ""));
};


/** @param {string} value */
proto.terrasmart.cloud.SiteParameters.prototype.setStowLogic = function(value) {
  jspb.Message.setField(this, 39, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.WeatherParameters = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.WeatherParameters, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.WeatherParameters.displayName = 'proto.terrasmart.cloud.WeatherParameters';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.WeatherParameters.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.WeatherParameters} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.WeatherParameters.toObject = function(includeInstance, msg) {
  var f, obj = {
    triggerAveraging: jspb.Message.getFieldWithDefault(msg, 1, false),
    enableWindSpeedStow: jspb.Message.getFieldWithDefault(msg, 2, false),
    enableWindGustStow: jspb.Message.getFieldWithDefault(msg, 3, false),
    enableSnowDepthStow: jspb.Message.getFieldWithDefault(msg, 4, false),
    enableSnowDepthAveraging: jspb.Message.getFieldWithDefault(msg, 5, false),
    enableAutoResumeTrackingSnow: jspb.Message.getFieldWithDefault(msg, 6, false),
    enablePanelSnowDepthStow: jspb.Message.getFieldWithDefault(msg, 7, false),
    enablePanelSnowDepthAveraging: jspb.Message.getFieldWithDefault(msg, 8, false),
    enableAutoResumeTrackingPanelSnow: jspb.Message.getFieldWithDefault(msg, 9, false),
    enableDiffuseMode: jspb.Message.getFieldWithDefault(msg, 10, false),
    enableTooColdToMoveStow: jspb.Message.getFieldWithDefault(msg, 11, false),
    enableSnowShedding: jspb.Message.getFieldWithDefault(msg, 12, false),
    enableVegetationMode: jspb.Message.getFieldWithDefault(msg, 13, false),
    windSpeedThreshold: +jspb.Message.getFieldWithDefault(msg, 14, 0.0),
    windSpeedDurationRequired: +jspb.Message.getFieldWithDefault(msg, 15, 0.0),
    windGustThreshold: +jspb.Message.getFieldWithDefault(msg, 16, 0.0),
    resumeTrackingAfterWindTimeout: +jspb.Message.getFieldWithDefault(msg, 17, 0.0),
    resumeTrackingAfterSnowTimeout: +jspb.Message.getFieldWithDefault(msg, 18, 0.0),
    resumeTrackingAfterPanelSnowTimeout: +jspb.Message.getFieldWithDefault(msg, 19, 0.0),
    snowDepthThreshold: +jspb.Message.getFieldWithDefault(msg, 20, 0.0),
    snowDepthLowThreshold: +jspb.Message.getFieldWithDefault(msg, 21, 0.0),
    panelSnowDepthThreshold: +jspb.Message.getFieldWithDefault(msg, 22, 0.0),
    panelSnowDepthLowThreshold: +jspb.Message.getFieldWithDefault(msg, 23, 0.0),
    tooColdToMoveStowTempThreshold: +jspb.Message.getFieldWithDefault(msg, 34, 0.0),
    tooColdToMoveStowTempLowThreshold: +jspb.Message.getFieldWithDefault(msg, 35, 0.0),
    resumeTrackingAfterTooColdToMoveTimeout: +jspb.Message.getFieldWithDefault(msg, 36, 0.0),
    vegetationTemperatureThreshold: +jspb.Message.getFieldWithDefault(msg, 27, 0.0),
    snowSheddingThreshold: +jspb.Message.getFieldWithDefault(msg, 28, 0.0),
    minimumStationsRequired: jspb.Message.getFieldWithDefault(msg, 29, 0),
    enterDiffuseModeDurationRequired: jspb.Message.getFieldWithDefault(msg, 30, 0),
    snowSheddingDuration: jspb.Message.getFieldWithDefault(msg, 31, 0),
    snowDepthMedianFilterLength: jspb.Message.getFieldWithDefault(msg, 32, 0),
    exitDiffuseModeDurationRequired: jspb.Message.getFieldWithDefault(msg, 33, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.WeatherParameters}
 */
proto.terrasmart.cloud.WeatherParameters.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.WeatherParameters;
  return proto.terrasmart.cloud.WeatherParameters.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.WeatherParameters} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.WeatherParameters}
 */
proto.terrasmart.cloud.WeatherParameters.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setTriggerAveraging(value);
      break;
    case 2:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableWindSpeedStow(value);
      break;
    case 3:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableWindGustStow(value);
      break;
    case 4:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableSnowDepthStow(value);
      break;
    case 5:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableSnowDepthAveraging(value);
      break;
    case 6:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableAutoResumeTrackingSnow(value);
      break;
    case 7:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnablePanelSnowDepthStow(value);
      break;
    case 8:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnablePanelSnowDepthAveraging(value);
      break;
    case 9:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableAutoResumeTrackingPanelSnow(value);
      break;
    case 10:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableDiffuseMode(value);
      break;
    case 11:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableTooColdToMoveStow(value);
      break;
    case 12:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableSnowShedding(value);
      break;
    case 13:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setEnableVegetationMode(value);
      break;
    case 14:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setWindSpeedThreshold(value);
      break;
    case 15:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setWindSpeedDurationRequired(value);
      break;
    case 16:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setWindGustThreshold(value);
      break;
    case 17:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setResumeTrackingAfterWindTimeout(value);
      break;
    case 18:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setResumeTrackingAfterSnowTimeout(value);
      break;
    case 19:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setResumeTrackingAfterPanelSnowTimeout(value);
      break;
    case 20:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSnowDepthThreshold(value);
      break;
    case 21:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSnowDepthLowThreshold(value);
      break;
    case 22:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setPanelSnowDepthThreshold(value);
      break;
    case 23:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setPanelSnowDepthLowThreshold(value);
      break;
    case 34:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setTooColdToMoveStowTempThreshold(value);
      break;
    case 35:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setTooColdToMoveStowTempLowThreshold(value);
      break;
    case 36:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setResumeTrackingAfterTooColdToMoveTimeout(value);
      break;
    case 27:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setVegetationTemperatureThreshold(value);
      break;
    case 28:
      var value = /** @type {number} */ (reader.readFloat());
      msg.setSnowSheddingThreshold(value);
      break;
    case 29:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setMinimumStationsRequired(value);
      break;
    case 30:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setEnterDiffuseModeDurationRequired(value);
      break;
    case 31:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setSnowSheddingDuration(value);
      break;
    case 32:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setSnowDepthMedianFilterLength(value);
      break;
    case 33:
      var value = /** @type {number} */ (reader.readUint32());
      msg.setExitDiffuseModeDurationRequired(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.WeatherParameters.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.WeatherParameters} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.WeatherParameters.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTriggerAveraging();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getEnableWindSpeedStow();
  if (f) {
    writer.writeBool(
      2,
      f
    );
  }
  f = message.getEnableWindGustStow();
  if (f) {
    writer.writeBool(
      3,
      f
    );
  }
  f = message.getEnableSnowDepthStow();
  if (f) {
    writer.writeBool(
      4,
      f
    );
  }
  f = message.getEnableSnowDepthAveraging();
  if (f) {
    writer.writeBool(
      5,
      f
    );
  }
  f = message.getEnableAutoResumeTrackingSnow();
  if (f) {
    writer.writeBool(
      6,
      f
    );
  }
  f = message.getEnablePanelSnowDepthStow();
  if (f) {
    writer.writeBool(
      7,
      f
    );
  }
  f = message.getEnablePanelSnowDepthAveraging();
  if (f) {
    writer.writeBool(
      8,
      f
    );
  }
  f = message.getEnableAutoResumeTrackingPanelSnow();
  if (f) {
    writer.writeBool(
      9,
      f
    );
  }
  f = message.getEnableDiffuseMode();
  if (f) {
    writer.writeBool(
      10,
      f
    );
  }
  f = message.getEnableTooColdToMoveStow();
  if (f) {
    writer.writeBool(
      11,
      f
    );
  }
  f = message.getEnableSnowShedding();
  if (f) {
    writer.writeBool(
      12,
      f
    );
  }
  f = message.getEnableVegetationMode();
  if (f) {
    writer.writeBool(
      13,
      f
    );
  }
  f = message.getWindSpeedThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      14,
      f
    );
  }
  f = message.getWindSpeedDurationRequired();
  if (f !== 0.0) {
    writer.writeFloat(
      15,
      f
    );
  }
  f = message.getWindGustThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      16,
      f
    );
  }
  f = message.getResumeTrackingAfterWindTimeout();
  if (f !== 0.0) {
    writer.writeFloat(
      17,
      f
    );
  }
  f = message.getResumeTrackingAfterSnowTimeout();
  if (f !== 0.0) {
    writer.writeFloat(
      18,
      f
    );
  }
  f = message.getResumeTrackingAfterPanelSnowTimeout();
  if (f !== 0.0) {
    writer.writeFloat(
      19,
      f
    );
  }
  f = message.getSnowDepthThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      20,
      f
    );
  }
  f = message.getSnowDepthLowThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      21,
      f
    );
  }
  f = message.getPanelSnowDepthThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      22,
      f
    );
  }
  f = message.getPanelSnowDepthLowThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      23,
      f
    );
  }
  f = message.getTooColdToMoveStowTempThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      34,
      f
    );
  }
  f = message.getTooColdToMoveStowTempLowThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      35,
      f
    );
  }
  f = message.getResumeTrackingAfterTooColdToMoveTimeout();
  if (f !== 0.0) {
    writer.writeFloat(
      36,
      f
    );
  }
  f = message.getVegetationTemperatureThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      27,
      f
    );
  }
  f = message.getSnowSheddingThreshold();
  if (f !== 0.0) {
    writer.writeFloat(
      28,
      f
    );
  }
  f = message.getMinimumStationsRequired();
  if (f !== 0) {
    writer.writeUint32(
      29,
      f
    );
  }
  f = message.getEnterDiffuseModeDurationRequired();
  if (f !== 0) {
    writer.writeUint32(
      30,
      f
    );
  }
  f = message.getSnowSheddingDuration();
  if (f !== 0) {
    writer.writeUint32(
      31,
      f
    );
  }
  f = message.getSnowDepthMedianFilterLength();
  if (f !== 0) {
    writer.writeUint32(
      32,
      f
    );
  }
  f = message.getExitDiffuseModeDurationRequired();
  if (f !== 0) {
    writer.writeUint32(
      33,
      f
    );
  }
};


/**
 * optional bool trigger_averaging = 1;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getTriggerAveraging = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 1, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setTriggerAveraging = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional bool enable_wind_speed_stow = 2;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnableWindSpeedStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 2, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnableWindSpeedStow = function(value) {
  jspb.Message.setField(this, 2, value);
};


/**
 * optional bool enable_wind_gust_stow = 3;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnableWindGustStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 3, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnableWindGustStow = function(value) {
  jspb.Message.setField(this, 3, value);
};


/**
 * optional bool enable_snow_depth_stow = 4;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnableSnowDepthStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 4, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnableSnowDepthStow = function(value) {
  jspb.Message.setField(this, 4, value);
};


/**
 * optional bool enable_snow_depth_averaging = 5;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnableSnowDepthAveraging = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 5, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnableSnowDepthAveraging = function(value) {
  jspb.Message.setField(this, 5, value);
};


/**
 * optional bool enable_auto_resume_tracking_snow = 6;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnableAutoResumeTrackingSnow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 6, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnableAutoResumeTrackingSnow = function(value) {
  jspb.Message.setField(this, 6, value);
};


/**
 * optional bool enable_panel_snow_depth_stow = 7;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnablePanelSnowDepthStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 7, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnablePanelSnowDepthStow = function(value) {
  jspb.Message.setField(this, 7, value);
};


/**
 * optional bool enable_panel_snow_depth_averaging = 8;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnablePanelSnowDepthAveraging = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 8, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnablePanelSnowDepthAveraging = function(value) {
  jspb.Message.setField(this, 8, value);
};


/**
 * optional bool enable_auto_resume_tracking_panel_snow = 9;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnableAutoResumeTrackingPanelSnow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 9, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnableAutoResumeTrackingPanelSnow = function(value) {
  jspb.Message.setField(this, 9, value);
};


/**
 * optional bool enable_diffuse_mode = 10;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnableDiffuseMode = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 10, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnableDiffuseMode = function(value) {
  jspb.Message.setField(this, 10, value);
};


/**
 * optional bool enable_too_cold_to_move_stow = 11;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnableTooColdToMoveStow = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 11, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnableTooColdToMoveStow = function(value) {
  jspb.Message.setField(this, 11, value);
};


/**
 * optional bool enable_snow_shedding = 12;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnableSnowShedding = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 12, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnableSnowShedding = function(value) {
  jspb.Message.setField(this, 12, value);
};


/**
 * optional bool enable_vegetation_mode = 13;
 * Note that Boolean fields may be set to 0/1 when serialized from a Java server.
 * You should avoid comparisons like {@code val === true/false} in those cases.
 * @return {boolean}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnableVegetationMode = function() {
  return /** @type {boolean} */ (jspb.Message.getFieldWithDefault(this, 13, false));
};


/** @param {boolean} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnableVegetationMode = function(value) {
  jspb.Message.setField(this, 13, value);
};


/**
 * optional float wind_speed_threshold = 14;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getWindSpeedThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 14, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setWindSpeedThreshold = function(value) {
  jspb.Message.setField(this, 14, value);
};


/**
 * optional float wind_speed_duration_required = 15;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getWindSpeedDurationRequired = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 15, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setWindSpeedDurationRequired = function(value) {
  jspb.Message.setField(this, 15, value);
};


/**
 * optional float wind_gust_threshold = 16;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getWindGustThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 16, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setWindGustThreshold = function(value) {
  jspb.Message.setField(this, 16, value);
};


/**
 * optional float resume_tracking_after_wind_timeout = 17;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getResumeTrackingAfterWindTimeout = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 17, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setResumeTrackingAfterWindTimeout = function(value) {
  jspb.Message.setField(this, 17, value);
};


/**
 * optional float resume_tracking_after_snow_timeout = 18;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getResumeTrackingAfterSnowTimeout = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 18, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setResumeTrackingAfterSnowTimeout = function(value) {
  jspb.Message.setField(this, 18, value);
};


/**
 * optional float resume_tracking_after_panel_snow_timeout = 19;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getResumeTrackingAfterPanelSnowTimeout = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 19, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setResumeTrackingAfterPanelSnowTimeout = function(value) {
  jspb.Message.setField(this, 19, value);
};


/**
 * optional float snow_depth_threshold = 20;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getSnowDepthThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 20, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setSnowDepthThreshold = function(value) {
  jspb.Message.setField(this, 20, value);
};


/**
 * optional float snow_depth_low_threshold = 21;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getSnowDepthLowThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 21, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setSnowDepthLowThreshold = function(value) {
  jspb.Message.setField(this, 21, value);
};


/**
 * optional float panel_snow_depth_threshold = 22;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getPanelSnowDepthThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 22, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setPanelSnowDepthThreshold = function(value) {
  jspb.Message.setField(this, 22, value);
};


/**
 * optional float panel_snow_depth_low_threshold = 23;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getPanelSnowDepthLowThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 23, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setPanelSnowDepthLowThreshold = function(value) {
  jspb.Message.setField(this, 23, value);
};


/**
 * optional float too_cold_to_move_stow_temp_threshold = 34;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getTooColdToMoveStowTempThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 34, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setTooColdToMoveStowTempThreshold = function(value) {
  jspb.Message.setField(this, 34, value);
};


/**
 * optional float too_cold_to_move_stow_temp_low_threshold = 35;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getTooColdToMoveStowTempLowThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 35, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setTooColdToMoveStowTempLowThreshold = function(value) {
  jspb.Message.setField(this, 35, value);
};


/**
 * optional float resume_tracking_after_too_cold_to_move_timeout = 36;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getResumeTrackingAfterTooColdToMoveTimeout = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 36, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setResumeTrackingAfterTooColdToMoveTimeout = function(value) {
  jspb.Message.setField(this, 36, value);
};


/**
 * optional float vegetation_temperature_threshold = 27;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getVegetationTemperatureThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 27, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setVegetationTemperatureThreshold = function(value) {
  jspb.Message.setField(this, 27, value);
};


/**
 * optional float snow_shedding_threshold = 28;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getSnowSheddingThreshold = function() {
  return /** @type {number} */ (+jspb.Message.getFieldWithDefault(this, 28, 0.0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setSnowSheddingThreshold = function(value) {
  jspb.Message.setField(this, 28, value);
};


/**
 * optional uint32 minimum_stations_required = 29;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getMinimumStationsRequired = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 29, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setMinimumStationsRequired = function(value) {
  jspb.Message.setField(this, 29, value);
};


/**
 * optional uint32 enter_diffuse_mode_duration_required = 30;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getEnterDiffuseModeDurationRequired = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 30, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setEnterDiffuseModeDurationRequired = function(value) {
  jspb.Message.setField(this, 30, value);
};


/**
 * optional uint32 snow_shedding_duration = 31;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getSnowSheddingDuration = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 31, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setSnowSheddingDuration = function(value) {
  jspb.Message.setField(this, 31, value);
};


/**
 * optional uint32 snow_depth_median_filter_length = 32;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getSnowDepthMedianFilterLength = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 32, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setSnowDepthMedianFilterLength = function(value) {
  jspb.Message.setField(this, 32, value);
};


/**
 * optional uint32 exit_diffuse_mode_duration_required = 33;
 * @return {number}
 */
proto.terrasmart.cloud.WeatherParameters.prototype.getExitDiffuseModeDurationRequired = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 33, 0));
};


/** @param {number} value */
proto.terrasmart.cloud.WeatherParameters.prototype.setExitDiffuseModeDurationRequired = function(value) {
  jspb.Message.setField(this, 33, value);
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.NCParametersUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.terrasmart.cloud.NCParametersUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.NCParametersUpdate.displayName = 'proto.terrasmart.cloud.NCParametersUpdate';
}


if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.NCParametersUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.NCParametersUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.NCParametersUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.NCParametersUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {
    snapAddr: msg.getSnapAddr_asB64(),
    when: (f = msg.getWhen()) && google_protobuf_timestamp_pb.Timestamp.toObject(includeInstance, f),
    siteParams: (f = msg.getSiteParams()) && proto.terrasmart.cloud.SiteParameters.toObject(includeInstance, f),
    weatherParams: (f = msg.getWeatherParams()) && proto.terrasmart.cloud.WeatherParameters.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.NCParametersUpdate}
 */
proto.terrasmart.cloud.NCParametersUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.NCParametersUpdate;
  return proto.terrasmart.cloud.NCParametersUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.NCParametersUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.NCParametersUpdate}
 */
proto.terrasmart.cloud.NCParametersUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setSnapAddr(value);
      break;
    case 2:
      var value = new google_protobuf_timestamp_pb.Timestamp;
      reader.readMessage(value,google_protobuf_timestamp_pb.Timestamp.deserializeBinaryFromReader);
      msg.setWhen(value);
      break;
    case 3:
      var value = new proto.terrasmart.cloud.SiteParameters;
      reader.readMessage(value,proto.terrasmart.cloud.SiteParameters.deserializeBinaryFromReader);
      msg.setSiteParams(value);
      break;
    case 4:
      var value = new proto.terrasmart.cloud.WeatherParameters;
      reader.readMessage(value,proto.terrasmart.cloud.WeatherParameters.deserializeBinaryFromReader);
      msg.setWeatherParams(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.NCParametersUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.NCParametersUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.NCParametersUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.NCParametersUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getWhen();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      google_protobuf_timestamp_pb.Timestamp.serializeBinaryToWriter
    );
  }
  f = message.getSiteParams();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.terrasmart.cloud.SiteParameters.serializeBinaryToWriter
    );
  }
  f = message.getWeatherParams();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.terrasmart.cloud.WeatherParameters.serializeBinaryToWriter
    );
  }
};


/**
 * optional bytes snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.NCParametersUpdate.prototype.getSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes snap_addr = 1;
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.NCParametersUpdate.prototype.getSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getSnapAddr()));
};


/**
 * optional bytes snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.NCParametersUpdate.prototype.getSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.NCParametersUpdate.prototype.setSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * optional google.protobuf.Timestamp when = 2;
 * @return {?proto.google.protobuf.Timestamp}
 */
proto.terrasmart.cloud.NCParametersUpdate.prototype.getWhen = function() {
  return /** @type{?proto.google.protobuf.Timestamp} */ (
    jspb.Message.getWrapperField(this, google_protobuf_timestamp_pb.Timestamp, 2));
};


/** @param {?proto.google.protobuf.Timestamp|undefined} value */
proto.terrasmart.cloud.NCParametersUpdate.prototype.setWhen = function(value) {
  jspb.Message.setWrapperField(this, 2, value);
};


proto.terrasmart.cloud.NCParametersUpdate.prototype.clearWhen = function() {
  this.setWhen(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.NCParametersUpdate.prototype.hasWhen = function() {
  return jspb.Message.getField(this, 2) != null;
};


/**
 * optional SiteParameters site_params = 3;
 * @return {?proto.terrasmart.cloud.SiteParameters}
 */
proto.terrasmart.cloud.NCParametersUpdate.prototype.getSiteParams = function() {
  return /** @type{?proto.terrasmart.cloud.SiteParameters} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.SiteParameters, 3));
};


/** @param {?proto.terrasmart.cloud.SiteParameters|undefined} value */
proto.terrasmart.cloud.NCParametersUpdate.prototype.setSiteParams = function(value) {
  jspb.Message.setWrapperField(this, 3, value);
};


proto.terrasmart.cloud.NCParametersUpdate.prototype.clearSiteParams = function() {
  this.setSiteParams(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.NCParametersUpdate.prototype.hasSiteParams = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional WeatherParameters weather_params = 4;
 * @return {?proto.terrasmart.cloud.WeatherParameters}
 */
proto.terrasmart.cloud.NCParametersUpdate.prototype.getWeatherParams = function() {
  return /** @type{?proto.terrasmart.cloud.WeatherParameters} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.WeatherParameters, 4));
};


/** @param {?proto.terrasmart.cloud.WeatherParameters|undefined} value */
proto.terrasmart.cloud.NCParametersUpdate.prototype.setWeatherParams = function(value) {
  jspb.Message.setWrapperField(this, 4, value);
};


proto.terrasmart.cloud.NCParametersUpdate.prototype.clearWeatherParams = function() {
  this.setWeatherParams(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.NCParametersUpdate.prototype.hasWeatherParams = function() {
  return jspb.Message.getField(this, 4) != null;
};



/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.terrasmart.cloud.CloudUpdates = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.terrasmart.cloud.CloudUpdates.repeatedFields_, null);
};
goog.inherits(proto.terrasmart.cloud.CloudUpdates, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  proto.terrasmart.cloud.CloudUpdates.displayName = 'proto.terrasmart.cloud.CloudUpdates';
}
/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.terrasmart.cloud.CloudUpdates.repeatedFields_ = [2,3,4,5,6,7,8,9,10,11,12,13,14,17,18,21,23];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto suitable for use in Soy templates.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     com.google.apps.jspb.JsClassTemplate.JS_RESERVED_WORDS.
 * @param {boolean=} opt_includeInstance Whether to include the JSPB instance
 *     for transitional soy proto support: http://goto/soy-param-migration
 * @return {!Object}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.toObject = function(opt_includeInstance) {
  return proto.terrasmart.cloud.CloudUpdates.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Whether to include the JSPB
 *     instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.terrasmart.cloud.CloudUpdates} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.CloudUpdates.toObject = function(includeInstance, msg) {
  var f, obj = {
    ncSnapAddr: msg.getNcSnapAddr_asB64(),
    trackingChangesList: jspb.Message.toObjectList(msg.getTrackingChangesList(),
    proto.terrasmart.cloud.TrackingChange.toObject, includeInstance),
    tcHourUpdatesList: jspb.Message.toObjectList(msg.getTcHourUpdatesList(),
    proto.terrasmart.cloud.TrackerControllerHourUpdates.toObject, includeInstance),
    tcDayUpdatesList: jspb.Message.toObjectList(msg.getTcDayUpdatesList(),
    proto.terrasmart.cloud.TrackerControllerUpdates.toObject, includeInstance),
    rackAnglesList: jspb.Message.toObjectList(msg.getRackAnglesList(),
    proto.terrasmart.cloud.RackAngles.toObject, includeInstance),
    tcUpdatesList: jspb.Message.toObjectList(msg.getTcUpdatesList(),
    proto.terrasmart.cloud.TrackerControllerInstantUpdates.toObject, includeInstance),
    logEntriesList: jspb.Message.toObjectList(msg.getLogEntriesList(),
    proto.terrasmart.cloud.LogEntry.toObject, includeInstance),
    clearLogEntriesList: jspb.Message.toObjectList(msg.getClearLogEntriesList(),
    proto.terrasmart.cloud.ClearLogEntry.toObject, includeInstance),
    activeAlertsList: jspb.Message.toObjectList(msg.getActiveAlertsList(),
    proto.terrasmart.cloud.Alert.toObject, includeInstance),
    alertUpdatesList: jspb.Message.toObjectList(msg.getAlertUpdatesList(),
    proto.terrasmart.cloud.Alert.toObject, includeInstance),
    batteryUpdatesList: jspb.Message.toObjectList(msg.getBatteryUpdatesList(),
    proto.terrasmart.cloud.BatteryUpdate.toObject, includeInstance),
    weatherUpdatesList: jspb.Message.toObjectList(msg.getWeatherUpdatesList(),
    proto.terrasmart.cloud.WeatherUpdate.toObject, includeInstance),
    configUpdatesList: jspb.Message.toObjectList(msg.getConfigUpdatesList(),
    proto.terrasmart.cloud.ConfigUpdate.toObject, includeInstance),
    assetUpdatesList: jspb.Message.toObjectList(msg.getAssetUpdatesList(),
    proto.terrasmart.cloud.AssetUpdate.toObject, includeInstance),
    cellUpdates: (f = msg.getCellUpdates()) && proto.terrasmart.cloud.CellUpdate.toObject(includeInstance, f),
    cellDailyUpdates: (f = msg.getCellDailyUpdates()) && proto.terrasmart.cloud.CellDailyUpdate.toObject(includeInstance, f),
    panelUpdateList: jspb.Message.toObjectList(msg.getPanelUpdateList(),
    proto.terrasmart.cloud.PanelUpdate.toObject, includeInstance),
    startUpDataList: jspb.Message.toObjectList(msg.getStartUpDataList(),
    proto.terrasmart.cloud.StartUpData.toObject, includeInstance),
    weatherStowUpdates: (f = msg.getWeatherStowUpdates()) && proto.terrasmart.cloud.WeatherStowUpdate.toObject(includeInstance, f),
    gpsUpdates: (f = msg.getGpsUpdates()) && proto.terrasmart.cloud.GpsUpdate.toObject(includeInstance, f),
    assetRadioUpdatesList: jspb.Message.toObjectList(msg.getAssetRadioUpdatesList(),
    proto.terrasmart.cloud.AssetRadioUpdate.toObject, includeInstance),
    siteConfigUpdates: (f = msg.getSiteConfigUpdates()) && proto.terrasmart.cloud.SiteConfigUpdate.toObject(includeInstance, f),
    chargerUpdatesList: jspb.Message.toObjectList(msg.getChargerUpdatesList(),
    proto.terrasmart.cloud.ChargerUpdate.toObject, includeInstance),
    assetRestarted: (f = msg.getAssetRestarted()) && proto.terrasmart.cloud.AssetRestarted.toObject(includeInstance, f),
    solarInfoUpdates: (f = msg.getSolarInfoUpdates()) && proto.terrasmart.cloud.SolarInfoUpdate.toObject(includeInstance, f),
    bridgeUpdates: (f = msg.getBridgeUpdates()) && proto.terrasmart.cloud.NetworkControllerBridgeUpdate.toObject(includeInstance, f),
    assetPresetChanged: (f = msg.getAssetPresetChanged()) && proto.terrasmart.cloud.AssetPresetChanged.toObject(includeInstance, f),
    commandStatus: (f = msg.getCommandStatus()) && proto.terrasmart.cloud.CommandStatusUpdate.toObject(includeInstance, f),
    motorCurrentUpdate: (f = msg.getMotorCurrentUpdate()) && proto.terrasmart.cloud.MotorCurrentUpdate.toObject(includeInstance, f),
    weatherReportingUpdate: (f = msg.getWeatherReportingUpdate()) && proto.terrasmart.cloud.WeatherReportingUpdate.toObject(includeInstance, f),
    configuredVersions: (f = msg.getConfiguredVersions()) && proto.terrasmart.cloud.ConfiguredVersions.toObject(includeInstance, f),
    assetRadioRestarted: (f = msg.getAssetRadioRestarted()) && proto.terrasmart.cloud.AssetRadioRestarted.toObject(includeInstance, f),
    cloudAccuWeatherUpdate: (f = msg.getCloudAccuWeatherUpdate()) && proto.terrasmart.cloud.CloudAccuWeatherUpdate.toObject(includeInstance, f),
    vegetationUpdate: (f = msg.getVegetationUpdate()) && proto.terrasmart.cloud.VegetationUpdate.toObject(includeInstance, f),
    irradianceUpdate: (f = msg.getIrradianceUpdate()) && proto.terrasmart.cloud.IrradianceUpdate.toObject(includeInstance, f),
    qaqcReportUpdate: (f = msg.getQaqcReportUpdate()) && proto.terrasmart.cloud.QaQcReportUpdate.toObject(includeInstance, f),
    increaseWeatherReporting: (f = msg.getIncreaseWeatherReporting()) && proto.terrasmart.cloud.IncreaseWeatherReporting.toObject(includeInstance, f),
    toggleFastTrakUpdate: (f = msg.getToggleFastTrakUpdate()) && proto.terrasmart.cloud.ToggleFastTrakUpdate.toObject(includeInstance, f),
    snowSheddingUpdate: (f = msg.getSnowSheddingUpdate()) && proto.terrasmart.cloud.SnowSheddingUpdate.toObject(includeInstance, f),
    snowSheddingReportUpdate: (f = msg.getSnowSheddingReportUpdate()) && proto.terrasmart.cloud.SnowSheddingReportUpdate.toObject(includeInstance, f),
    firmwareUpgradeReportUpdate: (f = msg.getFirmwareUpgradeReportUpdate()) && proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.toObject(includeInstance, f),
    ncParamsUpdate: (f = msg.getNcParamsUpdate()) && proto.terrasmart.cloud.NCParametersUpdate.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.terrasmart.cloud.CloudUpdates}
 */
proto.terrasmart.cloud.CloudUpdates.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.terrasmart.cloud.CloudUpdates;
  return proto.terrasmart.cloud.CloudUpdates.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.terrasmart.cloud.CloudUpdates} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.terrasmart.cloud.CloudUpdates}
 */
proto.terrasmart.cloud.CloudUpdates.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setNcSnapAddr(value);
      break;
    case 2:
      var value = new proto.terrasmart.cloud.TrackingChange;
      reader.readMessage(value,proto.terrasmart.cloud.TrackingChange.deserializeBinaryFromReader);
      msg.addTrackingChanges(value);
      break;
    case 3:
      var value = new proto.terrasmart.cloud.TrackerControllerHourUpdates;
      reader.readMessage(value,proto.terrasmart.cloud.TrackerControllerHourUpdates.deserializeBinaryFromReader);
      msg.addTcHourUpdates(value);
      break;
    case 4:
      var value = new proto.terrasmart.cloud.TrackerControllerUpdates;
      reader.readMessage(value,proto.terrasmart.cloud.TrackerControllerUpdates.deserializeBinaryFromReader);
      msg.addTcDayUpdates(value);
      break;
    case 5:
      var value = new proto.terrasmart.cloud.RackAngles;
      reader.readMessage(value,proto.terrasmart.cloud.RackAngles.deserializeBinaryFromReader);
      msg.addRackAngles(value);
      break;
    case 6:
      var value = new proto.terrasmart.cloud.TrackerControllerInstantUpdates;
      reader.readMessage(value,proto.terrasmart.cloud.TrackerControllerInstantUpdates.deserializeBinaryFromReader);
      msg.addTcUpdates(value);
      break;
    case 7:
      var value = new proto.terrasmart.cloud.LogEntry;
      reader.readMessage(value,proto.terrasmart.cloud.LogEntry.deserializeBinaryFromReader);
      msg.addLogEntries(value);
      break;
    case 8:
      var value = new proto.terrasmart.cloud.ClearLogEntry;
      reader.readMessage(value,proto.terrasmart.cloud.ClearLogEntry.deserializeBinaryFromReader);
      msg.addClearLogEntries(value);
      break;
    case 9:
      var value = new proto.terrasmart.cloud.Alert;
      reader.readMessage(value,proto.terrasmart.cloud.Alert.deserializeBinaryFromReader);
      msg.addActiveAlerts(value);
      break;
    case 10:
      var value = new proto.terrasmart.cloud.Alert;
      reader.readMessage(value,proto.terrasmart.cloud.Alert.deserializeBinaryFromReader);
      msg.addAlertUpdates(value);
      break;
    case 11:
      var value = new proto.terrasmart.cloud.BatteryUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.BatteryUpdate.deserializeBinaryFromReader);
      msg.addBatteryUpdates(value);
      break;
    case 12:
      var value = new proto.terrasmart.cloud.WeatherUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.WeatherUpdate.deserializeBinaryFromReader);
      msg.addWeatherUpdates(value);
      break;
    case 13:
      var value = new proto.terrasmart.cloud.ConfigUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.ConfigUpdate.deserializeBinaryFromReader);
      msg.addConfigUpdates(value);
      break;
    case 14:
      var value = new proto.terrasmart.cloud.AssetUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.AssetUpdate.deserializeBinaryFromReader);
      msg.addAssetUpdates(value);
      break;
    case 15:
      var value = new proto.terrasmart.cloud.CellUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.CellUpdate.deserializeBinaryFromReader);
      msg.setCellUpdates(value);
      break;
    case 16:
      var value = new proto.terrasmart.cloud.CellDailyUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.CellDailyUpdate.deserializeBinaryFromReader);
      msg.setCellDailyUpdates(value);
      break;
    case 17:
      var value = new proto.terrasmart.cloud.PanelUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.PanelUpdate.deserializeBinaryFromReader);
      msg.addPanelUpdate(value);
      break;
    case 18:
      var value = new proto.terrasmart.cloud.StartUpData;
      reader.readMessage(value,proto.terrasmart.cloud.StartUpData.deserializeBinaryFromReader);
      msg.addStartUpData(value);
      break;
    case 19:
      var value = new proto.terrasmart.cloud.WeatherStowUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.WeatherStowUpdate.deserializeBinaryFromReader);
      msg.setWeatherStowUpdates(value);
      break;
    case 20:
      var value = new proto.terrasmart.cloud.GpsUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.GpsUpdate.deserializeBinaryFromReader);
      msg.setGpsUpdates(value);
      break;
    case 21:
      var value = new proto.terrasmart.cloud.AssetRadioUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.AssetRadioUpdate.deserializeBinaryFromReader);
      msg.addAssetRadioUpdates(value);
      break;
    case 22:
      var value = new proto.terrasmart.cloud.SiteConfigUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.SiteConfigUpdate.deserializeBinaryFromReader);
      msg.setSiteConfigUpdates(value);
      break;
    case 23:
      var value = new proto.terrasmart.cloud.ChargerUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.ChargerUpdate.deserializeBinaryFromReader);
      msg.addChargerUpdates(value);
      break;
    case 24:
      var value = new proto.terrasmart.cloud.AssetRestarted;
      reader.readMessage(value,proto.terrasmart.cloud.AssetRestarted.deserializeBinaryFromReader);
      msg.setAssetRestarted(value);
      break;
    case 25:
      var value = new proto.terrasmart.cloud.SolarInfoUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.SolarInfoUpdate.deserializeBinaryFromReader);
      msg.setSolarInfoUpdates(value);
      break;
    case 26:
      var value = new proto.terrasmart.cloud.NetworkControllerBridgeUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.NetworkControllerBridgeUpdate.deserializeBinaryFromReader);
      msg.setBridgeUpdates(value);
      break;
    case 27:
      var value = new proto.terrasmart.cloud.AssetPresetChanged;
      reader.readMessage(value,proto.terrasmart.cloud.AssetPresetChanged.deserializeBinaryFromReader);
      msg.setAssetPresetChanged(value);
      break;
    case 28:
      var value = new proto.terrasmart.cloud.CommandStatusUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.CommandStatusUpdate.deserializeBinaryFromReader);
      msg.setCommandStatus(value);
      break;
    case 29:
      var value = new proto.terrasmart.cloud.MotorCurrentUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.MotorCurrentUpdate.deserializeBinaryFromReader);
      msg.setMotorCurrentUpdate(value);
      break;
    case 30:
      var value = new proto.terrasmart.cloud.WeatherReportingUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.WeatherReportingUpdate.deserializeBinaryFromReader);
      msg.setWeatherReportingUpdate(value);
      break;
    case 31:
      var value = new proto.terrasmart.cloud.ConfiguredVersions;
      reader.readMessage(value,proto.terrasmart.cloud.ConfiguredVersions.deserializeBinaryFromReader);
      msg.setConfiguredVersions(value);
      break;
    case 32:
      var value = new proto.terrasmart.cloud.AssetRadioRestarted;
      reader.readMessage(value,proto.terrasmart.cloud.AssetRadioRestarted.deserializeBinaryFromReader);
      msg.setAssetRadioRestarted(value);
      break;
    case 33:
      var value = new proto.terrasmart.cloud.CloudAccuWeatherUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.CloudAccuWeatherUpdate.deserializeBinaryFromReader);
      msg.setCloudAccuWeatherUpdate(value);
      break;
    case 34:
      var value = new proto.terrasmart.cloud.VegetationUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.VegetationUpdate.deserializeBinaryFromReader);
      msg.setVegetationUpdate(value);
      break;
    case 35:
      var value = new proto.terrasmart.cloud.IrradianceUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.IrradianceUpdate.deserializeBinaryFromReader);
      msg.setIrradianceUpdate(value);
      break;
    case 36:
      var value = new proto.terrasmart.cloud.QaQcReportUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.QaQcReportUpdate.deserializeBinaryFromReader);
      msg.setQaqcReportUpdate(value);
      break;
    case 37:
      var value = new proto.terrasmart.cloud.IncreaseWeatherReporting;
      reader.readMessage(value,proto.terrasmart.cloud.IncreaseWeatherReporting.deserializeBinaryFromReader);
      msg.setIncreaseWeatherReporting(value);
      break;
    case 38:
      var value = new proto.terrasmart.cloud.ToggleFastTrakUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.ToggleFastTrakUpdate.deserializeBinaryFromReader);
      msg.setToggleFastTrakUpdate(value);
      break;
    case 39:
      var value = new proto.terrasmart.cloud.SnowSheddingUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.SnowSheddingUpdate.deserializeBinaryFromReader);
      msg.setSnowSheddingUpdate(value);
      break;
    case 40:
      var value = new proto.terrasmart.cloud.SnowSheddingReportUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.SnowSheddingReportUpdate.deserializeBinaryFromReader);
      msg.setSnowSheddingReportUpdate(value);
      break;
    case 41:
      var value = new proto.terrasmart.cloud.FirmwareUpgradeReportUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.deserializeBinaryFromReader);
      msg.setFirmwareUpgradeReportUpdate(value);
      break;
    case 42:
      var value = new proto.terrasmart.cloud.NCParametersUpdate;
      reader.readMessage(value,proto.terrasmart.cloud.NCParametersUpdate.deserializeBinaryFromReader);
      msg.setNcParamsUpdate(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.terrasmart.cloud.CloudUpdates.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.terrasmart.cloud.CloudUpdates} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.terrasmart.cloud.CloudUpdates.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNcSnapAddr_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getTrackingChangesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      2,
      f,
      proto.terrasmart.cloud.TrackingChange.serializeBinaryToWriter
    );
  }
  f = message.getTcHourUpdatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.terrasmart.cloud.TrackerControllerHourUpdates.serializeBinaryToWriter
    );
  }
  f = message.getTcDayUpdatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      proto.terrasmart.cloud.TrackerControllerUpdates.serializeBinaryToWriter
    );
  }
  f = message.getRackAnglesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      5,
      f,
      proto.terrasmart.cloud.RackAngles.serializeBinaryToWriter
    );
  }
  f = message.getTcUpdatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      6,
      f,
      proto.terrasmart.cloud.TrackerControllerInstantUpdates.serializeBinaryToWriter
    );
  }
  f = message.getLogEntriesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      7,
      f,
      proto.terrasmart.cloud.LogEntry.serializeBinaryToWriter
    );
  }
  f = message.getClearLogEntriesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      8,
      f,
      proto.terrasmart.cloud.ClearLogEntry.serializeBinaryToWriter
    );
  }
  f = message.getActiveAlertsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      9,
      f,
      proto.terrasmart.cloud.Alert.serializeBinaryToWriter
    );
  }
  f = message.getAlertUpdatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      10,
      f,
      proto.terrasmart.cloud.Alert.serializeBinaryToWriter
    );
  }
  f = message.getBatteryUpdatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      11,
      f,
      proto.terrasmart.cloud.BatteryUpdate.serializeBinaryToWriter
    );
  }
  f = message.getWeatherUpdatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      12,
      f,
      proto.terrasmart.cloud.WeatherUpdate.serializeBinaryToWriter
    );
  }
  f = message.getConfigUpdatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      13,
      f,
      proto.terrasmart.cloud.ConfigUpdate.serializeBinaryToWriter
    );
  }
  f = message.getAssetUpdatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      14,
      f,
      proto.terrasmart.cloud.AssetUpdate.serializeBinaryToWriter
    );
  }
  f = message.getCellUpdates();
  if (f != null) {
    writer.writeMessage(
      15,
      f,
      proto.terrasmart.cloud.CellUpdate.serializeBinaryToWriter
    );
  }
  f = message.getCellDailyUpdates();
  if (f != null) {
    writer.writeMessage(
      16,
      f,
      proto.terrasmart.cloud.CellDailyUpdate.serializeBinaryToWriter
    );
  }
  f = message.getPanelUpdateList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      17,
      f,
      proto.terrasmart.cloud.PanelUpdate.serializeBinaryToWriter
    );
  }
  f = message.getStartUpDataList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      18,
      f,
      proto.terrasmart.cloud.StartUpData.serializeBinaryToWriter
    );
  }
  f = message.getWeatherStowUpdates();
  if (f != null) {
    writer.writeMessage(
      19,
      f,
      proto.terrasmart.cloud.WeatherStowUpdate.serializeBinaryToWriter
    );
  }
  f = message.getGpsUpdates();
  if (f != null) {
    writer.writeMessage(
      20,
      f,
      proto.terrasmart.cloud.GpsUpdate.serializeBinaryToWriter
    );
  }
  f = message.getAssetRadioUpdatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      21,
      f,
      proto.terrasmart.cloud.AssetRadioUpdate.serializeBinaryToWriter
    );
  }
  f = message.getSiteConfigUpdates();
  if (f != null) {
    writer.writeMessage(
      22,
      f,
      proto.terrasmart.cloud.SiteConfigUpdate.serializeBinaryToWriter
    );
  }
  f = message.getChargerUpdatesList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      23,
      f,
      proto.terrasmart.cloud.ChargerUpdate.serializeBinaryToWriter
    );
  }
  f = message.getAssetRestarted();
  if (f != null) {
    writer.writeMessage(
      24,
      f,
      proto.terrasmart.cloud.AssetRestarted.serializeBinaryToWriter
    );
  }
  f = message.getSolarInfoUpdates();
  if (f != null) {
    writer.writeMessage(
      25,
      f,
      proto.terrasmart.cloud.SolarInfoUpdate.serializeBinaryToWriter
    );
  }
  f = message.getBridgeUpdates();
  if (f != null) {
    writer.writeMessage(
      26,
      f,
      proto.terrasmart.cloud.NetworkControllerBridgeUpdate.serializeBinaryToWriter
    );
  }
  f = message.getAssetPresetChanged();
  if (f != null) {
    writer.writeMessage(
      27,
      f,
      proto.terrasmart.cloud.AssetPresetChanged.serializeBinaryToWriter
    );
  }
  f = message.getCommandStatus();
  if (f != null) {
    writer.writeMessage(
      28,
      f,
      proto.terrasmart.cloud.CommandStatusUpdate.serializeBinaryToWriter
    );
  }
  f = message.getMotorCurrentUpdate();
  if (f != null) {
    writer.writeMessage(
      29,
      f,
      proto.terrasmart.cloud.MotorCurrentUpdate.serializeBinaryToWriter
    );
  }
  f = message.getWeatherReportingUpdate();
  if (f != null) {
    writer.writeMessage(
      30,
      f,
      proto.terrasmart.cloud.WeatherReportingUpdate.serializeBinaryToWriter
    );
  }
  f = message.getConfiguredVersions();
  if (f != null) {
    writer.writeMessage(
      31,
      f,
      proto.terrasmart.cloud.ConfiguredVersions.serializeBinaryToWriter
    );
  }
  f = message.getAssetRadioRestarted();
  if (f != null) {
    writer.writeMessage(
      32,
      f,
      proto.terrasmart.cloud.AssetRadioRestarted.serializeBinaryToWriter
    );
  }
  f = message.getCloudAccuWeatherUpdate();
  if (f != null) {
    writer.writeMessage(
      33,
      f,
      proto.terrasmart.cloud.CloudAccuWeatherUpdate.serializeBinaryToWriter
    );
  }
  f = message.getVegetationUpdate();
  if (f != null) {
    writer.writeMessage(
      34,
      f,
      proto.terrasmart.cloud.VegetationUpdate.serializeBinaryToWriter
    );
  }
  f = message.getIrradianceUpdate();
  if (f != null) {
    writer.writeMessage(
      35,
      f,
      proto.terrasmart.cloud.IrradianceUpdate.serializeBinaryToWriter
    );
  }
  f = message.getQaqcReportUpdate();
  if (f != null) {
    writer.writeMessage(
      36,
      f,
      proto.terrasmart.cloud.QaQcReportUpdate.serializeBinaryToWriter
    );
  }
  f = message.getIncreaseWeatherReporting();
  if (f != null) {
    writer.writeMessage(
      37,
      f,
      proto.terrasmart.cloud.IncreaseWeatherReporting.serializeBinaryToWriter
    );
  }
  f = message.getToggleFastTrakUpdate();
  if (f != null) {
    writer.writeMessage(
      38,
      f,
      proto.terrasmart.cloud.ToggleFastTrakUpdate.serializeBinaryToWriter
    );
  }
  f = message.getSnowSheddingUpdate();
  if (f != null) {
    writer.writeMessage(
      39,
      f,
      proto.terrasmart.cloud.SnowSheddingUpdate.serializeBinaryToWriter
    );
  }
  f = message.getSnowSheddingReportUpdate();
  if (f != null) {
    writer.writeMessage(
      40,
      f,
      proto.terrasmart.cloud.SnowSheddingReportUpdate.serializeBinaryToWriter
    );
  }
  f = message.getFirmwareUpgradeReportUpdate();
  if (f != null) {
    writer.writeMessage(
      41,
      f,
      proto.terrasmart.cloud.FirmwareUpgradeReportUpdate.serializeBinaryToWriter
    );
  }
  f = message.getNcParamsUpdate();
  if (f != null) {
    writer.writeMessage(
      42,
      f,
      proto.terrasmart.cloud.NCParametersUpdate.serializeBinaryToWriter
    );
  }
};


/**
 * optional bytes nc_snap_addr = 1;
 * @return {!(string|Uint8Array)}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getNcSnapAddr = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes nc_snap_addr = 1;
 * This is a type-conversion wrapper around `getNcSnapAddr()`
 * @return {string}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getNcSnapAddr_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getNcSnapAddr()));
};


/**
 * optional bytes nc_snap_addr = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getNcSnapAddr()`
 * @return {!Uint8Array}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getNcSnapAddr_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getNcSnapAddr()));
};


/** @param {!(string|Uint8Array)} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setNcSnapAddr = function(value) {
  jspb.Message.setField(this, 1, value);
};


/**
 * repeated TrackingChange tracking_changes = 2;
 * @return {!Array.<!proto.terrasmart.cloud.TrackingChange>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getTrackingChangesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.TrackingChange>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.TrackingChange, 2));
};


/** @param {!Array.<!proto.terrasmart.cloud.TrackingChange>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setTrackingChangesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 2, value);
};


/**
 * @param {!proto.terrasmart.cloud.TrackingChange=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.TrackingChange}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addTrackingChanges = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 2, opt_value, proto.terrasmart.cloud.TrackingChange, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearTrackingChangesList = function() {
  this.setTrackingChangesList([]);
};


/**
 * repeated TrackerControllerHourUpdates tc_hour_updates = 3;
 * @return {!Array.<!proto.terrasmart.cloud.TrackerControllerHourUpdates>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getTcHourUpdatesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.TrackerControllerHourUpdates>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.TrackerControllerHourUpdates, 3));
};


/** @param {!Array.<!proto.terrasmart.cloud.TrackerControllerHourUpdates>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setTcHourUpdatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.terrasmart.cloud.TrackerControllerHourUpdates=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.TrackerControllerHourUpdates}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addTcHourUpdates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.terrasmart.cloud.TrackerControllerHourUpdates, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearTcHourUpdatesList = function() {
  this.setTcHourUpdatesList([]);
};


/**
 * repeated TrackerControllerUpdates tc_day_updates = 4;
 * @return {!Array.<!proto.terrasmart.cloud.TrackerControllerUpdates>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getTcDayUpdatesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.TrackerControllerUpdates>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.TrackerControllerUpdates, 4));
};


/** @param {!Array.<!proto.terrasmart.cloud.TrackerControllerUpdates>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setTcDayUpdatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.terrasmart.cloud.TrackerControllerUpdates=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.TrackerControllerUpdates}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addTcDayUpdates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.terrasmart.cloud.TrackerControllerUpdates, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearTcDayUpdatesList = function() {
  this.setTcDayUpdatesList([]);
};


/**
 * repeated RackAngles rack_angles = 5;
 * @return {!Array.<!proto.terrasmart.cloud.RackAngles>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getRackAnglesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.RackAngles>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.RackAngles, 5));
};


/** @param {!Array.<!proto.terrasmart.cloud.RackAngles>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setRackAnglesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 5, value);
};


/**
 * @param {!proto.terrasmart.cloud.RackAngles=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.RackAngles}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addRackAngles = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 5, opt_value, proto.terrasmart.cloud.RackAngles, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearRackAnglesList = function() {
  this.setRackAnglesList([]);
};


/**
 * repeated TrackerControllerInstantUpdates tc_updates = 6;
 * @return {!Array.<!proto.terrasmart.cloud.TrackerControllerInstantUpdates>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getTcUpdatesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.TrackerControllerInstantUpdates>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.TrackerControllerInstantUpdates, 6));
};


/** @param {!Array.<!proto.terrasmart.cloud.TrackerControllerInstantUpdates>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setTcUpdatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 6, value);
};


/**
 * @param {!proto.terrasmart.cloud.TrackerControllerInstantUpdates=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.TrackerControllerInstantUpdates}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addTcUpdates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 6, opt_value, proto.terrasmart.cloud.TrackerControllerInstantUpdates, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearTcUpdatesList = function() {
  this.setTcUpdatesList([]);
};


/**
 * repeated LogEntry log_entries = 7;
 * @return {!Array.<!proto.terrasmart.cloud.LogEntry>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getLogEntriesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.LogEntry>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.LogEntry, 7));
};


/** @param {!Array.<!proto.terrasmart.cloud.LogEntry>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setLogEntriesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 7, value);
};


/**
 * @param {!proto.terrasmart.cloud.LogEntry=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.LogEntry}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addLogEntries = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 7, opt_value, proto.terrasmart.cloud.LogEntry, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearLogEntriesList = function() {
  this.setLogEntriesList([]);
};


/**
 * repeated ClearLogEntry clear_log_entries = 8;
 * @return {!Array.<!proto.terrasmart.cloud.ClearLogEntry>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getClearLogEntriesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.ClearLogEntry>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.ClearLogEntry, 8));
};


/** @param {!Array.<!proto.terrasmart.cloud.ClearLogEntry>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setClearLogEntriesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 8, value);
};


/**
 * @param {!proto.terrasmart.cloud.ClearLogEntry=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.ClearLogEntry}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addClearLogEntries = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 8, opt_value, proto.terrasmart.cloud.ClearLogEntry, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearClearLogEntriesList = function() {
  this.setClearLogEntriesList([]);
};


/**
 * repeated Alert active_alerts = 9;
 * @return {!Array.<!proto.terrasmart.cloud.Alert>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getActiveAlertsList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.Alert>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.Alert, 9));
};


/** @param {!Array.<!proto.terrasmart.cloud.Alert>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setActiveAlertsList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 9, value);
};


/**
 * @param {!proto.terrasmart.cloud.Alert=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.Alert}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addActiveAlerts = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 9, opt_value, proto.terrasmart.cloud.Alert, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearActiveAlertsList = function() {
  this.setActiveAlertsList([]);
};


/**
 * repeated Alert alert_updates = 10;
 * @return {!Array.<!proto.terrasmart.cloud.Alert>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getAlertUpdatesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.Alert>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.Alert, 10));
};


/** @param {!Array.<!proto.terrasmart.cloud.Alert>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setAlertUpdatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 10, value);
};


/**
 * @param {!proto.terrasmart.cloud.Alert=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.Alert}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addAlertUpdates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 10, opt_value, proto.terrasmart.cloud.Alert, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearAlertUpdatesList = function() {
  this.setAlertUpdatesList([]);
};


/**
 * repeated BatteryUpdate battery_updates = 11;
 * @return {!Array.<!proto.terrasmart.cloud.BatteryUpdate>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getBatteryUpdatesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.BatteryUpdate>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.BatteryUpdate, 11));
};


/** @param {!Array.<!proto.terrasmart.cloud.BatteryUpdate>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setBatteryUpdatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 11, value);
};


/**
 * @param {!proto.terrasmart.cloud.BatteryUpdate=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.BatteryUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addBatteryUpdates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 11, opt_value, proto.terrasmart.cloud.BatteryUpdate, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearBatteryUpdatesList = function() {
  this.setBatteryUpdatesList([]);
};


/**
 * repeated WeatherUpdate weather_updates = 12;
 * @return {!Array.<!proto.terrasmart.cloud.WeatherUpdate>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getWeatherUpdatesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.WeatherUpdate>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.WeatherUpdate, 12));
};


/** @param {!Array.<!proto.terrasmart.cloud.WeatherUpdate>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setWeatherUpdatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 12, value);
};


/**
 * @param {!proto.terrasmart.cloud.WeatherUpdate=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.WeatherUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addWeatherUpdates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 12, opt_value, proto.terrasmart.cloud.WeatherUpdate, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearWeatherUpdatesList = function() {
  this.setWeatherUpdatesList([]);
};


/**
 * repeated ConfigUpdate config_updates = 13;
 * @return {!Array.<!proto.terrasmart.cloud.ConfigUpdate>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getConfigUpdatesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.ConfigUpdate>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.ConfigUpdate, 13));
};


/** @param {!Array.<!proto.terrasmart.cloud.ConfigUpdate>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setConfigUpdatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 13, value);
};


/**
 * @param {!proto.terrasmart.cloud.ConfigUpdate=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.ConfigUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addConfigUpdates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 13, opt_value, proto.terrasmart.cloud.ConfigUpdate, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearConfigUpdatesList = function() {
  this.setConfigUpdatesList([]);
};


/**
 * repeated AssetUpdate asset_updates = 14;
 * @return {!Array.<!proto.terrasmart.cloud.AssetUpdate>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getAssetUpdatesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.AssetUpdate>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.AssetUpdate, 14));
};


/** @param {!Array.<!proto.terrasmart.cloud.AssetUpdate>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setAssetUpdatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 14, value);
};


/**
 * @param {!proto.terrasmart.cloud.AssetUpdate=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.AssetUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addAssetUpdates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 14, opt_value, proto.terrasmart.cloud.AssetUpdate, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearAssetUpdatesList = function() {
  this.setAssetUpdatesList([]);
};


/**
 * optional CellUpdate cell_updates = 15;
 * @return {?proto.terrasmart.cloud.CellUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getCellUpdates = function() {
  return /** @type{?proto.terrasmart.cloud.CellUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.CellUpdate, 15));
};


/** @param {?proto.terrasmart.cloud.CellUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setCellUpdates = function(value) {
  jspb.Message.setWrapperField(this, 15, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearCellUpdates = function() {
  this.setCellUpdates(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasCellUpdates = function() {
  return jspb.Message.getField(this, 15) != null;
};


/**
 * optional CellDailyUpdate cell_daily_updates = 16;
 * @return {?proto.terrasmart.cloud.CellDailyUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getCellDailyUpdates = function() {
  return /** @type{?proto.terrasmart.cloud.CellDailyUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.CellDailyUpdate, 16));
};


/** @param {?proto.terrasmart.cloud.CellDailyUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setCellDailyUpdates = function(value) {
  jspb.Message.setWrapperField(this, 16, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearCellDailyUpdates = function() {
  this.setCellDailyUpdates(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasCellDailyUpdates = function() {
  return jspb.Message.getField(this, 16) != null;
};


/**
 * repeated PanelUpdate panel_update = 17;
 * @return {!Array.<!proto.terrasmart.cloud.PanelUpdate>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getPanelUpdateList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.PanelUpdate>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.PanelUpdate, 17));
};


/** @param {!Array.<!proto.terrasmart.cloud.PanelUpdate>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setPanelUpdateList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 17, value);
};


/**
 * @param {!proto.terrasmart.cloud.PanelUpdate=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.PanelUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addPanelUpdate = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 17, opt_value, proto.terrasmart.cloud.PanelUpdate, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearPanelUpdateList = function() {
  this.setPanelUpdateList([]);
};


/**
 * repeated StartUpData start_up_data = 18;
 * @return {!Array.<!proto.terrasmart.cloud.StartUpData>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getStartUpDataList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.StartUpData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.StartUpData, 18));
};


/** @param {!Array.<!proto.terrasmart.cloud.StartUpData>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setStartUpDataList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 18, value);
};


/**
 * @param {!proto.terrasmart.cloud.StartUpData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.StartUpData}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addStartUpData = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 18, opt_value, proto.terrasmart.cloud.StartUpData, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearStartUpDataList = function() {
  this.setStartUpDataList([]);
};


/**
 * optional WeatherStowUpdate weather_stow_updates = 19;
 * @return {?proto.terrasmart.cloud.WeatherStowUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getWeatherStowUpdates = function() {
  return /** @type{?proto.terrasmart.cloud.WeatherStowUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.WeatherStowUpdate, 19));
};


/** @param {?proto.terrasmart.cloud.WeatherStowUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setWeatherStowUpdates = function(value) {
  jspb.Message.setWrapperField(this, 19, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearWeatherStowUpdates = function() {
  this.setWeatherStowUpdates(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasWeatherStowUpdates = function() {
  return jspb.Message.getField(this, 19) != null;
};


/**
 * optional GpsUpdate gps_updates = 20;
 * @return {?proto.terrasmart.cloud.GpsUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getGpsUpdates = function() {
  return /** @type{?proto.terrasmart.cloud.GpsUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.GpsUpdate, 20));
};


/** @param {?proto.terrasmart.cloud.GpsUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setGpsUpdates = function(value) {
  jspb.Message.setWrapperField(this, 20, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearGpsUpdates = function() {
  this.setGpsUpdates(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasGpsUpdates = function() {
  return jspb.Message.getField(this, 20) != null;
};


/**
 * repeated AssetRadioUpdate asset_radio_updates = 21;
 * @return {!Array.<!proto.terrasmart.cloud.AssetRadioUpdate>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getAssetRadioUpdatesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.AssetRadioUpdate>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.AssetRadioUpdate, 21));
};


/** @param {!Array.<!proto.terrasmart.cloud.AssetRadioUpdate>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setAssetRadioUpdatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 21, value);
};


/**
 * @param {!proto.terrasmart.cloud.AssetRadioUpdate=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.AssetRadioUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addAssetRadioUpdates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 21, opt_value, proto.terrasmart.cloud.AssetRadioUpdate, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearAssetRadioUpdatesList = function() {
  this.setAssetRadioUpdatesList([]);
};


/**
 * optional SiteConfigUpdate site_config_updates = 22;
 * @return {?proto.terrasmart.cloud.SiteConfigUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getSiteConfigUpdates = function() {
  return /** @type{?proto.terrasmart.cloud.SiteConfigUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.SiteConfigUpdate, 22));
};


/** @param {?proto.terrasmart.cloud.SiteConfigUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setSiteConfigUpdates = function(value) {
  jspb.Message.setWrapperField(this, 22, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearSiteConfigUpdates = function() {
  this.setSiteConfigUpdates(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasSiteConfigUpdates = function() {
  return jspb.Message.getField(this, 22) != null;
};


/**
 * repeated ChargerUpdate charger_updates = 23;
 * @return {!Array.<!proto.terrasmart.cloud.ChargerUpdate>}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getChargerUpdatesList = function() {
  return /** @type{!Array.<!proto.terrasmart.cloud.ChargerUpdate>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.terrasmart.cloud.ChargerUpdate, 23));
};


/** @param {!Array.<!proto.terrasmart.cloud.ChargerUpdate>} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setChargerUpdatesList = function(value) {
  jspb.Message.setRepeatedWrapperField(this, 23, value);
};


/**
 * @param {!proto.terrasmart.cloud.ChargerUpdate=} opt_value
 * @param {number=} opt_index
 * @return {!proto.terrasmart.cloud.ChargerUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.addChargerUpdates = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 23, opt_value, proto.terrasmart.cloud.ChargerUpdate, opt_index);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearChargerUpdatesList = function() {
  this.setChargerUpdatesList([]);
};


/**
 * optional AssetRestarted asset_restarted = 24;
 * @return {?proto.terrasmart.cloud.AssetRestarted}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getAssetRestarted = function() {
  return /** @type{?proto.terrasmart.cloud.AssetRestarted} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.AssetRestarted, 24));
};


/** @param {?proto.terrasmart.cloud.AssetRestarted|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setAssetRestarted = function(value) {
  jspb.Message.setWrapperField(this, 24, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearAssetRestarted = function() {
  this.setAssetRestarted(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasAssetRestarted = function() {
  return jspb.Message.getField(this, 24) != null;
};


/**
 * optional SolarInfoUpdate solar_info_updates = 25;
 * @return {?proto.terrasmart.cloud.SolarInfoUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getSolarInfoUpdates = function() {
  return /** @type{?proto.terrasmart.cloud.SolarInfoUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.SolarInfoUpdate, 25));
};


/** @param {?proto.terrasmart.cloud.SolarInfoUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setSolarInfoUpdates = function(value) {
  jspb.Message.setWrapperField(this, 25, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearSolarInfoUpdates = function() {
  this.setSolarInfoUpdates(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasSolarInfoUpdates = function() {
  return jspb.Message.getField(this, 25) != null;
};


/**
 * optional NetworkControllerBridgeUpdate bridge_updates = 26;
 * @return {?proto.terrasmart.cloud.NetworkControllerBridgeUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getBridgeUpdates = function() {
  return /** @type{?proto.terrasmart.cloud.NetworkControllerBridgeUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.NetworkControllerBridgeUpdate, 26));
};


/** @param {?proto.terrasmart.cloud.NetworkControllerBridgeUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setBridgeUpdates = function(value) {
  jspb.Message.setWrapperField(this, 26, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearBridgeUpdates = function() {
  this.setBridgeUpdates(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasBridgeUpdates = function() {
  return jspb.Message.getField(this, 26) != null;
};


/**
 * optional AssetPresetChanged asset_preset_changed = 27;
 * @return {?proto.terrasmart.cloud.AssetPresetChanged}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getAssetPresetChanged = function() {
  return /** @type{?proto.terrasmart.cloud.AssetPresetChanged} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.AssetPresetChanged, 27));
};


/** @param {?proto.terrasmart.cloud.AssetPresetChanged|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setAssetPresetChanged = function(value) {
  jspb.Message.setWrapperField(this, 27, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearAssetPresetChanged = function() {
  this.setAssetPresetChanged(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasAssetPresetChanged = function() {
  return jspb.Message.getField(this, 27) != null;
};


/**
 * optional CommandStatusUpdate command_status = 28;
 * @return {?proto.terrasmart.cloud.CommandStatusUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getCommandStatus = function() {
  return /** @type{?proto.terrasmart.cloud.CommandStatusUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.CommandStatusUpdate, 28));
};


/** @param {?proto.terrasmart.cloud.CommandStatusUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setCommandStatus = function(value) {
  jspb.Message.setWrapperField(this, 28, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearCommandStatus = function() {
  this.setCommandStatus(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasCommandStatus = function() {
  return jspb.Message.getField(this, 28) != null;
};


/**
 * optional MotorCurrentUpdate motor_current_update = 29;
 * @return {?proto.terrasmart.cloud.MotorCurrentUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getMotorCurrentUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.MotorCurrentUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.MotorCurrentUpdate, 29));
};


/** @param {?proto.terrasmart.cloud.MotorCurrentUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setMotorCurrentUpdate = function(value) {
  jspb.Message.setWrapperField(this, 29, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearMotorCurrentUpdate = function() {
  this.setMotorCurrentUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasMotorCurrentUpdate = function() {
  return jspb.Message.getField(this, 29) != null;
};


/**
 * optional WeatherReportingUpdate weather_reporting_update = 30;
 * @return {?proto.terrasmart.cloud.WeatherReportingUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getWeatherReportingUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.WeatherReportingUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.WeatherReportingUpdate, 30));
};


/** @param {?proto.terrasmart.cloud.WeatherReportingUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setWeatherReportingUpdate = function(value) {
  jspb.Message.setWrapperField(this, 30, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearWeatherReportingUpdate = function() {
  this.setWeatherReportingUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasWeatherReportingUpdate = function() {
  return jspb.Message.getField(this, 30) != null;
};


/**
 * optional ConfiguredVersions configured_versions = 31;
 * @return {?proto.terrasmart.cloud.ConfiguredVersions}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getConfiguredVersions = function() {
  return /** @type{?proto.terrasmart.cloud.ConfiguredVersions} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.ConfiguredVersions, 31));
};


/** @param {?proto.terrasmart.cloud.ConfiguredVersions|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setConfiguredVersions = function(value) {
  jspb.Message.setWrapperField(this, 31, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearConfiguredVersions = function() {
  this.setConfiguredVersions(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasConfiguredVersions = function() {
  return jspb.Message.getField(this, 31) != null;
};


/**
 * optional AssetRadioRestarted asset_radio_restarted = 32;
 * @return {?proto.terrasmart.cloud.AssetRadioRestarted}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getAssetRadioRestarted = function() {
  return /** @type{?proto.terrasmart.cloud.AssetRadioRestarted} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.AssetRadioRestarted, 32));
};


/** @param {?proto.terrasmart.cloud.AssetRadioRestarted|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setAssetRadioRestarted = function(value) {
  jspb.Message.setWrapperField(this, 32, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearAssetRadioRestarted = function() {
  this.setAssetRadioRestarted(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasAssetRadioRestarted = function() {
  return jspb.Message.getField(this, 32) != null;
};


/**
 * optional CloudAccuWeatherUpdate cloud_accu_weather_update = 33;
 * @return {?proto.terrasmart.cloud.CloudAccuWeatherUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getCloudAccuWeatherUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.CloudAccuWeatherUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.CloudAccuWeatherUpdate, 33));
};


/** @param {?proto.terrasmart.cloud.CloudAccuWeatherUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setCloudAccuWeatherUpdate = function(value) {
  jspb.Message.setWrapperField(this, 33, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearCloudAccuWeatherUpdate = function() {
  this.setCloudAccuWeatherUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasCloudAccuWeatherUpdate = function() {
  return jspb.Message.getField(this, 33) != null;
};


/**
 * optional VegetationUpdate vegetation_update = 34;
 * @return {?proto.terrasmart.cloud.VegetationUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getVegetationUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.VegetationUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.VegetationUpdate, 34));
};


/** @param {?proto.terrasmart.cloud.VegetationUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setVegetationUpdate = function(value) {
  jspb.Message.setWrapperField(this, 34, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearVegetationUpdate = function() {
  this.setVegetationUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasVegetationUpdate = function() {
  return jspb.Message.getField(this, 34) != null;
};


/**
 * optional IrradianceUpdate irradiance_update = 35;
 * @return {?proto.terrasmart.cloud.IrradianceUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getIrradianceUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.IrradianceUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.IrradianceUpdate, 35));
};


/** @param {?proto.terrasmart.cloud.IrradianceUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setIrradianceUpdate = function(value) {
  jspb.Message.setWrapperField(this, 35, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearIrradianceUpdate = function() {
  this.setIrradianceUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasIrradianceUpdate = function() {
  return jspb.Message.getField(this, 35) != null;
};


/**
 * optional QaQcReportUpdate qaqc_report_update = 36;
 * @return {?proto.terrasmart.cloud.QaQcReportUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getQaqcReportUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.QaQcReportUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.QaQcReportUpdate, 36));
};


/** @param {?proto.terrasmart.cloud.QaQcReportUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setQaqcReportUpdate = function(value) {
  jspb.Message.setWrapperField(this, 36, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearQaqcReportUpdate = function() {
  this.setQaqcReportUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasQaqcReportUpdate = function() {
  return jspb.Message.getField(this, 36) != null;
};


/**
 * optional IncreaseWeatherReporting increase_weather_reporting = 37;
 * @return {?proto.terrasmart.cloud.IncreaseWeatherReporting}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getIncreaseWeatherReporting = function() {
  return /** @type{?proto.terrasmart.cloud.IncreaseWeatherReporting} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.IncreaseWeatherReporting, 37));
};


/** @param {?proto.terrasmart.cloud.IncreaseWeatherReporting|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setIncreaseWeatherReporting = function(value) {
  jspb.Message.setWrapperField(this, 37, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearIncreaseWeatherReporting = function() {
  this.setIncreaseWeatherReporting(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasIncreaseWeatherReporting = function() {
  return jspb.Message.getField(this, 37) != null;
};


/**
 * optional ToggleFastTrakUpdate toggle_fast_trak_update = 38;
 * @return {?proto.terrasmart.cloud.ToggleFastTrakUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getToggleFastTrakUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.ToggleFastTrakUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.ToggleFastTrakUpdate, 38));
};


/** @param {?proto.terrasmart.cloud.ToggleFastTrakUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setToggleFastTrakUpdate = function(value) {
  jspb.Message.setWrapperField(this, 38, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearToggleFastTrakUpdate = function() {
  this.setToggleFastTrakUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasToggleFastTrakUpdate = function() {
  return jspb.Message.getField(this, 38) != null;
};


/**
 * optional SnowSheddingUpdate snow_shedding_update = 39;
 * @return {?proto.terrasmart.cloud.SnowSheddingUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getSnowSheddingUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.SnowSheddingUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.SnowSheddingUpdate, 39));
};


/** @param {?proto.terrasmart.cloud.SnowSheddingUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setSnowSheddingUpdate = function(value) {
  jspb.Message.setWrapperField(this, 39, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearSnowSheddingUpdate = function() {
  this.setSnowSheddingUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasSnowSheddingUpdate = function() {
  return jspb.Message.getField(this, 39) != null;
};


/**
 * optional SnowSheddingReportUpdate snow_shedding_report_update = 40;
 * @return {?proto.terrasmart.cloud.SnowSheddingReportUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getSnowSheddingReportUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.SnowSheddingReportUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.SnowSheddingReportUpdate, 40));
};


/** @param {?proto.terrasmart.cloud.SnowSheddingReportUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setSnowSheddingReportUpdate = function(value) {
  jspb.Message.setWrapperField(this, 40, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearSnowSheddingReportUpdate = function() {
  this.setSnowSheddingReportUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasSnowSheddingReportUpdate = function() {
  return jspb.Message.getField(this, 40) != null;
};


/**
 * optional FirmwareUpgradeReportUpdate firmware_upgrade_report_update = 41;
 * @return {?proto.terrasmart.cloud.FirmwareUpgradeReportUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getFirmwareUpgradeReportUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.FirmwareUpgradeReportUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.FirmwareUpgradeReportUpdate, 41));
};


/** @param {?proto.terrasmart.cloud.FirmwareUpgradeReportUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setFirmwareUpgradeReportUpdate = function(value) {
  jspb.Message.setWrapperField(this, 41, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearFirmwareUpgradeReportUpdate = function() {
  this.setFirmwareUpgradeReportUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasFirmwareUpgradeReportUpdate = function() {
  return jspb.Message.getField(this, 41) != null;
};


/**
 * optional NCParametersUpdate nc_params_update = 42;
 * @return {?proto.terrasmart.cloud.NCParametersUpdate}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.getNcParamsUpdate = function() {
  return /** @type{?proto.terrasmart.cloud.NCParametersUpdate} */ (
    jspb.Message.getWrapperField(this, proto.terrasmart.cloud.NCParametersUpdate, 42));
};


/** @param {?proto.terrasmart.cloud.NCParametersUpdate|undefined} value */
proto.terrasmart.cloud.CloudUpdates.prototype.setNcParamsUpdate = function(value) {
  jspb.Message.setWrapperField(this, 42, value);
};


proto.terrasmart.cloud.CloudUpdates.prototype.clearNcParamsUpdate = function() {
  this.setNcParamsUpdate(undefined);
};


/**
 * Returns whether this field is set.
 * @return {!boolean}
 */
proto.terrasmart.cloud.CloudUpdates.prototype.hasNcParamsUpdate = function() {
  return jspb.Message.getField(this, 42) != null;
};


/**
 * @enum {number}
 */
proto.terrasmart.cloud.TrackingState = {
  UNKNOWN: 0,
  ESTOP: 1,
  STOW_WEATHER: 2,
  TRACKING_ONLY: 3,
  TRACKING_WITH_BACKTRACKING: 4,
  STOW_NIGHT: 5,
  PRESET: 6,
  TRACKING_WITH_DIFFUSE: 7,
  REMOTE_QC: 8,
  FLAT_MAINTENANCE: 9,
  SNOW_SHEDDING: 10
};

goog.object.extend(exports, proto.terrasmart.cloud);
