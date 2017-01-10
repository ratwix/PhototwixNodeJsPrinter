const logger = require("./config/logger-config");
const path = require('path')
const expressConfig = require("./config/express-config");
const twitter = require("./queues/twitter/twitter");
const parameter = require("./config/parameter-config");
const admin = require("./admin/admin.js");
const moderate = require("./queues/moderate/moderate");
const render = require("./queues/render/render");
const display = require("./queues/display/display");

var port = 3000;

logger.info("Read parameters");
parameter.unserialize();

logger.info("configuring express....");
expressConfig.init();
expressConfig.connect();
logger.info("Express configured");

logger.info("configuring render");
render.init();
logger.info("Render Configured");

logger.info("configuring moderate");
moderate.init();
logger.info("Moderate Configured");

logger.info("configuring twitter");
twitter.init();
logger.info("Twitter Configured");

logger.info("configuring admin");
admin.init();
logger.info("Admin configured");

logger.info("configuring display");
display.init();
logger.info("Display configured");

//Error management
expressConfig.app.use((err, request, response, next) => {
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send('Something broke!')
})
