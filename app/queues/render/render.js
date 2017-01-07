const logger = require("../../config/logger-config");
const param = require("../../config/parameter-config");
const util = require("../../util/util");
const display = require("../display/display");

var exec = require('child_process').exec;

const convertExe = "magick convert";
const identifyFormatExe = "magick identify -format \"%wx%h\"";

(function (renderQueue) {
  var renderInterval = 500;
  var canRender = true;

  renderQueue.toRenderQueue = []; //message to be rendered

  renderQueue.init = function () {
    setInterval(function() {
      renderQueue.runRender();
    }, renderInterval);
  }

  renderQueue.pushMessage = function (message) {
    renderQueue.toRenderQueue.push(message);
  }

  renderQueue.runRender = function () {
    if (canRender) {
      if (renderQueue.toRenderQueue.length > 0) {
        canRender = false;
        var message = renderQueue.toRenderQueue.shift();
        switch (message.media_downloaded.length) {
          case 0:
            logger.error("No photot to render on message " + JSON.stringify(message));
            break;
          case 1:
            renderQueue.render1Photos(message);
            break;
          case 2:
            renderQueue.render2Photos(message);
            break;
          case 3:
            renderQueue.render3Photos(message);
            break;
          case 4:
            renderQueue.render4Photos(message);
            break;
          default:
            logger.warn("Too many photos to render" + JSON.stringify(message));
            renderQueue.render4Photos(message);
        }
      }
    }
  }

  function getImageSize(image, callback) {
    var cmd = `${identifyFormatExe} "${image}"`;
    exec(cmd, function(err, stdout, stdedd) {
      if (err) {
        callback(err);
      } else {
        try {
          var photoWidth = parseInt(stdout.split("x")[0]);
          var photoHeight = parseInt(stdout.split("x")[1]);
          callback(null, photoWidth, photoHeight);
        } catch (err) {
          callback(err);
        }
      }
    })
  }

  function merge(message, positions, nbPhotos, templateFile, destFile, callback) {
    getImageSize(templateFile, function (err, templateWidth, templateHeight){
      if (err) {
        callback(err);
      } else {
        var cmd = `${convertExe} -size ${templateWidth}x${templateHeight} xc:black`;
        for (var i = 0; i < nbPhotos; i++) {
          var imageWidth = (positions.photos[i].xb - positions.photos[i].xa) * templateWidth / 100;
          var imageHeight = (positions.photos[i].yb - positions.photos[i].ya) * templateHeight / 100;
          var x = positions.photos[i].xa * templateWidth / 100;
          var y = positions.photos[i].ya * templateHeight / 100;
          cmd += ' ( "' + util.singlePhotoPath + '/' + message.media_downloaded[0] + '"' + ` -resize "${imageWidth}x${imageHeight}^" -gravity center -crop ${imageWidth}x${imageHeight}+0+0 ) -gravity NorthWest -geometry +${x}+${y} -composite`;
        }
        cmd += ` "${templateFile}" -composite "${destFile}"`;
        //TODO : Add text
        logger.debug('Merge CMD : ' + cmd);
        exec(cmd, function(err, stdout, stderr) {
          if (err) {
            callback(err + '\n' + stderr);
          } else {
            callback();
          }
        });
      }
    });
  }

  renderQueue.render1Photos = function (message, index) {
    var imageLocalUrl = util.singlePhotoPath + '/' + message.media_downloaded[0];

    getImageSize(imageLocalUrl, function (err, templateWidth, templateHeight) {
      if (err) {
        logger.error("Error get image size : " + err);
        canRender = true;
      } else {
        if (templateHeight < templateWidth) {
          renderQueue.renderSingleLandscape(message);
        } else {
          renderQueue.renderSinglePortrait(message);
        }
      }
    });
  }

  renderQueue.renderSingleLandscape = function (message) {
    if (param.p.render.onePhotoLandscape.active) {
      var cd = new Date();
      var destFile = `photo_${cd.getFullYear()}_${cd.getMonth() + 1}_${cd.getDate()}_${cd.getHours()}-${cd.getMinutes()}-${cd.getSeconds()}.jpg`;
      logger.debug("Render 1 photo landscape"); //Do waterfall crop + merge
      merge(message,
        param.p.render.onePhotoLandscape.positions,
        1,
        util.templatePath + '/' + param.p.render.onePhotoLandscape.templateFile,
        util.resultPhotoPath + '/' + destFile,
        function (err) {
          if (err) {
            logger.error("Error in convert merge : " + err);
          } else {
            logger.debug("Image " + destFile + " created");
            message.resultFile = destFile;
            display.pushMessage(message);
          }
          canRender = true;
        }
      );
    } else {
      if (param.p.render.onePhotoPortrait.active) {
        renderQueue.renderSinglePortrait(message);
      } else {
        logger.warn("Render 1 photo landscape not activated");
        canRender = true;
      }
    }
  }

  renderQueue.renderSinglePortrait = function (message) {
    if (param.p.render.onePhotoPortrait.active) {
      logger.debug("Render 1 photo portrait");
      canRender = true;
    } else {
      if (param.p.render.onePhotoLandscape.active) {
        renderQueue.renderSingleLandscape(message);
      } else { //If not active, generate the first photo only
        logger.warn("Render 1 photo portrait not activated");
        canRender = true;
      }
    }
  }

  renderQueue.render2Photos = function (message) {
    if (param.p.render.twoPhotos.active) {
      logger.debug("Render 2 photos");
      canRender = true;
    } else { //If not active, generate the first photo only
      renderQueue.render1Photos(message);
    }
  }

  renderQueue.render3Photos = function (message) {
    if (param.p.render.threePhotos.active) {
      logger.debug("Render 3 photos");
      canRender = true;
    } else { //If not active, generate the first photo only
      renderQueue.render1Photos(message);
    }
  }

  renderQueue.render4Photos = function (message) {
    if (param.p.render.fourPhotos.active) {
      logger.debug("Render 4 photos");
      canRender = true;
    } else { //If not active, generate the first photo only
      renderQueue.render1Photos(message);
    }
  }

})(module.exports);
