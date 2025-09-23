const db = require("../../db")
const { exeQuery } = require("../../pg")
/**
 * Returns the true/false if event is grouped or not
 * @param {event_name} event_name to verify if exisits
 */
exports.isGroupedEvent = (event_name) => {
  let groupedEvents = ['ASSET-NO-CONNECTION_WITH_NC', 'ASSET-MOTOR-CURRENT-HW-FAULT', 'ASSET-MOTOR-FAULT-TIMEOUT',
    'ASSET-CHARGER_FAULT', 'ASSET-MOTOR-CURRENT_SW_FAULT', 'ASSET-LOW-BATTERY_STOW', 'NC-LOW-BATTERY_STOW',
    'ASSET-LOW-TEMP_RESTRICTED_MOVEMENT', 'ASSET-ESTOP-Engaged', 'ASSET-ESTOP-Disengaged', 'ASSET-HIGH-TEMPERATURE-MOTOR-CUTOFF'];
  if (groupedEvents.includes(event_name)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Returns the exact Info of event from infoMap on the basis of event name
 * @param {infoMap} infoMap is map array having all groupedEventsDetail
 * @param {event_name} event_name to verify if exisits in infoMap
 */
exports.checkGropEvent = (infoMap, event_name) => {
  let info = null;
  infoMap.forEach((data) => {
    if (data.event_name === event_name) info = data;
  });
  return info;
}

/**
 * Returns the assetName From AssetsList after matching the id
 * @param {assetsInfo} assetsInfoList having info of all assets for specific site
 * @param {asset_id} asset_id for which we need to get info from assetInfoList
 */
exports.getAssetNameById = (assetsInfo, asset_id) => {
  console.log("getAssetNameById ", asset_id);
  let assetName = "ASSET";
  assetsInfo.forEach((data) => {
    if (data.asset_id === asset_id) {
      assetName = data.asset_name;
    }
  });
  console.log("assetName", assetName);
  return assetName;
}

/**
 * Returns the assetInfoList on the basis of siteId
 * @param {client} client databse client to execute query
 * @param {network_controller_id} network_controller_id for which we need to get info from database
 */
exports.getAssetsInfoByNetworkControllerId = async (network_controller_id) => {
  try {
    let assetsInfo = [];
    console.log(db.ncInfoById, [network_controller_id]);

    const getNc = await exeQuery(db.ncInfoById, [network_controller_id]);
    console.log(getNc);

    if (getNc.rows.length !== 0) {
      console.log(db.assetInfoByNcIdQuery, [getNc.rows[0].id]);
      const getAssets = await exeQuery(
        db.assetInfoByNcIdQuery, [getNc.rows[0].id]);

      // console.log("getAssets ",getAssets);
      assetsInfo = [{ asset_id: getNc.rows[0].id, asset_name: getNc.rows[0].name }];
      getAssets.rows.forEach(async (data) => {
        if (data.device_type === "Weather Station") {
          assetsInfo.push({ asset_id: data.asset_id, asset_name: data.asset_name });
        } else {
          let asset_name = "Row Box " +
            (data.row_id !== null ? data.row_id : "") +
            " (" +
            (data.row_name !== null ? data.row_name + " | " : "") +
            (data.shorthand_name !== null ? data.shorthand_name + " | " : "") +
            data.snap_addr +
            ")";
          assetsInfo.push({ asset_id: data.asset_id, asset_name: asset_name });
        }
      });
    }
    return assetsInfo;
  } catch (err) {
    console.trace(err);
    throw new Error("Operation not completed error getAssetsInfo..!!", err);
  }
}

/**
 * Returns the Html String to add the info in detail siteMode Email
 * @param {client} client databse client to execute query
 * @param {assetsWithActiveAlerts} assetsWithActiveAlerts contains assets Info which have active alerts
 * @param {network_controller_id} network_controller_id for which we need to get info from database
 */
exports.getGroupedEvents = async (assetsWithActiveAlerts, network_controller_id) => {
  try {
    let infoMap = [];
    const assetsInfo = await this.getAssetsInfoByNetworkControllerId(network_controller_id);
    // console.log("assetsInfo",assetsInfo);
    await assetsWithActiveAlerts.rows.forEach(async (data) => {
      if (this.isGroupedEvent(data.event_name)) {
        let eventInfo = this.checkGropEvent(infoMap, data.event_name);
        if (eventInfo !== null) {
          eventInfo.assets.push({ asset_id: data.asset_id, timestamp: data.timestamp });
        } else {
          infoMap.push({
            "isGroup": true,
            "event_name": data.event_name,
            "title": data.title,
            assets: [{ asset_id: data.asset_id, timestamp: data.timestamp }]
          });
        }
      } else {
        infoMap.push({ "isGroup": false, "info": data });
      }
    });
    // console.log("infoMap ",infoMap);
    let detail_text = '<ul class="disc">';
    infoMap.forEach((infoMapVal) => {
      // console.log("INFOMAPVAL ",infoMapVal);
      if (!infoMapVal.isGroup) {
        detail_text = detail_text + "<li>" + infoMapVal.info.title + "</li>";
      } else {
        if (infoMapVal.assets.length <= 1) {
          detail_text = detail_text + "<li>" + infoMapVal.title + " " + this.getAssetNameById(assetsInfo, infoMapVal.assets[0].asset_id) + "</li>";
        } else {
          detail_text = detail_text + '<li>' + infoMapVal.title + '</li> <ul class="dashed">';
          infoMapVal.assets.forEach((data) => {
            let asset_name = this.getAssetNameById(assetsInfo, data.asset_id);
            detail_text = detail_text + "<li><span class='dashed-li'></span>" + asset_name + "</li>";
          });
          detail_text = detail_text + "</ul>"
        }
      }
    });
    detail_text = detail_text + "</ul>";
    // console.log("DETAILTEXT ",detail_text);
    return detail_text;
  } catch (err) {
    console.trace(err);
    throw new Error("Operation not completed error getGroupedEvents..!!", err);
  }
}


/**
 * Returns the Html String to add the info in detail siteMode Email
 * @param {reportDetail} report detail with failed & unresponsive status
 */
exports.getSnowSheddingGroupedEvents = (reportDetail) => {
  try {
    let detail_text = ``;
    if (reportDetail.hasOwnProperty('failed')) {
      detail_text += `
      <ul class="disc"><li>Snow Shedding Failed Rows:</li></ul>
      <ul  class="dashed-margin"> `;
      reportDetail.failed.forEach(row => {
        detail_text += `<li>
        <span class='dashed-li'></span>Row ${row.row_id}(${row.snap_address})
        </li>`;
      });
      detail_text += `</ul>`;
    }

    if (reportDetail.hasOwnProperty('unresponsive')) {
      detail_text += '<ul class="disc">';

      detail_text += `<li>Snow Shedding Unresponsive Rows: </li>
      </ul>
      <ul class="dashed-margin">`;

      reportDetail.unresponsive.forEach(row => {
        detail_text += `<li><span class='dashed-li'></span>Row ${row.row_id}(${row.snap_address})</li>`;
      });
      detail_text += `</ul>`;
    }
    return detail_text;
  } catch (err) {
    console.trace(err);
    throw new Error("Operation not completed error getSnowSheddingGroupedEvents..!!", err);
  }
}

/**
 * Returns the Html String to add the info in detail siteMode Email
 * @param {reportDetail} report detail with failed & unresponsive status
 */
exports.getSnowSheddingGroupedEventsForSMS = (info, reportDetail, status_text, timestamp) => {
  try {
    let smsText = (info.multipleSites ? info.project_name + " | " : "") +
      info.site_name + " | " + status_text + " at " + timestamp + "\n";
    console.log(`SMS text: `, smsText);
    if (reportDetail.hasOwnProperty('failed')) {
      smsText += `Snow Shedding Failed Rows: \n`;
      reportDetail.failed.forEach(row => {
        smsText += `Row ${row.row_id}(${row.snap_address})\n`;
      });
    }
    console.log(`SMS text: `, smsText);
    if (reportDetail.hasOwnProperty('unresponsive')) {
      smsText += `Snow Shedding Unresponsive Rows: \n`;
      reportDetail.unresponsive.forEach(row => {
        smsText += `Row ${row.row_id}(${row.snap_address})\n`;
      });

    }
    console.log(`SMS text: `, smsText);
    return smsText;
  } catch (err) {
    console.trace(err);
    throw new Error("Operation not completed error getSnowSheddingGroupedEventsForSMS..!!", err);
  }
}

