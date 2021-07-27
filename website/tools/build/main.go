// Copyright © 2021 The Things Network Foundation, The Things Industries B.V.
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
	"log"

	"github.com/TheThingsNetwork/lorawan-devices/website/tools/build/pkg/config"
	"github.com/TheThingsNetwork/lorawan-devices/website/tools/build/pkg/devicerepository"
	"github.com/TheThingsNetwork/lorawan-devices/website/tools/build/pkg/hugo"
)

func main() {

	dir := config.Dir{
		DeviceRepo: config.DeviceRepo{
			Templates: "templates/",
			Vendor:    "../../../vendor/",
		},
		Hugo: config.Hugo{
			Devices: "../../content/devices/",
		},
	}

	dr, err := devicerepository.NewStore(dir)
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	err = hugo.CreateContentSingleDevice(dir, dr)
	if err != nil {
		log.Fatalf("error: %v", err)
	}

	err = hugo.CreateContentDevices(dir)
	if err != nil {
		log.Fatalf("error: %v", err)
	}
}
