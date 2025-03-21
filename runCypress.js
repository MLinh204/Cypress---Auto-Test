const { spawn } = require("child_process");
const path = require("path");

const testName = process.argv[2];
if (!testName) {
  console.error("Please provide a test name.");
  process.exit(1);
}

const testPath = path.join(__dirname, "cypress/e2e", `${testName}.cy.js`);

console.log(`🚀 Running Cypress test: ${testPath}`);

const cypressProcess = spawn("npx", ["cypress", "run", "--headless", "--browser", "chrome" , "--spec", testPath], { stdio: "inherit", shell: true });

cypressProcess.on("exit", (code) => {
  if (code === 0) {
    console.log("Cypress test completed successfully.");
  } else {
    console.error(`Cypress process exited with code ${code}`);
  }
  process.exit(code);
});
