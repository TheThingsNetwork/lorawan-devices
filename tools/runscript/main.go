// Copyright © 2020 The Things Network Foundation, The Things Industries B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"context"
	"encoding/json"
	"flag"
	"io/ioutil"
	"log"
	"os"
	"time"

	"go.thethings.network/lorawan-stack/v3/pkg/errors"
	"go.thethings.network/lorawan-stack/v3/pkg/scripting"
	"go.thethings.network/lorawan-stack/v3/pkg/scripting/javascript"
)

var (
	codecPath = flag.String("codec-path", "", "path to codec scripts")
	routine   = flag.String("routine", "", "routine (decodeUplink, normalizeUplink, encodeDownlink, decodeDownlink)")
	inputData = flag.String("input", "", "input (JSON)")
)

type decodeUplinkInput struct {
	Bytes []uint8 `json:"bytes"`
	FPort uint8   `json:"fPort"`
}

type decodeUplinkOutput struct {
	Data     map[string]interface{} `json:"data"`
	Warnings []string               `json:"warnings"`
	Errors   []string               `json:"errors"`
}

type normalizeUplinkInput struct {
	Data map[string]interface{} `json:"data"`
}

type normalizeUplinkOutput struct {
	Data     interface{} `json:"data"`
	Warnings []string    `json:"warnings"`
	Errors   []string    `json:"errors"`
}

type encodeDownlinkInput struct {
	Data  map[string]interface{} `json:"data"`
	FPort *uint8                 `json:"fPort"`
}

type encodeDownlinkOutput struct {
	Bytes    []uint8  `json:"bytes"`
	FPort    *uint8   `json:"fPort"`
	Warnings []string `json:"warnings"`
	Errors   []string `json:"errors"`
}

type decodeDownlinkInput struct {
	Bytes []uint8 `json:"bytes"`
	FPort uint8   `json:"fPort"`
}

type decodeDownlinkOutput struct {
	Data     map[string]interface{} `json:"data"`
	Warnings []string               `json:"warnings"`
	Errors   []string               `json:"errors"`
}

func main() {
	flag.Parse()

	if *codecPath == "" {
		flag.Usage()
		os.Exit(1)
	}
	switch *routine {
	case "decodeUplink", "normalizeUplink", "encodeDownlink", "decodeDownlink":
	default:
		flag.Usage()
		os.Exit(1)
	}

	script, err := ioutil.ReadFile(*codecPath)
	if err != nil {
		log.Fatalf("Read %q: %v", *codecPath, err)
	}

	opts := scripting.DefaultOptions
	opts.Timeout = 1 * time.Second

	var (
		vm            = javascript.New(opts)
		input, output interface{}
	)

	switch *routine {
	case "decodeUplink":
		input, output = decodeUplinkInput{}, decodeUplinkOutput{}
	case "normalizeUplink":
		input, output = normalizeUplinkInput{}, normalizeUplinkOutput{}
	case "encodeDownlink":
		input, output = encodeDownlinkInput{}, encodeDownlinkOutput{}
	case "decodeDownlink":
		input, output = decodeDownlinkInput{}, decodeDownlinkOutput{}
	}
	if err := json.Unmarshal([]byte(*inputData), &input); err != nil {
		log.Fatalf("Unmarshal input: %v", err)
	}

	valueAs, err := vm.Run(context.Background(), string(script), *routine, input)
	if err != nil {
		log.Fatalf("Script failed: %v (%v)", err, errors.Cause(err))
	}
	if err := valueAs(&output); err != nil {
		log.Fatalf("Retrieve output: %v (%v)", err, errors.Cause(err))
	}

	if err := json.NewEncoder(os.Stdout).Encode(output); err != nil {
		log.Fatalf("Marshal output: %v", err)
	}
}
