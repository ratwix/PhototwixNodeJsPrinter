const logger = require("./config/logger-config");
const path = require('path')
const expressConfig = require("./config/express-config");
const twitter = require("./queues/twitter/twitter");
const instagram = require("./queues/instagram/instagram");
const parameter = require("./config/parameter-config");
const admin = require("./admin/admin.js");
const moderate = require("./queues/moderate/moderate");
const render = require("./queues/render/render");
const display = require("./queues/display/display");
const print = require("./queues/print/print");
const gallery = require("./gallery/gallery");
const cameraRaspi = require("./camera/cameraRaspi");
const cameraFlashAir = require("./camera/cameraFlashAir");
const util = require("./util/util");

var port = 3000;

util.createFolders();
util.updatePaperPrinter();

logger.info("[MAIN] Read parameters");
parameter.unserialize();

logger.info("[MAIN] configuring express....");
expressConfig.init();
expressConfig.connect();
logger.info("[MAIN] Express configured");

logger.info("[MAIN] configuring render");
render.init();
logger.info("[MAIN] Render Configured");

logger.info("[MAIN] configuring moderate");
moderate.init();
logger.info("[MAIN] Moderate Configured");

logger.info("[MAIN] configuring twitter");
twitter.init();
logger.info("[MAIN] Twitter Configured");

logger.info("[MAIN] configuring admin");
admin.init();
logger.info("[MAIN] Admin configured");

logger.info("[MAIN] configuring display");
display.init();
logger.info("[MAIN] Display configured");

logger.info("[MAIN] configuring print");
print.init();
logger.info("[MAIN] Print configured");

logger.info("[MAIN] configuring gallery");
gallery.init();
logger.info("[MAIN] Gallery configured");

logger.info("[MAIN] configuring camera raspberry");
cameraRaspi.init();
logger.info("[MAIN] Camera configured");

logger.info("[MAIN] configuring camera flashair");
cameraFlashAir.init();
logger.info("[MAIN] Camera configured");

//Error management
expressConfig.app.use((err, request, response, next) => {
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send('Something broke!')
})
