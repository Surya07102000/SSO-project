/**
 * Standard API response structure
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Request success status
 * @property {string} message - Response message
 * @property {*} [data] - Response data (optional)
 * @property {Object} [meta] - Metadata like pagination (optional)
 * @property {Array} [errors] - Validation/error details (optional)
 * @property {number} timestamp - Response timestamp
 */

/**
 * HTTP Status codes enum
 */
const StatusCodes = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

/**
 * Build standardized API response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @param {Object} meta - Metadata
 * @param {Array} errors - Error details
 */
const buildResponse = (res, { statusCode, success, message, data = null, meta = null, errors = null }) => {
    const response = {
        success,
        message,
    };

    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;
    if (errors !== null) response.errors = errors;

    return res.status(statusCode).json(response);
};

/**
 * Success response builders
 */
const success = {
    /**
     * Standard success response
     */
    ok: (res, message = 'Success', data = null, meta = null) =>
        buildResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message,
            data,
            meta
        }),

    /**
     * Resource created successfully
     */
    created: (res, message = 'Resource created successfully', data = null) =>
        buildResponse(res, {
            statusCode: StatusCodes.CREATED,
            success: true,
            message,
            data
        }),

    /**
     * No content response
     */
    noContent: (res, message = 'No content') =>
        buildResponse(res, {
            statusCode: StatusCodes.NO_CONTENT,
            success: true,
            message
        }),

    /**
     * Paginated response
     */
    paginated: (res, data, pagination, message = 'Data retrieved successfully') =>
        buildResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message,
            data,
            meta: { pagination }
        })
};

/**
 * Error response builders
 */
const error = {
    /**
     * Bad request error
     */
    badRequest: (res, message = 'Bad request', errors = null) =>
        buildResponse(res, {
            statusCode: StatusCodes.BAD_REQUEST,
            success: false,
            message,
            errors
        }),

    /**
     * Unauthorized error
     */
    unauthorized: (res, message = 'Unauthorized access') =>
        buildResponse(res, {
            statusCode: StatusCodes.UNAUTHORIZED,
            success: false,
            message
        }),

    /**
     * Forbidden error
     */
    forbidden: (res, message = 'Access forbidden') =>
        buildResponse(res, {
            statusCode: StatusCodes.FORBIDDEN,
            success: false,
            message
        }),

    /**
     * Not found error
     */
    notFound: (res, message = 'Resource not found') =>
        buildResponse(res, {
            statusCode: StatusCodes.NOT_FOUND,
            success: false,
            message
        }),

    /**
     * Conflict error
     */
    conflict: (res, message = 'Resource conflict', errors = null) =>
        buildResponse(res, {
            statusCode: StatusCodes.CONFLICT,
            success: false,
            message,
            errors
        }),

    /**
     * Validation error
     */
    validation: (res, message = 'Validation failed', errors = null) =>
        buildResponse(res, {
            statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
            success: false,
            message,
            errors
        }),

    /**
     * Internal server error
     */
    internal: (res, message = 'Internal server error', error = null) =>
        buildResponse(res, {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message,
            errors: error ? [{ message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined }] : null
        }),

    /**
     * Service unavailable error
     */
    serviceUnavailable: (res, message = 'Service temporarily unavailable') =>
        buildResponse(res, {
            statusCode: StatusCodes.SERVICE_UNAVAILABLE,
            success: false,
            message
        })
};

/**
 * Custom response builder for specific cases
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} responseData - Custom response data
 */
const custom = (res, statusCode, responseData) => {
    const response = {
        success: statusCode < 400,
        timestamp: Date.now(),
        ...responseData
    };

    return res.status(statusCode).json(response);
};

module.exports = {
    StatusCodes,
    success,
    error,
    custom
}; 