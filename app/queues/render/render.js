const logger = require("../../config/logger-config");
const param = require("../../config/parameter-config")
const util = require("../../util/util")
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

  renderQueue.render1Photos = function (message, index) {
    var imageLocalUrl = message.media_downloaded[0];
    //Identify is the image is landscape or Portrait
    var cmd = identifyFormatExe + ' ' + util.singlePhotoPath + '/' + imageLocalUrl;
    exec(cmd, function(err, stdout, stderr) {
      if (err) {
        logger.error("Error in identify : " + err);
        canRender = true;
      }
      try {
        var templateWidth = parseInt(stdout.split("x")[0]);
        var templateHeight = parseInt(stdout.split("x")[1]);
        if (templateHeight < templateWidth) {
          renderQueue.renderSingleLandscape(message, templateWidth, templateHeight);
        } else {
          renderQueue.renderSinglePortrait(message, templateWidth, templateHeight);
        }
      } catch (err) {
        logger.error("Error parsing image size : " + err);
        canRender = true;
      }
    });
  }

  //Calcul photo size and crop it to file
  function crop(templateWidth, templateHeight, position, srcPath, destPath, callback) {
    var imageWidth = (position.xb - position.xa) * templateWidth / 100;
    var imageHeight = (position.yb - position.ya) * templateHeight / 100;

    var cmd = convertExe + ' ' + srcPath + ' -resize ' + imageWidth + 'x' + imageHeight + '^ -gravity center -crop ' + imageWidth + 'x' + imageHeight + '+0+0 ' + destPath;
    logger.debug('Resize CMD : ' + cmd);
    exec(cmd, function(err, stdout, stderr) {
      if (err) {
        logger.error("Error in convert resize : " + err);
        callback();
      }
      logger.debug("Image " + destPath + " resized");
      callback();
    });

  }

  renderQueue.renderSingleLandscape = function (message, templateWidth, templateHeight) {
    if (param.p.render.onePhotoLandscape.active) {
      logger.debug("Render 1 photo landscape");
      crop(templateWidth,
        templateHeight,
        param.p.render.onePhotoLandscape.positions.photos[0],
        util.singlePhotoPath + '/' + message.media_downloaded[0],
        util.workingdir + '/' + 'tmp1.jpg',
        function () {
          canRender = true;
        }
      );
    } else {
      if (param.p.render.onePhotoPortrait.active) {
        renderSinglePortrait(message);
      } else {
        logger.warn("Render 1 photo landscape not activated");
        canRender = true;
      }
    }
  }

  renderQueue.renderSinglePortrait = function (message, widthTemplate, heightTemplate) {
    if (param.p.render.onePhotoPortrait.active) {
      logger.debug("Render 1 photo landscape");
      canRender = true;
    } else {
      if (param.p.render.onePhotoLandscape.active) {
        renderSingleLandscape(message);
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
