import { Request, Response, NextFunction } from "express";

export const sanitizeData = <T extends object>(obj: T): T => {
    for (const key in obj) {
        if (key.startsWith('$')) {
            delete obj[key];
        } else {
            const val = obj[key];
            if (val !== null && typeof val === 'object') {
                sanitizeData(val as object);
            }
        }
    }
    return obj;
}
export const nosqlSanitize = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) sanitizeData(req.body);
    if (req.query) sanitizeData(req.query);
    if (req.params) sanitizeData(req.params);
    next();
}
