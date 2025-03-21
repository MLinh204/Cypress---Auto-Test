const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    retries: {
      runMode: 0,
      openMode: 0,
    },
    env: {
      requestMode: true,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "https://frabjous-malasada-7b6ce7.netlify.app",
    baseAPIURL: "https://to-do-app-backend-production-9b2e.up.railway.app/api",
  },
});
