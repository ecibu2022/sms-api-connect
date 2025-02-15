const AsyncHandler = (requestHandler) => {
    return (Request, Response, next) => {
        Promise.resolve(requestHandler(Request, Response, next)).catch((error) => next(error))
    }
}

module.exports = AsyncHandler