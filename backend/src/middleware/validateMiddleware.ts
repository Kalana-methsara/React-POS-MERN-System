import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// ඕනෑම Zod Schema එකක් පිළිගැනීමට z.ZodSchema භාවිතා කරන්න
export const validate = (schema: z.ZodSchema) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // දත්ත පරීක්ෂා කිරීම
      schema.parse({ 
        body: req.body, 
        query: req.query, 
        params: req.params 
      });
      next();
    } catch (error) {
      // මෙතැනදී error එක next(error) ලෙස යැවීමෙන් 
      // ඔබේ ගෝලීය errorHandler එක එය අල්ලා ගනී.
      next(error); 
    }
  };
