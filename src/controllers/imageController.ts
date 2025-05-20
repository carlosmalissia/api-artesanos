import { Request, Response } from 'express';
import { uploadImageToS3, deleteImageFromS3 } from '../services/s3Service';

export const uploadImage = async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const imageUrl = await uploadImageToS3(req.file);
    res.status(201).json({ imageUrl: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error });
  }
};

export const removeImage = async (req: Request, res: Response) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ message: 'Image key required' });

  try {
    await deleteImageFromS3(key);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Image deletion failed', error });
  }
};
