 
const list = {}

class Context {
 
  constructor(ctx) {
    this.snapAddr = ctx.snapAddr;
    this.requestId = ctx.requestId; 
    this.principalId = ctx.principalId;
    this.siteId = ctx.siteId;
    this.ncId = ctx.ncId;
    this.ncVersion = ctx.ncVersion;
    this.assetId = ctx.assetId;
  }  
}

const createContext = async (ctx) => {
  const context = new Context(ctx);
  list[context.requestId] = context;
  process.env.REQUEST_ID = context.requestId;
  return context;
}

const getContext = () => {
  const requestId = process.env.REQUEST_ID;
  if(!requestId) {
    throw(new Error('context id not found'));
  }

  return list[requestId];
};

const destroyContext = () => {
  const requestId = process.env.REQUEST_ID;
  if(requestId) {
    delete list[requestId];
    delete process.env.REQUEST_ID;
  }
}

module.exports = { 
  createContext, 
  getContext, 
  destroyContext
}