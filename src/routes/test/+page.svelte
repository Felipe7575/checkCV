<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { z } from 'zod';
	import {
		AspectResultSchema,
		EvaluationResultSchema,
		EvaluationResultsSchema,
		filesZodSchema
	} from '$lib/schemas';
	import { deserialize } from '$app/forms';
	import { writable } from 'svelte/store';

	// Types
	type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

	// Constants
	const ACCEPTED_FILE_TYPES = ['.pdf', '.jpg', '.jpeg', '.png'];
	const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png'];
	const SUPPORTED_PDF_EXTENSION = 'pdf';

	let { data }: PageProps = $props();

	// Superforms setup
	const { form, message } = superForm(data.form, {
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

	// Store for selected file
	let selectedFile : z.infer<typeof filesZodSchema> | null = $state(null)
    let generatingReport = $state(false);
    let isLoading = $state(false);
	let errorMessage :string | null = $state(null);
	let resultsSelectedCv : EvaluationResult[] | null = $state(null);


	// Determine file type
	const getFileType = (url: string) => {
		if (!url) return '';
		const extension = url.split('.').pop().toLowerCase();
		if (SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) return 'image';
		if (extension === SUPPORTED_PDF_EXTENSION) return 'pdf';
		return 'other';
	};

	// Modal handling
	const showFilePreview = (file: z.infer<typeof filesZodSchema>) => {
		selectedFile = file;
		//document.getElementById('fileModal').showModal();
	};
	const closeModal = () => {
		selectedFile = null;
		//document.getElementById('fileModal').close();
	};

	// Handle file evaluation
	const evalCurriculum = async (fileId: string) => {
		const form = new FormData();
		form.append('fileId', fileId);

		try {
			generatingReport = true;
			const res = await fetch('?/evalCurriculum', {
				method: 'POST',
				body: form
			});

			if (!res.ok) throw new Error(`Network response was not ok: ${res.statusText}`);

			const dataText = await res.text();
			const results = deserialize(dataText);
            errorMessage = null;

			if (results.status === 200) {
				if (results.data.success) {
					console.log('Curriculum Evaluated Successfully');
					const res = EvaluationResultsSchema.safeParse(results.data.results);
					if (res.success) {
						resultsSelectedCv = res.data;
					} else {
						errorMessage = 'Error parsing curriculum.';
						console.error(res.error);
					}
				} else {
					errorMessage = 'Error Evaluating Curriculum';
					console.error(results.data.error);
				}
			} else {
				throw new Error('Error evaluating curriculum');
			}
		} catch (error) {
			console.error('Fetch error:', error);
			errorMessage = 'An error occurred while evaluating the curriculum. Please try again.';
		} finally {
			generatingReport = false;
		}
	};


    // Handle outside click on modal
    const handleOutsideClick = (e: MouseEvent) => {
        if (e.target === document.getElementById('fileModal')) {
            closeModal();
        }
    };
</script>

<div
	class="bg-base-200 grid h-screen max-h-screen grid-cols-1 gap-4 overflow-hidden p-4 md:grid-cols-2"
>
	<!-- Left Column - Current Interface -->
	<div class="flex flex-col gap-4 overflow-hidden">
		<!-- Upload Section -->
		<div class="card bg-base-100 mx-auto w-full max-w-lg flex-shrink-0 p-6 shadow-lg">
			<h2 class="mb-4 text-center text-xl font-bold">Upload Your CV</h2>

			<form
				use:enhance
				method="POST"
				enctype="multipart/form-data"
				action="?/upload"
				{form}
				class="form-control"
			>
				<input
					type="file"
					name="file"
					accept={ACCEPTED_FILE_TYPES.join(',')}
					class="file-input file-input-bordered w-full"
				/>
				<button type="submit" class="btn btn-primary mt-4 w-full">Upload CV</button>

				{#if $message}
					<div class="alert alert-success mt-4">{$message}</div>
				{/if}
			</form>
		</div>

		{#if data.files}
			<!-- Uploaded Files Section -->
			<div
				class="card bg-base-100 mx-auto flex h-full w-full max-w-lg flex-grow flex-col overflow-hidden p-6 shadow-lg"
			>
				<h2 class="mb-4 flex-shrink-0 text-center text-xl font-bold">Uploaded CV</h2>

				<!-- Fixed Height & Scrollable Content -->
				<div class="flex-grow overflow-hidden">
					<ul class="bg-base-200 rounded-box h-full w-full overflow-y-auto shadow-md">
						{#each data.files as file}
							<li
								class="hover:bg-base-300 grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-4 rounded-lg p-3"
							>
								<span class="badge badge-outline w-24 text-center">
									{new Date(file.uploadedAt).toISOString().split('T')[0]}
								</span>
								<span class="w-full truncate text-lg">{file.originalName}</span>
								<button
									class="btn btn-sm btn-secondary bg-secondary/50 w-20"
									onclick={() => showFilePreview(file)}
								>
									View
								</button>
								<button class="btn btn-sm btn-primary w-20" onclick={() => evalCurriculum(file.id)}>
									Inspect
								</button>
							</li>
						{/each}
						<div
							class="from-base-100 pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t to-transparent"
						></div>
					</ul>
				</div>
			</div>
		{/if}
	</div>

	<!-- Right Column - Results Section -->
	<div class="flex h-full flex-col overflow-hidden">
		<div class="card bg-base-100 flex h-full w-full flex-col p-6 shadow-lg">
			<h2 class="mb-4 flex-shrink-0 text-center text-xl font-bold">Analysis Results</h2>

			<div class="flex-grow overflow-y-auto pr-2">
                {#if !generatingReport}
                    {#if !errorMessage}
                        {#if resultsSelectedCv}
                            <div class="grid grid-cols-1 gap-4">
                                {#each resultsSelectedCv as result}
                                    <div class="card bg-base-200 p-4 shadow-xl">
                                        <h2 class="text-lg font-bold capitalize">{result.key}</h2>

                                        {#if result.error}
                                            <p class="text-red-500">Error processing this aspect.</p>
                                        {:else}
                                            <p class="text-gray-600">{result.result.text}</p>
                                            <div class="mt-2 flex items-center gap-2">
                                                <progress
                                                    class="progress progress-primary w-56"
                                                    value={result.result.score}
                                                    max="10"
                                                ></progress>
                                                <span class="badge badge-outline">{result.result.score}/10</span>
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                                <div
                                    class="from-base-100 pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t to-transparent"
                                ></div>
                            </div>
                        {:else}
                            <div class="flex h-full items-center justify-center">
                                <p class="text-gray-500">
                                    Select a CV and click "Inspect" to see analysis results here.
                                </p>
                            </div>
                        {/if}
                    {:else}
                        <div class="alert alert-error">{errorMessage}</div>
                    {/if}
                {:else}
                    <div class="flex h-full items-center justify-center">
                        <span class="loading loading-spinner text-primary"></span>
                    </div>
                {/if}
			</div>
		</div>
	</div>
</div>

{#if selectedFile}
	<dialog id="fileModal" class="modal modal-open" onclick={handleOutsideClick}>
		<div class="modal-box bg-base-100 rounded-lg p-6 shadow-xl">
			<h3 class="text-primary text-center text-lg font-bold">{selectedFile?.originalName}</h3>

			<div class="relative mt-4 flex w-full items-center justify-center">
				{#if getFileType(selectedFile.fileUrl) === 'image'}
					<img
						src={selectedFile.fileUrl}
						alt="Uploaded Image"
						class="max-h-[400px] max-w-full rounded-lg border border-gray-200 shadow-lg"
					/>
				{:else if getFileType(selectedFile.fileUrl) === 'pdf'}
					{#if isLoading}
						<div
							class="absolute inset-0 flex h-96 w-full animate-pulse items-center justify-center rounded-lg bg-gray-200"
						>
							<span class="text-gray-500">Loading PDF...</span>
						</div>
					{/if}

					<iframe
						src={selectedFile.fileUrl}
						class="h-96 w-full rounded-lg border border-gray-300 shadow-md"
						onload={() => isLoading = false}
					></iframe>
				{:else}
					<p class="text-center text-gray-500">📂 This file type cannot be displayed.</p>
					<div class="mt-2 flex justify-center">
						<a href={selectedFile.fileUrl} target="_blank" class="btn btn-outline btn-primary ml-3"
							>Download File</a
						>
					</div>
				{/if}
			</div>

			<div class="modal-action mt-6 flex w-full justify-between">
				{#if getFileType(selectedFile?.fileUrl) === 'image' || getFileType(selectedFile?.fileUrl) === 'pdf'}
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
