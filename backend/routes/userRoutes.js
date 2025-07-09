import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    registerUser,
    loginUser,
    logoutUser,
    deleteAccount,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    getUserById
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(protect);
router.put('/change-password', changePassword);
router.put('/profile', updateProfile);
router.delete('/delete-account', deleteAccount);
router.get('/:userId', getUserById);

// Export router
export default router;