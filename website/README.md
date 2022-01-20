# Device Repository for LoRaWAN Website

An hugo static site generated from the lorawan-devices repository.

## Setup localhost

Run the steps below to run the site at `http://localhost:1313/device-repository/`

Requirements are `nodejs`, `yarn` and `hugo` and `go` , install these yourself.

### Generate content files

`make go.deps`
`make go.build`

### Install frontend dependencies

`yarn install`

### Run development environment

#### Run webpack-dev-server for frontend assets

`yarn start`

#### Run hugo server

`make run`

### How lorawan-devices becomes markdown for hugo

The build scripts are written in go and are located in `tools/build`

`tools/build/templates` contains `.tmpl` files for generated hugo files, edit these if you want to add content to all pages. This folder should mimic the folder structure of the hugo `content` folder.

### Frontend

Editable files for the front end are stored in `src` directory and are outputted by webpack to the `static` directory.

Highly interactive elements are being generated using react
