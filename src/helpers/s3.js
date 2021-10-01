const AWS = require('aws-sdk');
const keys = require('../keys/keys');

const s3 = new AWS.S3({
    bucketName: keys.bucketName,
    signatureVersion: "v4",
    region: "eu-west-1" 
});



module.exports = s3;