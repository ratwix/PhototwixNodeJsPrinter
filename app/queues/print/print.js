const logger = require("../../config/logger-config");
const util = require("../../util/util");
var sizeOf = require('image-size');

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
    sizeOf(filePath, function (err, dimensions) {
      if (err) {
        logger.error("[PRINT] error getting size " + filePath);
      } else {
        if (dimensions.width > dimensions.height) {
            printLandscape(filePath);
        } else {
          if ((dimensions.width * 2) > dimensions.height) {
            printPortrait(filePath);
          } else {
            printCutter(filePath);
          }
        }
      }
    });
  }

  function printLandscape(filePath) {
    logger.info("[PRINT] print landscape:" + filePath);
  }

  function printPortrait(filePath) {
    logger.info("[PRINT] print portrait:" + filePath);
  }

  function printCutter(filePath) {
    logger.info("[PRINT] print cutter:" + filePath);
  }

})(module.exports);
