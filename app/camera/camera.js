const parameter = require('../config/parameter-config');
const expressConfig = require('../config/express-config')
const path = require('path');
const util = require('../util/util');
const logger = require("../config/logger-config");
const photoMessage = require('../queues/message');
const render = require('../queues/render/render');
const fs = require('fs');

(function (camera) {
  var logger = require("../config/logger-config");

  camera.init = function () { //Initialise de l'admin

    //BEGIN ADMIN ROUTE
    expressConfig.app.get('/camera/getTemplates', function(req, res) {
      logger.debug("[CAMERA] gettemplate json");
      var resjson = {
        templates : []
      };

      if (parameter.p.render.onePhotoLandscape.active) {
        resjson.templates.push({
          nb: 1,
          templateUrl: '/templates/' + parameter.p.render.onePhotoLandscape.templateFile
        });
      }

      if (parameter.p.render.twoPhotos.active) {
        resjson.templates.push({
          nb: 2,
          templateUrl: '/templates/' + parameter.p.render.twoPhotos.templateFile
        });
      }

      if (parameter.p.render.threePhotos.active) {
        resjson.templates.push({
          nb: 3,
          templateUrl: '/templates/' + parameter.p.render.threePhotos.templateFile
        });
      }

      if (parameter.p.render.fourPhotos.active) {
        resjson.templates.push({
          nb: 4,
          templateUrl: '/templates/' + parameter.p.render.fourPhotos.templateFile
        });
      }

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(resjson, 2, null));
    });


    expressConfig.app.post('/camera/uploadPhotos', function(req, res) {
      logger.debug("[CAMERA] " + "Recieve photos:" + JSON.stringify(req.fields) + " " + JSON.stringify(req.files));
      if (req.files["images[]"]) {
        var message = new photoMessage();
        message.messageType = 'cameraRaspi';
        message.validate_status = 'validated';
        var images = req.files["images[]"];
        if (!Array.isArray(images)) {
          images = [images];
        }
        for (var i = 0; i < images.length; i++) {
          var img = images[i];
          fs.renameSync(img.path, util.singlePhotoPath + '/' +util.singleCameraPiPhotoPath + '/' + img.name);
          message.media_downloaded.push(util.singleCameraPiPhotoPath + '/' + img.name);
        }
        message.print = true;
        render.unshiftMessage(message);
      }
      res.send("");
    });

    //END ROUTE
  };
})(module.exports);
