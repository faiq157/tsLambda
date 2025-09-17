const testBase = require("./common/testBase");
const { createSiteBySnapAddr } = require('./common/testData');
const networkController = require('../models/network.controller.model');
const asset = require('../models/asset.model');
const { assetTypes } = require("../utils/constants")

describe.skip("GRC Site Setup", function () {

  beforeEach(async () => {
    await testBase.init();
  })

  it("setup", async () => {
    const snapAddr = 'ff0000';
    const site = createSiteBySnapAddr(snapAddr, undefined, 100, 3, 0);
    await networkController.getOrCreateNetworkController(snapAddr, site.aws_iot_principal_id, snapAddr, site.network_controller_id);

    for(const rb of site.rowBoxes) {
      await asset.getOrCreateAsset(rb.snap_addr, site.network_controller_id, assetTypes.ASSET_TYPE_RB)
    }

    for(const ws of site.weatherStations) {
      await asset.getOrCreateAsset(ws.snap_addr, site.network_controller_id, assetTypes.ASSET_TYPE_WS)
    }

    // for(const rb of site.repeaters) {
    //   await asset.getOrCreateAsset(rb.snap_addr, site.network_controller_id, assetTypes.ASSET_TYPE_RB)
    // }
  })
});
