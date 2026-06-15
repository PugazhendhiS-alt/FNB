import { useState, useEffect, useRef } from 'react';

export default function QRScanner({ onScan, onClose }) {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const containerRef = useRef(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;

        const scanner = new Html5Qrcode('qr-scanner-container');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            try {
              const data = JSON.parse(decodedText);
              const code = data.orderCode || data.code || '';
              if (code.length === 6) {
                scanner.stop().catch(() => {});
                if (!cancelled) onScan(code);
                return;
              }
            } catch {}
            if (/^[A-Z0-9]{6}$/.test(decodedText.trim())) {
              scanner.stop().catch(() => {});
              if (!cancelled) onScan(decodedText.trim());
            }
          },
          () => {}
        );

        if (!cancelled) setScanning(true);
      } catch (err) {
        if (!cancelled) setError('Camera access denied or not supported');
      }
    }

    start();

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Camera Error</p>
              <p className="text-xs text-gray-500">{error}</p>
              <button
                onClick={onClose}
                className="btn-secondary text-sm mt-2"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div
                id="qr-scanner-container"
                ref={containerRef}
                className="w-full aspect-square rounded-xl overflow-hidden bg-gray-900"
              />
              <p className="text-xs text-gray-500 text-center mt-3">
                Point your camera at the order QR code
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
