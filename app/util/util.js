const fs = require("fs");
const http = require("http");
const request = require("request");
const logger = require("../config/logger-config");

(function (util) {

  util.singlePhotoPath = require('app-root-path') + '/public/photos/single';
  util.templatePath = require('app-root-path') + '/public/templates';
  util.workingdir = require('app-root-path') + '/workingdir';

  util.downloadFile = (url, dest, callback) => {
    //Test if file already exists
    fs.exists(dest, (exists) => {
      if (exists) {
        logger.info(`File ${dest} already exists`);
        callback();
      } else {
        logger.info(`Downloading ${url} to ${dest}`);
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
})(module.exports);
