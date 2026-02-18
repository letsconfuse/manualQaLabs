/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Custom neon/dark theme colors if needed later
                primary: '#0ea5e9',
                secondary: '#6366f1',
                dark: '#0f172a',

                // Theme Semantic Colors
                body: 'rgb(var(--bg-body) / <alpha-value>)',
                surface: 'rgb(var(--bg-surface) / <alpha-value>)',
                'primary-color': 'rgb(var(--text-primary) / <alpha-value>)',
                'secondary-color': 'rgb(var(--text-secondary) / <alpha-value>)',
                theme: 'rgb(var(--border-color) / <alpha-value>)',
                'accent-primary': 'rgb(var(--accent-primary) / <alpha-value>)',
                'accent-secondary': 'rgb(var(--accent-secondary) / <alpha-value>)',
            }
        },
    },
    plugins: [],
}
