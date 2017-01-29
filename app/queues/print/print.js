const logger = require("../../config/logger-config");
const util = require("../../util/util");
const spawn = require('child_process').spawn;
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
    var exe = spawn(util.printPath, ['duplicate:false', 'portrait:false', 'cutter:false', filePath]);

    exe.stderr.on('data', (data) => {
      logger.info(`[PRINT] Error printing printing ${filePath} ${data}`);
    });

    exe.on('close', (code) => {
      logger.info(`[PRINT] end of printing ${filePath}`);
    });
  }

  function printPortrait(filePath) {
    logger.info("[PRINT] print portrait:" + filePath);
    //gutenprint 5.2.12 auto rotate
    var exe = spawn(util.printPath, ['duplicate:false', 'portrait:false', 'cutter:false', filePath]);

    exe.stderr.on('data', (data) => {
      logger.info(`[PRINT] Error printing printing ${filePath} ${data}`);
    });

    exe.on('close', (code) => {
      logger.info(`[PRINT] end of printing ${filePath}`);
    });
  }

  function printCutter(filePath) {
    logger.info("[PRINT] print cutter:" + filePath);
    //gutenprint 5.2.12 auto rotate
    var exe = spawn(util.printPath, ['duplicate:true', 'portrait:false', 'cutter:true', filePath]);

    exe.stderr.on('data', (data) => {
      logger.info(`[PRINT] Error printing printing ${filePath} ${data}`);
    });

    exe.on('close', (code) => {
      logger.info(`[PRINT] end of printing ${filePath}`);
    });
  }

})(module.exports);
