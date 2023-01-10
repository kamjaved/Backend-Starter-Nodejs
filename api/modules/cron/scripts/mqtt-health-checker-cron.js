'use strict';

const CronJob = require('cron').CronJob;

module.exports = function (app) {


  /**
   * Run the cron job every 10 second
   */
  new CronJob('*/10 * * * * *', function () {
    /**
  * Check if mosquitto server is already running
  * If not, then run it
  */
    require('child_process').execFile('sh', [`${process.cwd()}/check.sh`], function (error, stdout /*, stderr*/) {

      if (error) {
        throw error;
      }

      if (stdout.toString().replace(/[^01]/g, '') === '0') {

        require('child_process').exec('mosquitto -c /etc/mosquitto/mosquitto.conf', {}, function (error /*, stdout, stderr*/) {

          if (error) {
            throw error;
          }
          console.log('Mosquitto started');
        });
      } else {
        console.log('Mosquitto already running');
      }
    });

  }, null, true, 'America/Los_Angeles');
};