/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,js,svelte,ts}", // ✅ Ensures Tailwind scans your Svelte files
    ],
    theme: {
      extend: {}, // ✅ You can add custom styles here if needed
    },
    plugins: [require("daisyui")], // ✅ Ensure DaisyUI is included
    daisyui: {
      themes: ["light", "dark"], // ✅ Enables DaisyUI themes (optional)
    },
  };
  