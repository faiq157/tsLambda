const chai = require("chai");
const { expect } = chai;
const { snappyHex } = require("../util");
const { verifyDbRow } = require("./common/dbVerify");
const testBase = require("../test/common/testBase");
const { site } = require("./common/testData");
const testPg = require("./common/testPg");

describe("Asset Radio Update Service", () => {
  const [rowbox] = site.rowBoxes;
  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };
  before(async () => {
    await testBase.init();
    await testPg.deleteAssetHistoryBySnapAddr(rowbox.snap_addr);
  });

  it("asset radio updates", async () => {
    const assetRadioUpdate = [
      {
        snapAddr: rowbox.snap_addr_b64,
        when,
        radioMacAddr: "",
        radioChannel: "",
        radioNetworkId: "",
        radioFirmware: "",
        radioScriptVersion: "",
        radioScriptCrc: "",
        radioLinkQuality: "",
        radioMeshDepth: "",
        radioPollsSent: "72",
        radioPollResponses: "20",
        isARepeater: false,
      },
      {
        snapAddr: rowbox.snap_addr_b64,
        when,
        radioMacAddr: "001c2c2ad613b566",
        radioChannel: "5",
        radioNetworkId: "-16657",
        radioFirmware: "1",
        radioScriptVersion: "30",
        radioScriptCrc: "18687",
        radioLinkQuality: "48",
        radioMeshDepth: "2",
        radioPollsSent: "16",
        radioPollResponses: "15",
        isARepeater: false,
      },
    ];

    for (let update of assetRadioUpdate) {
      const result = await testBase.invokeLambda({
        assetRadioUpdates: [update],
      });
      expect(result).to.equal(true);

      await verifyDbRow(() => testPg.getRadioHist(rowbox.snap_addr), {
        snap_addr: rowbox.snap_addr,
        data: {
          "radio.polls_sent": update.radioPollsSent,
          "radio.polls_recv": update.radioPollResponses,
          "radio.firmware_rev": update.radioFirmware,
          "radio.script_rev": update.radioScriptVersion,
          "radio.mesh_depth": update.radioMeshDepth.toString(),
          "radio.link_quality": update.radioLinkQuality.toString(),
          "radio.channel": update.radioChannel,
          "radio.network_id": snappyHex(update.radioNetworkId),
          "radio.is_a_repeater": update.isARepeater,
          "radio.script_crc": snappyHex(update.radioScriptCrc),
        },
      });
    }
  });
});
