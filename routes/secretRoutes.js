import express from 'express';
import { setupSecret, secretLogin, secretLogout, secretStatus } from '../controllers/secretController.js';
import { secretMiddleware } from '../middlewares/secretMiddleware.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/status', authMiddleware, secretStatus);
router.post('/setup',authMiddleware, setupSecret);
router.post('/login', authMiddleware, secretLogin);
router.post('/logout', authMiddleware,  secretLogout);
router.get('/protected', authMiddleware,secretMiddleware, (req, res) => {
  res.json({ message: 'Sei dentro il DiarioSegreto' });
});

export default router;
