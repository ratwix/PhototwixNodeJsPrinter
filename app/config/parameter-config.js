var fs = require('fs');
var configFile = require('app-root-path') + '/configjson/config.json';


(function (parameterConfig) {
  var logger = require("./logger-config");

  parameterConfig.p = {
    twitterClient : {
      twitter_active : true,
      consumer_key: '',
      consumer_secret: '',
      access_token_key: '',
      access_token_secret: '',
      tags : '',
      account : '',
      lastScanId : ''
    },
    needValidation : false,
    render : {
      onePhotoLandscape: {
        active:true,
        templateFile:'',
        positions:[
          {xa:0,yb:0,xb:0,yb:0,rotate:0}
        ]
      }
    }
  };

  parameterConfig.serialize = function () {
    fs.writeFile(configFile, JSON.stringify(parameterConfig.p), function(err) {
        if (err) {
            return logger.error("Error writing config file " + err);
        }
        logger.info("Config serialized");
    });
  };

  parameterConfig.unserialize = function () {
    var data = fs.readFileSync(configFile);
    parameterConfig.p = JSON.parse(data);
    logger.info("Config unserialize");
  };
})(module.exports);
