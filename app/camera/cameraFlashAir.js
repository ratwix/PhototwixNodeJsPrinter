const parameter = require('../config/parameter-config');
const expressConfig = require('../config/express-config')
const path = require('path');
const photoMessage = require('../queues/message');
const render = require('../queues/render/render');
const moderate = require("../queues/moderate/moderate");
const fs = require('fs');
const http = require('http');
const async = require("async");
const util = require('../util/util');
const gallery = require('../gallery/gallery')

const cameraFlashAirInterval = 4000;
const queueNoDownloadedInterval = 500;
/**
  * FlashAIr camera
  */


(function (cameraFlashAir) {
  var logger = require("../config/logger-config");

  var canPopQueueNoDownloaded = true;

  cameraFlashAir.photosDone = [];
  cameraFlashAir.queueNoDownloaded = [];

  cameraFlashAir.init = function () {

    setInterval(function() {
      cameraFlashAir.getNewContent();
    }, cameraFlashAirInterval);

    setInterval(function() {
      cameraFlashAir.scanCameraNoDownloadedQueue();
    }, queueNoDownloadedInterval);
  };

  cameraFlashAir.getNewContent = function () {
    if (parameter.p.camera.active) {
      var newContentAddress = "http://" + parameter.p.camera.ip + "/command.cgi?op=102";
      //logger.debug('[CAMERA T] Get New Content on ' + newContentAddress);

      http.get({
        hostname: parameter.p.camera.ip,
        port: 80,
        path: '/command.cgi?op=102',
        agent: false  // create a new agent just for this one request
      }, (res) => {
        var body = '';
        res.on('data', function(data){
          body += data;
        });
        res.on('end', function() {
          if (body == "0") {
            //logger.debug('[CAMERA T] no update');
            if (cameraFlashAir.photosDone.length == 0) { //First update. Update photoDone without render
              cameraFlashAir.updateFileList(false);
            }
          }
          if (body == "1") { //New file, update photosDone and render
            logger.debug('[CAMERA T] update');
            if (cameraFlashAir.photosDone.length == 0) { //First update. Update photoDone without render. Lost first update
              cameraFlashAir.updateFileList(false);
            }
            cameraFlashAir.updateFileList(true);
          }
        });
      })
      .on('error', function(e) {
        //logger.debug("[CAMERA T] unable to get camera " + e.message);
      });
    }
  }

  cameraFlashAir.updateFileList = function (render) {
    http.get({
      hostname: parameter.p.camera.ip,
      port: 80,
      path: '/command.cgi?op=100&DIR=' + parameter.p.camera.dcim,
      agent: false
    }, (res) => {
        var body = '';
        res.on('data', function(data){
          body += data;
        });
        res.on('end', function() {
          var files = body.split(/\r|\n/);
          for (var i = 0; i < files.length; i++) {
            var file = files[i].split(',')[1];
            if (cameraFlashAir.photosDone.indexOf(file) < 0) { //File not in the array
              cameraFlashAir.photosDone.push(file);
              if (render) {
                logger.info("[CAMERA T] new file " + file);
                var m = new photoMessage(); //Create a new message and push it to noDownloaded queue
                m.messageType = 'cameraFlashAir';
                m.validate_status = 'validated';
                m.media_url.push("http://" + parameter.p.camera.ip + parameter.p.camera.dcim + "/" + file);
                cameraFlashAir.queueNoDownloaded.push(m);
              } else {
                logger.info("[CAMERA T] init file " + file);
              }
            }
          }
        });
    })
    .on('error', function(e) {
      logger.info("[CAMERA T] unable to get camera file list" + e.message);
    });
  }

  cameraFlashAir.scanCameraNoDownloadedQueue = function () {
    if (canPopQueueNoDownloaded) {
      if (cameraFlashAir.queueNoDownloaded.length > 0) {
        canPopQueueNoDownloaded = false;
        var m = cameraFlashAir.queueNoDownloaded.shift();
        logger.debug('[CAMERA T] Download of camera message :\n' + JSON.stringify(m, null, 2));
        //Download each file
        async.eachOf(
          m.media_url,
          function (media_url, index, callback) {
            var urlSplit = media_url.split("/");
            var media_name = urlSplit[urlSplit.length -1];
            m.media_downloaded[index] = util.singleCameraPhotoPath + '/' + media_name;
            util.downloadFile(media_url, util.singlePhotoPath + '/' + util.singleCameraPhotoPath + "/" + media_name, callback);
          },
          function (err) {
              if (err) {
                logger.error("[CAMERA T] Error downloading file " + JSON.stringify(err));
              } else {
                logger.info("[CAMERA T] All photos downloaded");
                //Send message to moderateQueue
                if (parameter.p.camera.directPrint) {
                  moderate.pushMessage(m); //Push the message to the moderate queue for rendering
                } else {
                  m.print = false; //Push the message to gallery
                  //moderate.pushMessage(m);
                  gallery.addCameraPhoto(m);
                }
                //moderate.pushMessage(m);
              }
              canPopQueueNoDownloaded = true;
          }
        )
      }
    }
  }

})(module.exports);
