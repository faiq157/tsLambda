const remoteCache = require("./remoteCache");

class RemoteCacheHelper {
  async verifyDuplicate(event) {
    try {
      const date = new Date();
      const timeStamp = date.toISOString().substr(0, 16);
      const key = event.principal + "|" + event.payload;
      const member = timeStamp; //+ "|" + event.payload + "|" + event.principal;
      //console.log("PAYLOAD: ", event.payload);
      //console.log("member : ", member);
      //console.log("key ",key);
      const exists = await remoteCache.get(key);
      //console.log("Exists: ", exists);
      if (exists === undefined) {
        await remoteCache.set(key, member, "ex", 3600);
        //console.log("setter response: ", res);
        return false;
      } else {
        console.log("Duplicate payload found: ", event.payload);
        return true;
      }
    } catch (err) {
      console.log("ElasticCache Error: ", err);
    }
  }
  async getAssetEntitiesIds(snap_addr){
    try{
        console.log("getAssetEntitiesIds ",snap_addr);
        let ids  = await remoteCache.get(snap_addr);
          //console.log("getAssetEntitiesIds_Res ",ids);
          if(ids) ids = JSON.parse(ids);
         return ids;

      }catch(err){
          console.log('Error in updateAssetEntitiesIds..! ',err);
          throw new Error("No Redis connection found.");
      }
  }

  async updateAssetEntitiesIds(snap_addr,ids){
      try {
        return remoteCache.set(snap_addr,JSON.stringify(ids));
      } catch(err){
        console.log('Error in updateAssetEntitiesIds..! ',err);
      }
    }


}

exports.remoteCacheHelper = new RemoteCacheHelper();
