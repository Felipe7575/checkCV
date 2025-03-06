import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { fail, json } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';

const schema = z.object({
    file: z.instanceof(File, { message: 'Please select a valid file (PDF, DOC, DOCX)' })
});

export const load = async () => {
    const form = await superValidate(schema);
    return { form };
};

export const actions = {
    default: async ({ request }) => {
        const form = await superValidate(request, schema);
        if (!form.valid) {
            return fail(400, { form }); // Return validation errors
        }

        const file = form.data.file;

        try {
            const blob = await put(file.name, file, {
                access: 'public', // Make it public (or 'private' if needed)
                token: BLOB_READ_WRITE_TOKEN // Use the env token
            });

            return json({ form, url: blob.url });
        } catch (err) {
            console.error('Upload failed:', err);
            return fail(500, { form, error: 'Upload failed' });
        }
    }
};
