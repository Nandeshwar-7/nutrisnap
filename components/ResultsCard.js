'use client';

import { motion } from 'framer-motion';

function getBarColor(score) {
  if (typeof score !== 'number') return 'bg-neutral-300';
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default function ResultsCard({ result }) {
  if (!result) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        {result.isFood ? (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">{result.foodName}</h2>
            <p className="text-neutral-700">Estimated Calories: {result.estimatedCalories}</p>
            <div>
              <div className="flex items-center justify-between text-sm text-neutral-600">
                <span>Health Score</span>
                <span>{result.healthScore}/100</span>
              </div>
              <div className="h-3 w-full rounded-full bg-neutral-200 mt-2 overflow-hidden">
                <div
                  className={`h-3 ${getBarColor(result.healthScore)}`}
                  style={{ width: `${Math.max(0, Math.min(100, Number(result.healthScore) || 0))}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-neutral-700">This doesn’t look like food — Please try uploading an image which contains food.</p>
        )}
      </div>
    </motion.div>
  );
}


