'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Spinner from './Spinner';

export default function UploadBox({ onAnalyzed }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const borderClasses = useMemo(() => (
    isDragging ? 'border-blue-500 bg-blue-50' : 'border-neutral-300 hover:border-neutral-400'
  ), [isDragging]);

  const handleFiles = useCallback((files) => {
    const file = files?.[0];
    if (!file) return;
    setFileObj(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onBrowse = useCallback((e) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const analyze = useCallback(async () => {
    if (!fileObj) return;
    setIsLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', fileObj);
      const { data } = await axios.post('/api/analyze', form);
      onAnalyzed?.(data);
    } catch (err) {
      const serverMsg = err?.response?.data?.error;
      setError(serverMsg || 'Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fileObj, onAnalyzed]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`transition rounded-xl border-2 border-dashed p-8 text-center ${borderClasses}`}
      >
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-neutral-600">Drag & drop an image, or</p>
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 rounded-md bg-black text-white text-sm"
          >
            Browse files
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onBrowse} />
        </div>
      </div>

      {previewUrl && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
          <div className="rounded-xl overflow-hidden border border-neutral-200 bg-white">
            <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={analyze}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-blue-600 disabled:opacity-60 text-white"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2"><Spinner /> Analyzing…</span>
              ) : 'Analyze Food'}
            </button>
            <button
              onClick={() => { setPreviewUrl(null); setFileObj(null); onAnalyzed?.(null); }}
              className="px-3 py-2 rounded-md border border-neutral-300"
            >
              Clear
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </motion.div>
      )}
    </div>
  );
}


