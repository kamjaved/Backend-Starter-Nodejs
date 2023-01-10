'use strict';
//////////////////
// Dependencies //
//////////////////
const express = require('express'),
  swaggerUi = require('swagger-ui-express'),
  YAML = require('yamljs'),
  swaggerDocument = YAML.load('./api/swagger/swagger.yaml'),
  fp = require('find-free-port'),
  opn = require('open');
//////////////////////////////
// Creating the express app //
//////////////////////////////
const app = express();

//////////////////////////////
// Attched Rider Documents  //
//////////////////////////////
app.use('/swagger-api-docs/driver', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//////////////////
// Run Server   //
//////////////////
fp(5000).then(([freep]) => {
  app.server = app.listen(freep, () => console.log('Server listening on : ', freep));
  opn(`http://localhost:${freep}/swagger-api-docs/driver`);
}).catch((err) => {
  console.error(err);
});


module.exports = app;