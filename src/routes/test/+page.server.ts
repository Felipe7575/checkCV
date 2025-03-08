import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms/server';
import { fail } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import { db } from '$lib/server/db';
import { filesTable } from '$lib/server/db/schema';
import { asc, desc, eq } from 'drizzle-orm';

// ✅ Only validate the filename (Superforms does not handle `File` objects)
const schema = z.object({
    filename: z.string().min(1, 'Please upload a file.'),
    url: z.string().optional()
});

export const load = async ({ locals }) => {  
    if (!locals.user) {  // ✅ Check authentication using "locals"
        return fail(401, { error: 'Unauthorized' });
    }
    const userId = locals.user.id;  
    // GET THE FILES BY THE USER ID FROM THE DATABASE
    const res = await db.select().from(filesTable).where(eq(filesTable.userId, userId)).orderBy(desc(filesTable.uploadedAt))



    return { 
        form: await superValidate(zod(schema)),
        files: res
    };
};

export const actions = {
    upload: async ({ request, locals} ) => {  
        console.log('Upload request received');
        const userId = locals.user.id;  

        const formData = await request.formData();
        const file = formData.get('file');

        // ✅ Ensure a valid file is uploaded
        if (!(file instanceof File) || !file.name) {
            return fail(400, {
                form: await superValidate(zod(schema)),
                error: 'Invalid file. Please upload a valid file.'
            });
        }

        // ✅ Validate only the filename
        const form = await superValidate({ filename: file.name }, zod(schema));
        if (!form.valid) {
            return fail(400, { form });
        }

        try {
            // ✅ Upload file to Vercel Blob
            const blob = await put(file.name, file, {
                access: 'public',
                token: BLOB_READ_WRITE_TOKEN
            });

            console.log('Upload successful:', blob.url);

            // ✅ Return the URL inside `message()`
            form.data.url = blob.url;

            // UPLOAD THE FILE BY THE USER ID TO THE DATABASE
            const res = await db.insert(filesTable).values({
                userId: userId,
                fileUrl: blob.url,
                originalName: file.name
            }).returning()
            console.log(res)



            return {form}
        } catch (err) {
            console.error('Upload failed:', err);
            return fail(500, { form, error: 'Upload failed' });
        }
    }
};
