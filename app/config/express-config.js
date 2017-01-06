const exphbs  = require('express-handlebars');
const formidable = require('express-formidable');

(function (expressConfig) {

  var logger = require("./logger-config");

  var path = require('path');
  var expressValidator = require('express-validator');

  expressConfig.init = function (app, express) {

    //Set up handelbar
    app.engine('.hbs', exphbs({
      defaultLayout: 'main',
      extname: '.hbs',
      layoutsDir: path.join(__dirname, '../views/layouts'),
      partialsDir: path.join(__dirname, '../views/partials'),
    }))

    app.set('view engine', '.hbs')
    app.set('views', path.join(__dirname, '../'))

    //Enable GZip compression
    logger.debug("Enabling GZip compression.");
    var compression = require('compression');
    app.use(compression({
      threshold: 512
    }));

    logger.debug("Setting 'Public' folder with maxAge: 1 Day.");
    /*
    var publicFolder = path.dirname(module.parent.filename)  + "/public";
    var oneYear = 31557600000;
    app.use(express.static(publicFolder, { maxAge: oneYear }));
    */
    app.use(express.static('public'));

/*
    logger.debug("Setting parse urlencoded request bodies into req.body.");
    var bodyParser = require('body-parser');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
*/
    logger.debug("Set formidable");
    app.use(formidable({
      encoding: 'utf-8',
      uploadDir: require('app-root-path') + '/upload',
      multiples: true // req.files to be arrays of files
    }));

    logger.debug("Overriding 'Express' logger");
    app.use(require('morgan')("combined", { "stream": logger.stream }));
  };

})(module.exports);
