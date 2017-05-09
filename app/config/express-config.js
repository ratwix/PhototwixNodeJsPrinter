const express = require('express');
const exphbs  = require('express-handlebars');
const formidable = require('express-formidable');
const util = require('../util/util');
const thumb = require('./express-thumbnail');
const session = require('express-session');
const timeout = require('connect-timeout');

(function (expressConfig) {

  var logger = require("./logger-config");

  var path = require('path');
  var expressValidator = require('express-validator');

  expressConfig.io = {};
  expressConfig.app = express();
  expressConfig.server = {};
  expressConfig.host = '';
  expressConfig.port = 3000;

  expressConfig.haltOnTimedout = function (req, res, next) {
    if (!req.timedout) {
      next()
    } else {
      logger.error("[CONFIG EXP] Timeout ! Restart");
      expressConfig.server.close();
      //Timeout : restart node
    }
  }

  expressConfig.init = function () {

    //Set up handelbar
    expressConfig.app.engine('.hbs', exphbs({
      defaultLayout: 'main',
      extname: '.hbs',
      layoutsDir: path.join(__dirname, '../views/layouts'),
      partialsDir: path.join(__dirname, '../views/partials'),
      helpers: {
          jsonLinear: function (data) { return JSON.stringify(data); },
          json: function (data) { return JSON.stringify(data, null, 2); },
          eq: function (a, b) {return a == b},
          ifCond: function (v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '&&!':
                    return (v1 && !v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        }
      }
    }))

    expressConfig.app.set('view engine', '.hbs')
    expressConfig.app.set('views', path.join(__dirname, '../'))

    expressConfig.app.use(timeout('20s'));

    //BUG in thumbnail ?

    expressConfig.app.use(thumb.register(
      require('app-root-path') + '/public',
      util.thumbs
    ));

    expressConfig.app.use(expressConfig.haltOnTimedout);

    //Enable GZip compression
    /*
    logger.debug("[CONFIG EXP] Enabling GZip compression.");
    var compression = require('compression');
    expressConfig.app.use(compression({
      threshold: 512
    }));
*/

    logger.debug("[CONFIG EXP] Setting 'Public' folder with maxAge: 1 Day.");
    /*
    var publicFolder = path.dirname(module.parent.filename)  + "/public";
    var oneYear = 31557600000;
    app.use(express.static(publicFolder, { maxAge: oneYear }));
    */
    expressConfig.app.use(express.static('public'));
    expressConfig.app.use(expressConfig.haltOnTimedout);
/*
    logger.debug("Setting parse urlencoded request bodies into req.body.");
    var bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
*/
    logger.debug("[CONFIG EXP] Set formidable");
    expressConfig.app.use(formidable({
      encoding: 'utf-8',
      uploadDir: require('app-root-path') + '/upload',
      multiples: true // req.files to be arrays of files
    }));

    expressConfig.app.use(expressConfig.haltOnTimedout);

    logger.debug("[CONFIG EXP] Overriding 'Express' logger");
    expressConfig.app.use(require('morgan')("combined", { "stream": logger.stream }));

    expressConfig.app.use(expressConfig.haltOnTimedout);
    //expressConfig.app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

    //Main route definition
    expressConfig.app.get('/', (request, response) => {
      response.render('views/mainscreen/mainscreen', {
      });
    })
  };

  expressConfig.setTimeoutAlert = function() {
    expressConfig.app.use(expressConfig.haltOnTimedout);
  }

  expressConfig.connect = function() {
    expressConfig.app.use(expressConfig.haltOnTimedout);
    expressConfig.server = expressConfig.app.listen(expressConfig.port);
    expressConfig.host = expressConfig.server.address().address;
    expressConfig.io = require('socket.io').listen(expressConfig.server);
    logger.info('[CONFIG EXP] Phototwix app listening with io at http://%s:%s', expressConfig.host, expressConfig.port);
  }

})(module.exports);
