import { z } from "zod";

export const filesZodSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    fileUrl: z.string().min(1, 'Please upload a file.'),
    originalName: z.string().optional(),
    uploadedAt: z.string().optional(),
});


export const AspectResultSchema = z.object({
    text: z.string(),
    score: z.number().min(1).max(10)
});

export const EvaluationResultSchema = z.object({
    key: z.string(),
    result: AspectResultSchema,
    error: z.any().optional()
});

export const EvaluationResultsSchema = z.array(EvaluationResultSchema);