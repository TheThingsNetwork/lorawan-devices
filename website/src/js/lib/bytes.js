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

/**
 * Converts base64 encoded string to hex.
 *
 * @param {string} str - Base64 encoded string.
 * @returns {string} - `str` hex encoded.
 */
export const base64ToHex = (str) => {
  return Array.from(atob(str.replace(/[ \r\n]+$/, '')))
    .map((char) => {
      const tmp = char.charCodeAt(0).toString(16)

      return tmp.length > 1 ? tmp : `0${tmp}`
    })
    .join('')
}
