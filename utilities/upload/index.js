'use strict';

const os = require('os');

/**
 * Formats the image path to reflect the server URL
 * @param  {String} path The path of the image on the storage server
 * @param  {Number} port The port number of the storage server
 * @return {String}      The image url
 */
function formatImageLink(path, port) {
  if (!path) {
    throw new Error('Path is required');
  }

  let interfaces = os.networkInterfaces();

  let addresses = [];

  for (let k in interfaces) {

    for (let k2 in interfaces[k]) {

      let address = interfaces[k][k2];

      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }

  return 'http://' + addresses[0] + ':' + port + '/' + path;
}

/**
 * Custom File Upload module
 * @param  {Express} app               Reference to the server instance
 * @param  {Object}  opts              The options with which to use this module
 * @param  {Object}  opts.localStorage Path from cwd to the folder where files are to be stored, default = public/uploads
 * @param  {Object}  opts.useS3        Whether to use S3 or not if available, default = true
 * @return {Object}                    Object containing file-upload methods
 *
 * If localStorage path doesn't begin with public, then the local file path is stored instead of URL
 */
module.exports = function(app, opts) {

  if (!opts) {
    opts = {};
  }

  const options = {
    'localStorage': opts.localStorage || 'public/uploads',
    'useS3': opts.useS3 || false, //TODO: Change it
    'useFileFilter': opts.useFileFilter || false,
    'allowedFileTypes': opts.allowedFileTypes || []
  };

  /**
   * To handle single or multiple file upload
   */
  const multer = require('multer');

  /**
   * In-built module to handle path
   */
  const path = require('path');

  /**
   * In-built module to handle file system
   */
  const fs = require('fs');

  /**
   * Default upload path
   */
  const dir = path.resolve(process.cwd(), options.localStorage);

  /**
   * If AWS-S3 configuration is provided then initializes s3Util
   */
  const s3Util = (app.config.aws.s3) ? app.utility.s3Util : null;

  /**
   * If upload directory doesn't exist, create it
   */
  if (!fs.existsSync(dir)) {
    app.utility.mkdirR(dir, console.log);
  }

  /**
   * Uploads to AWS S3
   * @param  {Object}   config   The AWS-S3 config data
   * @param  {Function} callback The callback
   */
  function uploadFile(config) {
    return s3Util.uploadInS3({
      'bucket': config.bucket,
      'key': config.key,
      'path': config.path,
      'ACL': 'public-read'
    }).then(() => {
      return Promise.resolve(s3Util.getUrl({
        'bucket': config.bucket,
        'key': config.key
      }));
    }).catch(Promise.reject);
  }

  function fileFilter(req, file, cb) {
    if (!options.useFileFilter) {
      cb(null, true);
    } else {
      // console.log(file);
      if (options.allowedFileTypes.some(each => file.mimetype === each)) {
        cb(null, true);
      } else {
        req.invalidFileError = true;
        cb(null, false);
      }
    }
  }

  /**
   * Initializing multer
   */
  const upload = multer({

    /**
     * Creating multer storage settings
     */
    'storage': multer.diskStorage({

      /**
       * Setting upload destination in multer
       */
      'destination': function(req, file, cb) {
        cb(null, dir);
      },

      /**
       * Setting filename convention in multer
       */
      'filename': function(req, file, cb) {
        cb(null, app.utility.generateUniqueKey() + path.extname(file.originalname));
      }
    }),
    'fileFilter': fileFilter
  });

  /**
   * Checks if s3Util is defined. If so, then upload files to AWS-S3 server. Else, store locally.
   * @param  {Object}   req      The request object
   * @param  {Function} callback The callback function
   */
  function storeImages(req, callback) {
    if (s3Util && options.useS3) {

      let path = process.env.NODE_ENV === 'development' ? 'app/dev/' : 'app/prod/';

      return Promise.map(Object.keys(req.files), function(item) {
        return uploadFile({
          'bucket': app.config.aws.s3.bucket,
          'key': `${path}${req.files[item][0].filename}`,
          'path': req.files[item][0].path
        }).then((s3Path) => {
          /**
           * Remove local file
           */
          app.utility.handleFile.removeFile(req.files[item][0].path);

          /**
           * Setting the `getPath` property in each file. This `getPath` will be stored in database
           */
          req.files[item][0].getPath = s3Path;
          req.files[item] = req.files[item][0];

          return Promise.resolve();
        }).catch((err) => {
          return Promise.reject(err);
        });

      }).then(() => {
        return callback();
      }).catch(callback);

    } else {

      /**
       * The path to be stored in the database
       * @type {String}
       */
      let storePath = '';

      // Check if the file is meant to accessible publicly
      if (options.localStorage.substring(0, options.localStorage.indexOf('/')) === 'public') {

        /**
         * Local path where file is present (excluding, the 'public' folder)
         * @type {String}
         */
        // storePath = req.protocol + '://' + req.get('host') + '/' + options.localStorage.substring(options.localStorage.indexOf('/') + 1);
        storePath = formatImageLink(options.localStorage.substring(options.localStorage.indexOf('/') + 1), app.config.server.port);

      } else {

        storePath = path.resolve(process.cwd(), options.localStorage);
      }

      /**
       * Setting the `getPath` property in each file. This `getPath` will be stored in database
       */
      Object.keys(req.files)
        .forEach(function(e) {
          req.files[e][0].getPath = storePath + '/' + req.files[e][0].filename;
          req.files[e] = req.files[e][0];
        });

      callback();
    }
  }

  /**
   * Returns a middleware function to handle single or multiple-file upload using Multer
   * @param  {String|String[]} fields Array of field names
   * @return {Function}               Middleware
   */
  const multipleUpload = function(fields) {

    if (!Array.isArray(fields)) {
      fields = [fields];
    }
    //////////////////////////////////////////////////////////////////////
    // Converting the field names to object-array as accepted by Multer //
    //////////////////////////////////////////////////////////////////////
    fields = fields.map((e) => {
      return {
        'name': e,
        'maxCount': 1
      };
    });

    return function(req, res, next) {

      upload.fields(fields)(req, res, (error) => {
        if (req.invalidFileError) {
          return next({
            'errCode': 'INVALID_FILE_TYPE'
          });
        }
        if (error) {
          // console.log(req.files);
          return next(error);
        }

        if (!req.hasOwnProperty('files')) {
          // console.log(req.files);
          req.files = {};
          return next();
        }
        return storeImages(req, (error) => {
          if (error) {
            return next(error);
          }

          next();
        });
      });
    };
  };

  return multipleUpload;
};