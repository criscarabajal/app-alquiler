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
                primary: '#CFFF5E', // Neon Green
                secondary: '#8C7DFF', // Purple
                accent: '#B87EED', // Pink-Purple
                dark: {
                    900: '#111111',
                    800: '#1A1A1A',
                    700: '#262626',
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            borderRadius: {
                'pill': '9999px',
            }
        },
    },
    plugins: [],
}
