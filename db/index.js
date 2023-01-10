'use strict';

module.exports = function(app) {

  const mongoose = require('mongoose');

  /////////////////////////
  // Requiring db config //
  /////////////////////////
  const config = require('./config');

  ////////////////////////////////////////////////////
  // Setting Promise library to be used by Mongoose //
  ////////////////////////////////////////////////////
  mongoose.Promise = global.Promise;

  ///////////////////////////
  // Requiring the plugins //
  ///////////////////////////
  const plugins = {
    'pagedFind': require('./plugins/pagedFind')(app),
  };

  //////////////////////////////////
  // Attaching the global plugins //
  //////////////////////////////////
  mongoose.plugin(plugins.pagedFind);

  /////////////////////////////////////////////////
  // Connecting to MongoDB and storing reference //
  /////////////////////////////////////////////////
  const db = mongoose.createConnection((app.get('env') === 'production') ? config.uri.production : (app.get('env') === 'testing') ? config.uri.testing : config.uri.development, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  ////////////////////////////////////////
  // Attaching db config to db instance //
  ////////////////////////////////////////
  db.config = config;

  ////////////////////////////////////////////////////
  // Initializing and attaching the Mongoose Models //
  ////////////////////////////////////////////////////
  db.models = {
    'Admin': db.model('Admin', require('./models/admin')(app, mongoose, plugins)),
    'GlobalConfig': db.model('GlobalConfig', require('./models/globalConfig')(app, mongoose, plugins)),
    'Role': db.model('Role', require('./models/role')(app, mongoose, plugins)),
    'Notification': db.model('Notification', require('./models/notification')(app, mongoose, plugins)),
  };

  return db;
};