/**
 * Zod Schemas for Contract Testing
 * Define expected response structures for workflow outputs
 */

import { z } from 'zod';

// ===== Common Schemas =====

export const contactFormSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  submissionId: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
  data: z
    .object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      message: z.string().min(1),
    })
    .optional(),
});

export const leadCaptureSchema = z.object({
  success: z.boolean(),
  leadId: z.string().uuid(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted']),
  source: z.string(),
  data: z.object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    company: z.string().optional(),
    phone: z.string().optional(),
  }),
  createdAt: z.string().datetime(),
});

export const emailNotificationSchema = z.object({
  sent: z.boolean(),
  messageId: z.string().optional(),
  recipient: z.string().email(),
  subject: z.string(),
  timestamp: z.string().datetime(),
  error: z.string().optional(),
});

export const webhookResponseSchema = z.object({
  executionId: z.string().optional(),
  status: z.enum(['success', 'error', 'pending']),
  data: z.any().optional(),
  error: z
    .object({
      message: z.string(),
      code: z.string().optional(),
    })
    .optional(),
});

// ===== Error Response Schemas =====

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    field: z.string().optional(),
  }),
});

export const validationErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    validationErrors: z.array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    ),
  }),
});

// ===== Execution Schemas =====

export const executionDataSchema = z.object({
  resultData: z.object({
    runData: z.record(z.any()),
  }),
  executionData: z.object({
    contextData: z.any(),
    nodeExecutionStack: z.array(z.any()),
    waitingExecution: z.any(),
  }),
});

// ===== Export Type Helpers =====

export type ContactFormResponse = z.infer<typeof contactFormSchema>;
export type LeadCaptureResponse = z.infer<typeof leadCaptureSchema>;
export type EmailNotificationResponse = z.infer<typeof emailNotificationSchema>;
export type WebhookResponse = z.infer<typeof webhookResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type ValidationError = z.infer<typeof validationErrorSchema>;
export type ExecutionData = z.infer<typeof executionDataSchema>;

// ===== Schema Registry =====

export const schemaRegistry = {
  contactForm: contactFormSchema,
  leadCapture: leadCaptureSchema,
  emailNotification: emailNotificationSchema,
  webhookResponse: webhookResponseSchema,
  error: errorResponseSchema,
  validationError: validationErrorSchema,
  executionData: executionDataSchema,
} as const;

export type SchemaName = keyof typeof schemaRegistry;

/**
 * Get schema by name
 */
export function getSchema(name: SchemaName): z.ZodSchema {
  return schemaRegistry[name];
}

/**
 * Validate data against schema
 */
export function validateSchema<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}
