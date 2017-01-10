const logger = require("../../config/logger-config");
const util = require("../../util/util");

(function (printQueue) {
  var printInterval = 500;

  printQueue.toPrintQueue = [];

  printQueue.init = function () {
    setInterval(function() {
      printQueue.runPrint();
    }, printInterval);
  }

  printQueue.pushMessage = function (message) {
    logger.debug("[PRINT] Push message to print queue:" + JSON.stringify(message, 2, null))
    printQueue.toPrintQueue.push(message);
  }

  printQueue.runPrint = function () {
    if (printQueue.toPrintQueue.length > 0) {

      var message = printQueue.toPrintQueue.shift();
      logger.debug("[PRINT] Shift print message " + JSON.stringify(message, 2, null));
      print(util.resultPhotoPath + '/' + message.resultFile);
    }
  }

  function print(filePath) {
    logger.info("[PRINT] file " + filePath);
  }

})(module.exports);
