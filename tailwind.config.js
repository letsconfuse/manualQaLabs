/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom neon/dark theme colors if needed later
                primary: '#0ea5e9',
                secondary: '#6366f1',
                dark: '#0f172a',
            }
        },
    },
    plugins: [],
}
