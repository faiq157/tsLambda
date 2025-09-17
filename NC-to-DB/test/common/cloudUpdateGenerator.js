// const { site } = require('./testData');
const pb = require("../../protobuf/terrasmart_cloud_pb");
const timestampPb = require('google-protobuf/google/protobuf/timestamp_pb.js');

const capitalize = (s) => (s && s[0].toUpperCase() + s.slice(1)) || '';

const capitalizeIfCamelCase = (str) => {
  return (/[A-Z]/.test(str)) ? capitalize(str) : str;
}

const isTimeStamp = (s) => (s.seconds != undefined && s.nanos != undefined);

const generateMessage = (payload, obj='CloudUpdates') => {
  const update = new pb[capitalizeIfCamelCase(obj)]();
  for(const key in payload) {
    const val = payload[key];
    const prop = `set${capitalize(key)}`;

    if (isTimeStamp(val)) { 
      const ts = new timestampPb.Timestamp();
      ts.setSeconds(val.seconds);
      ts.setNanos(val.nanos);
      update[prop](ts);
    } else if(Buffer.isBuffer(val)) {
      update[prop](val);
    } else if(typeof val === 'object') {
      update[prop](generateMessage(val, key));      
    } else if (Array.isArray(val)) {
      const arr = [];
      for(const a of val) {
        arr.push(generateMessage(a, key));
      }
      update[prop](arr);
    } else {
      update[prop](val);
    }
  }

  return update;
}

// const encodeAccuWeather = () => {

//   const message = new pb.CloudUpdates();
//   message.setNcSnapAddr(site.nc_snap_addr);

//   const cloudAccuWeatherUpdate = new pb.CloudAccuWeatherUpdate();
//   message.setCloudAccuWeatherUpdate(cloudAccuWeatherUpdate);

//   cloudAccuWeatherUpdate.setSnapAddr(site.nc_snap_addr);
//   cloudAccuWeatherUpdate.setNeedAccuWeatherUpdate(true);
//   cloudAccuWeatherUpdate.setAccuStow(false);
//   cloudAccuWeatherUpdate.setStowType('avg_wind');
//   cloudAccuWeatherUpdate.setStowStartTime('2019-09-13 23:33:46.053000');
//   cloudAccuWeatherUpdate.setStowEndTime('2019-09-13 23:33:46.053000');
//   cloudAccuWeatherUpdate.setErrorCodes(0);

//   const date = new Date();
//   const ts = new timestampPb.Timestamp();
//   ts.setSeconds(date.getTime());
//   ts.setNanos(0);
//   cloudAccuWeatherUpdate.setWhen(ts)
//   return message;
// }

const getEncodedPayload = (payload) => {
  const message = generateMessage(payload);
  // const message = encodeAccuWeather();
  const uIntArray = message.serializeBinary();
  const buffer = Buffer.from(uIntArray);
  const str = buffer.toString('base64');
  console.log(str);
  return str;
}

module.exports = { 
  getEncodedPayload
}