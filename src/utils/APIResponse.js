class APIResponse {
    constructor(statusCode, data, message, success = false) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = success;
    }
}

module.exports = APIResponse