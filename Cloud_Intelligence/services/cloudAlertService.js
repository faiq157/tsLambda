const db = require("../db");
const { getCloudAlertById, exeQuery, getCloudAlertDetailByAlertId, removeCloudAlert } = require("../pg");
const utils = require("../utils");
const debug = true;
class CloudAlertService {
  async clearAlertDetail(alertId, deleteMainAlert = true) {
    try {
      console.log("ALert Detail ", alertId);
      const cloudAlertAssetIDRes = await getCloudAlertById(alertId);
      console.log("cloudAlertAssetIDRes ", cloudAlertAssetIDRes.rows);
      if (cloudAlertAssetIDRes.rows.length !== 0) {
        //check if it is a NC or Asset & get alert
        const mainCloudAlertRes = await this.getActiveCommandedStateChangedAlert(
          cloudAlertAssetIDRes.rows[0].asset_id
        );
        console.log("==>", mainCloudAlertRes.rows);
        if (mainCloudAlertRes.rows.length !== 0) {
          //remove alert from the details
          await this.clearCloudAlertDetails(
            mainCloudAlertRes.rows[0].id,
            cloudAlertAssetIDRes.rows[0].asset_id,
            cloudAlertAssetIDRes.rows[0].event_name
          );

          if (deleteMainAlert) {
            //get all the alert details
            const cloudAlertDetailsRes = await this.getCloudAlertDetails(
              mainCloudAlertRes.rows[0].id
            );
            if (cloudAlertDetailsRes.rows.length === 0) {
              //check if NC Sate is not equals to 1 && 6
              const ncState = await exeQuery(
                `
                SELECT * FROM terrasmart.tracking_command_hist
                WHERE tracking_command_hist.network_controller_id in (
                  SELECT id FROM terrasmart.network_controller WHERE network_controller.asset_id = $1::UUID
                    )
                  ORDER BY tracking_command_hist.changed_at DESC limit 1
                `,
                [mainCloudAlertRes.rows[0].asset_id]
              );
              console.log("NCStates", ncState.rows);
              if (ncState.rows.length !== 0) {
                if (
                  ncState.rows[0].commanded_state !== 1 &&
                  ncState.rows[0].commanded_state !== 6 &&
                  ncState.rows[0].commanded_state !== 2 &&
                  ncState.rows[0].commanded_state !== 7 &&
                  ncState.rows[0].commanded_state !== 8 &&
                  ncState.rows[0].commanded_state !== 9 &&
                  ncState.rows[0].commanded_state !== 10
                ) {
                  //clear the alert
                  await this.clearAlert(mainCloudAlertRes.rows[0].id);
                }
              }
            }
          }
        }
      }
      return true;
    } catch (err) {
      this.logInfo(err);
      throw new Error(
        "Operation not completed error clearAlertDetail handler..!!",
        err
      );
    }
  }

  async getActiveCommandedStateChangedAlert(assetId) {
    try {
      let mainCloudAlertRes = await exeQuery(
        `SELECT cloud_alert.*
        FROM terrasmart.cloud_alert
        WHERE 
        cloud_alert.active = true AND (cloud_alert.asset_id in (
                SELECT asset.id as asset_id FROM terrasmart.asset
                INNER JOIN terrasmart.network_controller on network_controller.id = asset.parent_network_controller_id
                WHERE network_controller.asset_id = $1::UUID
                )
            OR cloud_alert.asset_id in (
                            SELECT network_controller.asset_id from terrasmart.network_controller
                                INNER JOIN terrasmart.asset on asset.parent_network_controller_id = network_controller."id"
                                where asset.id = $1::UUID
                            )
                            OR cloud_alert.asset_id = $1::UUID
                                            )
            AND ( cloud_alert.event_name = 'NC-COMMANDED-STATE' 
                            OR cloud_alert.event_name ILIKE 'Weather_Stow_%' )
            ORDER BY cloud_alert.created DESC;`,
        [assetId]
      );
      if (mainCloudAlertRes.rows.length === 0) {
        //check if active alert for weather stow exisits
        mainCloudAlertRes = await exeQuery(`SELECT cloud_alert.*
        FROM terrasmart.cloud_alert
        WHERE 
        cloud_alert.active = true AND cloud_alert.asset_id in (
					SELECT ah.id FROM terrasmart.asset ah
					WHERE ah.parent_network_controller_id = (
						SELECT parent_network_controller_id from terrasmart.asset a 
            where id = $1 :: UUID
					)
				) AND ( cloud_alert.event_name = 'NC-COMMANDED-STATE' 
            OR cloud_alert.event_name = 'Weather_Stow_Deep_Snow'
            OR cloud_alert.event_name = 'Weather_Stow_Avg_Wind' 
            OR cloud_alert.event_name = 'Weather_Stow_Wind_Gust' 
            OR cloud_alert.event_name = 'Weather_Stow_Deep_Panel_Snow'
            OR cloud_alert.event_name = 'Weather_Stow_No_Weather_Station'
            OR cloud_alert.event_name = 'Weather_Stow_AccuWeather-Avg_Wind'
            OR cloud_alert.event_name = 'Weather_Stow_AccuWeather-Wind_Gust'
            OR cloud_alert.event_name = 'Weather_Stow_AccuWeather-Deep_Snow'
            OR cloud_alert.event_name = 'Weather_Stow_AccuWeather-Alert')
            ORDER BY cloud_alert.created DESC;`, [assetId]);
      }
      return mainCloudAlertRes;
    } catch (err) {
      this.logInfo(err);
      throw new Error(
        "Operation not completed error getActiveCommandedStateChangedAlert handler..!!",
        err
      );
    }
  }
  async clearCloudAlertDetails(alertId, alertDetailId, event_name) {
    try {
      const removeAlertDetail = await exeQuery(
        `
            DELETE FROM terrasmart.cloud_alert_detail
            WHERE cloud_alert_id = $1::UUID AND asset_id = $2::UUID AND event_name = $3::VARCHAR`,
        [alertId, alertDetailId, event_name]
      );
      return removeAlertDetail;
    } catch (err) {
      this.logInfo(err);
      throw new Error(
        "Operation not completed error clearCloudAlertDetails handler..!!",
        err
      );
    }
  }
  async getCloudAlertDetails(alertId) {
    try {
      const cloudAlertDetailsRes = await getCloudAlertDetailByAlertId(alertId);
      return cloudAlertDetailsRes;
    } catch (err) {
      this.logInfo(err);
      throw new Error(
        "Operation not completed error getCloudAlertDetails handler..!!",
        err
      );
    }
  }

  async clearAlert(alertId) {
    try {
      const clearAlertRes = await removeCloudAlert(alertId);
      return clearAlertRes;
    } catch (err) {
      this.logInfo(err);
      throw new Error(
        "Operation not completed error clearAlert handler..!!",
        err
      );
    }
  }
  logInfo(obj) {
    if (debug) console.log(obj);
  }
}
exports.cloudAlertService = new CloudAlertService();
