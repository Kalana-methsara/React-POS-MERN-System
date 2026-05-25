// src/middleware/errorMiddleware.ts
// import { Request, Response, NextFunction } from 'express';
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod'; // Zod ගෙන් import කරගන්න

// අනිවාර්යයෙන්ම පරාමිති 4ක් තිබිය යුතුය (err, req, res, next)
// export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // මෙතැනදී Typescript විසින් err, req, res, next යන පරාමිති හතරම 
  // නිවැරදි වර්ගය (Type) ලෙස හඳුනා ගනී.
  let statusCode = err.status || 500;
  let message = err.message || "Server Error";
  let errors: any = null; // errors සඳහා අලුත් variable එකක්

  // MongoDB ID error එකක් නම් 400 කරන්න
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Zod error එකක් නම් (ඔබ Zod පාවිච්චි කරනවා නම්)
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.issues.map(issue => ({
      path: issue.path,
      message: issue.message
    }));
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }), // errors තිබේ නම් පමණක් යවන්න
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};