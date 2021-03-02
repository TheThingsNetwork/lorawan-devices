# Copyright © 2021 The Things Network Foundation, The Things Industries B.V.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

SHELL = /bin/bash

.PHONY: clean
clean:
	rm -f tools/build/build || true
	rm -r content/devices/* || true
	rm -rf public || true

.PHONY: go.deps
go.deps:
	pushd ./tools/build && go mod download && popd

.PHONY: go.build
go.build: clean
	pushd ./tools/build && go build . && ./build && popd

.PHONY: run
run:
	hugo server -b localhost/device-repository/
