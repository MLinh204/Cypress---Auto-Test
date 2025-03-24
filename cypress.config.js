const { defineConfig } = require("cypress");
const {downloadFile} = require("cypress-downloadfile/lib/addPlugin");
const fs = require('fs-extra');
const path = require('path');
module.exports = defineConfig({
  e2e: {
    downloadsFolder: "/Users/linhhoang204/Documents/Sheets/TestFolder",
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
      on('task', {
        downloadFile,
        editFile({ fileName, editedValue }) {
          return fs.writeFile(fileName, editedValue)
            .then(() => true)
            .catch((err) => {
              throw new Error(`Error editing file: ${err.message}`);
            });
        },
        addFile({filePath, content}){
          return fs.ensureDir(path.dirname(filePath)).then(() => fs.writeFile(filePath, content)).then(() => true).catch((err) => { throw new Error(`Error adding file: ${err.message}`); });
        },
        deleteFile({fileDir}){
          return fs.remove(fileDir).then(() => true).catch((err) => { throw new Error(`Error deleting file: ${err.message}`); });
        },
        moveFile({currentDir, destinationDir}){
          return fs.ensureDir(path.dirname(destinationDir))
            .then(() => fs.move(currentDir, destinationDir))
            .then(() => true)
            .catch((err) => {
              throw new Error(`Error moving file: ${err.message}`);
            });
        },
        deleteAllFiles({dir}){
          return fs.emptyDir(dir)
           .then(() => true)
           .catch((err) => {
             throw new Error(`Error deleting all files in ${dir}: ${err.message}`);
           });
        },
        getLatestFile({ dir, extension }) {
          const files = fs.readdirSync(dir)
            .filter(file => file.endsWith(`.${extension}`))
            .map(file => ({
              name: file,
              mtime: fs.statSync(`${dir}/${file}`).mtime
            }))
            .sort((a, b) => b.mtime - a.mtime);
          
          if (files.length === 0) {
            throw new Error(`No ${extension} files found in ${dir}`);
          }
          
          return files[0].name;
        }
      });
    },
    baseUrl: "https://frabjous-malasada-7b6ce7.netlify.app",
    baseAPIURL: "https://to-do-app-backend-production-9b2e.up.railway.app/api",
  },
});
