module github.com/TheThingsNetwork/lorawan-devices/tools/runscript

go 1.16

// Use our fork of grpc-gateway.
replace github.com/grpc-ecosystem/grpc-gateway => github.com/TheThingsIndustries/grpc-gateway v1.15.2-gogo

// Use our fork of gogo/protobuf.
replace github.com/gogo/protobuf => github.com/TheThingsIndustries/gogoprotobuf v1.3.1

// Do not upgrade Protobuf beyond v1.3.5
replace github.com/golang/protobuf => github.com/golang/protobuf v1.3.5

// Do not upgrade gRPC beyond v1.33.1
replace google.golang.org/grpc => google.golang.org/grpc v1.33.1

// Do not upgrade genproto beyond v0.0.0-20200513103714-09dca8ec2884
replace google.golang.org/genproto => google.golang.org/genproto v0.0.0-20200513103714-09dca8ec2884

// Do not upgrade Echo beyond v4.1.2.
// See https://github.com/TheThingsNetwork/lorawan-stack/issues/977.
replace github.com/labstack/echo/v4 => github.com/labstack/echo/v4 v4.1.2

// Do not upgrade go-sqlmock beyond v1.3.0.
// See https://github.com/heptiolabs/healthcheck/issues/23.
replace gopkg.in/DATA-DOG/go-sqlmock.v1 => gopkg.in/DATA-DOG/go-sqlmock.v1 v1.3.0

// Versions higher trigger google/protobuf update past v1.3.5.
replace gocloud.dev => gocloud.dev v0.19.0

// Versions higher trigger google/protobuf update past v1.3.5.
replace github.com/onsi/gomega => github.com/onsi/gomega v1.10.0

// Optional dependencies of throttled/v2 update golang/protobuf past v1.3.5.
replace github.com/throttled/throttled/v2 => github.com/TheThingsIndustries/throttled/v2 v2.7.1-noredis

// Do not upgrade Mapstructure beyond v1.3.0.
// See https://github.com/TheThingsNetwork/lorawan-stack/issues/3736.
replace github.com/mitchellh/mapstructure => github.com/mitchellh/mapstructure v1.3.0

// Do not upgrade Redis beyond v8.4.0.
// See https://github.com/TheThingsNetwork/lorawan-stack/pull/3848.
replace github.com/go-redis/redis/v8 => github.com/go-redis/redis/v8 v8.4.0

require (
	github.com/valyala/fasttemplate v1.1.0 // indirect
	go.thethings.network/lorawan-stack/v3 v3.14.0
)
