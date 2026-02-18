export const sanitizeData = (obj) => {
    if (obj instanceof Object) {
        for (const key in obj) {
            if (key.startsWith('$')) {
                delete obj[key];
            } else {
                sanitizeData(obj[key]);
            }
        }
    }
    return obj;
}
export const nosqlSanitize = (req, res, next) => {
    if (req.body) sanitizeData(req.body);
    if (req.query) sanitizeData(req.query);
    if (req.params) sanitizeData(req.params);
    next();
}
