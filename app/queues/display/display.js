const logger = require("../../config/logger-config");
const parameter = require('../../config/parameter-config');
const expressConfig = require('../../config/express-config');
const print = require('../print/print');

(function (displayQueue) {
  var displayInterval = 500;
  var displayTime = 5000;
  var canDisplay = true;

  displayQueue.toDisplayQueue = [];
  displayQueue.socket = {};

  displayQueue.init = function () {
    //BEGIN PHOTO SCREEN ROUTE
    expressConfig.app.get('/photoScreen', function(req, res) {
        res.render('views/controler/display', {
          param: parameter.p
        });
    });

    //Timer end. Put the message in print queue
    expressConfig.app.post('/photoScreen/printPhoto', function(req, res) {
      logger.debug(`[DISPLAY] get print message : ${JSON.stringify(req.fields, 2, null)}`);
      var message = req.fields;
      //if message is a print message (not single view), put it on print message
      if (!message.print || (message.print === 'false')) {
        logger.debug('[DISPLAY] Do not put message in print queue');
      } else {
        logger.debug('[DISPLAY] Put message in print queue');
        print.pushMessage(message);
      }
      canDisplay = true;
      res.contentType('text/html');
      res.send("Photo send to print");
    });

    displayQueue.socket = expressConfig.io
      .of('/screen')
      .on('connection', function (socket) {
        logger.debug('[DISPLAY] JE SUIS CONNECTE');
    });

    //Queue management timer
    setInterval(function() {
      runDisplay();
    }, displayInterval);
  }

  displayQueue.changeDisplayToVideo = function () {
    displayQueue.socket.emit('changeBgToVideo', parameter.p);
  }

  displayQueue.changeDisplayToImage = function () {
    displayQueue.socket.emit('changeBgToImage', parameter.p);
  }

  displayQueue.pushMessage = function (message) {
    logger.debug("[DISPLAY] Push New message to display");
    displayQueue.toDisplayQueue.push(message);
  }

  displayQueue.unshiftMessage = function (message) {
    logger.debug("[DISPLAY] Push New message to display FIRST");
    displayQueue.toDisplayQueue.unshift(message);
  }

  //Display the Image
  function runDisplay() {
    if (canDisplay) {
      if (displayQueue.toDisplayQueue.length > 0) {
        canDisplay = false;
        logger.debug("[DISPLAY] Send photo to display Screen");
        var message = displayQueue.toDisplayQueue.shift();
        message.displayTime = displayTime;
        displayQueue.socket.emit('displayPhoto', message);
      }
    }
  }
})(module.exports);
