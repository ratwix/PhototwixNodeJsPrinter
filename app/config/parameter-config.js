var fs = require('fs');
var util = require('../util/util');


(function (parameterConfig) {
  var logger = require("./logger-config");

  parameterConfig.p = {}

  parameterConfig.sample = {
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
        messageTextActivated:false,
        messageTextColor:'#000000',
        messageTextFont:'Comic Sans MS',
        positions:{
          photos:[{xa:0,yb:0,xb:0,yb:0}],
          text:{xa:0,yb:0,xb:0,yb:0}
        }
      },
      onePhotoPortrait: {
        active:true,
        templateFile:'',
        messageTextActivated:false,
        messageTextColor:'#000000',
        messageTextFont:'Comic Sans MS',
        positions:{
          photos:[{xa:0,yb:0,xb:0,yb:0}],
          text:{xa:0,yb:0,xb:0,yb:0}
        }
      },
      twoPhotos: {
        active:true,
        templateFile:'',
        messageTextActivated:false,
        messageTextColor:'#000000',
        messageTextFont:'Comic Sans MS',
        positions:{
          photos:[{xa:0,yb:0,xb:0,yb:0},{xa:0,yb:0,xb:0,yb:0}],
          text:{xa:0,yb:0,xb:0,yb:0}
        }
      },
      threePhotos: {
        active:true,
        templateFile:'',
        messageTextActivated:false,
        messageTextColor:'#000000',
        messageTextFont:'Comic Sans MS',
        positions:{
          photos:[{xa:0,yb:0,xb:0,yb:0},{xa:0,yb:0,xb:0,yb:0},{xa:0,yb:0,xb:0,yb:0}],
          text:{xa:0,yb:0,xb:0,yb:0}
        }
      },
      fourPhotos: {
        active:true,
        templateFile:'',
        messageTextActivated:false,
        messageTextColor:'#000000',
        messageTextFont:'Comic Sans MS',        
        positions:{
          photos:[{xa:0,yb:0,xb:0,yb:0},{xa:0,yb:0,xb:0,yb:0},{xa:0,yb:0,xb:0,yb:0},{xa:0,yb:0,xb:0,yb:0}],
          text:{xa:0,yb:0,xb:0,yb:0}
        }
      }
    },
    photoScreen: {
      mediaType:'',
      mediaFile:''
    },
    printer : {
      active : true,
      currentPaper: 0,
      maxPrint : 0,
      currentNbPrint : 0
    },
    camera : {
      active : true,
      directPrint : true,
      ip : '',
      dcim : ''
    }
  };

  parameterConfig.serialize = function () {
    fs.writeFile(util.configFile, JSON.stringify(parameterConfig.p), function(err) {
        if (err) {
            return logger.error("[PARAMETER] Error writing config file " + err);
        }
        logger.info("[PARAMETER] Config serialized");
    });
  };

  parameterConfig.unserialize = function () {
    if (fs.existsSync(util.configFile)) {
      var data = fs.readFileSync(util.configFile);
      parameterConfig.p = JSON.parse(data);
      logger.info("Config unserialize");
    } else {
      parameterConfig.p = parameterConfig.sample;
      parameterConfig.serialize();
    }
  };
})(module.exports);
