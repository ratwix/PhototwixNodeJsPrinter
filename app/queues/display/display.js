const logger = require("../../config/logger-config");
const parameter = require('../../config/parameter-config');

(function (displayQueue) {
  var validatedInterval = 500;

  displayQueue.pendingDisplayQueue = [];

  displayQueue.init = function (app) {
    //BEGIN PHOTO SCREEN ROUTE
    app.get('/photoScreen', function(req, res) {
        res.render('views/controler/screen', {
          param: parameter.p,
          helpers: {
              json: function (data) { return JSON.stringify(data, null, 2); }
          }
        });
    });

  }

  displayQueue.pushMessage = function (message) {
    displayQueue.pendingDisplayQueue.push(message);
  }
})(module.exports);
