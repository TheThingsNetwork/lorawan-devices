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

require go.thethings.network/lorawan-stack/v3 v3.24.1

require (
	contrib.go.opencensus.io/exporter/prometheus v0.4.0 // indirect
	github.com/TheThingsIndustries/protoc-gen-go-json v1.4.0 // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/blang/semver v3.5.1+incompatible // indirect
	github.com/cespare/xxhash/v2 v2.2.0 // indirect
	github.com/dlclark/regexp2 v1.7.0 // indirect
	github.com/dop251/goja v0.0.0-20220815083517-0c74f9139fd6 // indirect
	github.com/go-kit/log v0.2.0 // indirect
	github.com/go-logfmt/logfmt v0.5.1 // indirect
	github.com/go-sourcemap/sourcemap v2.1.3+incompatible // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/gotnospirit/makeplural v0.0.0-20180622080156-a5f48d94d976 // indirect
	github.com/gotnospirit/messageformat v0.0.0-20190719172517-c1d0bdacdea2 // indirect
	github.com/grpc-ecosystem/go-grpc-prometheus v1.2.0 // indirect
	github.com/grpc-ecosystem/grpc-gateway v1.16.0 // indirect
	github.com/json-iterator/go v1.1.12 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.1 // indirect
	github.com/modern-go/concurrent v0.0.0-20180306012644-bacd9c7ef1dd // indirect
	github.com/modern-go/reflect2 v1.0.2 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/prometheus/client_golang v1.11.0 // indirect
	github.com/prometheus/client_model v0.2.0 // indirect
	github.com/prometheus/common v0.32.1 // indirect
	github.com/prometheus/procfs v0.7.3 // indirect
	github.com/prometheus/statsd_exporter v0.22.4 // indirect
	github.com/satori/go.uuid v1.2.0 // indirect
	go.opencensus.io v0.23.0 // indirect
	go.uber.org/atomic v1.10.0 // indirect
	go.uber.org/multierr v1.7.0 // indirect
	go.uber.org/zap v1.21.0 // indirect
	golang.org/x/exp v0.0.0-20220706164943-b4a6d9510983 // indirect
	golang.org/x/net v0.36.0 // indirect
	golang.org/x/sys v0.30.0 // indirect
	golang.org/x/text v0.22.0 // indirect
	google.golang.org/genproto v0.0.0-20220519153652-3a47de7e79bd // indirect
	google.golang.org/grpc v1.46.2 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
)
