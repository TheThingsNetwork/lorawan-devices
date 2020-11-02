module github.com/TheThingsNetwork/lorawan-devices/tools/runscript

go 1.15

// Do not upgrade Echo beyond v4.1.2.
// See https://github.com/TheThingsNetwork/lorawan-stack/issues/977.
replace github.com/labstack/echo/v4 => github.com/labstack/echo/v4 v4.1.2

// Do not upgrade go-sqlmock beyond v1.3.0.
// See https://github.com/heptiolabs/healthcheck/issues/23.
replace gopkg.in/DATA-DOG/go-sqlmock.v1 => gopkg.in/DATA-DOG/go-sqlmock.v1 v1.3.0

// Versions higher trigger google/protobuf update past v1.3.5.
replace gocloud.dev => gocloud.dev v0.19.0

require go.thethings.network/lorawan-stack/v3 v3.9.4
