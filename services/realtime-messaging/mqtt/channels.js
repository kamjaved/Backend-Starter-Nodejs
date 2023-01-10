'use strict';

module.exports = function (broker) {

  //////////////////////////////
  //Common function to publish //
  ///////////////////////////////

  const send = (channelName, type, data) => {
    console.log('channelName and type', channelName, type);
    return broker.publish(channelName, JSON.stringify({ type: type, data: data }), { 'qos': 2 });
  };


  const sampleAlert = function (userId, data) {
    send('projectName/user/' + userId, 'sample-alert', data);
  };
  return {
    'sample': sampleAlert
  };

};
