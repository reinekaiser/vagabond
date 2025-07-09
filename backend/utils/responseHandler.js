/**
 * Utility to handle API responses consistently
 * @param {Object} res - Express response object
 * @param {Number} status - HTTP status code
 * @param {Boolean} success - Indicates if the request was successful
 * @param {String} message - Response message
 * @param {Object} data - Response data (optional)
 * @returns {Object} - JSON response
 */
const response = (res, status, success, message, data = null) => {
    return res.status(status).json({
        success,
        message,
        data
    });
};

export default response; 