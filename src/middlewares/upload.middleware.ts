// upload.middleware.ts
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { 
        fileSize: 5 * 1024 * 1024,  // 5MB
        fieldSize: 2 * 1024 * 1024  // 2MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'));
        }
    }
});

// ✅ Middleware para pitch con campos múltiples
export const uploadPitchFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'rating', maxCount: 1 },
    { name: 'size', maxCount: 1 },
    { name: 'groundType', maxCount: 1 },
    { name: 'roof', maxCount: 1 },
    { name: 'price', maxCount: 1 },
    { name: 'business', maxCount: 1 }
]);

// ✅ Mantener el middleware original para compatibilidad
export const uploadSingle = upload.single('image');