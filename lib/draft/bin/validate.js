#!/usr/bin/env node

const yargs = require("yargs");
const fs = require("fs");
const Ajv = require("ajv");
const yaml = require("js-yaml");

const schema = require("../schema.json");

const options = yargs
  .usage("Usage: --definition <definition> --data <file>")
  .option("definition", {
    describe: "Definition",
    type: "string",
    demandOption: true,
  })
  .option("data", {
    describe: "Path to data file",
    type: "string",
    demandOption: true,
  }).argv;

fs.readFile(options.data, (err, data) => {
  if (err) {
    throw err;
  }
  const obj = yaml.load(data);
  const ajv = Ajv();
  const validate = ajv
    .addSchema(schema)
    .compile({
      $ref: `https://lorawan-schema.org/draft/devices/1/schema#/definitions/${options.definition}`,
    });
  if (!validate(obj)) {
    console.log(`${options.data} is invalid`);
    console.log(validate.errors);
    process.exit(1);
  }
  console.log(`${options.data} is valid`);
});
