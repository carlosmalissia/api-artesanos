import { Router } from 'express';
import multer from 'multer';
import { uploadImage, removeImage } from '../controllers/imageController';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('image'), uploadImage);
router.delete('/remove', removeImage);

export default router;
