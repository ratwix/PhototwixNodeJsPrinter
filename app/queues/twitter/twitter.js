const Twitter = require('twitter');
var parameter = require('../../config/parameter-config');
var twitterMessage = require ('../message');
const twitterInterval = 12500;
const twitterQueueNoDownloadedInterval = 500;
const async = require("async");
const util = require("../../util/util");
const logger = require("../../config/logger-config");
const moderate = require("../moderate/moderate");


(function (twitterQueue) {
  var canPopQueueNoDownloaded = true;
  var canPopQueueNoDownloadedTimeoutValue = 20000;
  var canPopQueueNoDownloadedTimeout;

  twitterQueue.queueNoDownloaded = []; //Queue with twitter message no downloded
  twitterQueue.client = '';

  /**
  * Init and connect twitter
  */

  twitterQueue.init = function () { //Initialise Twitter
    if (parameter.p.twitterClient.twitter_active) {
      logger.debug("[TWITTER] Init twitter");
      var twitterClient = new Twitter({
        consumer_key: parameter.p.twitterClient.consumer_key,
        consumer_secret: parameter.p.twitterClient.consumer_secret,
        access_token_key: parameter.p.twitterClient.access_token_key,
        access_token_secret: parameter.p.twitterClient.access_token_secret
      });
      twitterQueue.client = twitterClient;
      logger.debug("[TWITTER] Twitter initialise");

      setInterval(function() {
        twitterQueue.requestTwitter();
      }, twitterInterval);

      setInterval(function() {
        twitterQueue.scanTwitterNoDownloadedQueue();
      }, twitterQueueNoDownloadedInterval);
    } else {
      logger.info("[TWITTER] Twitter not activated");
    }

  };

  /**
  * Request twitter and create twitterMessage.
  * Put twitterMessage in the queueNoDownloaded
  */
  twitterQueue.requestTwitter = function () {
    logger.debug("[TWITTER] Scan twitter");
    var twitterQuery = {
      q: parameter.p.twitterClient.account + " " + parameter.p.twitterClient.tags + " filter:images"
    };
    if (parameter.p.twitterClient.lastScanId != '') {
      twitterQuery.since_id = parameter.p.twitterClient.lastScanId;
    }
    logger.debug("[TWITTER] " + JSON.stringify(twitterQuery));
    twitterQueue.client.get('search/tweets', twitterQuery, function(error, tweets, response) {
      if(error) {
        logger.error("[TWITTER] Twitter error:" + JSON.stringify(error));
        return;
      }
      for (var i = tweets.statuses.length - 1; i >= 0; i--) {
        var message = tweets.statuses[i];
        var t = new twitterMessage();
        t.messageType = 'twitter';
        t.id = message.id_str;
        if (t.id > parameter.p.twitterClient.lastScanId) {
          parameter.p.twitterClient.lastScanId = t.id;
        }
        t.text = message.text;
        t.userName = message.user.name;
        t.userScreenName = message.user.screen_name;
        t.userId = message.user.id;
        for (var j = 0; j < message.extended_entities.media.length; j++) {
          t.media_url.push(message.extended_entities.media[j].media_url);
        }
        //If do not need validation, auto validate message
        if (!parameter.needValidation) {
          t.validate_status = 'validated';
        } else {
          t.validate_status = 'pending';
        }
        twitterQueue.queueNoDownloaded.push(t);
        logger.info("[TWITTER] " + JSON.stringify(t, null, 2));
      }
    });
  }

  /**
  * Download all medias from each twitterMessage in queueNoDownloaded
  * Once all downloaded, queue in queue
  */
  twitterQueue.scanTwitterNoDownloadedQueue = function () {
    if (canPopQueueNoDownloaded) { //a download process is not already in progress
      if (twitterQueue.queueNoDownloaded.length > 0) {
          canPopQueueNoDownloaded = false;
          clearTimeout(canPopQueueNoDownloadedTimeout);
          canPopQueueNoDownloadedTimeout = setTimeout(function () {canPopQueueNoDownloaded = true;}, canPopQueueNoDownloadedTimeoutValue); //Timeout protection
          var tm = twitterQueue.queueNoDownloaded.shift(); //get twitter message
          logger.debug("[TWITTER] Download of twitter message :\n" + JSON.stringify(tm, null, 2) + "\n");
          //Download each file
          async.eachOf(
            tm.media_url,
            function (media_url, index, callback) {
              var urlSplit = media_url.split("/");
              var media_name = urlSplit[urlSplit.length -1];
              tm.media_downloaded[index] = util.singleSocialPhotoPath + '/' + media_name;
              util.downloadFile(media_url, util.singlePhotoPath + '/' + util.singleSocialPhotoPath + "/" + media_name, callback);
            },
            function (err) {
                if (err) {
                  logger.error("[TWITTER] Error downloading file " + JSON.stringify(err));
                } else {
                  logger.info("[TWITTER] All photos downloaded");
                  //Send message to moderateQueue
                  moderate.pushMessage(tm);
                }
                canPopQueueNoDownloaded = true;
                clearTimeout(canPopQueueNoDownloadedTimeout);
            }
          )
      }
    }
  }
})(module.exports);
