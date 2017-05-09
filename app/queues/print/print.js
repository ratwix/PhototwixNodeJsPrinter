const logger = require("../../config/logger-config");
const util = require("../../util/util");
const spawn = require('child_process').spawn;
const parameter = require('../../config/parameter-config');
const display = require('../display/display');
var sizeOf = require('image-size');

(function (printQueue) {
  var printInterval = 1000;

  printQueue.toPrintQueue = [];

  printQueue.init = function () {
    setInterval(function() {
      printQueue.runPrint();
    }, printInterval);
  }

  printQueue.pushMessage = function (message) {
    logger.debug("[PRINT] Push message to print queue:" + JSON.stringify(message, 2, null))
    printQueue.toPrintQueue.push(message);
    //TODO update print queue size
  }

  printQueue.runPrint = function () {
    //logger.debug("[PRINT] live queueSize:" + printQueue.toPrintQueue.length);

    if (parameter.p.printer.active) {
      if (parameter.p.printer.currentPaper <= 1) {
        display.showNoPaper();
        return;
      } else {
        display.hideNoPaper();
      }

      if (parameter.p.printer.maxPrint != 0) {
        if (parameter.p.currentNbPrint >= parameter.p.printer.maxPrint) {
          display.showNoPrint();
          return;
        } else {
          display.hideNoPrint();
        }
      }
    }

    if (printQueue.toPrintQueue.length > 0) {
      var message = printQueue.toPrintQueue.shift();
      if (parameter.p.printer.active && message.print) {
        logger.debug("[PRINT] Shift print message " + JSON.stringify(message, 2, null));
        print(util.resultPhotoPath + '/' + message.resultFile, message.nbPhotoPrint);
      } else {
        logger.debug("[PRINT] Printer not active for message or noprint " + JSON.stringify(message, 2, null));
      }
    }
  }

  function print(filePath, nb) {
    sizeOf(filePath, function (err, dimensions) {
      if (err) {
        logger.error("[PRINT] error getting size " + filePath);
      } else {
        //Update nb print
        parameter.p.currentNbPrint++;
        parameter.serialize();
        if (dimensions.width > dimensions.height) {
            printLandscape(filePath, nb);
        } else {
          if ((dimensions.width * 2) > dimensions.height) {
            printPortrait(filePath, nb);
          } else {
            printCutter(filePath, nb);
          }
        }
      }
    });
  }

  function printLandscape(filePath, nb) {
    logger.info("[PRINT] print landscape:" + filePath);
    var exe = spawn(util.printPath, ['duplicate:false', 'portrait:false', 'cutter:false', nb, filePath]);

    exe.stderr.on('data', (data) => {
      logger.info(`[PRINT] Error printing printing ${filePath} ${data}`);
    });

    exe.on('close', (code) => {
      logger.info(`[PRINT] end of printing ${filePath}`);
    });
  }

  function printPortrait(filePath, nb) {
    logger.info("[PRINT] print portrait:" + filePath);
    //gutenprint 5.2.12 auto rotate
    var exe = spawn(util.printPath, ['duplicate:false', 'portrait:false', 'cutter:false', nb, filePath]);

    exe.stderr.on('data', (data) => {
      logger.info(`[PRINT] Error printing printing ${filePath} ${data}`);
    });

    exe.on('close', (code) => {
      logger.info(`[PRINT] end of printing ${filePath}`);
    });
  }

  function printCutter(filePath, nb) {
    logger.info("[PRINT] print cutter:" + filePath);
    //gutenprint 5.2.12 auto rotate
    var exe = spawn(util.printPath, ['duplicate:true', 'portrait:false', 'cutter:true', nb, filePath]);

    exe.stderr.on('data', (data) => {
      logger.info(`[PRINT] Error printing printing ${filePath} ${data}`);
    });

    exe.on('close', (code) => {
      logger.info(`[PRINT] end of printing ${filePath}`);
    });
  }

})(module.exports);
