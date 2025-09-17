const {
  INVALID_SNAP_ADDR,
  assetTypes,
  getDeviceModelFromAssetType,
  getConfigFlagsFromAssetType,
  getHardwareRevFromAssetType,
  getAssetTypeStr
} = require("../../utils/constants");
const { getAWSAccountId } = require("../../utils/lib/envVarProvider");

const getSnapAddrB64 = (snapAddr) => {
  return Buffer.from(snapAddr, "hex").toString("base64");
};

const createAssetBySnapAddr = (snapAddr, ncId = null, assetType = assetTypes.ASSET_TYPE_RB) => {
  return {
    asset_id: `00000000-0000-0000-0000-000000${snapAddr}`,
    snap_addr: snapAddr,
    assetType,
    snap_addr_b64: getSnapAddrB64(snapAddr),
    parent_network_controller_id: ncId
  }
};

const createSiteBySnapAddr = (snapAddr, ncId, noOfRB = 0, noOfWS = 0, noOfRepeaters = 0) => {
  if (ncId === undefined) {
    ncId = `${snapAddr}00-0000-0000-0000-000000000000`;
  }

  let snap = Number(`0x${snapAddr}`);

  const site = {
    network_controller_id: ncId,
    aws_iot_principal_id: '1111111111111111111111111111111111111111111111111111111111111111',
    snap_addr: snapAddr,
    snap_addr_b64: getSnapAddrB64(snapAddr),
    nc_snap_addr: snapAddr,
    nc_snap_addr_b64: getSnapAddrB64(snapAddr),
    site_id: null,
    asset_id: `00000000-0000-0000-0000-000000${snapAddr}`,
    rowBoxes: [],
    weatherStations: [],
    repeaters: []
  };

  snap++;

  for (let i = 0; i < noOfRB; i++) {
    const assetSnapAddr = snap.toString(16);
    site.rowBoxes.push(createAssetBySnapAddr(assetSnapAddr, ncId));
    snap++;
  }

  for (let i = 0; i < noOfWS; i++) {
    const assetSnapAddr = snap.toString(16);
    site.weatherStations.push(createAssetBySnapAddr(assetSnapAddr, ncId, assetTypes.ASSET_TYPE_WS));
    snap++;
  }

  for (let i = 0; i < noOfRepeaters; i++) {
    const assetSnapAddr = snap.toString(16);
    site.repeaters.push(createAssetBySnapAddr(assetSnapAddr, ncId));
    snap++;
  }

  return site;
}

