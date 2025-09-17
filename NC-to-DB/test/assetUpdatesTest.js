const testBase = require("./common/testBase");
const { site } = require("./common/testData");
const { mockSns } = require('./common/mock');
const chai = require("chai");
const { expect } = chai;
const pg = require('../utils/lib/pg');
const testPg = require('./common/testPg');
// const { channels } = require('../utils/helpers/NotificationHelper');
const { verifyDbRow } = require('./common/dbVerify');


describe("assetUpdates", () => {

    const [rowbox] = site.rowBoxes;

    beforeEach(async () => {
        await testBase.init();
        await testPg.deleteAssetLastUpdateBySnapAddr(site.rowBoxes[0].snap_addr);
    });

    describe("Verify asset dummy update", () => {
        const testCases = [{
            name: "Dummy Update",
            unitTemperature: 0,
            uptime: 0
        }];

        for (const testcase of testCases) {

            it(testcase.name, async () => {

                const date = new Date();
                const when = {
                    seconds: Math.floor(date.getTime() / 1000),
                    nanos: 0,
                };

                const assetUpdate = {
                    snapAddr: rowbox.snap_addr_b64,
                    when,
                    unitTemperature: testcase.unitTemperature,
                    uptime: testcase.uptime
                }

                const snsPayloadConnectionHist = {
                    type: 'elastic_search-1',
                    channel: 'asset_update',
                    asset_id: rowbox.asset_id,
                    timestamp: new Date(when.seconds * 1000),
                    asset_temp: testcase.unitTemperature,
                    uptime: testcase.uptime
                }

                const scopeSnsConnectionHist = mockSns(snsPayloadConnectionHist);

                const result = await testBase.invokeLambda({ assetUpdates: [assetUpdate] });

                expect(result).to.equal(true);

                expect(scopeSnsConnectionHist.isDone()).to.equal(false);

                const {rows: assetLastUpdate} = await testPg.getAssetLastUpdate(rowbox.snap_addr);
                expect(assetLastUpdate.length).to.equal(1);

            });
        }
    });

    describe("Verify asset update", () => {
        const testCases = [{
            name: "Asset Update",
            unitTemperature: 10.5,
            uptime: 1024
        }];

        for (const testcase of testCases) {

            it(testcase.name, async () => {

                const date = new Date();
                const when = {
                    seconds: Math.floor(date.getTime() / 1000),
                    nanos: 0,
                };


                const assetUpdate = {
                    snapAddr: rowbox.snap_addr_b64,
                    when,
                    unitTemperature: testcase.unitTemperature,
                    upTime: testcase.uptime
                }

                const snsPayloadConnectionHist = {
                    type: 'elastic_search-1',
                    channel: 'asset_update',
                    asset_id: rowbox.asset_id,
                    timestamp: new Date(when.seconds * 1000),
                    asset_temp: testcase.unitTemperature,
                    uptime: testcase.uptime
                }

                const scopeSnsConnectionHist = mockSns(snsPayloadConnectionHist);

                const result = await testBase.invokeLambda({ assetUpdates: [assetUpdate] });

                expect(result).to.equal(true);

                expect(scopeSnsConnectionHist.isDone()).to.equal(false);

                await verifyDbRow(() => pg.getAssetBySnapAddr(rowbox.snap_addr), {
                    asset_temp: testcase.unitTemperature,
                    uptime: testcase.uptime
                });
                // Below code is commented, because we are not updating time based on this event
                // const {rows: assetLastUpdate} = await testPg.getAssetLastUpdate(rowbox.snap_addr);
                // expect(assetLastUpdate.length).to.equal(1);

            });
        }
    });
});
