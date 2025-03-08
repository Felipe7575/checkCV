<script lang="ts">
    import { superForm } from 'sveltekit-superforms';
    import { enhance } from '$app/forms';
    import type { PageProps } from './$types';
	import type { z } from 'zod';
	import type { filesZodSchema } from '$lib/schemas';

    let { data }: PageProps = $props();
    
    // ✅ Destructure Superforms data correctly
    const { form, message } = superForm(data.form,{
        resetForm: true,
		invalidateAll: true,
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				console.log(f.errors);
			} else {
				console.log(f);
				console.log(f.errors);
			}
		}
	});
    
    // DERIVED FOR FILE URL
    let fileUrl = $derived($form.url);

    const getFileType = (url: string) =>{
        if (!url) return "";
        const extension = url.split(".").pop().toLowerCase();
        if (["jpg", "jpeg", "png"].includes(extension)) return "image";
        if (extension === "pdf") return "pdf";
        return "other";
    }

    let selectedFile : z.infer<typeof filesZodSchema> |null = $state(null);
    const showFilePreview = (file: z.infer<typeof filesZodSchema>) => {
        selectedFile = file;
        document.getElementById("fileModal").showModal();
    }
    const closeModal = () => {
        selectedFile = null;
        document.getElementById("fileModal").close();
    }

    let isLoading = $state(false); 
    const handleIframeLoad = () => {
        isLoading = false; // ✅ Hide loader when iframe is loaded
    };

    const handleOutsideClick = (event: MouseEvent) => {
        const modal = document.getElementById("fileModal");
        if (modal && event.target === modal) {
            closeModal();
        }
    };
    

</script>




<div class="grid grid-rows-3 gap-4 h-screen bg-base-200 p-6">
    <!-- ✅ First Section (1/3 of Screen) -->
    <div class="card mx-auto row-span-1 bg-base-100 shadow-lg p-6 max-w-lg w-full h-full flex flex-col justify-center">
        <h2 class="text-xl font-bold text-center mb-4">Upload Your CV</h2>

        <form use:enhance method="POST" enctype="multipart/form-data" action="?/upload" {form} class="form-control">
            <input 
                type="file" 
                name="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                class="file-input file-input-bordered w-full"
            />
            <button type="submit" class="btn btn-primary w-full mt-4">Upload CV</button>

            {#if $message}
                <div class="alert alert-success mt-4">{$message}</div>
            {/if}
        </form>
    </div>

    {#if data.files}
        <!-- ✅ Second Section (2/3 of Screen) -->
        <div class="card mx-auto row-span-2 bg-base-100 shadow-lg p-6 w-full max-w-lg h-full overflow-hidden">
            <h2 class="text-xl font-bold text-center mb-4">Uploaded CV</h2>
            
            <!-- ✅ Fixed Height & Scrollable Content -->
            <ul class="bg-base-200 rounded-box shadow-md w-full h-full max-h-full overflow-y-auto">
                {#each data.files as file}
                    <li class="grid grid-cols-[auto_1fr_auto] gap-4 items-center p-3 hover:bg-base-300 rounded-lg w-full">
                        <span class="badge badge-outline w-24 text-center">{new Date(file.uploadedAt).toISOString().split("T")[0]}</span>
                        <span class="text-lg truncate w-full">{file.originalName}</span>
                        <button class="btn btn-sm btn-primary w-20" onclick={() => showFilePreview(file)}>View</button>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>


{#if selectedFile}
    <dialog id="fileModal" class="modal modal-open" onclick="{handleOutsideClick}">
        <div class="modal-box rounded-lg shadow-xl bg-base-100 p-6">
            <h3 class="font-bold text-lg text-center text-primary">{selectedFile?.originalName}</h3>
            
            <div class="flex justify-center items-center mt-4 relative w-full">
                {#if getFileType(selectedFile.fileUrl) === "image"}
                    <img src={selectedFile.fileUrl} alt="Uploaded Image" class="rounded-lg shadow-lg max-w-full max-h-[400px] border border-gray-200" />

                {:else if getFileType(selectedFile.fileUrl) === "pdf"}
                    {#if isLoading}
                        <div class="absolute inset-0 flex justify-center items-center bg-gray-200 animate-pulse rounded-lg h-96 w-full">
                            <span class="text-gray-500">Loading PDF...</span>
                        </div>
                    {/if}

                    <iframe src={selectedFile.fileUrl} class="w-full h-96 border border-gray-300 rounded-lg shadow-md"
                        onload={handleIframeLoad}
                    ></iframe>

                {:else}
                    <p class="text-gray-500 text-center">📂 This file type cannot be displayed.</p>
                    <div class="flex justify-center mt-2">
                        <a href={selectedFile.fileUrl} target="_blank" class="btn btn-outline btn-primary ml-3">Download File</a>
                    </div>
                {/if}
            </div>

            <div class="modal-action flex justify-between mt-6 w-full">
                {#if getFileType(selectedFile?.fileUrl) === "image" || getFileType(selectedFile?.fileUrl) === "pdf"}
                    <a href={selectedFile.fileUrl} target="_blank" class="btn btn-outline btn-secondary">
                        Open in New Tab
                    </a>
                {/if}
            
                <div class="ml-auto">
                    <button class="btn btn-error" onclick={closeModal}>Close</button>
                </div>
            </div>
        </div>
    </dialog>
{/if}
