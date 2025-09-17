require('dotenv').config();
const loader = require('./index');

loader.handler(null, null, (err, resp) => {
  console.log('Err:', err);
  console.log('Resp:', resp);
});
