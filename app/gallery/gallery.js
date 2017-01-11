const fs = require('fs');
const path = require('path');
const parameter = require('../config/parameter-config');
const expressConfig = require('../config/express-config');
const util = require('../util/util');
const logger = require("../config/logger-config");

(function (gallery) {


  gallery.init = function () { //Initialise de l'admin

    //BEGIN GALLERY ROUTE
    expressConfig.app.get('/gallery', function(req, res) {
        //Get all photos in result directory
        var photos = [];
        fs.readdir(util.resultPhotoPath, (err, files) => {
          files.forEach(file => {
            var ext = path.extname(file);
            if ((ext.toLowerCase() == ".jpg") || (ext.toLowerCase() == ".png")) {
              photos.push(file);
            }
          });
          res.render('views/controler/gallery', {
            param: parameter.p,
            photos: photos
          });
        })
    });

    //END ROUTE
  };
})(module.exports);
