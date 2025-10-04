import { Readable } from 'stream';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';


class CloudinaryService {
    constructor() {
        console.log('☁️ Initializing Cloudinary...');
        
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        
        console.log('✅ Cloudinary configured');
    }

    async uploadFile(file: Express.Multer.File, courtId?: number): Promise<{ url: string; fileId: string }> {
        try {
            console.log('☁️ Uploading to Cloudinary:', file.originalname);

            // Convertir buffer a base64
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;

            const fileName = courtId 
                ? `court_${courtId}_${Date.now()}`
                : `court_${Date.now()}`;

            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'courts',
                public_id: fileName,
                resource_type: 'auto'
            });

            console.log('✅ Uploaded successfully:', result.secure_url);

            return {
                url: result.secure_url,
                fileId: result.public_id
            };

        } catch (error) {
            console.error('❌ Cloudinary error:', error);
            throw new Error(`Upload failed: ${error}`);
        }
    }

    async deleteFile(fileId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(fileId);
            console.log('✅ File deleted:', fileId);
        } catch (error) {
            console.error('❌ Delete error:', error);
        }
    }
}

// export const googleDriveService = new GoogleDriveService();
export const cloudinaryService = new CloudinaryService();