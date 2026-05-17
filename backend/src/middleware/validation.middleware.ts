import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import xss from 'xss';
import { sendError } from '../utils/response.js';

// Custom helper to sanitize string values recursively against XSS script injections
const sanitizeObject = (obj: any): any => {
  if (!obj) return obj;
  const sanitized: any = {};
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = xss(obj[key].trim());
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

// Joi schema validating Student registration inputs
export const studentSignupSchema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string().min(6).max(100).required(),
  full_name: Joi.string().max(100).allow('', null),
  college_name: Joi.string().max(100).allow('', null),
  department: Joi.string().max(100).allow('', null),
  year: Joi.string().max(50).allow('', null)
});

// Joi schema validating College registration inputs
export const collegeSignupSchema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string().min(6).max(100).required(),
  college_name: Joi.string().required().max(100),
  college_type: Joi.string().max(50).allow('', null),
  location: Joi.string().max(150).allow('', null),
  contact_email: Joi.string().email().allow('', null)
});

// Joi schema validating common login authentication inputs
export const loginSchema = Joi.object({
  email: Joi.string().email().required().max(255),
  password: Joi.string().required().max(100)
});

// Reusable middleware factory to validate incoming request body schemas
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Sanitize incoming payload body to completely block XSS and malicious HTML injections
    req.body = sanitizeObject(req.body);

    // 2. Validate clean body against schema
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true // Strip unrecognized extra parameters to prevent parameter pollution
    });

    if (error) {
      const errorMessage = error.details.map(d => d.message).join(', ');
      return sendError(res, `Validation Error: ${errorMessage}`, 400);
    }

    // Overwrite with sanitized and validated values
    req.body = value;
    next();
  };
};
