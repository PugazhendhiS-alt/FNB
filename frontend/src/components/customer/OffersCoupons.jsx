import { useState, useEffect } from 'react';
import { TagIcon, ClockIcon } from '@heroicons/react/24/outline';

function getTimeRemaining(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${Math.floor(diff / (1000 * 60 * 60))}h`;
}

export default function OffersCoupons({ offers, loading }) {
  const [copied, setCopied] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 animate-pulse">
        <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!offers?.length) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-500">
            <TagIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Offers</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No offers available right now. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-500">
          <TagIcon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Offers & Coupons</h3>
      </div>
      <div className="space-y-2.5">
        {offers.map(offer => {
          const remaining = getTimeRemaining(offer.expiresAt);
          return (
            <div key={offer.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-800/30">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{offer.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{offer.description}</p>
                {remaining && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                    <ClockIcon className="w-3 h-3" />
                    {remaining} left
                  </div>
                )}
              </div>
              {offer.code && (
                <button
                  onClick={() => handleCopyCode(offer.code)}
                  className={`flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    copied === offer.code
                      ? 'bg-green-500 text-white'
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {copied === offer.code ? 'Copied!' : offer.code}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
