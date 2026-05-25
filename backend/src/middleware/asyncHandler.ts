// src/middleware/asyncHandler.ts
// මෙය middleware/asyncHandler.ts ලෙස සාදන්න. එවිට ඔබට controller වල try-catch ලිවීමට අවශ්‍ය නොවේ.
// RequestHandler - express-async-handler වැනි tested library එකක් npm install කර භාවිතා කරනු
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Controller එකක් ලබාගෙන, එය Promise එකක් ලෙස ක්‍රියාත්මක කර, 
// error එකක් ආවොත් next() හරහා errorMiddleware එකට යවයි.
export const asyncHandler = (fn: RequestHandler) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

