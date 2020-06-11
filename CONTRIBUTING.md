# Contributing

You can contribute to this repository by adding end devices, end device profiles and gateways.

When contributing, make sure the models are validated against the schema and that all files are formatted correctly. This repository contains tooling to help you with that.

## Prerequisites

[Download and install Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). To check your Node.js and npm version:

```bash
$ node -v
$ npm -v
```

Then, install the dependencies:

```bash
$ npm install
```

## Validate Models

To validate the entire tree of vendors, devices and profiles:

```bash
$ npm run validate
```

### Visual Studio Code

[Visual Studio Code](https://code.visualstudio.com/) is a great editor for editing schemas. You can validate the models automatically using the [YAML plugin](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml).

Put this in your `.vscode/settings.json` settings:

```json
{
  "yaml.schemas": {
    "./schema.json": "vendor/*.yaml"
  }
}
```

## Format Files

This repository enforces a JSON format to keep all the files clean and valid. To format the files in this repository:

```bash
$ npm run format
```
