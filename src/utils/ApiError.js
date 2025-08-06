class ApiError extends Error {
    constructor(
        message = "An unexpected error occurred",
        statusCode,
        errors = [],
        stack = ''
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false; // Indicates that the operation was not successful
        this.errors = errors;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
module.exports = { ApiError };