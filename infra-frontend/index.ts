import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as fs from "fs";
import * as path from "path";
import mime from "mime";
import crypto from "crypto";


function createPublicReadPolicy(bucketName: string): string {
    return JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: "*",
            Action: [
                "s3:GetObject"
            ],
            Resource: [
                `arn:aws:s3:::${bucketName}/*`
            ]
        }]
    });
}

const getFileContentHash = (filePath: string) => {
    return crypto.createHash("sha256").update(fs.readFileSync(filePath).toString()).digest("hex")
}

function addFolderContents(sideDir: string, prefix: string = '', objects: pulumi.Output<string>[] = []) {
    for (let item of fs.readdirSync(sideDir)) {
        const filePath = path.join(sideDir, item);
        const isDirectory = fs.lstatSync(filePath).isDirectory();

        if (isDirectory) {
            const newPrefix = prefix ? path.join(prefix, item) : item;
            addFolderContents(filePath, newPrefix, objects);
            continue;
        }

        const itemPath = prefix ? path.join(prefix, item) : item;
        const object = new aws.s3.BucketObject(itemPath, {
            bucket: bucket,
            source: new pulumi.asset.FileAsset(filePath),
            contentType: mime.getType(filePath) || undefined,
            etag: getFileContentHash(filePath),
        });

        objects.push(object.id);
    }

    return objects;
}

const bucket = new aws.s3.Bucket("calculator-website");

const bucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock("calculator-website-public-access", {
    bucket: bucket.id,
    blockPublicAcls: false,
    blockPublicPolicy: false,
    ignorePublicAcls: false,
    restrictPublicBuckets: false,
})

const bucketPolicy = new aws.s3.BucketPolicy("calculator-website-frontend-policy", {
    bucket: bucket.bucket,
    policy: bucket.bucket.apply(createPublicReadPolicy),
}, {
    dependsOn: [bucketPublicAccessBlock]
});

const bucketWebsiteConfig = new aws.s3.BucketWebsiteConfiguration("calculator-website-frontend-config", {
    bucket: bucket.bucket,
    indexDocument: { suffix: 'index.html' },
    errorDocument: { key: 'index.html' },
});

const objects = addFolderContents("./dist");

export const output = {
    bucket: {
        id: bucket.id,
        arn: bucket.arn,
    },
    bucketPolicy: {
        id: bucketPolicy.id,
        arn: bucket.arn,
    },
    websiteConfig: {
        id: bucketWebsiteConfig.id,
        endpoint: bucketWebsiteConfig.websiteEndpoint
    },
    objects
};
