'use strict';

module.exports = function(app) {

  /**
   * Check if mosquitto server is already running
   * If not, then run it
   */
  require('child_process').execFile('sh', [`${process.cwd()}/check.sh`], function(error, stdout /*, stderr*/ ) {

    if (error) {
      throw error;
    }

    if (stdout.toString().replace(/[^01]/g, '') === '0') {

      require('child_process').exec('mosquitto -c /etc/mosquitto/mosquitto.conf', {}, function(error /*, stdout, stderr*/ ) {

        if (error) {
          throw error;
        }
        ////////////////////////////////////
        //                       FOR EASE //
        ////////////////////////////////////
        console.log('Mosquitto started'); //
        ////////////////////////////////////
        //                       FOR EASE //
        ////////////////////////////////////
      });
    } else {
      ////////////////////////////////////////////
      //                               FOR EASE //
      ////////////////////////////////////////////
      console.log('Mosquitto already running'); //
      ////////////////////////////////////////////
      //                               FOR EASE //
      ////////////////////////////////////////////
    }
  });

  const mqtt = require('mqtt');

  const connectUrl = (app.get('env') === 'production') ? app.config.mqtt.connecturl.production : (app.get('env') === 'testing') ? app.config.mqtt.connecturl.testing : app.config.mqtt.connecturl.development;

  const broker = mqtt.connect(connectUrl);

  broker.on('connect', function() {
    broker.publish('Sample Project', 'Welcome to Sample Project');
  });

  const channels = require('./channels')(broker, app);
  broker.channels = channels;
  return broker;
};