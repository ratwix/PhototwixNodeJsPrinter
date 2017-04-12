const fs = require("fs");
const http = require("http");
const request = require("request");
var mkdirp = require('mkdirp');
const logger = require("../config/logger-config");
const spawn = require('child_process').spawn;
const parameter = require('../config/parameter-config');

(function (util) {

  util.photosPath = require('app-root-path') + '/public/photos';
  util.singlePhotoPath = require('app-root-path') + '/public/photos/single';
  util.singleSocialPhotoPath = 'social';
  util.singleCameraPhotoPath = 'camera';
  util.singleCameraPiPhotoPath = 'camerapi';
  util.resultPhotoPath = require('app-root-path') + '/public/photos/result';
  util.deletedPhotoPath = require('app-root-path') + '/public/photos/deleted';
  util.thumbs = require('app-root-path') + '/public/photos/thumbs';
  util.templatePath = require('app-root-path') + '/public/templates';
  util.mediaPath = require('app-root-path') + '/public/medias';
  util.imgPath = require('app-root-path') + '/public/img';
  util.uploadPath = require('app-root-path') + '/upload';
  util.workingPath = require('app-root-path') + '/public/working';
  util.configFolder = require('app-root-path') + '/configjson';
  util.configFile =  util.configFolder + '/config.json';
  util.logPath = require('app-root-path') + '/logs';
  util.getPaperPath = require('app-root-path') + '/scripts/get_paper.sh';
  util.printPath = require('app-root-path') + '/scripts/print.sh';


  util.convertExe = /^win/.test(process.platform) ? "magick convert" : "convert"; //depending windows or linux Imagemagick binary
  util.openPar = /^win/.test(process.platform) ? "(" : "\\(";
  util.closePar = /^win/.test(process.platform) ? ")" : "\\)";

  util.downloadFile = (url, dest, callback) => {
    //Test if file already exists
    fs.exists(dest, (exists) => {
      if (exists) {
        logger.info(`[UTIL] File ${dest} already exists`);
        callback();
      } else {
        logger.info(`[UTIL] Downloading ${url} to ${dest}`);
        const file = fs.createWriteStream(dest);
        http.get(url, (response) => {
            response.pipe(file);
            file.on("finish", () => {
                file.close();
                callback();
            });
        }).on('error', function(err) { // Handle errors
          fs.unlink(dest); // Delete the file async. (But we don't check the result)
          if (callback) {
            callback(err.message);
          }
        });
      }
    });
  }

  util.createFolders = () => {
    mkdirp(util.logPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.logPath + ":" + err);}
    });
    mkdirp(util.configFolder, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.configFolder + ":" + err);}
    });
    mkdirp(util.singlePhotoPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.singlePhotoPath + ":" + err);}
    });
    mkdirp(util.singlePhotoPath + '/' + util.singleSocialPhotoPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.singlePhotoPath + '/' + util.singleSocialPhotoPath + ":" + err);}
    });
    mkdirp(util.singlePhotoPath + '/' + util.singleCameraPhotoPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.singlePhotoPath + '/' +util.singleCameraPhotoPath + ":" + err);}
    });
    mkdirp(util.singlePhotoPath + '/' + util.singleCameraPiPhotoPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.singlePhotoPath + '/' +util.singleCameraPiPhotoPath + ":" + err);}
    });
    mkdirp(util.resultPhotoPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.resultPhotoPath + ":" + err);}
    });
    mkdirp(util.deletedPhotoPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.deletedPhotoPath + ":" + err);}
    });
    mkdirp(util.thumbs, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.thumbs + ":" + err);}
    });
    mkdirp(util.templatePath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.templatePath + ":" + err);}
    });
    mkdirp(util.mediaPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.mediaPath + ":" + err);}
    });
    mkdirp(util.imgPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.imgPath + ":" + err);}
    });
    mkdirp(util.uploadPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.uploadPath + ":" + err);}
    });
    mkdirp(util.workingPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.workingPath + ":" + err);}
    });
  }

  util.updatePaperPrinter = () => {
    logger.info("[UTIL] Get paper");
    try {
      var exe = spawn(util.getPaperPath, []);

      exe.stdout.on('data', (data) => {
        logger.info(`[UTIL] Get paper result ${data}`);
        parameter.p.printer.currentPaper = parseInt(data);
      });

      exe.stderr.on('data', (data) => {
        logger.info(`[UTIL] Get paper error ${data}`);
      });

      exe.on('close', (code) => {
        logger.info(`[UTIL] eng get paper ${code}`);
      });
    } catch (err) {
      logger.error(`[UTIL] get paper error 2 ${err}`);
      parameter.p.printer.currentPaper = 0;
    }
  }
})(module.exports);
