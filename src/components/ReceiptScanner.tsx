import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, RefreshCw, FileText, CheckCircle2, ArrowRight, Sparkles, Smile } from 'lucide-react';
import { Member } from '../types';

interface ReceiptScannerProps {
  onClose: () => void;
  onScanComplete: (scannedData: { name: string; amount: number; category: string; caption: string }) => void;
  members: Member[];
}

export default function ReceiptScanner({ onClose, onScanComplete, members }: ReceiptScannerProps) {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'processed'>('idle');
  const [hasCamera, setHasCamera] = useState(true);
  const [scannedResult, setScannedResult] = useState({
    store: 'Curlies Beach Shack, Goa',
    amount: 3250,
    category: 'Food',
    date: '2026-10-17',
    items: [
      { name: 'Butter Garlic Prawns x2', price: 1400 },
      { name: 'Stuffed Crab x1', price: 750 },
      { name: 'Kinfisher beers x6', price: 900 },
      { name: 'Service Tax & GST', price: 200 }
    ]
  });

  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanState === 'scanning') {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setScanState('processed');
            }, 500);
            return 100;
          }
          return prev + 4;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [scanState]);

  const handleStartScan = () => {
    setScanState('scanning');
  };

  const handleApplyScan = () => {
    onScanComplete({
      name: scannedResult.store,
      amount: scannedResult.amount,
      category: scannedResult.category,
      caption: 'Auto-scanned via Minto OCR. Spreads: ' + scannedResult.items.map(i => i.name.split(' ')[0]).join(', ')
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#E85D3A] flex items-center justify-center">
              <Camera size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#111111]">Receipt OCR Scanner</h3>
              <p className="text-[10px] text-gray-400 font-medium">Under 10 seconds auto-splitting</p>
            </div>
          </div>
          <button 
            id="close-scanner-btn"
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 rounded-full transition text-[#666666]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Outer Scanner Wrapper */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence mode="wait">
            {scanState === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-center"
              >
                {/* Simulated Camera Viewfinder */}
                <div className="relative aspect-[3/4] rounded-[24px] bg-slate-900 overflow-hidden border-2 border-dashed border-gray-200 p-2 group flex flex-col justify-between">
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg"></div>

                  {/* Backdrop bill mockup image in viewfinder */}
                  <div className="absolute inset-4 rounded-xl overflow-hidden bg-slate-850 flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80"
                      className="w-full h-full object-cover opacity-60 absolute"
                      alt="Receipt template"
                    />
                    <div className="z-10 bg-white/95 rounded-2xl p-4 shadow-lg w-5/6 text-left space-y-2 transform -rotate-2 border border-gray-100">
                      <div className="border-b border-dashed border-gray-200 pb-1.5 text-center">
                        <div className="text-[10px] font-black tracking-widest text-[#111111] uppercase">CURLIES SHACK</div>
                        <span className="text-[7px] text-gray-400 font-mono">ANJUNA, GOA • OCT 17</span>
                      </div>
                      <div className="space-y-1 font-mono text-[8px] text-[#666666]">
                        <div className="flex justify-between"><span>Butter Garlic Prawns</span><span>₹1,400</span></div>
                        <div className="flex justify-between"><span>Stuffed Crab</span><span>₹750</span></div>
                        <div className="flex justify-between"><span>Kingfisher Beers x6</span><span>₹900</span></div>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-dashed border-gray-200 font-bold text-xs text-[#111111]">
                        <span>TOTAL</span>
                        <span>₹3,250</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <span className="text-[10px] bg-black/60 text-white px-3 py-1.5 rounded-full font-bold backdrop-blur-sm shadow-md">
                      Aesthetic Receipt Captured
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-[#111111]">Auto AI Receipt OCR Extractor</h4>
                  <p className="text-xs text-[#666666] leading-relaxed">
                    Instantly isolates restaurant lines, beach tax, and beers. Generates fair splits in one click.
                  </p>
                </div>

                <button
                  id="start-ocr-scan-btn"
                  onClick={handleStartScan}
                  className="w-full bg-[#E85D3A] hover:bg-[#d15030] text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Camera size={18} />
                  <span>Scan and Extract Bill Details</span>
                </button>
              </motion.div>
            )}

            {scanState === 'scanning' && (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-center py-6"
              >
                {/* Glowing laser screen scanner */}
                <div className="relative aspect-[3/4] rounded-[24px] bg-slate-900 overflow-hidden border border-gray-850 p-1">
                  <img 
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80"
                    className="w-full h-full object-cover opacity-30"
                    alt="Receipt layout"
                  />
                  {/* Glowing orange scanning bar */}
                  <motion.div 
                    className="absolute left-0 right-0 h-1.5 bg-[#E85D3A] shadow-[0_0_15px_#E85D3A] z-10"
                    animate={{ top: ['5%', '95%', '5%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  />
                  {/* Dynamic digital reading overlays */}
                  <div className="absolute inset-10 flex flex-col justify-center items-center space-y-4">
                    <div className="bg-orange-500/10 border border-[#E85D3A]/30 text-[#E85D3A] px-4 py-2 rounded-xl text-xs font-mono font-bold animate-pulse">
                      EXTRACTING BILL OCR...
                    </div>
                    <div className="text-white/60 font-mono text-[9px] text-left space-y-1">
                      <p className={`transition-opacity duration-300 ${scanProgress > 20 ? 'opacity-100' : 'opacity-20'}`}>&gt; DETECTED STORE: CURLIES SHACK</p>
                      <p className={`transition-opacity duration-300 ${scanProgress > 50 ? 'opacity-100' : 'opacity-20'}`}>&gt; ANALYZING LINE ITEMS (4)</p>
                      <p className={`transition-opacity duration-300 ${scanProgress > 80 ? 'opacity-100' : 'opacity-20'}`}>&gt; ISOLATING CURRENCY: INR (₹)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 px-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                    <span>Processing Matrix</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#E85D3A] transition-all duration-100" 
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {scanState === 'processed' && (
              <motion.div 
                key="processed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 border border-emerald-100/40">
                  <CheckCircle2 size={24} className="text-[#4CD37D] shrink-0" />
                  <div>
                    <h4 className="text-xs font-extrabold">Bill Extracted Safely!</h4>
                    <p className="text-[10px] text-emerald-600/90 font-medium">Auto-extracted restaurant breakdown perfectly</p>
                  </div>
                </div>

                {/* Extracted Details card */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">STORE &amp; DESTINATION</span>
                      <h4 className="text-sm font-black text-[#111111]">{scannedResult.store}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">DATE</span>
                      <p className="text-xs font-mono font-bold text-[#111111]">{scannedResult.date}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">EXTRACTED ITEMS</span>
                    <div className="space-y-1.5">
                      {scannedResult.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs font-medium text-[#666666]">
                          <span>{item.name}</span>
                          <span className="font-mono font-bold text-[#111111]">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="text-xs font-black text-[#111111]">TOTAL BILL AMOUNT</span>
                    <span className="text-lg font-black text-[#E85D3A] font-mono">₹{scannedResult.amount}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-[10px] text-gray-400 text-center font-medium">
                    This bill will be split equally among all {members.length} active room/trip companions.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      id="reset-scan-btn"
                      onClick={() => setScanState('idle')} 
                      className="flex-1 py-3 px-4 border border-gray-100 hover:border-gray-300 rounded-xl text-xs font-bold text-[#666666] flex items-center justify-center gap-1.5 transition"
                    >
                      <RefreshCw size={14} />
                      <span>Retake</span>
                    </button>
                    <button
                      id="apply-scan-btn"
                      onClick={handleApplyScan}
                      className="flex-2 bg-[#E85D3A] hover:bg-[#d15030] text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <span>Split Extractions</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
