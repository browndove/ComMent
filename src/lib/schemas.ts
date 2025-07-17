import { z } from 'zod';

// Schema for user login
export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// Schema for user registration
export const RegisterSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  universityId: z.string().min(5, { message: 'A valid university ID is required.'}),
  role: z.enum(['student', 'counselor'], { required_error: 'You must select a role.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'], // Set the error on the confirmPassword field
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

// Schema for requesting an appointment
export const RequestAppointmentSchema = z.object({
  counselorId: z.string().min(1, { message: "Please select a counselor." }),
  preferredDate: z.date({ required_error: "Please select a preferred date."}),
  preferredTime: z.string().min(1, { message: "Please select a preferred time."}),
  contactMethod: z.enum(['video', 'chat', 'in-person'], { required_error: "Please select a contact method."}),
  appointmentType: z.enum(['initial-consultation', 'follow-up', 'academic-support', 'crisis-support'], { required_error: "Please select an appointment type."}),
  priority: z.enum(['normal', 'urgent'], { required_error: "Please select a priority level."}),
  reason: z.string().min(10, { message: "Please provide a brief reason for your visit (min. 10 characters)."}).max(1000, "The reason should not exceed 1000 characters."),
  referralSource: z.string().optional(),
  timezone: z.string(), // Will be populated automatically
});
export type RequestAppointmentInput = z.infer<typeof RequestAppointmentSchema>;

// Schema for updating user profile (comprehensive version)
export const ProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  universityId: z.string().optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  
  // Personal Information
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  nationality: z.string().max(50, 'Nationality must be less than 50 characters').optional(),
  
  // Academic Information
  program: z.string().max(100, 'Program must be less than 100 characters').optional(),
  yearOfStudy: z.enum(['1', '2', '3', '4', '5', 'graduate']).optional(),
  faculty: z.string().max(100, 'Faculty must be less than 100 characters').optional(),
  department: z.string().max(100, 'Department must be less than 100 characters').optional(),
  
  // Contact Information
  currentAddress: z.string().max(500, 'Address must be less than 500 characters').optional(),
  permanentAddress: z.string().max(500, 'Address must be less than 500 characters').optional(),
  
  // Emergency Contact
  emergencyContactName: z.string().max(100, 'Emergency contact name must be less than 100 characters').optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelationship: z.string().max(50, 'Relationship must be less than 50 characters').optional(),
  
  // Social Media
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  twitterUrl: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  instagramUrl: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
  
  // Interests & Skills
  interests: z.string().max(500, 'Interests must be less than 500 characters').optional(),
  languages: z.string().max(200, 'Languages must be less than 200 characters').optional(),
  
  // Medical Information
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  medicalConditions: z.string().max(500, 'Medical conditions must be less than 500 characters').optional(),
  allergies: z.string().max(500, 'Allergies must be less than 500 characters').optional(),
});
export type ProfileInput = z.infer<typeof ProfileSchema>;

// Image upload schema - fixed for Server Actions compatibility
export const ImageUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  fileType: z.string().refine(
    (type) => type.startsWith('image/'),
    'File must be an image'
  ),
  fileData: z.string(), // Base64 encoded file data or file path
});
export type ImageUploadInput = z.infer<typeof ImageUploadSchema>;

// Alternative: If you need to validate actual File objects in client-side code
export const ClientImageUploadSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    'Must be a valid file'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    'File size must be less than 5MB'
  ).refine(
    (file) => file.type.startsWith('image/'),
    'File must be an image'
  ),
});
export type ClientImageUploadInput = z.infer<typeof ClientImageUploadSchema>;