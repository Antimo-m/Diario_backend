import express from 'express';
import { createEntry, getEntries } from '../controllers/diaryController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();



router.post('/', authMiddleware, createEntry);

router.get('/', getEntries);

export default router;

