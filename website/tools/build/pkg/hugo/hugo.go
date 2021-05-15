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

package hugo

import (
	"bytes"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"text/template"

	"gopkg.in/yaml.v2"

	"github.com/TheThingsNetwork/lorawan-devices/website/tools/build/pkg/config"
	"github.com/TheThingsNetwork/lorawan-devices/website/tools/build/pkg/devicerepository"
)

// TemplateData contains data to use in the App template.
type TemplateData struct {
	DeviceBase string `name:"device-base" description:"yaml fields from the base file for device"`
	VendorBase string `name:"vendor-base"`
}

type Photo struct {
	FileName string
	Path     string
}

func generateTags(e *devicerepository.EndDevice) []string {
	var t []string

	t = append(t, e.Sensors...)
	t = append(t, e.IPCode)

	// add frequency plans
	for _, versions := range e.FirmwareVersions {
		for p := range versions.Profiles {
			t = append(t, p)
		}
	}

	return t
}

func copyImage(sourceFile string, destinationFile string, e *devicerepository.EndDevice,
) error {
	if e.Photos != nil && e.Photos.Main != "" {

		input, err := ioutil.ReadFile(sourceFile)
		if err != nil {
			return err
		}

		err = ioutil.WriteFile(destinationFile, input, 0644)
		if err != nil {
			return err
		}
	}

	return nil
}

func createFileFromTemplate(templatePath string, output string, tp *TemplateData) error {

	tmpl, err := template.ParseFiles(templatePath)
	if err != nil {
		return err
	}

	var tmplBytes bytes.Buffer
	err = tmpl.Execute(&tmplBytes, &tp)
	if err != nil {
		return err
	}

	f, err := os.Create(output)
	if err != nil {
		return err
	}

	_, err = f.WriteString(tmplBytes.String())
	if err != nil {
		return err
	}

	f.Close()

	return nil
}

// CreateContentSingleDevice generates the hugo content files in markdown
func CreateContentSingleDevice(dir config.Dir, drs devicerepository.Store) error {

	_ = os.Mkdir(dir.Hugo.Devices, 0700)

	for _, vendor := range drs.Vendors {

		err := createContentDevicesVendor(dir, vendor)
		if err != nil {
			return err
		}

		for _, endDevice := range vendor.EndDevices {

			_ = os.Mkdir(dir.Hugo.Devices+vendor.ID+"/"+endDevice, 0700)
			_ = os.Mkdir(dir.Hugo.Devices+vendor.ID+"/"+endDevice+"/images", 0700)

			endDeviceModel, err := drs.Device(vendor.ID, endDevice, dir)
			if err != nil {
				return err
			}

			endDeviceModel.ModelID = endDevice
			endDeviceModel.Vendor = vendor
			endDeviceModel.Title = endDeviceModel.Name
			endDeviceModel.Tags = generateTags(endDeviceModel)

			if endDeviceModel.Photos != nil && endDeviceModel.Photos.Main != "" {
				PhotoMain := Photo{FileName: filepath.Base(endDeviceModel.Photos.Main), Path: endDeviceModel.Photos.Main}
				endDeviceModel.Photos.Main = PhotoMain.FileName

				sourceFile := dir.DeviceRepo.Vendor + vendor.ID + "/" + PhotoMain.Path
				destinationFile := dir.Hugo.Devices + vendor.ID + "/" + endDevice + "/images/" + PhotoMain.FileName

				err := copyImage(sourceFile, destinationFile, endDeviceModel)
				if err != nil {
					return err
				}
			}

			d, err := yaml.Marshal(&endDeviceModel)
			if err != nil {
				return err
			}

			templatePath := dir.DeviceRepo.Templates + "devices/single.tmpl"
			output := dir.Hugo.Devices + vendor.ID + "/" + endDevice + "/index.md"

			err = createFileFromTemplate(templatePath, output, &TemplateData{DeviceBase: string(d)})
			if err != nil {
				return err
			}

			log.Printf("%+v\n", endDeviceModel.Name)

		}
	}

	return nil
}

// createContenteDevice generates the hugo content for devices list in markdown
func createContentDevicesVendor(dir config.Dir, vendor devicerepository.Vendor) error {

	// Create vendor directory
	_ = os.Mkdir(dir.Hugo.Devices+vendor.ID, 0700)

	vendor.Title = vendor.Name

	v, err := yaml.Marshal(vendor)
	if err != nil {
		return err
	}

	templatePath := dir.DeviceRepo.Templates + "devices/vendor/_index.tmpl"
	output := dir.Hugo.Devices + vendor.ID + "/_index.md"

	err = createFileFromTemplate(templatePath, output, &TemplateData{VendorBase: string(v)})
	if err != nil {
		return err
	}

	return nil

}

// createContenteDevice generates the hugo content for devices list in markdown
func CreateContentDevices(dir config.Dir) error {

	templatePath := dir.DeviceRepo.Templates + "devices/_index.tmpl"
	output := dir.Hugo.Devices + "_index.md"

	err := createFileFromTemplate(templatePath, output, &TemplateData{})
	if err != nil {
		return err
	}

	return nil

}
