const fs = require("fs");
const http = require("http");
const request = require("request");
var mkdirp = require('mkdirp');
const logger = require("../config/logger-config");

(function (util) {

  util.singlePhotoPath = require('app-root-path') + '/public/photos/single';
  util.resultPhotoPath = require('app-root-path') + '/public/photos/result';
  util.deletedPhotoPath = require('app-root-path') + '/public/photos/deleted';
  util.thumbs = require('app-root-path') + '/public/photos/thumbs';
  util.templatePath = require('app-root-path') + '/public/templates';
  util.mediaPath = require('app-root-path') + '/public/medias';
  util.imgPath = require('app-root-path') + '/public/img';
  util.uploadPath = require('app-root-path') + '/upload';
  util.workingPath = require('app-root-path') + '/working';

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
    mkdirp(util.singlePhotoPath, function(err) {
      if (err) {logger.error('Unable to create dir ' + util.singlePhotoPath + ":" + err);}
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
})(module.exports);
