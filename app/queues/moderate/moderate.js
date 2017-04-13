const logger = require("../../config/logger-config");
const render = require("../render/render");
const parameter = require('../../config/parameter-config');
const expressConfig = require('../../config/express-config');

(function (moderateQueue) {
  var validatedInterval = 500;

  moderateQueue.pendingQueue = [];
  moderateQueue.validatedQueue = [];
  moderateQueue.rejectedQueue = [];

  moderateQueue.init = function () {
    setInterval(function() {
      moderateQueue.runValidated();
    }, validatedInterval);

    //Begin moderate ROUTE
    expressConfig.app.get('/moderate', function(req, res) {
        res.render('views/controler/moderate', {
          param: parameter.p,
          pending: moderateQueue.pendingQueue
        });
    });

    expressConfig.app.get('/moderate/like/:id', function(req, res) {
      var id = req.params.id;
      for (var i = 0; i < moderateQueue.pendingQueue.length; i++) {
        if (moderateQueue.pendingQueue[i].internalId == id) {
          moderateQueue.pendingQueue[i].validate_status = 'validated';
          moderateQueue.validatedQueue.push(moderateQueue.pendingQueue[i]); //Push to validated queue
          moderateQueue.pendingQueue.splice(i, 1); //Remove from pending queue
          logger.debug("[MODERATE] like " + id);
          break;
        }
        if (moderateQueue.pendingQueue.length == (i + 1)) {
          logger.error("[MODERATE] like do not find item with id " + id);
        }
      }
      res.contentType('text/html');
      res.send("Photo liked");
    });

    expressConfig.app.get('/moderate/dislike/:id', function(req, res) {
      var id = req.params.id;
      for (var i = 0; i < moderateQueue.pendingQueue.length; i++) {
        if (moderateQueue.pendingQueue[i].internalId == id) {
          moderateQueue.pendingQueue.splice(i, 1); //Remove from pending queue
          break;
        }
        if (moderateQueue.pendingQueue.length == (i + 1)) {
          logger.error("[MODERATE] dislake do not find item with id " + id);
        }
      }
      logger.debug("[MODERATE] dislike " + id);
      res.contentType('text/html');
      res.send("Photo disliked");
    });    
  }

  moderateQueue.pushMessage = function (message) {
    if (!parameter.p.needValidation) {
      message.validate_status = 'validated';
    }

    if (message.validate_status == 'pending') {
      logger.debug("[MODERATE] Push message to pending queue")
      moderateQueue.pendingQueue.push(message);
    } else if (message.validate_status == 'validated') {
      moderateQueue.validatedQueue.push(message);
    } else {
      logger.error("[MODERATE] Try to push message with invalid validate_status");
    }
  }

  moderateQueue.runValidated = function () {
    if (moderateQueue.validatedQueue.length > 0) {
      logger.debug("[MODERATE] Shift validated message");
      for (var i = 0; i < moderateQueue.validatedQueue.length; i++) {
        if (moderateQueue.validatedQueue[i].validate_status == 'validated') {
          var message = moderateQueue.validatedQueue[i];
          moderateQueue.validatedQueue.splice(i, 1);
          i--;
          render.pushMessage(message);
        }
      }
    }
  }

})(module.exports);
