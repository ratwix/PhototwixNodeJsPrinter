const parameter = require('../config/parameter-config');

(function (admin) {
  var logger = require("../config/logger-config");

  admin.init = function (app) { //Initialise de l'admin
    //BEGIN ADMIN ROUTE
    app.get('/admin', function(req, res) {
        res.render('views/controler/admin', { param: parameter.p });
    });

    //Save all change in form
    app.post('/admin/save', function(req, res) {
      logger.debug(JSON.stringify(req.body));
      parameter.p.twitterClient.account  = req.body.twitterAccount;
      parameter.p.twitterClient.tags = req.body.twitterTag;
      parameter.p.twitterClient.consumer_key = req.body.twitter_consumer_key;
      parameter.p.twitterClient.consumer_secret = req.body.twitter_consumer_secret;
      parameter.p.twitterClient.access_token_key = req.body.twitter_access_token_key;
      parameter.p.twitterClient.access_token_secret = req.body.twitter_access_token_secret;
      parameter.p.twitterClient.lastScanId = req.body.twitter_last_scan_id;
      parameter.p.needValidation = (req.body.needValidation === "true");
      parameter.serialize();
      res.contentType('text/html');
    	res.send("Parameter saved");
    });
    //END ROUTE
  };
})(module.exports);
