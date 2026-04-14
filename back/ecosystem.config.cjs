module.exports = {
  apps: [
    {
      name: 'bizap-back',
      cwd: __dirname,
      script: 'npm',
      args: 'start',
      exec_mode: 'fork',
      autorestart: true,
      restart_delay: 5000,
    }
  ]
};