const createConfigUpdate = (asset, when = null) => {
  const { assetType } = asset;
  when = when || {
    seconds: Math.floor(new Date().getTime() / 1000),
    nanos: 0,
  }

  return {
    snapAddr: asset.nc_snap_addr_b64 || asset.snap_addr_b64,
    when,
    modelDevice: getDeviceModelFromAssetType(assetType),  // Row Box
    locationLat: 1.0,
    locationLng: 2.0,
    locationText: `${getAssetTypeStr(assetType)} 1`,
    hardwareRev: getHardwareRevFromAssetType(assetType),
    firmwareRev: 34,
    configLabel: "Factory A",
    configTimestamp: when.seconds * 1000,
    siteName: 'Test Site',
    panelHorizontalCalAngle: 0,
    panelMinCalAngle: -600,
    panelMaxCalAngle: 600,
    configFlags: getConfigFlagsFromAssetType(assetType),
    segments0PanelArrayWidth: assetType === assetTypes.ASSET_TYPE_RB ? 400 : 0,
    segments0SpacingToEast: assetType === assetTypes.ASSET_TYPE_RB ? 1000 : 0,
    segments0SpacingToWest: assetType === assetTypes.ASSET_TYPE_RB ? 1001 : 0,
    segments0DeltaHeightEast: assetType === assetTypes.ASSET_TYPE_RB ? -5 : 0,
    segments0DeltaHeightWest: assetType === assetTypes.ASSET_TYPE_RB ? 6 : 0,
    segments1PanelArrayWidth: assetType === assetTypes.ASSET_TYPE_RB ? 400 : 0,
    segments1SpacingToEast: assetType === assetTypes.ASSET_TYPE_RB ? 1001 : 0,
    segments1SpacingToWest: assetType === assetTypes.ASSET_TYPE_RB ? 1000 : 0,
    segments1DeltaHeightEast: assetType === assetTypes.ASSET_TYPE_RB ? 7 : 0,
    segments1DeltaHeightWest: assetType === assetTypes.ASSET_TYPE_RB ? 8 : 0,
    presetAngles0PresetAngle: assetType === assetTypes.ASSET_TYPE_RB ? 150 : 0,
    presetAngles0NearestEnabled: assetType === assetTypes.ASSET_TYPE_RB,
    presetAngles1PresetAngle: 0,
    presetAngles1NearestEnabled: false,
    presetAngles2PresetAngle: 0,
    presetAngles2NearestEnabled: false,
    presetAngles3PresetAngle: 0,
    presetAngles3NearestEnabled: false,
    presetAngles4PresetAngle: assetType === assetTypes.ASSET_TYPE_RB ? -600 : 0,
    presetAngles4NearestEnabled: false,
    presetAngles5PresetAngle: assetType === assetTypes.ASSET_TYPE_RB ? 600 : 0,
    presetAngles5NearestEnabled: false,
    presetAngles6PresetAngle: assetType === assetTypes.ASSET_TYPE_RB ? -600 : 0,
    presetAngles6NearestEnabled: false,
    presetAngles7PresetAngle: assetType === assetTypes.ASSET_TYPE_RB ? 600 : 0,
    presetAngles7NearestEnabled: false,
    presetAngles8PresetAngle: assetType === assetTypes.ASSET_TYPE_RB ? -150 : 0,
    presetAngles8NearestEnabled: false,
    presetAngles9PresetAngle: 0,
    presetAngles9NearestEnabled: false,
    presetAngles10PresetAngle: 0,
    presetAngles10NearestEnabled: false,
    presetAngles11PresetAngle: 0,
    presetAngles11NearestEnabled: false,
    presetAngles12PresetAngle: 0,
    presetAngles12NearestEnabled: false,
    presetAngles13PresetAngle: 0,
    presetAngles13NearestEnabled: false,
    presetAngles14PresetAngle: 0,
    presetAngles14NearestEnabled: false,
    presetAngles15PresetAngle: 0,
    presetAngles15NearestEnabled: false,
    swocRequiredDuration: assetType === assetTypes.ASSET_TYPE_RB ? 0.30000001192092896 : 0,
    swocThreshold: assetType === assetTypes.ASSET_TYPE_RB ? 10 : 0,
    encodedHardLimitRegister: assetType === assetTypes.ASSET_TYPE_RB ? 20400 : 0,
    encodedSoftLimitRegister: assetType === assetTypes.ASSET_TYPE_RB ? 255 : 0,
    snow_sensor_height: 0,
    wind_dir_offset: 0,
    batteryRev: '2.2',
    scriptRev: '1.7',
    radioRev: '2.8.1',
    macAddress: assetType === assetTypes.ASSET_TYPE_NC ? '00:11:22:33:44:55' : '',
    stmRev: '3.4',
    tracking_min_angle: -60,
    tracking_max_angle: 60,
    dynamic_min_angle: -30,
    dynamic_max_angle: 30,
    simulation_flags: 1,
    heater_k: 30.5,
    preheating_battery_threshold: 20,
    preheating_temperature_threshold: 30.5
  };
}

