import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

export const uploadToS3 = async (buffer, mimetype, key) => {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimetype
    });

    await s3Client.send(command);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};