const getConfig = (name) => ({
  name: `${name}-booker`,
  script: 'dist/index.js',
  env: {
    OWNER: name,
  },
  autorestart: false,
  cron_restart: '55 20 * * 0,6',
});

module.exports = {
  apps: [
    getConfig('long'),
  ],
};
