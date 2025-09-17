
const { insertOnDuplicateUpdateNcConfigParams } = require('../models/ncConfigParams.model');
const { toSnakeCase } = require('../util');
const helpers = require('../utils/helpers/functions');


class NcParametersUpdate {

  
  async handler(ncParametersPbUpdate) {
    this.ncParametersPbUpdate = ncParametersPbUpdate;
  
    // Extract the base JSON structure from ncParametersPbUpdate
    const rawData = this.ncParametersPbUpdate.toObject();
  
    // Remove `snap_addr` and `when` from rawData
    delete rawData.snapAddr;
    delete rawData.when;
  
    // Override specific fields
    const ncConfigParameters = {
      snap_addr: helpers.getSnapAddr(this.ncParametersPbUpdate.getSnapAddr_asU8()),
      when: this.ncParametersPbUpdate.getWhen().toDate(),
      data: toSnakeCase(rawData), // Store the modified JSON fields
    };
  
    // Log for debugging
    console.log(ncConfigParameters.snap_addr, "/ncParametersPbUpdate: ", ncConfigParameters);
  
    // Insert or update in the database
    await insertOnDuplicateUpdateNcConfigParams(ncConfigParameters.snap_addr, {
      updated_at: ncConfigParameters.when,
      data: ncConfigParameters.data, // Store everything as JSONB
    });
  
    return true;
  }
  
  
  

}

exports.ncParametersUpdate = new NcParametersUpdate();
