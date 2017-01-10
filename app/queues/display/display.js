const logger = require("../../config/logger-config");
const parameter = require('../../config/parameter-config');
const expressConfig = require('../../config/express-config');

(function (displayQueue) {
  var displayInterval = 500;
  var displayTime = 5000;
  var canDisplay = true;

  displayQueue.toDisplayQueue = [];
  displayQueue.socket = {};

  displayQueue.init = function () {
    //BEGIN PHOTO SCREEN ROUTE
    expressConfig.app.get('/photoScreen', function(req, res) {
        res.render('views/controler/screen', {
          param: parameter.p
        });
    });

    //Timer end. Put the message in print queue
    expressConfig.app.post('/photoScreen/printPhoto', function(req, res){
      var message = req.fields.message;
      canDisplay = true;
      res.contentType('text/html');
      res.send("Photo send to print");
    });

    //TODO: Timer interupt, and do not print the photo
    expressConfig.app.post('/photoScreen/noPrintPhoto', function(req, res){
      var message = req.fields.message;
      canDisplay = true;
    });

    //TODO: Timer interupt, and delete the photo
    expressConfig.app.post('/photoScreen/deletePhoto', function(req, res){
      var message = req.fields.message;
      canDisplay = true;
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

  displayQueue.pushMessage = function (message) {
    logger.debug("[DISPLAY] Push New message to display");
    displayQueue.toDisplayQueue.push(message);
  }

  //Display the Image
  function runDisplay() {
    if (canDisplay) {
      if (displayQueue.toDisplayQueue.length > 0) {
        canDisplay = false;
        logger.debug("[DISPLAY] Envoie d'un message pour affichage");
        var message = displayQueue.toDisplayQueue.shift();
        message.displayTime = displayTime;
        displayQueue.socket.emit('displayPhoto', message);
      }
    }
  }
})(module.exports);
