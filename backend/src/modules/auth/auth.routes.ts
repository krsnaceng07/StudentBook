import { Router } from 'express';
import * as authController from './auth.controller.js';
import { 
  validateRequest, 
  studentSignupSchema, 
  collegeSignupSchema, 
  loginSchema 
} from '../../middleware/validation.middleware.js';

const router = Router();

// Secure Input Validation: validate body schemas and sanitize inputs against XSS scripts before passing to controller
router.post('/signup/student', validateRequest(studentSignupSchema), authController.signupStudent);
router.post('/signup/college', validateRequest(collegeSignupSchema), authController.signupCollege);
router.post('/login', validateRequest(loginSchema), authController.login);

export default router;
