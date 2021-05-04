#!/bin/python3
import os
import yaml

os.environ["TROPO_REAL_BOOL"] = "True"  # Before we import troposphere
from troposphere import s3, iam, Template, Output, Sub, Export, Ref, GetAtt

template = Template()
template.set_version("2010-09-09")
template.set_description("Assets S3 bucket for the device repository")

bucket = template.add_resource(s3.Bucket(
    "AssetsBucket",
    BucketName="device-repository-assets",
))

template.add_output(Output(
    "AssetsBucket",
    Value=Ref(bucket),
    Export=Export(Sub("device-repository-prod-AssetsBucket",
))))

template.add_output(Output(
    "AssetsBucketDomainName",
    Value=GetAtt(bucket, "DomainName"),
    Export=Export(Sub("device-repository-prod-AssetsBucketDomainName",
))))

print(template.to_yaml(True, True))
