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
	"io/ioutil"
	"log"
	"sort"

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
	Logo        string `yaml:"logo"`
	Draft       bool   `yaml:"draft,omitempty"`
	EndDevices  []string
}

// ProfileDetail mirrors the fields of a vendor profile YAML file.
type ProfileDetail struct {
	ID                        string  `yaml:"-"`
	MACVersion                string  `yaml:"macVersion"`
	RegionalParametersVersion string  `yaml:"regionalParametersVersion"`
	SupportsJoin              bool    `yaml:"supportsJoin"`
	MaxEIRP                   float32 `yaml:"maxEIRP"`
	Supports32BitFCnt         bool    `yaml:"supports32bitFCnt"`
	SupportsClassB            bool    `yaml:"supportsClassB"`
	SupportsClassC            bool    `yaml:"supportsClassC"`
	LoRaWANCertified          bool    `yaml:"-"`
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
	Weight       float32 `yaml:"weight"`
	DeviceWeight float32
	Battery      *struct {
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

	// Enriched fields derived from profile and codec YAMLs.
	Profiles                   map[string]ProfileDetail
	Classes                    []string
	MACVersions                []string
	RegionalParametersVersions []string
	FrequencyPlans             []string
	Certified                  bool
	HasCodec                   bool
	CodecFiles                 []string
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
	profiles := make(map[string]ProfileDetail)
	codecFiles := make(map[string]bool)
	frequencyPlans := make(map[string]bool)

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

				for _, section := range rawEndDeviceCodec {
					if m, ok := section.(map[string]interface{}); ok {
						if f, ok := m["fileName"].(string); ok && f != "" {
							codecFiles[f] = true
						}
					}
				}
			}

			frequencyPlans[p] = true

			if existing, ok := profiles[profile.ID]; ok {
				existing.LoRaWANCertified = existing.LoRaWANCertified || profile.LoRaWANCertified
				profiles[profile.ID] = existing
			} else {
				detail, err := loadProfile(dir, vendorID, profile.ID)
				if err != nil {
					log.Printf("profile %s/%s: %v", vendorID, profile.ID, err)
					continue
				}
				detail.LoRaWANCertified = profile.LoRaWANCertified
				profiles[profile.ID] = detail
			}

			if profile.LoRaWANCertified {
				rawEndDevice.Certified = true
			}
		}
	}

	rawEndDevice.Codecs = dc
	rawEndDevice.Profiles = profiles
	rawEndDevice.HasCodec = len(dc) > 0
	rawEndDevice.CodecFiles = sortedKeys(codecFiles)
	rawEndDevice.FrequencyPlans = sortedKeys(frequencyPlans)

	classes := map[string]bool{"A": true}
	macVersions := make(map[string]bool)
	regParams := make(map[string]bool)
	for _, d := range profiles {
		if d.SupportsClassB {
			classes["B"] = true
		}
		if d.SupportsClassC {
			classes["C"] = true
		}
		if d.MACVersion != "" {
			macVersions[d.MACVersion] = true
		}
		if d.RegionalParametersVersion != "" {
			regParams[d.RegionalParametersVersion] = true
		}
	}
	rawEndDevice.Classes = sortedKeys(classes)
	rawEndDevice.MACVersions = sortedKeys(macVersions)
	rawEndDevice.RegionalParametersVersions = sortedKeys(regParams)

	return rawEndDevice, nil
}

func loadProfile(dir config.Dir, vendorID, profileID string) (ProfileDetail, error) {
	detail := ProfileDetail{ID: profileID}

	b, err := ioutil.ReadFile(dir.DeviceRepo.Vendor + vendorID + "/" + profileID + ".yaml")
	if err != nil {
		return detail, err
	}

	err = yaml.Unmarshal(b, &detail)
	return detail, err
}

func sortedKeys(m map[string]bool) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

