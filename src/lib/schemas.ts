import { z } from "zod";

export const filesZodSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    fileUrl: z.string().min(1, 'Please upload a file.'),
    originalName: z.string().optional(),
    uploadedAt: z.string().optional(),
});
