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
      logger.debug("Push message to pending queue")
      moderateQueue.pendingQueue.push(message);
    } else if (message.validate_status == 'validated') {
      moderateQueue.validatedQueue.push(message);
    } else {
      logger.error("Try to push message with invalid validate_status");
    }
  }

  moderateQueue.runValidated = function () {
    if (moderateQueue.validatedQueue.length > 0) {
      logger.debug("Shift validated message");
      var message = moderateQueue.validatedQueue.shift();
      render.pushMessage(message);
    }

  }

})(module.exports);
