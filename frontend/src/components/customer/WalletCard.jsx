import { memo, useState } from 'react';
import { WalletIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

function WalletCard({ wallet, loading, onTopUp }) {
  const [showTopUp, setShowTopUp] = useState(false);
  const [amount, setAmount] = useState('');

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white animate-pulse">
        <div className="h-5 w-28 bg-white/20 rounded mb-4" />
        <div className="h-8 w-32 bg-white/20 rounded mb-3" />
        <div className="h-3 w-20 bg-white/20 rounded" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="bg-white dark:bg-gray-800/95 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-500">
            <WalletIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Food Card</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">No food card linked. Contact support to set one up.</p>
      </div>
    );
  }

  const handleTopUp = () => {
    const val = parseFloat(amount);
    if (val > 0 && onTopUp) {
      onTopUp(val);
      setAmount('');
      setShowTopUp(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <WalletIcon className="w-5 h-5" />
          <h3 className="font-semibold">Food Card</h3>
        </div>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">••••{wallet.cardNumber?.slice(-4)}</span>
      </div>

      <p className="text-3xl font-bold mb-1">₹{wallet.balance?.toFixed(2)}</p>
      <p className="text-xs text-white/70 mb-4">Available balance</p>

      {!showTopUp ? (
        <button onClick={() => setShowTopUp(true)} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium">
          <PlusIcon className="w-4 h-4" /> Top Up
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            {[100, 500, 1000].map(v => (
              <button key={v} onClick={() => setAmount(String(v))} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${amount === String(v) ? 'bg-white text-primary-600' : 'bg-white/20 hover:bg-white/30'}`}>
                ₹{v}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Custom" className="flex-1 px-3 py-1.5 rounded-lg bg-white/20 text-white placeholder-white/50 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40" />
            <button onClick={handleTopUp} disabled={!amount || parseFloat(amount) <= 0} className="px-4 py-1.5 rounded-lg bg-white text-primary-600 text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors">
              Add
            </button>
          </div>
          <button onClick={() => { setShowTopUp(false); setAmount(''); }} className="text-xs text-white/60 hover:underline">Cancel</button>
        </div>
      )}

      {wallet.recentTransactions?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/20">
          <p className="text-xs font-medium text-white/80 mb-2">Recent</p>
          <div className="space-y-1.5">
            {wallet.recentTransactions.slice(0, 3).map(tx => (
              <div key={tx.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {tx.type === 'CREDIT' ? (
                    <ArrowDownIcon className="w-3 h-3 text-green-300" />
                  ) : (
                    <ArrowUpIcon className="w-3 h-3 text-red-300" />
                  )}
                  <span className="text-white/70">{tx.description || tx.type}</span>
                </div>
                <span className={tx.type === 'CREDIT' ? 'text-green-300' : 'text-red-300'}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(WalletCard, (prev, next) =>
  prev.loading === next.loading && prev.wallet?.balance === next.wallet?.balance
);
