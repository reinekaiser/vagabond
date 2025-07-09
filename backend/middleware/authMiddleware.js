import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import response from '../utils/responseHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vagabond123';

export const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token || token === 'undefined') {
            console.warn('No token provided or token is undefined');
            return response(res, 401, false, 'Not authorized, no token');
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            console.warn('Token verification failed:', err.message);
            return response(res, 401, false, 'Not authorized, token invalid');
        }

        // Get user from token
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            console.warn('User not found for token:', decoded.userId);
            return response(res, 401, false, 'Not authorized, user not found');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return response(res, 401, false, 'Not authorized, token failed');
    }
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        console.warn('User is not admin:', req.user ? req.user.email : 'No user');
        return response(res, 403, false, 'Not authorized as admin');
    }
}; 