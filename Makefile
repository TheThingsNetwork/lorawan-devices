# Copyright © 2020 The Things Network Foundation, The Things Industries B.V.
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

SHELL = bash
GIT = git
NPM = npm

.PHONY: default
default: validate

.PHONY: deps
deps:
	$(NPM) install

.PHONY: deps.update
deps.update:
	$(GIT) subtree pull -P lib/draft https://github.com/lorawan-schema/draft-devices.git v1

.PHONY: validate
validate:
	$(NPM) run validate

.PHONY: fmt
fmt:
	$(NPM) run format

# vim: ft=make
