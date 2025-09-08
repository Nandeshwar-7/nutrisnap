'use client';

export default function Spinner({ className = '' }) {
  return (
    <div className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 ${className}`} />
  );
}


