import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { sendSuccess, sendError } from '../utils/http.js';

const router = Router();

router.post('/', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded', 400);
    }

    const urls = req.files.map(file => {
      return `http://localhost:5000/uploads/${file.filename}`;
    });

    return sendSuccess(res, urls, 'Files uploaded successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
});

export default router;
