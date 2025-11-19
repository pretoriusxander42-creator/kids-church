import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Generic validation middleware factory
 * Validates request body, query, or params against a Zod schema
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }

    // Replace with validated data
    req[source] = result.data;
    next();
  };
}

// Common validation schemas
export const schemas = {
  // Auth schemas
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),

  register: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character'),
    name: z.string().min(1, 'Name is required').max(100),
  }),

  passwordReset: z.object({
    token: z.string().optional(),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain a special character')
      .optional(),
  }),

  email: z.object({
    email: z.string().email('Invalid email format'),
  }),

  // Child schemas
  createChild: z.object({
    first_name: z.string().min(1, 'First name is required').max(50),
    last_name: z.string().min(1, 'Last name is required').max(50),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    gender: z.enum(['male', 'female', 'other']).optional(),
    allergies: z.string().max(500).optional(),
    medical_notes: z.string().max(1000).optional(),
    special_needs: z.boolean().optional(),
    special_needs_details: z.string().max(1000).optional(),
  }),

  updateChild: z.object({
    first_name: z.string().min(1).max(50).optional(),
    last_name: z.string().min(1).max(50).optional(),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    allergies: z.string().max(500).optional(),
    medical_notes: z.string().max(1000).optional(),
    special_needs: z.boolean().optional(),
    special_needs_details: z.string().max(1000).optional(),
  }),

  // Parent schemas
  createParent: z.object({
    first_name: z.string().min(1, 'First name is required').max(50),
    last_name: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email().optional(),
    phone_number: z.string().min(1, 'Phone number is required').max(20),
    address: z.string().max(200).optional(),
    emergency_contact_name: z.string().max(100).optional(),
    emergency_contact_phone: z.string().max(20).optional(),
  }),

  updateParent: z.object({
    first_name: z.string().min(1).max(50).optional(),
    last_name: z.string().min(1).max(50).optional(),
    email: z.string().email().optional(),
    phone_number: z.string().max(20).optional(),
    address: z.string().max(200).optional(),
    emergency_contact_name: z.string().max(100).optional(),
    emergency_contact_phone: z.string().max(20).optional(),
  }),

  // Check-in schemas
  createCheckin: z.object({
    child_id: z.string().uuid('Invalid child ID'),
    parent_id: z.string().uuid('Invalid parent ID'),
    class_attended: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
  }),

  checkout: z.object({
    security_code: z.string().length(6, 'Security code must be 6 digits').regex(/^\d{6}$/),
  }),

  // Class schemas
  createClass: z.object({
    name: z.string().min(1, 'Class name is required').max(100),
    description: z.string().max(500).optional(),
    type: z.enum(['regular', 'special', 'ftv', 'event']).optional(),
    age_min: z.number().int().min(0).max(18).optional(),
    age_max: z.number().int().min(0).max(18).optional(),
    capacity: z.number().int().min(1).optional(),
    room_location: z.string().max(100).optional(),
    schedule: z.string().max(200).optional(),
  }),

  updateClass: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    type: z.enum(['regular', 'special', 'ftv', 'event']).optional(),
    age_min: z.number().int().min(0).max(18).optional(),
    age_max: z.number().int().min(0).max(18).optional(),
    capacity: z.number().int().min(1).optional(),
    room_location: z.string().max(100).optional(),
    schedule: z.string().max(200).optional(),
  }),

  // Special needs schemas
  createSpecialNeedsForm: z.object({
    child_id: z.string().uuid('Invalid child ID'),
    diagnosis: z.string().max(500).optional(),
    medications: z.string().max(500).optional(),
    triggers: z.string().max(500).optional(),
    calming_techniques: z.string().max(500).optional(),
    communication_methods: z.string().max(500).optional(),
    emergency_procedures: z.string().max(1000).optional(),
    additional_notes: z.string().max(1000).optional(),
  }),

  // UUID param validation
  uuidParam: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),
};
