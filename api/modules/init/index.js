'use strict';

module.exports = function (app, next) {

  const parallelScripts = [
    require('./scripts/default-global-config')
  ],
    dependentScripts = [
      require('./scripts/default-super-admin'),
    ];

  Promise.all(parallelScripts.map(e => e(app)))
    .then(() => {
      Promise.all(dependentScripts.map(e => e(app)))
        .then(() => next())
        .catch(next);
    })
    .catch(next);
};