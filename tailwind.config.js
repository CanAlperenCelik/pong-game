/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    daisyui: {
        themes: ["synthwave"],
    },
    plugins: [require("daisyui")],
}