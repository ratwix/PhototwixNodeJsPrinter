const parameter = require('../config/parameter-config');
const expressConfig = require('../config/express-config')
const path = require('path');
const fs = require('fs');
const util = require('../util/util');
const display = require('../queues/display/display');

(function (admin) {
  var logger = require("../config/logger-config");

  admin.init = function () { //Initialise de l'admin

    //BEGIN ADMIN ROUTE
    expressConfig.app.get('/admin', function(req, res) {
        res.render('views/controler/admin', {
          param: parameter.p
        });
    });

    //Save all change in form
    expressConfig.app.post('/admin/save', function(req, res) {
      logger.debug("[ADMIN] " + JSON.stringify(req.fields));
      if (!parameter.p)
        parameter.p = {};

      if (!parameter.p.twitterClient)
        parameter.p.twitterClient = {};
      parameter.p.twitterClient.twitter_active = (req.fields.twitter_active === "true");
      parameter.p.twitterClient.account  = req.fields.twitterAccount;
      parameter.p.twitterClient.tags = req.fields.twitterTag;
      parameter.p.twitterClient.consumer_key = req.fields.twitter_consumer_key;
      parameter.p.twitterClient.consumer_secret = req.fields.twitter_consumer_secret;
      parameter.p.twitterClient.access_token_key = req.fields.twitter_access_token_key;
      parameter.p.twitterClient.access_token_secret = req.fields.twitter_access_token_secret;
      parameter.p.twitterClient.lastScanId = req.fields.twitter_last_scan_id;

      parameter.p.needValidation = (req.fields.needValidation === "true");

      if (!parameter.p.render)
        parameter.p.render = {};
      if (!parameter.p.render.onePhotoLandscape)
        parameter.p.render.onePhotoLandscape = {};
      parameter.p.render.onePhotoLandscape.active = (req.fields.onePhotoLandscapeActivated === "true");
      parameter.p.render.onePhotoLandscape.templateFile = req.fields.onePhotoLandscapeFilename;
      try {
          parameter.p.render.onePhotoLandscape.positions = JSON.parse(req.fields.onePhotoLandscapePositions);
      } catch (e) {
        res.send("ERROR: JSON 1 photo Landscape invalid");
      }


      if (!parameter.p.render.onePhotoPortrait)
        parameter.p.render.onePhotoPortrait = {};
      parameter.p.render.onePhotoPortrait.active = (req.fields.onePhotoPortraitActivated === "true");
      parameter.p.render.onePhotoPortrait.templateFile = req.fields.onePhotoPortraitFilename;
      try {
        parameter.p.render.onePhotoPortrait.positions = JSON.parse(req.fields.onePhotoPortraitPositions);
      } catch (e) {
        res.send("ERROR: JSON 1 photo Portrait invalid");
      }

      if (!parameter.p.render.twoPhotos)
        parameter.p.render.twoPhotos = {};
      parameter.p.render.twoPhotos.active = (req.fields.twoPhotosActivated === "true");
      parameter.p.render.twoPhotos.templateFile = req.fields.twoPhotosFilename;
      try {
        parameter.p.render.twoPhotos.positions = JSON.parse(req.fields.twoPhotosPositions);
      } catch (e) {
        res.send("ERROR: JSON 2 photos invalid");
      }

      if (!parameter.p.render.threePhotos)
        parameter.p.render.threePhotos = {};
      parameter.p.render.threePhotos.active = (req.fields.threePhotosActivated === "true");
      parameter.p.render.threePhotos.templateFile = req.fields.threePhotosFilename;
      try {
        parameter.p.render.threePhotos.positions = JSON.parse(req.fields.threePhotosPositions);
      } catch (e) {
        res.send("ERROR: JSON 3 photos invalid");
      }

      if (!parameter.p.render.fourPhotos)
        parameter.p.render.fourPhotos = {};
      parameter.p.render.fourPhotos.active = (req.fields.fourPhotosActivated === "true");
      parameter.p.render.fourPhotos.templateFile = req.fields.fourPhotosFilename;
      try {
        parameter.p.render.fourPhotos.positions = JSON.parse(req.fields.fourPhotosPositions);
      } catch (e) {
        res.send("ERROR: JSON 4 photos invalid");
      }

      if (!parameter.p.photoScreen)
        parameter.p.photoScreen = {};

      if ((parameter.p.photoScreen.mediaType != req.fields.screenMediaType) || (parameter.p.photoScreen.mediaFile != req.fields.screenMediaFilename)) { //New media file
        parameter.p.photoScreen.mediaType = req.fields.screenMediaType;
        parameter.p.photoScreen.mediaFile = req.fields.screenMediaFilename;
        if (req.fields.screenMediaType == 'video') {
          display.changeDisplayToVideo();
        }
        if (req.fields.screenMediaType == 'image') {
          display.changeDisplayToImage();
        }
      }

      parameter.p.photoScreen.mediaType = req.fields.screenMediaType;
      parameter.p.photoScreen.mediaFile = req.fields.screenMediaFilename;

      parameter.serialize();
      res.contentType('text/html');
    	res.send("Parameter saved");
    });
    //Template for fields
    expressConfig.app.post('/admin/uploadTemplate', function(req, res) {
      logger.debug("[ADMIN] " + "Receive new template:\n" + JSON.stringify(req.fields) + "\n\n" + JSON.stringify(req.files));
      if (req.files.uploads) {
        fs.rename(req.files.uploads.path,
                  util.templatePath + '/' + req.files.uploads.name,
                  function (err) {
                    if (err) throw err;
                    if (req.fields.templateType == 'oneLandscape') {
                      parameter.p.render.onePhotoLandscape.templateFile = req.files.uploads.name;
                    }
                    if (req.fields.templateType == 'onePortrait') {
                      parameter.p.render.onePhotoPortrait.templateFile = req.files.uploads.name;
                    }
                    if (req.fields.templateType == 'two') {
                      parameter.p.render.twoPhotos.templateFile = req.files.uploads.name;
                    }
                    if (req.fields.templateType == 'three') {
                      parameter.p.render.threePhotos.templateFile = req.files.uploads.name;
                    }
                    if (req.fields.templateType == 'four') {
                      parameter.p.render.fourPhotos.templateFile = req.files.uploads.name;
                    }
                    parameter.serialize();
                    res.send(req.files.uploads.name);
                  });
      }
    });

    expressConfig.app.post('/admin/uploadScreenMedia', function(req, res) {
      logger.debug("[ADMIN] " + "Recieve screen media file:" + JSON.stringify(req.fields) + '\n' + JSON.stringify(req.files));
      if (req.files.screenMediaFile) {
        fs.rename(req.files.screenMediaFile.path,
                  util.mediaPath + '/' + req.files.screenMediaFile.name, function (err) {
                    if (err) throw err;
                    //parameter.p.photoScreen.mediaFile = req.files.screenMediaFile.name;
                    parameter.serialize();
                    res.send(req.files.screenMediaFile.name);
                  });
      }
    });
    //END ROUTE
  };
})(module.exports);
