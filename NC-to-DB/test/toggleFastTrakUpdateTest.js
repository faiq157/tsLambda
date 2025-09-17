const testBase = require("./common/testBase");
const { site } = require("./common/testData");
const chai = require("chai");
const { expect } = chai;
const testPg = require("./common/testPg");
const { verifyDbRow } = require("./common/dbVerify");

describe("ToggleFastTrakUpdate", () => {
  const [rowbox] = site.rowBoxes;

  beforeEach(async () => {
    await testBase.init();
  });

  const date = new Date();
  const when = {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: 0,
  };

  const toggleFastTrakUpdateTestCases = [
    {
      name: "Enable rowbox fasttrak",
      snapAddr: rowbox.snap_addr_b64,
      status: true,
      when,
    },
    {
      name: "Disable rowbox fasttrak",
      snapAddr: rowbox.snap_addr_b64,
      status: false,
      when,
    },
  ];

  for (const testcase of toggleFastTrakUpdateTestCases) {
    const toggleFastTrakUpdate = testcase;

    it(testcase.name, async () => {
      const result = await testBase.invokeLambda({
        toggleFastTrakUpdate: toggleFastTrakUpdate,
      });

      expect(result).to.equal(true);

      await verifyDbRow(() => testPg.getAssetBySnapAddress(rowbox.snap_addr), {
        is_fasttrak_enable: toggleFastTrakUpdate.status,
      });
    });
  }
});
