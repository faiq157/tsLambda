const request = require("request-promise");
const fs = require("fs");
const moment = require("moment-timezone");
const { mqtt } = require("./utils/constants");
const { getContext } = require("./utils/lib/context");
const { getAWSRegion } = require('./utils/lib/envVarProvider');
const { readFileAsync } = require("./utils/helpers/functions");

let awsIot = null;

const loadIotCerts = async () => {
  if (awsIot) {
    return awsIot;
  }

  console.log("mqtt loading certs");

  let key
  let cert

  if (process.env.AWS_REGION === 'us-west-1') {
    key = await readFileAsync('./certs/private.dev.key');
    cert = await readFileAsync('./certs/my_aws_iot.dev.crt');
  }
  else if (process.env.AWS_REGION === 'us-west-2') {
    key = await readFileAsync('./certs/private.stage.key');
    cert = await readFileAsync('./certs/my_aws_iot.stage.crt');
  } else {
    key = await readFileAsync('./certs/private.key');
    cert = await readFileAsync('./certs/my_aws_iot.pem');
  }

  awsIot = {
    key,
    cert,
    ca: [fs.readFileSync("./certs/rootCA.pem")]
  }

  return awsIot;
}

exports.updateWeatherForecastStow = async (args) => {
  // We are doing this over HTTPS so we can share the same credentials across all backend servers
  // If we used MQTT then as soon as another backend sever connects it disconnects the other
  const { principalId } = getContext();
  console.log(`mqtt iotPub[${principalId}]:`, args);

  const iot = await loadIotCerts();

  const response = await request.post({
    // url : 'https://a2dlentyd00pdf.iot.us-east-2.amazonaws.com:8443'
    url: `https://${mqtt.accountPrefix}-ats.iot.${getAWSRegion()}.amazonaws.com:8443${mqtt.ncTopic}/${principalId}?qos=1`,
    body: {
      cmd: "cloud_accu_weather_alert",
      args
    },
    json: true,
    key: iot.key,
    cert: iot.cert,
    ca: iot.ca
  });

  console.log("mqtt response", response);

  return response;
};

exports.sendAccuWeatherNoStowResponse = async () => {
  const params = {
    accu_stow: false,
    stow_type: 'avg_wind',
    stow_start_time: moment().subtract(1, "hour").utc().format(),
    stow_end_time: moment().subtract(1, "hour").utc().format()
  }
  return this.updateWeatherForecastStow(params);
};
