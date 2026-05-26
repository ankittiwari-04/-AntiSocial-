import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = 
      file.mimetype.startsWith('video');
    return {
      folder: 'antisocial',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: [
        'jpg','jpeg','png','gif',
        'webp','mp4','mov','webm'
      ],
      transformation: file.fieldname === 
        'profilePicture' 
        ? [{ width: 400, height: 400, 
             crop: 'fill' }] 
        : file.fieldname === 'coverPhoto'
        ? [{ width: 1200, height: 400, 
             crop: 'fill' }]
        : [],
    };
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

export default upload;
