const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const logger = require('./logger-config');
const util = require('../util/util');
var exec = require('child_process').exec;

/**
* Return a live thumbnail if the the height parameter is set
*/

function register(publicDir, thumbDir) {

  publicDir = path.normalize(publicDir);
  thumbDir = path.normalize(thumbDir)

  return function (req, res, next) {
    var fileurl = decodeURI(req.url.replace(/\?(.*)/, ''));
    var filepath = path.join(publicDir, fileurl);
    var filename = path.basename(filepath);
    var fileCachePath = path.join(thumbDir, filename);
    var fileext = path.extname(filepath);

    var height = req.query.height || '';
    var width = req.query.width || '';

    if ((height != '' || width != '') && (fileext == '.png' || fileext == '.jpg' || fileext == '.jpeg'))  {
        fs.stat(filepath, function (err, stats) { //Do nothing if exist
          if (err || !stats.isFile()) { return next(); }
          if (height == '' && width == '') { return next(); }
          fs.exists(fileCachePath, (exists) => {
            if (exists) { //File already in cache
              logger.debug('[THUMBNAIL] ' + filename + ' already in cache ');
              return res.sendFile(fileCachePath);
            }
            logger.debug('[THUMBNAIL] ' + filename + ' not in cache, create thumb');
            var cmd = `${util.convertExe} ${filepath} -resize ${width}x${height} ${fileCachePath}`;
            exec(cmd, function(err, stdout, stderr) {
              if (err) {
                logger.error("[THUMBNAIL] error " + err);
                return next();
              } else {
                return res.sendFile(fileCachePath);
              }
            });
          });
        });
    } else {
      return next();
    }
  };
}

exports.register = register;
