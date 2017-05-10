const express = require('express');
const exphbs  = require('express-handlebars');
//const expressFormidable = require('express-formidable');
const util = require('../util/util');
const thumb = require('./express-thumbnail');
const session = require('express-session');
const timeout = require('connect-timeout');

const formidable = require('formidable');

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

  expressConfig.formidableMiddleware = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8',
    form.uploadDir = require('app-root-path') + '/upload',
    form.multiples = true // req.files to be arrays of files

    var files = {};
    var fields = {};
    form.on('field', function(field, value) {
        //logger.debug('[CONFIG EXP] formidable field ' + field + ":" + value);
        fields[field] = value;
    })
    form.on('file', function(name, file) {
        //logger.debug('[CONFIG EXP] formidable file ' + name + ":" + file.name);
        if (!Array.isArray(files[name])) {
          files[name] = [];
        }
        files[name].push(file);
    })
    form.on('end', function() {
        logger.debug('[CONFIG EXP] formidable done');
        req.files = {};
        req.fields = {};

        Object.assign(req.files, files);
        Object.assign(req.fields, fields);
        //Object.assign(req, { fields, files });
        logger.debug("[CONFIG EXP] " + "formidable end:" + JSON.stringify(req.fields) + " " + JSON.stringify(req.files));
        next();
    });
    form.on('error', function(err) {
      logger.error("[CONFIG EXP] Formidable error : " + err);
      next(err);
    });
    form.parse(req);
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

    expressConfig.app.use(timeout('25s'));

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


    expressConfig.app.use(expressConfig.formidableMiddleware);

    /*
    expressConfig.app.use(expressFormidable({
      encoding: 'utf-8',
      uploadDir: require('app-root-path') + '/upload',
      multiples: true // req.files to be arrays of files
    }));
    */
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
