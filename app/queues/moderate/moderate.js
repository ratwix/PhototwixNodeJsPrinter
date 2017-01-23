const logger = require("../../config/logger-config");
const render = require("../render/render");

(function (moderateQueue) {
  var validatedInterval = 500;

  moderateQueue.pendingQueue = [];
  moderateQueue.validatedQueue = [];
  moderateQueue.rejectedQueue = [];

  moderateQueue.init = function () {
    setInterval(function() {
      moderateQueue.runValidated();
    }, validatedInterval);
  }

  moderateQueue.pushMessage = function (message) {
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
      for (var i = 0; i < validatedQueue.length; i++) {
        if (validatedQueue[i].validate_status == 'validated') {
          var message = validatedQueue[i];
          validatedQueue.splice(i, 1);
          i--;
          render.pushMessage(message);
        }
      }
    }
  }

})(module.exports);
