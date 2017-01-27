const InstagramAPI = require('instagram-api');
var parameter = require('../../config/parameter-config');
var message = require ('../message');
const twitterInterval = 12500;
const twitterQueueNoDownloadedInterval = 500;
const async = require("async");
const util = require("../../util/util");
const logger = require("../../config/logger-config");
const moderate = require("../moderate/moderate");

(function (instagramQueue) {
  var canPopQueueNoDownloaded = true;

  instagramQueue.queueNoDownloaded = [];
  instagramQueue.client = '';

  instagramQueue.access_token = '40613250.de78c90.da61a2d522424cfe9a93f5b426247793';

  /**
  * Init and connect instagram
  */

  instagramQueue.init = function () { //Initialise Twitter
    instagramQueue.client = new InstagramAPI(instagramQueue.access_token);
    logger.info('[INSTAGRAM] Instagram connected');

    instagramQueue.client.userSelf().then(function(result) {
        logger.debug(result.data); // user info
        logger.debug(result.limit); // api limit
        logger.debug(result.remaining) // api request remaining
    }, function(err){
        logger.error(err); // error info
    });

    instagramQueue.client.getMediasByTag('test').then(function(result) {
        logger.debug(result.data); // user info
        logger.debug(result.limit); // api limit
        logger.debug(result.remaining) // api request remaining
    }, function(err){
        logger.error(err); // error info
    });
  };
})(module.exports);
