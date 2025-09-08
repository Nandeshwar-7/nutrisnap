'use client';

import { useState } from 'react';
import UploadBox from '../components/UploadBox';
import ResultsCard from '../components/ResultsCard';

export default function Home() {
  const [result, setResult] = useState(null);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-6 gap-6">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-semibold">NutriSnap</h1>
        <p className="text-neutral-600 mt-1">Upload a food photo and get instant nutrition insights.</p>
      </div>

      <UploadBox onAnalyzed={setResult} />

      <div className="w-full max-w-2xl">
        <ResultsCard result={result} />
      </div>
    </main>
  );
}

