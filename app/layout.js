export const metadata = {
  title: 'NutriSnap',
  description: 'Analyze food images with Gemini',
};

import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">{children}</body>
    </html>
  );
}

