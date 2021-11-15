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

package devicerepository

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"

	"github.com/ghodss/yaml"

	"github.com/TheThingsNetwork/lorawan-devices/website/tools/build/pkg/config"
)

// Store contains data to use in the App template.
type Store struct {
	Vendors []Vendor `yaml:"vendors"`
}

// Vendor is an end device vendor.
type Vendor struct {
	ID          string `yaml:"id"`
	Name        string `yaml:"name"`
	Title       string
	VendorID    uint32 `yaml:"vendorID"`
	Website     string `yaml:"website"`
	Email       string `yaml:"email"`
	Description string `yaml:"description"`
	Draft       bool   `yaml:"draft,omitempty"`
	EndDevices  []string
}

// EndDevice contains the required items from a device
type EndDevice struct {
	ModelID          string
	Vendor           Vendor
	Tags             []string
	Title            string
	Name             string `yaml:"name"`
	Description      string `yaml:"description"`
	HardwareVersions []struct {
		Version    string `yaml:"version"`
		Numeric    uint32 `yaml:"numeric"`
		PartNumber string `yaml:"partNumber"`
	} `yaml:"hardwareVersions"`
	FirmwareVersions []struct {
		Version          string   `yaml:"version"`
		Numeric          uint32   `yaml:"numeric"`
		HardwareVersions []string `yaml:"hardwareVersions"`
		Profiles         map[string]struct {
			ID               string `yaml:"id"`
			Codec            string `yaml:"codec"`
			LoRaWANCertified bool   `yaml:"lorawanCertified"`
		} `yaml:"profiles"`
	} `yaml:"firmwareVersions"`
	Sensors    []string `yaml:"sensors"`
	Dimensions *struct {
		Width    float32 `yaml:"width"`
		Height   float32 `yaml:"height"`
		Diameter float32 `yaml:"diameter"`
		Length   float32 `yaml:"length"`
	} `yaml:"dimensions"`
	Weight  float32 `yaml:"weight"`
	Battery *struct {
		Replaceable bool   `yaml:"replaceable"`
		Type        string `yaml:"type"`
	} `yaml:"battery"`
	OperatingConditions *struct {
		Temperature *struct {
			Min float32 `yaml:"min"`
			Max float32 `yaml:"max"`
		} `yaml:"temperature"`
		RelativeHumidity *struct {
			Min float32 `yaml:"min"`
			Max float32 `yaml:"max"`
		} `yaml:"relativeHumidity"`
	} `yaml:"operatingConditions"`
	IPCode string `yaml:"ipCode"`
	Photos *struct {
		Main  string   `yaml:"main"`
		Other []string `yaml:"other"`
	} `yaml:"photos"`
	Video  string `yaml:"video"`
	Videos *struct {
		Main  string   `yaml:"main"`
		Other []string `yaml:"other"`
	} `yaml:"videos"`
	ProductURL   string `yaml:"productURL"`
	DataSheetURL string `yaml:"dataSheetURL"`
	ResellerURLs []struct {
		Name   string   `yaml:"name"`
		Region []string `yaml:"region"`
		URL    string   `yaml:"url"`
	} `yaml:"resellerURLs"`
	Compliances *struct {
		Safety []struct {
			Body     string `yaml:"body"`
			Norm     string `yaml:"norm"`
			Standard string `yaml:"standard"`
			Version  string `yaml:"version"`
		} `yaml:"safety"`
		RadioEquipment []struct {
			Body     string `yaml:"body"`
			Norm     string `yaml:"norm"`
			Standard string `yaml:"standard"`
			Version  string `yaml:"version"`
		} `yaml:"radioEquipment"`
	} `yaml:"compliances"`
	AdditionalRadios []string `yaml:"additionalRadios"`
	Codecs           map[string]interface{}
}

// NewStore initialize a new device repository store
func NewStore(dir config.Dir) (Store, error) {
	drs := Store{}
	err := drs.SetVendorEndDevices(dir)
	if err != nil {
		return drs, err
	}

	return drs, nil
}

// setVendors gets available end device vendors from the vendor/index.yaml file.
func (drs *Store) setVendors(dir config.Dir) error {
	b, err := ioutil.ReadFile(dir.DeviceRepo.Vendor + "index.yaml")
	if err != nil {
		return err
	}

	rawVendorIndex := struct {
		Vendors []Vendor `yaml:"vendors"`
	}{}

	err = yaml.Unmarshal(b, &rawVendorIndex)
	if err != nil {
		return err
	}

	drs.Vendors = rawVendorIndex.Vendors

	return nil
}

// SetVendorEndDevices gets all devices from all vendors
func (drs *Store) SetVendorEndDevices(dir config.Dir) error {
	err := drs.setVendors(dir)
	if err != nil {
		return err
	}

	for i, vendor := range drs.Vendors {
		// Skip draft vendors
		if vendor.Draft {
			continue
		}

		c, err := ioutil.ReadFile(dir.DeviceRepo.Vendor + vendor.ID + "/index.yaml")
		if err != nil {
			log.Print(err)
			continue
		}

		rawEndDevicesIndex := struct {
			EndDevices []string `yaml:"endDevices"`
		}{}

		err = yaml.Unmarshal(c, &rawEndDevicesIndex)
		if err != nil {
			return err
		}

		drs.Vendors[i].EndDevices = rawEndDevicesIndex.EndDevices

	}

	return nil
}

// Device returns end device yaml file as a string, and a striped down endDevice struct
func (drs *Store) Device(vendorID string, endDevice string, dir config.Dir) (*EndDevice, error) {

	fmt.Printf(dir.DeviceRepo.Vendor)

	yamlFile, err := ioutil.ReadFile(dir.DeviceRepo.Vendor + vendorID + "/" + endDevice + ".yaml")
	if err != nil {
		return nil, err
	}

	rawEndDevice := &EndDevice{}

	err = yaml.Unmarshal(yamlFile, &rawEndDevice)
	if err != nil {
		return nil, err
	}

	dc := make(map[string]interface{})

	for _, versions := range rawEndDevice.FirmwareVersions {
		for p, profile := range versions.Profiles {
			if profile.Codec != "" {
				yamlFile, err := ioutil.ReadFile(dir.DeviceRepo.Vendor + vendorID + "/" + profile.Codec + ".yaml")
				if err != nil {
					return nil, err
				}

				jsonDoc, err := yaml.YAMLToJSON(yamlFile)
				if err != nil {
					return nil, err
				}

				var rawEndDeviceCodec map[string]interface{}
				err = json.Unmarshal(jsonDoc, &rawEndDeviceCodec)
				if err != nil {
					return nil, err
				}

				dc[p] = rawEndDeviceCodec
			}
		}
	}

	rawEndDevice.Codecs = dc

	return rawEndDevice, nil
}