module.exports = {
  site: {
    asset_id: "481ee11b-45c3-476e-9b1f-1f1430b95b9f",
    network_controller_id: "e177ebd3-a357-4ff7-9149-248b11bc52ec",
    assetType: assetTypes.ASSET_TYPE_NC,
    snap_addr: "0a1ba4",
    snap_addr_b64: getSnapAddrB64("0a1ba4"),
    aws_iot_principal_id: "12b135b235133a55d65d2bcfd1451b577e146c5723979057ce1fe0fc76a5eca9",
    site_id: "9e7cc704-e8c2-49c3-9872-0a523e10af9f",
    project_id: '4cd04005-7f1b-470a-9318-ff30aa544282',
    nc_snap_addr: "0a1ba4",
    nc_snap_addr_b64: getSnapAddrB64("0a1ba4"),
    rowBoxes: [
      {
        asset_id: "4d8e6d2c-ead3-4368-96c0-2890e6d21c01",
        assetType: assetTypes.ASSET_TYPE_RB,
        snap_addr: "0ac44f",
        snap_addr_b64: getSnapAddrB64("0ac44f"),
        motor_id: 'd2cfea15-572a-4c32-8430-40998a6f3278',
        radio_id: 'ebfecf5c-df0e-4470-97d8-9d5fb2e9b3e7',
        rack_id: '9864f16a-54d5-4d09-a6da-057919728837',
        battery_id: 'de222116-7e01-4209-becb-b3f80b8ba421',
        charger_id: '860f90c7-6bed-4745-a17f-68f8dcbc7e23'
      },
      createAssetBySnapAddr('ff0001')
    ],
    weatherStations: [
      {
        asset_id: "a351f48e-4b7f-4fff-a912-bf40e08fa7cc",
        assetType: assetTypes.ASSET_TYPE_WS,
        snap_addr: '0ac33b',
        snap_addr_b64: getSnapAddrB64("0ac33b"),
      }
    ]
  },
  newSite: createSiteBySnapAddr('abcdef'),
  invalidSite: createSiteBySnapAddr(INVALID_SNAP_ADDR),
  aws: {
    accountId: getAWSAccountId(),
    snsTopic: "test-terratrak-nc-to-ci",
    lambdaTriggerQueueName: 'test-terratrak-cloud-updates',
    sqsMessageId: '1ac216c9-b448-48a7-bf16-fd0cd3dc3d66',
    sqsReceiptHandle: 'TESTJBx+I+mEsLbqLQmDBh6XIxhskIoShNXmO1pN6Or3tbPbSG+fK7BBZPwIZ3jtUTqgqH1MdhitsyOSjc9yi+WQL8ocbskZlQR5eIsL2lYTnvodVsL3J8YB+Lqs7zDYMloFlt0E/sn5z1jPyv8MS7eqZX31lCFAee9cfQK7PdrfDjPtE55KUWJibux7KhbYKoFi8uDHJUOJIBS2Y/jUMzJ6B6nPwAt/PKuA7qKX/PRVcwxjGwiF/X6TSA2MvD+HGmDLwC6l7ekMvpk/j0L+zcmwnfuCnLe7xa9YNdnfpgrYfQfLySbDgk6BRrkvzhleB/D5jx/s8hPEKgn34A/68OROjIskfQrzXuRsZXyUYfx2aRtMA84M1ZtdcpjksP06PUKrheXjqFuPWKVBQ+yp2gq3gqAkns36z/sNh0CNF1bN9xY=',
  },
  rowConfig: {
    row_controller_id: "741719df-7e56-45af-ab61-9c93da1f172e",
    config_label: "Config2",
  },
  firmware: {
    34: 'c3ee55b1-6235-422b-98ac-ed4851e4321b'
  },
  hardware: {
    3: 'e8c7f7cb-acf5-4954-9a54-286fb08b606e'
  },
  tcDayUpdatesJson: {
    tcSnapAddr: getSnapAddrB64("0ac44f"),
    updates: [
      {
        type: 7,
        value: 100,
        partialData: false
      },
    ],
    when: "",
    pollsSent: 779740,
    pollsReceived: 0,
    linkQuality: 0,
    meshDepth: 0
  },
  createConfigUpdate,
  createSiteBySnapAddr,
  getSnapAddrB64,
  createAssetBySnapAddr
}
