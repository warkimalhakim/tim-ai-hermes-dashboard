const { spawn } = require("child_process");
const child = spawn("hermes", ["-p", "manager", "gateway", "run"], {
  cwd: "/home/mywarkim",
  stdio: "inherit",
  env: { ...process.env, HERMES_HOME: "/home/mywarkim/.hermes" },
});
child.on("exit", (code) => {
  console.log("Gateway-manager exited with code:", code);
  process.exit(code || 1);
});
