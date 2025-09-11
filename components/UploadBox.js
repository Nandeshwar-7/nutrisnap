'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const openFilePicker = useCallback((withCapture = false) => {
    const input = inputRef.current;
    if (!input) return;
    if (withCapture) {
      input.setAttribute('capture', 'environment');
    } else {
      input.removeAttribute('capture');
    }
    input.click();
    // Remove capture after triggering to avoid affecting future clicks
    if (withCapture) {
      setTimeout(() => {
        input.removeAttribute('capture');
      }, 0);
    }
  }, []);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);

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

  const stopStreamTracks = useCallback((stream) => {
    try {
      stream?.getTracks?.().forEach((t) => t.stop());
    } catch (_) {
      // ignore
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (mediaStream) stopStreamTracks(mediaStream);
    setMediaStream(null);
    setIsCameraOpen(false);
  }, [mediaStream, stopStreamTracks]);

  useEffect(() => {
    return () => {
      // cleanup on unmount
      if (mediaStream) stopStreamTracks(mediaStream);
    };
  }, [mediaStream, stopStreamTracks]);

  // Ensure the media stream reliably attaches to the <video> when camera opens
  useEffect(() => {
    if (!isCameraOpen) return;
    const video = videoRef.current;
    if (video && mediaStream) {
      try {
        video.srcObject = mediaStream;
        video.muted = true;
        video.setAttribute('playsinline', '');
        const maybePromise = video.play?.();
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise.catch(() => {
            // Some browsers may block autoplay; user will tap to play
          });
        }
      } catch (_) {
        // ignore attach errors
      }
    }
  }, [isCameraOpen, mediaStream]);

  

  const openCamera = useCallback(async () => {
    setCameraError(null);
    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported by this browser.');
      // graceful fallback: invoke mobile capture via file input
      openFilePicker(true);
      return;
    }
    try {
      const constraints = { video: { facingMode: { ideal: 'environment' } }, audio: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMediaStream(stream);
      setIsCameraOpen(true);
      // The actual attachment to the <video> happens in the effect above
    } catch (err) {
      setCameraError('Unable to access camera.');
      // fallback to file input
      openFilePicker(true);
    }
  }, [openFilePicker]);

  const capturePhoto = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const width = video.videoWidth || 0;
    const height = video.videoHeight || 0;
    if (!width || !height) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setFileObj(file);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setError(null);
      closeCamera();
    }, 'image/jpeg', 0.92);
  }, [closeCamera]);

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
            onClick={() => openFilePicker(false)}
            className="px-4 py-2 rounded-md bg-black text-white text-sm"
          >
            Browse files
          </button>
          <button
            onClick={openCamera}
            className="px-4 py-2 rounded-md border border-neutral-300 text-sm inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M9 2a1 1 0 0 0-.894.553L7.382 4H5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-2.382l-.724-1.447A1 1 0 0 0 15 2H9Zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            </svg>
            Visual Search
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

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeCamera} />
          <div className="relative z-10 w-full max-w-md mx-auto rounded-xl bg-white shadow-lg p-4">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-black">
              <video ref={videoRef} className="h-full w-full object-cover" playsInline muted autoPlay />
            </div>
            {cameraError && (
              <p className="mt-3 text-sm text-red-600">{cameraError}</p>
            )}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button onClick={closeCamera} className="px-3 py-2 rounded-md border border-neutral-300">Close</button>
              <button onClick={capturePhoto} className="px-4 py-2 rounded-md bg-blue-600 text-white">Capture</button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
}


