import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { sendSuccess, sendError } from '../utils/http.js';
import fs from 'fs';
import path from 'path';

const router = Router();

router.post('/', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded', 400);
    }

    const urls = req.files.map(file => {
      return `/uploads/${file.filename}`;
    });

    return sendSuccess(res, urls, 'Files uploaded successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
});

router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return sendSuccess(res, null, 'File deleted successfully');
    } else {
      return sendError(res, 'File not found', 404);
    }
  } catch (error) {
    return sendError(res, error.message, 500);
  }
});

export default router;
