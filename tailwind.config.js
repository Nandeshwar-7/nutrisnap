/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './pages/**/*.{js,jsx}',
    // Removed @21dev/ui since the package is not available
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

