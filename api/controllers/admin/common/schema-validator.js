'use strict';

module.exports = function(app) {


  const searchUpcCode = {
    'searchKey': {
      type: 'string',
      required: true,
    },
    'riderId': {
      type: 'string',
    }
  };

  return {
    'searchUpcCode': searchUpcCode
  };
};