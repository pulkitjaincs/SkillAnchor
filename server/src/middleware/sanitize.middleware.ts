import { Request, Response, NextFunction } from "express";

export const sanitizeData = (obj: any): any => {
    if (obj instanceof Object) {
        for (const key in obj) {
            if (key.startsWith('$')) {
                delete obj[key];
            } else {
                sanitizeData((obj as any)[key]);
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
