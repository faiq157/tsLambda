const request = require("request-promise");
const fs = require("fs");
const region = process.env.AWS_REGION || 'us-east-2';

const readFileAsync = async (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
}

let awsIot = null;

const loadIotCerts = async () => {
  if(awsIot) {
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

exports.updateWeatherForecastStow = async ( awsPrincipalId, param ) => {

  console.log(`IOTPUBLOG `, {
    pid: awsPrincipalId,
    cmd: "cloud_accu_weather_alert",
    args: {
      accu_stow: param.stow,
      stow_type: param.stow_type,
      stow_start_time: param.start_time,
      stow_end_time: param.end_time
    },
  });
  // We are doing this over HTTPS so we can share the same credentials across all backend servers
  // If we used MQTT then as soon as another backend sever connects it disconnects the other
  const iot = await loadIotCerts();

  const response = await request.post({
    url: `https://a2dlentyd00pdf-ats.iot.${region}.amazonaws.com:8443/topics/networkControllers/${awsPrincipalId}?qos=1`,
    body: {
      cmd: "cloud_accu_weather_alert",
      args: {
        accu_stow: param.stow,
        stow_type: param.stow_type,
        stow_start_time: param.start_time,
        stow_end_time: param.end_time
      },
    },
    json: true,
    key: iot.key,
    cert: iot.cert,
    ca: iot.ca
  });

  console.log("mqtt response", response);

  return response;
};
