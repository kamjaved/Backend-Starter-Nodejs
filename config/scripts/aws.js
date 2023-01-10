'use strict';

module.exports = {


  's3': {
    'apiVersion': '2006-03-01',
    'region': process.env.S3_REGION,
    'bucket': (process.env.NODE_ENV === 'production' ? 'bucketName' : 'bucketName'),
    'accessKeyId': process.env.S3_ACCESS_ID,
    'secretAccessKey': process.env.S3_SECRET_ACCESS_KEY,
    'maxRetries': 5,
    'timeout': 240000
  },

  'SES': {
    'accessKeyId': process.env.SES_ACCESS_ID,
    'secretAccessKey': process.env.SES_SECRET_ACCESS_KEY,
    'region': process.env.SES_REGION,
    'apiVersion': '2010-12-01'
  },

  'SNS': {
    'region': process.env.SNS_REGION,
    'accessKeyId': process.env.SNS_ACCESS_ID,
    'secretAccessKey': process.env.SNS_SECRET_ACCESS_KEY,
    'apiVersion': '2010-03-31',
  }
};