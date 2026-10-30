const { spawn } = require("child_process");
const path = require("path");

const child = spawn(
  process.execPath,
  [path.join(__dirname, "node_modules/next/dist/bin/next"), "start", "-p", "3001"],
  {
    cwd: __dirname,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  }
);

child.on("exit", (code) => {
  console.log("Dashboard exited with code:", code);
  process.exit(code || 1);
});
