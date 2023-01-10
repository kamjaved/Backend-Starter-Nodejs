'use strict';

//////////////////
// Dependencies //
//////////////////
require('dotenv').config();
const express = require('express');
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const helmet = require('helmet');
const pino = require('pino')({
  prettyPrint: process.env.NODE_ENV === 'development' ? {
    colorize: true,
    translateTime: true,
    ignore: 'pid,hostname',
  } : false,
});

//Express pino middleware
const expressPino = require('express-pino-logger')({
  logger: pino,
  reqCustomProps: function(req) {
    return {
      body: req.body,
      params: req.params,
      query: req.query,
    };
  },
  customLogLevel: function(res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    } else if (res.statusCode >= 500 || err) {
      return 'error';
    }
    return 'info';
  },
});

/////////////////////////////////
// Promise Configuration Setup //
/////////////////////////////////
global.Promise = require('bluebird');

if (process.env.NODE_ENV === 'production') {
  Promise.config({
    warnings: false,
    longStackTraces: false,
    cancellation: false,
    monitoring: false,
  });
} else {
  Promise.config({
    warnings: false,
    longStackTraces: true,
    cancellation: true,
    monitoring: true,
  });
}

//////////////////////////////
// Creating the express app //
//////////////////////////////
const app = express();

//////////////////////////////
// Sentry Integration       //
//////////////////////////////
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  });

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}

//////////////////////////
// Attach Helmet to app //
//////////////////////////
app.use(helmet());

///////////////////////////////////////
// Attaching the reference to config //
///////////////////////////////////////
app.config = require('./config')(app);

///////////////////////////////////////
// Attaching the reference to logger //
///////////////////////////////////////
app.logger = pino;

//////////////////////
// Express settings //
//////////////////////
app.disable('x-powered-by');
app.set('port', app.config.server.port);
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');

///////////////////////////
// Express global locals //
///////////////////////////
app.locals.projectName = app.config.project.name;
app.locals.copyrightYear = app.config.project.copyrightYear;
app.locals.companyName = app.config.project.companyName;
app.locals.path = __dirname;

//////////////////////////////////////
// Attaching method-override module //
//////////////////////////////////////
app.use(require('method-override')());
/////////////////////////////////////////////////////
// Attaching the body-parser module for urlencoded //
/////////////////////////////////////////////////////
app.use(
  express.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(
  express.json({
    limit: '50mb',
  })
);

///////////////////////////
// Attaching CORS module //
///////////////////////////
app.use(
  require('cors')({
    origin: '*',
    methods: ['PUT', 'GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'accept',
      'content-type',
      'x-auth-deviceid',
      'x-auth-devicetype',
      'x-auth-token',
      'x-auth-latitude',
      'x-auth-longitude',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

/////////////////////////////
// Attaching the utilities //
/////////////////////////////
app.utility = require('./utilities')(app);

/////////////////////////////////////////////////////////////
// Attaching the workflow module & default-language module //
/////////////////////////////////////////////////////////////
app.use(app.utility.attachWorkflow);

//////////////////////////////
// Set the Default Language //
//////////////////////////////
if (process.env.NODE_ENV !== 'production') {
  app.locals.defaultLanguage = 'en-us';
} else {
  app.locals.defaultLanguage = 'en-us';
}

////////////////////////////////////////////////
// Connect the DB and Initialize the models ////
////////////////////////////////////////////////
const db = require('./db')(app);

//////////////////////
// attaching models //
//////////////////////

app.models = db.models;

////////////////////////////
// Attaching the services //
////////////////////////////
app.service = require('./services')(app);

///////////////////////////
// Attaching the modules //
///////////////////////////
app.module = require('./api/modules')(app);

///////////////////////////////////////////
// Production or Development environment //
///////////////////////////////////////////
if (process.env.NODE_ENV !== 'production') {
  ///////////////////////////////
  // Pino logger middleware     //
  ///////////////////////////////
  app.use(expressPino);

  ///////////////////////////
  // Attaching the JS Docs //
  ///////////////////////////
  //app.use('/js-doc', express.static(`${__dirname}/api/docs/jsdoc/render`));

  //////////////////////////////
  // Attaching Pretty Console //
  //////////////////////////////
  // if (process.env.PRETTY_DEBUG === 'true') {
  //   require('./utilities/pretty-console')(app);
  // }
} else {
  //////////////////////////////
  // Attaching Request Logger //
  //////////////////////////////
  if (process.env.MORGAN_LOG === 'true') {
    app.use(require('morgan')('dev'));
  }
}

//////////////////////////////////
// Attaching the uploads folder //
//////////////////////////////////
// app.use('/uploads', express.static(`${__dirname}/public/uploads`));

app.use('/api/v1', [
  //////////////////////////
  // Attaching the routes //
  //////////////////////////
  require('./api/controllers/')(app),

  ////////////////////////////////////
  // Attaching the response handler //
  ////////////////////////////////////
  require('./api/responseHandler/')(app),

  // The error handler must be before any other error middleware and after all controllers
  process.env.SENTRY_DSN ? app.use(Sentry.Handlers.errorHandler()) : null,

  /////////////////////////////////////////
  // Attaching the default error handler //
  /////////////////////////////////////////
  app.utility.errorHandler,
]);

///////////////////////////////
// Default 404 error handler //
///////////////////////////////
app.use(function(req, res) {
  res.status(400).end();
});

//////////////////////////////////////
// Execute the init module (if any) //
//////////////////////////////////////
if (Object.prototype.hasOwnProperty.call(app.module, 'init')) {
  app.module.init(app, (error) => {
    if (error) {
      app.logger.error(`Server can't be started.`);
      app.logger.error(error);
      process.exit();
    } else {
      ///////////////////////
      // Listening on port //
      ///////////////////////
      app.server = app.listen(app.config.server.port, () =>
        app.logger.info(`Server listening on : ${app.config.server.port}`)
      );
    }
  });
} else {
  app.logger.error(
    `Server can't be started. As this project requires init module`
  );
  process.exit();
}

module.exports = app;