'use strict';

module.exports = {
  apps: [{
    name: 'UrPc',
    script: 'app.js',
    instances: 'max',
    autorestart: true,
    watch: false,
    log: './logs/combined.log',
    error: './logs/error.log',
    merge_logs: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PUSH_ENV: 'production',
      PRETTY_DEBUG: false,
      DISABLE_CRON: true,
      PORT: 8000
    },
    env_production: {
      NODE_ENV: 'production',
      PUSH_ENV: 'production',
      PRETTY_DEBUG: false,
      DISABLE_CRON: true,
      PORT: 9000
    }
  }],

};