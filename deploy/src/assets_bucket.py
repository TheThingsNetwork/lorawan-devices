#!/bin/python3
import os
import yaml

os.environ["TROPO_REAL_BOOL"] = "True"  # Before we import troposphere
from troposphere import s3, iam, Template, Output, Sub, Export, Ref, GetAtt, Join

template = Template()
template.set_version("2010-09-09")
template.set_description("TTUI assets S3 bucket")

bucket = template.add_resource(s3.Bucket(
    "AssetsBucket",
    BucketName="ttui-assets",
))

sync_user = template.add_resource(iam.User("SyncUser",
    Policies=[iam.Policy(
        PolicyDocument=
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:DeleteObject",
                        "s3:Put*",
                        "s3:Get*",
                        "s3:List*",
                        "s3:GetBucketLocation",
                    ],
                    "Resource": [
                        Join('', ["arn:aws:s3:::", Ref(bucket), "/*"]),
                        Join('', ["arn:aws:s3:::", Ref(bucket)]),
                    ]
                }
            ]
        },
        PolicyName="AccessS3",
    )],
))
sync_user_access_key = template.add_resource(iam.AccessKey("SyncUserAccessKey",
    Status="Active",
    UserName=Ref(sync_user),
))

template.add_output(Output(
    "SyncUserAccessKeyId",
    Value=Ref(sync_user_access_key),
    Export=Export(Sub("ttui-assets-SyncUserAccessKeyId"))
))

template.add_output(Output(
    "SyncUserAccessKeySecret",
    Value=GetAtt(sync_user_access_key, "SecretAccessKey"),
    Export=Export(Sub("ttui-assets-SyncUserAccessKeySecret"))
))

template.add_output(Output(
    "AssetsBucket",
    Value=Ref(bucket),
    Export=Export(Sub("ttui-assets-AssetsBucket")),
))

template.add_output(Output(
    "AssetsBucketDomainName",
    Value=GetAtt(bucket, "DomainName"),
    Export=Export(Sub("ttui-assets-AssetsBucketDomainName")),
))

print(template.to_yaml(True, True))
