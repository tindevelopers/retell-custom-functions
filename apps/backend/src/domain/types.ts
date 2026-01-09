import { z } from 'zod';

export const TimeWindowSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, 'HH:MM'),
  end: z.string().regex(/^\d{2}:\d{2}$/, 'HH:MM'),
});

export const FunctionConfigSchema = z.object({
  enabled: z.boolean().default(true),
  timezone: z.string(),
  days_of_week: z.array(
    z.enum([
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]),
  ),
  windows: z.array(TimeWindowSchema).min(1),
  transfer_number: z.string().optional(),
  deny_message: z.string().optional(),
});

export const ProjectConfigSchema = z.object({
  project_id: z.string(),
  functions: z.record(FunctionConfigSchema),
});

export type TimeWindow = z.infer<typeof TimeWindowSchema>;
export type FunctionConfig = z.infer<typeof FunctionConfigSchema>;
export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

