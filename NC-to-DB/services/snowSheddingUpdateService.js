const { getSnapAddr } = require("../utils/helpers/functions");
const { addSnowShedding } = require("../models/snow.shedding.model");
const { getAssetBySnapAddr } = require("../models/asset.model");
const { notificationHelper } = require("../utils/helpers/NotificationHelper");
const { getContext } = require("../utils/lib/context");

class SnowSheddingUpdateService {
    async handler(pbUpdate) {
        console.log("SnowSheddingUpdateService Handler ..");
        this.snowSheddingUpdate = pbUpdate;
        this.snowSheddingUpdate.snapAddr = getSnapAddr(this.snowSheddingUpdate.getSnapAddr_asU8());
        const { snapAddr } = getContext();
        const row = await addSnowShedding(
            snapAddr,
            Math.floor(new Date(this.snowSheddingUpdate.getWhen().toDate()).getTime() / 1000),
            this.snowSheddingUpdate.getDepth() / 0.0254,
            this.snowSheddingUpdate.getBaseline() / 0.0254,
            this.snowSheddingUpdate.getSnowOnGroundNow() / 0.0254,
            this.snowSheddingUpdate.getEstimate() / 0.0254,
            this.snowSheddingUpdate.getTrigger() / 0.0254,
            this.snowSheddingUpdate.getThreshold() / 0.0254,
            this.snowSheddingUpdate.getActive(),
            this.snowSheddingUpdate.snapAddr,
            Math.floor(new Date(this.snowSheddingUpdate.getTimestamp().toDate()).getTime() / 1000),
            this.snowSheddingUpdate.getState()
        );

        if (row) {
            const asset = await getAssetBySnapAddr(this.snowSheddingUpdate.snapAddr);
            if (!asset) {
                console.error(`Asset not found: `, this.snowSheddingUpdate.snapAddr);
                return false;
            }
            await notificationHelper.sendSnowSheddingUpdate(this.snowSheddingUpdate, row.last_snow_shedding, asset.id);

        }

        return true;
    }


}

exports.snowSheddingUpdateService = new SnowSheddingUpdateService();
