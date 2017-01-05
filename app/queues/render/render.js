const logger = require("../../config/logger-config");

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

  renderQueue.render1Photos = function (message) {
    //TODO : test if landscape or portrait
    renderQueue.renderSingleLandscape(message);
  }

  renderQueue.renderSingleLandscape = function (message) {
    logger.debug("Render 1 photo landscape");
    canRender = true;
  }

  renderQueue.renderSinglePortrait = function (message) {
    logger.debug("Render 1 photo portrait");
    canRender = true;
  }

  renderQueue.render2Photos = function (message) {
    logger.debug("Render 2 photo");
    canRender = true;
  }

  renderQueue.render3Photos = function (message) {
    logger.debug("Render 3 photo");
    canRender = true;
  }

  renderQueue.render4Photos = function (message) {
    logger.debug("Render 4 photo");
    canRender = true;
  }

})(module.exports);
