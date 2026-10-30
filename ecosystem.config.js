module.exports = {
  apps: [
    {
      name: "tim-dashboard",
      script: "/home/mywarkim/tim-ai/dashboard/start-server.js",
      cwd: "/home/mywarkim/tim-ai/dashboard",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
