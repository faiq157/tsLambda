const pg = require("../utils/lib/pg");
const { assetTypes } = require("../utils/constants");
const { isValidSnapAddr } = require('../utils/helpers/functions');
const { 
  getAssetBySnapAddr,
  getOrCreateAsset 
} = require("../models/asset.model");

const { LAST_ACTIVITY_UPDATE_INTERVAL } =  require('../utils/constants');

const { acquireLock, acquireNcLock} = require("../utils/lib/distributedLock");

const getNetworkControllerByPrincipalId = async (principalId) => {
  const { rows } = await pg.getNetworkControllerByPrincipalId(principalId);
  if(rows.length > 0) {
    return rows[0];
  }

  console.warn('nc by principal id not found', JSON.stringify({ principalId }));

  return null;
}

const getNcSnapAddrU8ByPrincipalId = async (principalId) => {
  const { rows } = await pg.getNcSnapAddrU8ByPrincipalId(principalId);
  if (rows.length > 0) {
    return rows[0].snap_addr;
  }
  return null;
}

const getNetworkControllerById = async (networkControllerId) => {
  const { rows } = await pg.getNetworkControllerById(networkControllerId);
  if(rows.length > 0) {
    return rows[0];
  }

  console.warn('nc by network controler id not found', JSON.stringify({ networkControllerId }));

  return null;
}

const getNetworkControllerByAssetId = async (assetId) => {
  const { rows } = await pg.getNetworkControllerByAssetId(assetId);
  if(rows.length > 0) {
    return rows[0];
  }

  console.warn('nc by network controler asset id not found', JSON.stringify({ assetId }));

  return null;
}

const updateNetworkControllerPrincipalIdByAssetId = async (assetId, principalId) => {
  const result = await pg.updateNetworkControllerPrincipalIdByAssetId(assetId, principalId);
  if(result.rowCount > 0) {
    console.warn('nc principal id updated successfully', JSON.stringify({ assetId, principalId }));
    return result;
  }

  console.error('unable to update nc principal id using asset id', JSON.stringify({ assetId, principalId }));

  throw new Error('unable to update nc principal id using asset id');
}

const addNetworkController = async (snapAddr, principalId, clientId, networkControllerId=null) => {
  console.warn("adding new network controller", JSON.stringify({ snapAddr, principalId, clientId }));

  if(!snapAddr || !principalId) {
    throw (new Error('snap address and principal id is required for adding new network controller'));
  }

  const asset = await getOrCreateAsset(snapAddr, null, assetTypes.ASSET_TYPE_NC);

  const { rows, rowCount } = await pg.addNetworkController(principalId, asset.id, clientId, networkControllerId);

  console.log('network controller creation result', JSON.stringify({ rows, rowCount }));

  return rows[0];
};

const updateNetworkControllerLastActivity = async (nc) => {
  const lastMinute = new Date().getTime() - (LAST_ACTIVITY_UPDATE_INTERVAL * 1000);
  const dbTimestamp = nc.last_updated ? nc.last_updated.getTime() : null;
  
  if (dbTimestamp && dbTimestamp >= lastMinute) {
    console.log(`nc last update ignored, db(${dbTimestamp}) > lastMin(${lastMinute})`);  
  } else {
    await acquireLock("locks:nclastupdated:" + nc.id, 3000, async () => {
      const { rowCount, rows } = await pg.updateNetworkControllerLastActivity(nc.id, LAST_ACTIVITY_UPDATE_INTERVAL);
      console.log("nc activity update result ", { rowCount, rows });
    }).catch((err) => {
      console.trace("nc activity update error ", err);
    });
  }

  // console.log("nc last activity update completed");
};

const getOrCreateNetworkController = async (snapAddr, principalId, clientId, networkControllerId=null) => {
  
  return acquireNcLock(snapAddr || principalId, async () => {
    
    const networkController = await getNetworkControllerByPrincipalId(principalId);
    if(networkController) {
      return networkController;
    }
  
    if (isValidSnapAddr(snapAddr)) {
      const asset = await getAssetBySnapAddr(snapAddr);
  
      if(asset) {
        const ncExists = await getNetworkControllerByAssetId (asset.id);
        if(ncExists) {
          console.warn('need to update nc certificate id', JSON.stringify({
            snapAddr, 
            principalId, 
            clientId, 
            oldPrincipalId: ncExists.aws_iot_principal_id 
          }));
          await updateNetworkControllerPrincipalIdByAssetId(asset.id, principalId);
        
          return getNetworkControllerByPrincipalId(principalId);
        }  
      }
    }
  
    await addNetworkController(snapAddr, principalId, clientId, networkControllerId);
  
    return getNetworkControllerByPrincipalId(principalId);
  }, 2500)
  
}

const addTrackingModeHistory = async (networkControllerId, changedAt, trackingMode, trackingModeDetail) => {
  const { rowCount } = await pg.addTrackingModeHisotry(
    networkControllerId,
    changedAt,
    trackingMode,
    trackingModeDetail
  );

  if(rowCount === 0) {
    console.error("unable to add tracking mode history");
  }

  return rowCount;
}

const updateTrackingMode = async (networkControllerId, changedAt, trackingMode, trackingModeDetail, userName, userEmail, source) => {
  const { rowCount } = await pg.updateTrackingMode(
    networkControllerId,
    changedAt,
    trackingMode,
    trackingModeDetail,
    userName, 
    userEmail,
    source
  );

  if(rowCount === 0) {
    console.warn("tracking mode was not updated due to out of order updates.");
  }

  return rowCount;
}

const getNetworkControllerBySnapAddr = async (snapAddr) => {
  let res = await pg.getNetworkControllerBySnapAddr(snapAddr);
  if (res?.rows?.length > 0) {
    return res.rows[0];
  }
  return null;
}

const updateEStopEngageAt = async (networkControllerId, estopEngagedAt) => {
  const { rowCount, rows } = await pg.updateEStopEngageAt(
    networkControllerId,
    estopEngagedAt
  );

  if(rowCount === 0) {
    console.warn("estop engaged at not updated due to out of order updates.", JSON.stringify(rows));
  }

  return rowCount;
}

const updateEStopDisengageAt = async (networkControllerId, estopDisengagedAt) => {
  const { rowCount, rows } = await pg.updateEStopDisengageAt(
    networkControllerId,
    estopDisengagedAt
  );

  if(rowCount === 0) {
    console.warn("estop disengaged at not updated due to out of order updates.", JSON.stringify(rows));
  }

  return rowCount;
}

module.exports = {
  getOrCreateNetworkController,
  getNetworkControllerById,
  getNetworkControllerByAssetId,
  getNetworkControllerByPrincipalId,
  getNetworkControllerBySnapAddr,
  updateNetworkControllerLastActivity,
  addTrackingModeHistory,
  updateTrackingMode,
  updateEStopEngageAt,
  updateEStopDisengageAt,
  getNcSnapAddrU8ByPrincipalId,
}