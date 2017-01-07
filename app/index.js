const logger = require("./config/logger-config");
const express = require('express')
const path = require('path')
const app = express()
const expressConfig = require("./config/express-config");
const twitter = require("./queues/twitter/twitter");
const parameter = require("./config/parameter-config");
const admin = require("./admin/admin.js");
const moderate = require("./queues/moderate/moderate");
const render = require("./queues/render/render");
const display = require("./queues/display/display");

const port = 3000

logger.info("Read parameters");
parameter.unserialize();

logger.info("configuring express....");
expressConfig.init(app, express);
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
admin.init(app);
logger.info("Admin configured");

logger.info("configuring display");
display.init(app);
logger.info("Display configured");

//Main route definition
app.get('/', (request, response) => {
  response.render('views/mainscreen/mainscreen', {
  });
})

//Error management
app.use((err, request, response, next) => {
  // log the error, for now just console.log
  console.log(err)
  response.status(500).send('Something broke!')
})

var server = app.listen(port, function() {
  var host = server.address().address;
  var port = server.address().port;
  logger.info('Example app listening at http://%s:%s', host, port);
})
