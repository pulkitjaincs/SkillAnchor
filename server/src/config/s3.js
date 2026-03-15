import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || process.env.AWS_BUCKET_NAME;

export const generatePreSignedUrl = async (key, contentType, size) => {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
        ContentLength: size
    });

    // Generate URL that expires in 5 minutes (300 seconds)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return { uploadUrl, key, fileUrl };
};

// Generate a pre-signed URL to read a private object (expires in 1 hour)
export const generateReadSignedUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });
    return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

export const deleteFromS3 = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key
    });
    return s3Client.send(command);
};

export const uploadToS3 = async (buffer, mimetype, key) => {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimetype
    });

    await s3Client.send(command);
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};