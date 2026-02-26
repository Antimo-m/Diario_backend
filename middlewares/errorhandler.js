function errorHandler(err, req, res, next) {
    console.error(err);

    const status = err && err.status ? err.status : 500;

    if (process.env.NODE_ENV === "development") {
        return res.status(status).json({ message: err.message, stack: err.stack });
    }

    const publicMessage = err && err.publicMessage ? err.publicMessage : "Internal Server Error";
    return res.status(status).json({ message: publicMessage });
}

export default errorHandler