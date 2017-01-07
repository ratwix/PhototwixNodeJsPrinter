const logger = require("../../config/logger-config");

(function (displayQueue) {
  var validatedInterval = 500;

  displayQueue.pendingDisplayQueue = [];

  displayQueue.init = function () {
    //Route + socket.io for message
  }

  displayQueue.pushMessage = function (message) {
    displayQueue.pendingDisplayQueue.push(message);
  }
})(module.exports);
