#!/usr/bin/env node

const deploy = require("./../index.js");

const args = process.argv.slice(2);

deploy(...args)
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
