#!/bin/bash

# This script generates the vendor index file from a list of vendors in text.
# This script requires jq [0] and yq [1].
#
#   1. Copy the rows of interest from [2] to clipboard
#   2. Run:
#      $ pbpaste | ./genindex.sh > vendors.yaml
#
# [0] https://stedolan.github.io/jq/
# [1] https://kislyuk.github.io/yq/
# [2] https://lora-alliance.org/sites/default/files/2020-10/LoRa_Alliance_Vendor_ID_for_QR_Code.pdf

grep -E '^[0-9]{1,3} ' \
	| grep -v 'Reserved for future use' \
	| sed -E 's/^([0-9]+) (.*)$/{"name":"\2","vendorID":\1}/' \
	| jq -s '.' \
	| yq -y '{vendors: map({id: .name | ascii_downcase | gsub(" "; "-"), name: .name, vendorID: .vendorID})}'
