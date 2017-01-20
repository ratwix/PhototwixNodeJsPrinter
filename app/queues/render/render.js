const logger = require("../../config/logger-config");
const param = require("../../config/parameter-config");
const util = require("../../util/util");
const display = require("../display/display");
const gallery = require("../../gallery/gallery");
const sizeOf = require('image-size');

var exec = require('child_process').exec;



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

  renderQueue.unshiftMessage = function (message) {
    logger.debug("[RENDER] Push New message FIRST");
    renderQueue.toRenderQueue.unshift(message);
  }

  renderQueue.runRender = function () {
    if (canRender) {
      if (renderQueue.toRenderQueue.length > 0) {
        canRender = false;
        var message = renderQueue.toRenderQueue.shift();
        switch (message.media_downloaded.length) {
          case 0:
            logger.error("[RENDER] No photos to render on message " + JSON.stringify(message));
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
            logger.warn("[RENDER] Too many photos to render" + JSON.stringify(message));
            renderQueue.render4Photos(message);
        }
      }
    }
  }

  function generateFileName() {
    var cd = new Date();
    return `photo_${cd.getFullYear()}_${cd.getMonth() + 1}_${cd.getDate()}_${cd.getHours()}-${cd.getMinutes()}-${cd.getSeconds()}-${Math.floor((Math.random() * 10000) + 1)}.jpg`;
  }

  function merge(message, positions, nbPhotos, templateFile, destFile, callback) {
    sizeOf(templateFile, function (err, dimensions){
      if (err) {
        callback(err);
      } else {
        var cmd = `${util.convertExe} -size ${dimensions.width}x${dimensions.height} xc:black`;
        for (var i = 0; i < nbPhotos; i++) {
          var imageWidth = (positions.photos[i].xb - positions.photos[i].xa) * dimensions.width / 100;
          var imageHeight = (positions.photos[i].yb - positions.photos[i].ya) * dimensions.height / 100;
          var x = positions.photos[i].xa * dimensions.width / 100;
          var y = positions.photos[i].ya * dimensions.height / 100;
          cmd += ' ( "' + util.singlePhotoPath + '/' + message.media_downloaded[i] + '"' + ` -resize "${imageWidth}x${imageHeight}^" -gravity center -crop ${imageWidth}x${imageHeight}+0+0 ) -gravity NorthWest -geometry +${x}+${y} -composite`;
        }
        cmd += ` "${templateFile}" -composite "${destFile}"`;
        //TODO : Add text
        logger.debug('[RENDER] Merge CMD : ' + cmd);
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

    sizeOf(imageLocalUrl, function (err, dimensions) {
      if (err) {
        logger.error("[RENDER] Error get image size : " + err);
        canRender = true;
      } else {
        if (dimensions.height < dimensions.width) {
          renderQueue.renderSingleLandscape(message);
        } else {
          renderQueue.renderSinglePortrait(message);
        }
      }
    });
  }

  renderQueue.renderSingleLandscape = function (message) {
    if (param.p.render.onePhotoLandscape.active) {
      var destFile = generateFileName();
      logger.debug("[RENDER] Render 1 photo landscape"); //Do waterfall crop + merge
      merge(message,
        param.p.render.onePhotoLandscape.positions,
        1,
        util.templatePath + '/' + param.p.render.onePhotoLandscape.templateFile,
        util.resultPhotoPath + '/' + destFile,
        function (err) {
          if (err) {
            logger.error("[RENDER] Error in convert merge : " + err);
          } else {
            logger.debug("[RENDER] Image " + destFile + " created");
            message.resultFile = destFile;
            endProcess(message);
          }
          canRender = true;
        }
      );
    } else {
      if (param.p.render.onePhotoPortrait.active) {
        renderQueue.renderSinglePortrait(message);
      } else {
        logger.warn("[RENDER] Render 1 photo landscape not activated");
        canRender = true;
      }
    }
  }

  renderQueue.renderSinglePortrait = function (message) {
    if (param.p.render.onePhotoPortrait.active) {
      var destFile = generateFileName();
      logger.debug("[RENDER] Render 1 photo portrait"); //Do waterfall crop + merge
      merge(message,
        param.p.render.onePhotoPortrait.positions,
        1,
        util.templatePath + '/' + param.p.render.onePhotoPortrait.templateFile,
        util.resultPhotoPath + '/' + destFile,
        function (err) {
          if (err) {
            logger.error("[RENDER] Error in convert merge : " + err);
          } else {
            logger.debug("[RENDER] Image " + destFile + " created");
            message.resultFile = destFile;
            endProcess(message);
          }
          canRender = true;
        }
      );
    } else {
      if (param.p.render.onePhotoLandscape.active) {
        renderQueue.renderSingleLandscape(message);
      } else { //If not active, generate the first photo only
        logger.warn("[RENDER] Render 1 photo portrait not activated");
        canRender = true;
      }
    }
  }

  renderQueue.render2Photos = function (message) {
    if (param.p.render.twoPhotos.active) {
      var destFile = generateFileName();
      logger.debug("[RENDER] Render 2 photos"); //Do waterfall crop + merge
      merge(message,
        param.p.render.twoPhotos.positions,
        2,
        util.templatePath + '/' + param.p.render.twoPhotos.templateFile,
        util.resultPhotoPath + '/' + destFile,
        function (err) {
          if (err) {
            logger.error("[RENDER] Error in convert merge : " + err);
          } else {
            logger.debug("[RENDER] Image " + destFile + " created");
            message.resultFile = destFile;
            endProcess(message);
          }
          canRender = true;
        }
      );
    } else { //If not active, generate the first photo only
      renderQueue.render1Photos(message);
    }
  }

  renderQueue.render3Photos = function (message) {
    if (param.p.render.threePhotos.active) {
      var destFile = generateFileName();
      logger.debug("[RENDER] Render 3 photos");
      merge(message,
        param.p.render.threePhotos.positions,
        3,
        util.templatePath + '/' + param.p.render.threePhotos.templateFile,
        util.resultPhotoPath + '/' + destFile,
        function (err) {
          if (err) {
            logger.error("[RENDER] Error in convert merge : " + err);
          } else {
            logger.debug("[RENDER] Image " + destFile + " created");
            message.resultFile = destFile;
            endProcess(message);
          }
          canRender = true;
        }
      );
    } else { //If not active, generate the first photo only
      renderQueue.render1Photos(message);
    }
  }

  renderQueue.render4Photos = function (message) {
    if (param.p.render.fourPhotos.active) {
      var destFile = generateFileName();
      logger.debug("[RENDER] Render 4 photos"); //Do waterfall crop + merge
      merge(message,
        param.p.render.fourPhotos.positions,
        4,
        util.templatePath + '/' + param.p.render.fourPhotos.templateFile,
        util.resultPhotoPath + '/' + destFile,
        function (err) {
          if (err) {
            logger.error("[RENDER] Error in convert merge : " + err);
          } else {
            logger.debug("[RENDER] Image " + destFile + " created");
            message.resultFile = destFile;
            endProcess(message);
          }
          canRender = true;
        }
      );
    } else { //If not active, generate the first photo only
      renderQueue.render1Photos(message);
    }
  }

  function endProcess(message) {
    display.pushMessage(message);
    gallery.addPhoto(message);
  }

})(module.exports);
