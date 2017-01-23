const fs = require('fs');
const path = require('path');
const parameter = require('../config/parameter-config');
const expressConfig = require('../config/express-config');
const util = require('../util/util');
const logger = require("../config/logger-config");
const display = require('../queues/display/display');
const render = require('../queues/render/render');
var photoMessage = require ('../queues/message'); //TODO: inherite message

(function (gallery) {


  gallery.init = function () { //Initialise de l'admin
    //BEGIN GALLERY ROUTE
    expressConfig.app.get('/gallery', function(req, res) {
        //Get all photos in result directory
        var photos = [];
        var camera = [];
        var files = [];

        files = fs.readdirSync(util.resultPhotoPath);
        files.forEach(file => {
          var ext = path.extname(file);
          if ((ext.toLowerCase() == ".jpg") || (ext.toLowerCase() == ".png")) {
            photos.push(file);
          }
        });
        if (parameter.p.eyefi.active && !parameter.p.eyefi.directPrint) {
          files = fs.readdirSync(util.singlePhotoPath + '/' + util.singleCameraPhotoPath);
          files.forEach(file => {
            var ext = path.extname(file);
            if ((ext.toLowerCase() == ".jpg") || (ext.toLowerCase() == ".png")) {
              camera.push(file);
            }
          });
        }
        res.render('views/controler/gallery', {
          param: parameter.p,
          photos: photos,
          camera: camera,
          param: parameter.p
        });
      });

    expressConfig.app.post('/gallery/printPhoto', function(req, res) {
        //Send photo to display queue (who will send it to print queue)
        logger.debug(`[GALLERY] get print message : ${JSON.stringify(req.fields, 2, null)}`);
        var photo = req.fields.photo;
        var message = new photoMessage();
        message.messageType = 'printGallery';
        message.validate_status = 'validated';
        message.resultFile = photo;
        message.print = true;
        display.unshiftMessage(message);
        res.contentType('text/html');
        res.send("Photo send to print");
    });

    expressConfig.app.post('/gallery/printCamera', function(req, res) {
        //Send photo to display queue (who will send it to print queue)
        logger.debug(`[GALLERY] get print camera message : ${JSON.stringify(req.fields['photos[]'], 2, null)}`);
        var photos = req.fields['photos[]'];
        if (!Array.isArray(photos)) {
          photos = [photos];
        }
        var message = new photoMessage();
        message.messageType = 'camera';
        message.validate_status = 'validated';
        message.media_downloaded = photos;
        message.print = true;
        render.unshiftMessage(message);
        res.contentType('text/html');
        res.send("Photo send to render");
    });

    expressConfig.app.post('/gallery/viewPhoto', function(req, res) {
        //Send photo to display queue (who will not send it to print queue)
        logger.debug(`[GALLERY] get view message : ${JSON.stringify(req.fields, 2, null)}`);
        var photo = req.fields.photo;
        var message = new photoMessage();
        message.messageType = 'view';
        message.validate_status = 'validated';
        message.resultFile = photo;
        message.print = false;
        display.unshiftMessage(message);
        res.contentType('text/html');
        res.send("Photo send to print for view");
    });

    expressConfig.app.post('/gallery/deletePhoto', function(req, res) {
        //Move the file to deleted folder
        logger.debug(`[GALLERY] get move photo : ${JSON.stringify(req.fields, 2, null)}`);
        var photo = req.fields.photo;
        fs.rename(util.resultPhotoPath + '/' + photo, util.deletedPhotoPath + '/' + photo, function(err) {
          if (err) {logger.error("[GALLERY] error delete file:" + photo);}
          res.contentType('text/html');
          res.send("Photo " + photo + " moved");
        });
    });
    //END ROUTE

    gallery.socket = expressConfig.io
      .of('/gallery')
      .on('connection', function (socket) {
        logger.debug('[GALLERY] JE SUIS CONNECTE');
    });
  };

  //Add a new message to the gallery
  gallery.addPhoto = function(message) {
    logger.debug("[GALLERY] push photo to gallery");
    gallery.socket.emit('addPhoto', message.resultFile);
  }
})(module.exports);
