const {
  updateFasttrakUnableDisableBySnapAddress, getAssetBySnapAddr,
} = require("../models/asset.model");
const { getSnapAddr } = require("../utils/helpers/functions");

class ToggleFastTrakUpdateService {
  async handler(pbUpdate) {
    console.log("ToggleFastTrakUpdate Handler ..");
    this.toggleFastTrakUpdate = pbUpdate;
    this.toggleFastTrakUpdate.snapAddr = getSnapAddr(
      this.toggleFastTrakUpdate.getSnapAddr_asU8(
        this.toggleFastTrakUpdate.snapAddr
      )
    );
    
    const assetInfo = await getAssetBySnapAddr(this.toggleFastTrakUpdate.snapAddr); 
    if (assetInfo?.repeater_only) {
      console.info("In ToggleFastTrakUpdateService Ignoring repeater update,", this.toggleFastTrakUpdate.snapAddr);
      return null
    }

    await updateFasttrakUnableDisableBySnapAddress(
      { is_fasttrak_enable: this.toggleFastTrakUpdate.getStatus() },
      this.toggleFastTrakUpdate.snapAddr
    );
    return true;
  }
}

exports.toggleFastTrakUpdateService = new ToggleFastTrakUpdateService();
