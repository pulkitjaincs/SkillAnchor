import api from '@/lib/api';
import axios from 'axios';

/**
 * Uploads a file directly to S3 using a pre-signed URL from the backend.
 * 
 * @param {File} file - The file object to upload
 * @param {string} folder - The destination folder in S3 (e.g., 'avatars', 'resumes')
 * @returns {Promise<{url: string, key: string}>} - The public URL and S3 key of the uploaded file
 */
export const uploadFileToS3 = async (file: File, folder: string = 'uploads') => {
    // 1. Get the pre-signed URL from our backend (uses auth-equipped api instance)
    const { data: response } = await api.get('/upload/pre-signed-url', {
        params: {
            name: file.name,
            type: file.type,
            size: file.size,
            folder
        }
    });

    const { uploadUrl, key, fileUrl } = response.data;

    // 2. Upload the file directly to S3 using PUT
    // Use raw axios here — this request goes to S3, not our backend
    await axios.put(uploadUrl, file, {
        headers: {
            'Content-Type': file.type
        }
    });

    return { url: fileUrl, key };
};
