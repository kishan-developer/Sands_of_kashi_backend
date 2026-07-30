


const fs = require("fs");
const path = require("path");
const { Upload } = require("@aws-sdk/lib-storage");
const s3Client = require("../config/awsConfig");

const imageUploader = async (images, slugFileName) => {
    const list = Array.isArray(images) ? images : [images];
    const uploadedUrls = [];

    for (const image of list) {
        const ext = path.extname(image.name);
        const finalName = `${slugFileName}-${Date.now()}${ext}`;

        // Read file from tempFilePath
        const fileStream = fs.createReadStream(image.tempFilePath);

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: finalName,
                Body: fileStream,
                ContentType: image.mimetype,
            },
        });

        const result = await upload.done();
        
        // Location is available in result.Location (or result.Key with custom URL construction if needed)
        // For v3, bucket URL is typically https://{bucket}.s3.{region}.amazonaws.com/{key}
        const bucketUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${finalName}`;
        uploadedUrls.push(bucketUrl);
    }

    return uploadedUrls;
};

module.exports = imageUploader;






// const s3 = require("../config/awsConfig");
// const path = require("path");

// const imageUploader = async (images, slugFileName) => {
//     const list = Array.isArray(images) ? images : [images];
//     let uploaded = [];

//     for (const image of list) {

//         console.log("image", image)
//         const ext = path.extname(image.name);
       
//         const finalName = `${slugFileName}${ext}`;

//         const params = {
//             Bucket: process.env.AWS_BUCKET_NAME,
//             Key: finalName,
//             Body: image.data,
//             ContentType: image.mimetype,
//             // ACL: "public-read"
//         };

//         // console.log(s3)
//         const result = await s3.upload(params).promise();

//         uploaded.push({
//             // fileName: finalName,
//             url: result.Location
//         });
//     }

//     return uploaded;
// };

// module.exports = imageUploader;



