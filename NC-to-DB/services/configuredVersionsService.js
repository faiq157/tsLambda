const db = require("../db");
const { exeQuery } = require("../utils/lib/pg");
class ConfiguredVersionsService {
  async handler(pbUpdate,net_ctrl_id) {
    // Update and the principal, needed in one of the queries
    try {
      console.log("In ConfiguredVersionsServiceHandler .. ");
      this.configVersionsUpdate = pbUpdate;
      
      // let when = this.configVersionsUpdate.getWhen().toDate();
      // let nc_version = this.configVersionsUpdate.getNcVersion();
      // let nc_script_version = this.configVersionsUpdate.getNcScriptVersion();
      // let nc_radio_version = this.configVersionsUpdate.getNcRadioVersion();
      // let nc_stm32_version = this.configVersionsUpdate.getNcStm32Version();
      // let nc_gas_guage_version = this.configVersionsUpdate.getNcGasGuageVersion();
      // let asset_script_version = this.configVersionsUpdate.getAssetScriptVersion();
      // let asset_radio_version = this.configVersionsUpdate.getAssetRadioVersion();
      // let asset_stm32_version = this.configVersionsUpdate.getAssetStm32Version();
      // let asset_gas_guage_version = this.configVersionsUpdate.getAssetGasGuageVersion();
      if(net_ctrl_id){
        //update configuredUpdates
        await this.updateConfigVsersions(net_ctrl_id);
        //add history
        await this.addConfigVsersionsHist(net_ctrl_id);
      } else {
        console.log("No Network Controller found in database");
      }

      return true;
    } catch (err) {
      console.log("Rolling Back Database Changes..", err);
      throw new Error(
        "Operation not completed, error in ConfiguredVersionsService handler..!!"
      );
    }
  }

  async updateConfigVsersions(net_ctrl_id){
    try{//network_controller_id, timestamp, nc_version, nc_script_version, nc_radio_version, nc_stm32_version,
     // nc_gas_guage_version, asset_script_version, asset_radio_version, asset_stm32_version, asset_gas_guage_version
      
      const updatRes = await exeQuery(db.updateConfigVersionsQuery,[
        net_ctrl_id,
        this.configVersionsUpdate.getWhen().toDate(),
        this.configVersionsUpdate.getNcVersion(),
        this.configVersionsUpdate.getNcScriptVersion(),
        this.configVersionsUpdate.getNcRadioVersion(),
        this.configVersionsUpdate.getNcStm32Version(),
        this.configVersionsUpdate.getNcGasGuageVersion(),
        this.configVersionsUpdate.getAssetScriptVersion(),
        this.configVersionsUpdate.getAssetRadioVersion(),
        this.configVersionsUpdate.getAssetStm32Version(),
        this.configVersionsUpdate.getAssetGasGuageVersion()
      ]);
      
      return updatRes;
    }catch(err){
      console.log(err);
      throw new Error(
        "Operation not completed, error in updateConfigVsersions handler..!!"
      );
    }
  }

  async addConfigVsersionsHist(net_ctrl_id){
    try{//network_controller_id, timestamp, nc_version, nc_script_version, nc_radio_version, nc_stm32_version,
     // nc_gas_guage_version, asset_script_version, asset_radio_version, asset_stm32_version, asset_gas_guage_version
      
      const addRes = await exeQuery(db.addConfigVersionsHistQuery,[
        net_ctrl_id,
        this.configVersionsUpdate.getWhen().toDate(),
        this.configVersionsUpdate.getNcVersion(),
        this.configVersionsUpdate.getNcScriptVersion(),
        this.configVersionsUpdate.getNcRadioVersion(),
        this.configVersionsUpdate.getNcStm32Version(),
        this.configVersionsUpdate.getNcGasGuageVersion(),
        this.configVersionsUpdate.getAssetScriptVersion(),
        this.configVersionsUpdate.getAssetRadioVersion(),
        this.configVersionsUpdate.getAssetStm32Version(),
        this.configVersionsUpdate.getAssetGasGuageVersion()
      ]);
      return addRes;
    }catch(err){
      console.log(err);
      throw new Error(
        "Operation not completed, error in addConfigVsersionsHist handler..!!"
      );
    }
  }
}

exports.configuredVersionsService = new ConfiguredVersionsService();
