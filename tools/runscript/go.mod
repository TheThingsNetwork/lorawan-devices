module github.com/TheThingsNetwork/lorawan-devices/tools/runscript

go 1.18

// Use our fork of grpc-gateway.
replace github.com/grpc-ecosystem/grpc-gateway => github.com/TheThingsIndustries/grpc-gateway v1.15.2-gogo

// But the original grpc-gateway v2.
replace github.com/grpc-ecosystem/grpc-gateway/v2 => github.com/grpc-ecosystem/grpc-gateway/v2 v2.10.3

// Use our fork of gogo/protobuf.
replace github.com/gogo/protobuf => github.com/TheThingsIndustries/gogoprotobuf v1.3.1

// Use our fork of throttled/throttled/v2.
replace github.com/throttled/throttled/v2 => github.com/TheThingsIndustries/throttled/v2 v2.7.1-noredis

// Pin dependencies that would break because of our old golang/protobuf.
replace (
	cloud.google.com/go => cloud.google.com/go v0.81.0
	cloud.google.com/go/pubsub => cloud.google.com/go/pubsub v1.3.1
	cloud.google.com/go/storage => cloud.google.com/go/storage v1.16.0
	github.com/Azure/azure-storage-blob-go => github.com/Azure/azure-storage-blob-go v0.10.0
	github.com/golang/protobuf => github.com/golang/protobuf v1.3.5
	github.com/googleapis/gax-go/v2 => github.com/googleapis/gax-go/v2 v2.0.5
	github.com/onsi/gomega => github.com/onsi/gomega v1.10.0
	github.com/prometheus/client_golang => github.com/prometheus/client_golang v1.11.0
	github.com/spf13/cobra => github.com/spf13/cobra v1.2.1
	github.com/spf13/viper => github.com/spf13/viper v1.8.1
	gocloud.dev => gocloud.dev v0.19.0
	gocloud.dev/pubsub/natspubsub => gocloud.dev/pubsub/natspubsub v0.19.0
	google.golang.org/api => google.golang.org/api v0.53.0
	google.golang.org/genproto => google.golang.org/genproto v0.0.0-20200513103714-09dca8ec2884
	google.golang.org/grpc => google.golang.org/grpc v1.33.1
)

// Do not upgrade go-sqlmock beyond v1.3.0.
// See https://github.com/heptiolabs/healthcheck/issues/23.
replace gopkg.in/DATA-DOG/go-sqlmock.v1 => gopkg.in/DATA-DOG/go-sqlmock.v1 v1.3.0

// See https://github.com/mattn/go-ieproxy/issues/31
replace github.com/mattn/go-ieproxy => github.com/mattn/go-ieproxy v0.0.1

// See https://github.com/mitchellh/mapstructure/pull/278
replace github.com/mitchellh/mapstructure v1.4.3 => github.com/TheThingsIndustries/mapstructure v0.0.0-20220329135826-c42f9f170b2a

require go.thethings.network/lorawan-stack/v3 v3.21.0

require golang.org/x/net v0.7.0 // indirect
