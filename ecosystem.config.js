const getConfig = (name) => ({
  name: `${name}-booker`,
  script: 'dist/index.js',
  env: {
    OWNER: name,
  },
  autorestart: false,
});

module.exports = {
  apps: [
    getConfig('long'),
    getConfig('leddy'),
  ],
};
