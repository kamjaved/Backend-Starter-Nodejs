'use strict';

module.exports = function (app, mongoose /*, plugins*/) {
  const roleSchema = new mongoose.Schema({
    'name': {
      type: String,
      required: true
    },
    'permissions': [{
      'moduleName': {
        'type': String,
        'required': true
      },
      'role': {
        'type': Number,
        'required': true
      }
    }],
    'canEndTrip': {
      type: Boolean,
      default: false
    },
    'canCancelBooking': {
      type: Boolean,
      default: false
    }
  }, {
    'versionKey': false,
    'timestamps': true,
    'usePushEach': true
  });

  /**
   * this function is to add new role
   * @param  {String} name        name of the role
   * @param  {Array} permissions  array of permissions
   * @return {Promise}            
   */
  roleSchema.statics.createRole = function (name, permissions, canEndTrip = false, canCancelBooking = false) {
    return this.exist(name)
      .then((doc) => doc ? Promise.reject({
        'errCode': 'ROLE_ALREADY_EXISTS'
      }) : (new this({
        name: name,
        permissions: permissions,
        canEndTrip: canEndTrip,
        canCancelBooking: canCancelBooking
      })).save());

  };
  /**
   * this is to check if any role exists with the name
   * @param  {String} name name of the role
   * @return {Promise}
   */
  roleSchema.statics.exist = function (name) {
    return this.countDocuments({
      name: name
    }).exec();
  };


  /**
   * this function is to remove role 
   * @param  {string} _id role id
   * @return {Promise}    Promise Object 
   */
  roleSchema.statics.removeRole = function (_id) {
    return this.findByIdAndRemove(_id).exec();
  };

  return roleSchema;
};