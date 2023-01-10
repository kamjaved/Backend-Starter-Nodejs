'use strict';

module.exports = function ( /*app*/) {

  return {

    /////////////
    // GENERAL //
    /////////////
    'API_VALIDATION_ERROR': 400,
    'UPLOAD_ERROR': 401,
    'UNKNOWN_ERROR': 403,
    'ADMIN_NO_ACCESS': 404,

    ////////////
    // COMMON //
    ////////////
    'INVALID_FILE_TYPE': 501,
    'NO_USER_ACCESS': 502,

    /////////////
    // PAYMENT //
    /////////////
    'DEFAULT_GATEWAY_NOT_FOUND': 503,
    'POSTAL_CODE_INVALID': 504,
    'LOCATION_UNAVAILABLE': 505,

    //////////
    // AUTH //
    //////////
    'SESSION_NOT_FOUND': 1000,
    'OTP_INVALID': 1001,
    'OTP_TIMEDOUT': 1002,
    'PASSWORD_MISMATCH': 1003,
    'REFERRAL_CODE_NOT_FOUND': 1004,
    'PHONE_NUMBER_NOT_FOUND': 1005,



    //////////
    // CARD //
    //////////
    'INVALID_CARD_TOKEN': 1601,
    'CARD_LIST_ERROR': 1602,
    'DEFAULT_CARD_CHANGE_ERROR': 1603,
    'DEFAULT_CARD_CAN_NOT_BE_DELETED': 1604,
    'REMOVE_CARD_ERROR': 1605,
    'DEFAULT_SOURCE_CAN_NOT_BE_DELETED': 1606,
    'REMOVE_SOURCE_ERROR': 1607,
    'CARD_NOT_LINKED': 1608,


    /////////////////
    //BANK ACCOUNT //
    /////////////////
    'INVALID_BANK_ACCOUNT_TOKEN': 2600,
    'BANK_ACCOUNT_LIST_ERROR': 2601,
    'DEFAULT_BANK_ACCOUNT_CHANGE_ERROR': 2602,
    'DEFAULT_BANK_ACCOUNT_CAN_NOT_BE_DELETED': 2603,
    'PAYMENT_PROFILE_PAYOUT_ENABLE_ERROR': 2604,


    ///////////
    // ADMIN //
    ///////////
    'ADMIN_NOT_FOUND': 2800,
    'ADMIN_EMAIL_ALREADY_EXISTS': 2801,
    'ADMIN_ALREADY_EXISTS_FOR_THIS_ROLE': 2802,
    'ROLE_ALREADY_EXISTS': 2803,
    'ADMIN_HAS_BEEN_SUSPENDED': 2804,
    'ADMIN_HAS_BEEN_DELETED': 2805,



    ///////////////////
    // GLOBAL CONFIG //
    ///////////////////
    'GLOBAL_CONFIG_NOT_FOUND': 5001,
    'CANCELLATION_PERCENTAGE_NOT_HUNDRED': 5500,
    'REVENUE_PERCENTAGE_NOT_HUNDRED': 5501,
    'OPERATIONAL_PARAMETER_NOT_FOUND': 5502,

  };
};
