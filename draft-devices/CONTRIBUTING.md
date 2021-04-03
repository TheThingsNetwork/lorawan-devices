# Contributing

You can contribute to this repository to extend the schemas and add examples.

When contributing, make sure the examples are validated against the schema and that all files are formatted correctly. This repository contains tooling to help you with that.

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

## Validate Definitions

To validate the examples against the schema:

```bash
$ npm run validate
```

### Visual Studio Code

[Visual Studio Code](https://code.visualstudio.com/) is a great editor for editing schemas. You can validate the examples automatically using the [YAML plugin](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml).

Put this in your `.vscode/settings.json` settings:

```json
{
  "yaml.schemas": {
    "./schema.json": "**/*.yaml"
  }
}
```

## Format Files

This repository enforces a JSON format to keep all the files clean and valid. To format the files in this repository:

```bash
$ npm run format
```
