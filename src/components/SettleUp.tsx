import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Smartphone, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, 
  Check, ExternalLink, ShieldAlert, Users, Trophy, QrCode, Copy
} from 'lucide-react';
import { Member } from '../types';
import { SimplifiedDebt } from '../data';

interface SettleUpProps {
  onClose: () => void;
  debts: SimplifiedDebt[];
  members: Member[];
  onSettle: (fromMemberId: string, toMemberId: string, amount: number) => void;
}

export default function SettleUp({ onClose, debts, members, onSettle }: SettleUpProps) {
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [selectedDebt, setSelectedDebt] = useState<SimplifiedDebt | null>(null);
  const [selectedUPIApp, setSelectedUPIApp] = useState<'PhonePe' | 'Google Pay' | 'Paytm'>('Google Pay');
  const [payGatewayState, setPayGatewayState] = useState<'idle' | 'app-picker' | 'connecting' | 'success' | 'qr-code'>('idle');
  const [loadingText, setLoadingText] = useState('Opening secure UPI link...');
  const [showCompletedSec, setShowCompletedSec] = useState(false);
  const [completedList, setCompletedList] = useState<Array<{ fromName: string; toName: string; amount: number; isPaidByMe: boolean }>>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Identify active profile view inside sandbox
  const defaultUser = members.find(m => m.id === 'm1' || m.name.includes('(You)')) || members[0];
  const [activeUserId, setActiveUserId] = useState<string>(defaultUser.id);
  
  const currentUser = members.find(m => m.id === activeUserId) || defaultUser;
  const currentUserId = currentUser.id;

  // Filter 1: You need to pay
  const pendingToPay = debts.filter(d => d.fromMemberId === currentUserId);
  // Filter 2: You will receive
  const pendingToReceive = debts.filter(d => d.toMemberId === currentUserId);

  useEffect(() => {
    // If we just got settled and everything is empty, trigger confetti!
    if (pendingToPay.length === 0 && pendingToReceive.length === 0 && completedList.length > 0) {
      setShowConfetti(true);
    }
  }, [debts, completedList, pendingToPay.length, pendingToReceive.length]);

  // Calculate settlement progress completion percentage
  const totalItems = pendingToPay.length + pendingToReceive.length + completedList.length;
  const settledItems = completedList.length;
  const completionPercent = totalItems > 0 ? Math.round((settledItems / totalItems) * 100) : 100;

  // Handles starting the payment flow
  const handleStartPayment = (debt: SimplifiedDebt) => {
    setSelectedDebt(debt);
    setPayGatewayState('app-picker');
  };

  // Helper to generate recipient UPI ID representation
  const getRecipientUpi = (debt: SimplifiedDebt) => {
    if (debt.toUpiId) return debt.toUpiId;
    const cleanName = debt.toName.toLowerCase().replace(' (you)', '').replace(/[^a-z0-9]/g, '');
    return `${cleanName}@paytm`;
  };

  // Simulates executing the designated payment app
  const executeUPITransfer = (customApp?: 'PhonePe' | 'Google Pay' | 'Paytm', customDebt?: SimplifiedDebt) => {
    const debtToUse = customDebt || selectedDebt;
    const appToUse = customApp || selectedUPIApp;
    if (!debtToUse) return;
    
    if (customDebt) {
      setSelectedDebt(customDebt);
    }
    if (customApp) {
      setSelectedUPIApp(customApp);
    }

    setPayGatewayState('connecting');
    setLoadingText(`Opening ${appToUse}...`);
    
    // Attempt standard redirect in case they are on a mobile device
    const upiLink = `upi://pay?pa=${getRecipientUpi(debtToUse)}&pn=${encodeURIComponent(debtToUse.toName.replace(' (You)', ''))}&am=${debtToUse.amount}&cu=INR&tn=MintoTripSettlement`;
    try {
      window.location.href = upiLink;
    } catch (e) {
      console.log("Deep link blocked or unsupported, running sandbox simulation.");
    }

    setTimeout(() => {
      setLoadingText('Interpreting UPI Payload (Receiver & Amount)...');
      setTimeout(() => {
        setLoadingText('Securing corridor link with bank server...');
        setTimeout(() => {
          setLoadingText('Processing instant ledger credit...');
          setTimeout(() => {
            // Confirm the settlement in state
            onSettle(debtToUse.fromMemberId, debtToUse.toMemberId, debtToUse.amount);
            
            // Add to completed list so it is shown in Section 3
            const isPayerMe = debtToUse.fromMemberId === currentUserId;
            setCompletedList(prev => [
              ...prev, 
              { 
                fromName: isPayerMe ? 'You' : debtToUse.fromName.replace(' (You)', ''), 
                toName: isPayerMe ? debtToUse.toName.replace(' (You)', '') : 'You', 
                amount: debtToUse.amount,
                isPaidByMe: isPayerMe
              }
            ]);

            setPayGatewayState('success');
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  // Immediate settlement from QR code display
  const executeQRSettlement = () => {
    if (!selectedDebt) return;
    onSettle(selectedDebt.fromMemberId, selectedDebt.toMemberId, selectedDebt.amount);
    
    const isPayerMe = selectedDebt.fromMemberId === currentUserId;
    setCompletedList(prev => [
      ...prev, 
      { 
        fromName: isPayerMe ? 'You' : selectedDebt.fromName.replace(' (You)', ''), 
        toName: isPayerMe ? selectedDebt.toName.replace(' (You)', '') : 'You', 
        amount: selectedDebt.amount,
        isPaidByMe: isPayerMe
      }
    ]);
    
    setPayGatewayState('success');
  };

  const handleDismissSuccess = () => {
    setPayGatewayState('idle');
    setSelectedDebt(null);
  };

  const copyUpiIdToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
      {/* Absolute floating Confetti burst if all settled */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-55 overflow-hidden">
          {[...Array(50)].map((_, i) => {
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 80 + 20;
            const randomDuration = Math.random() * 3 + 2;
            const color = ['bg-orange-500', 'bg-emerald-500', 'bg-sky-400', 'bg-amber-400', 'bg-pink-400'][i % 5];
            return (
              <motion.div
                key={i}
                initial={{ top: '-5%', left: `${randomX}%`, rotate: 0 }}
                animate={{ top: `${randomY}%`, rotate: 360, opacity: [1, 1, 0] }}
                transition={{ duration: randomDuration, repeat: Infinity, ease: 'linear' }}
                className={`absolute w-1.5 h-3.5 ${color} rounded-sm`}
              />
            );
          })}
        </div>
      )}

      <motion.div 
        id="settle-up-window"
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 15 }}
        className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] border border-[#ECE7E1]"
      >
        {/* Dynamic header */}
        <div className="p-5.5 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
          <div className="text-left">
            <h3 className="text-sm font-bold text-[#1D1D1D] tracking-tight">Trip Settlements</h3>
            <p className="text-[10px] text-gray-500 font-medium">Clear pending balances securely</p>
          </div>
          <button 
            id="close-settle-btn"
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-[#1D1D1D]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Core content view */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence mode="wait">
            {payGatewayState === 'idle' && (
              <motion.div 
                key="settlements-picker"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 text-left"
              >
                {/* Active Member Selection Box (Sandbox Profile Simulator) */}
                <div className="bg-neutral-50/70 border border-[#ECE7E1] rounded-2xl p-3.5 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                      Active Member Profile
                    </span>
                    <span className="text-[8px] bg-orange-100/60 text-[#E85D3A] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      Simulation Mode
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
                    {members.map(m => {
                      const isSelected = m.id === activeUserId;
                      // Calculate what they owe to display badge
                      const mOwes = debts.filter(d => d.fromMemberId === m.id).reduce((acc, d) => acc + d.amount, 0);
                      const mReceives = debts.filter(d => d.toMemberId === m.id).reduce((acc, d) => acc + d.amount, 0);
                      
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setActiveUserId(m.id);
                            setSelectedDebt(null);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold transition shrink-0 border cursor-pointer select-none active:scale-95 ${
                            isSelected 
                              ? 'bg-[#1D1D1D] text-white border-[#1D1D1D] shadow-sm' 
                              : 'bg-white text-gray-600 border-[#ECE7E1] hover:border-gray-300'
                          }`}
                        >
                          <img 
                            src={m.avatar} 
                            className="w-4 h-4 rounded-full object-cover border border-[#ECE7E1]/50" 
                            alt={m.name} 
                          />
                          <div className="text-left leading-none">
                            <div className="text-[10px] tracking-tight">{m.name.replace(' (You)', '')}</div>
                            <div className={`text-[7px] mt-0.5 font-semibold ${
                              isSelected 
                                ? 'text-gray-300' 
                                : mOwes > 0 
                                  ? 'text-red-500' 
                                  : mReceives > 0 
                                    ? 'text-emerald-500' 
                                    : 'text-gray-400'
                            }`}>
                              {mOwes > 0 ? `Owes ₹${mOwes}` : mReceives > 0 ? `Gets ₹${mReceives}` : 'Cleared'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Switcher Tabs */}
                <div className="flex bg-neutral-100 p-1 rounded-2xl border border-gray-100">
                  <button
                    onClick={() => setActiveTab('my')}
                    className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                      activeTab === 'my' 
                        ? 'bg-white text-[#1D1D1D] shadow-xs' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Smartphone size={12} />
                    <span>My Balances</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
                      activeTab === 'all' 
                        ? 'bg-white text-[#1D1D1D] shadow-xs' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Users size={12} />
                    <span>All Transfers</span>
                  </button>
                </div>

                {activeTab === 'my' ? (
                  <div className="space-y-4">
                    
                    {/* Completion progress bar */}
                    <div className="bg-neutral-50/70 border border-[#ECE7E1] p-3.5 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-gray-500">
                        <span>Settlement Progress</span>
                        <span className="text-[#4DAA57] font-semibold">{completionPercent}% Settled</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercent}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-orange-400 to-[#4DAA57]" 
                        />
                      </div>
                    </div>

                    {/* Role Banners */}
                    <div className="space-y-2">
                      {pendingToPay.length > 0 && (
                        <div className="bg-red-50/80 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-[#E85D3A] shrink-0">
                            <ShieldAlert size={18} />
                          </div>
                          <div className="text-left space-y-0.5">
                            <h4 className="text-xs font-bold text-red-800">You owe money</h4>
                            <p className="text-[10px] text-red-600 font-medium leading-normal">
                              You have pending payments to make to your group mates. Use the options below to clear your share.
                            </p>
                          </div>
                        </div>
                      )}

                      {pendingToReceive.length > 0 && (
                        <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#4DAA57] shrink-0">
                            <CheckCircle2 size={18} />
                          </div>
                          <div className="text-left space-y-0.5">
                            <h4 className="text-xs font-bold text-emerald-800">You paid on this trip</h4>
                            <p className="text-[10px] text-emerald-600 font-medium leading-normal">
                              You paid extra on this trip and are owed money. Once other members transfer, click "Received" to confirm.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Overall Success / Empty State if fully cleared */}
                    {pendingToPay.length === 0 && pendingToReceive.length === 0 ? (
                      <div className="text-center py-10 space-y-4 bg-white rounded-2xl border border-dashed border-[#ECE7E1]">
                        <div className="w-12 h-12 bg-emerald-50 text-[#4DAA57] rounded-full flex items-center justify-center mx-auto">
                          <Trophy size={24} />
                        </div>
                        <div className="space-y-1 px-4">
                          <h4 className="text-xs font-bold text-[#1D1D1D]">Everything is cleared! 🎉</h4>
                          <p className="text-[10px] text-gray-500 font-medium">All group shares are perfectly balanced. Trip bookkeeping is complete.</p>
                        </div>
                        <button
                          onClick={onClose}
                          className="mx-auto bg-[#1D1D1D] hover:bg-black text-white text-[10px] font-bold py-2 px-5 rounded-lg transition"
                        >
                          Close Ledger
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        
                        {/* Section 1: You Need To Pay */}
                        {pendingToPay.length > 0 && (
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-0.5">You Need To Pay</span>
                            
                            {pendingToPay.map((debt, index) => (
                              <div 
                                key={`p-pay-${index}`} 
                                className="bg-white rounded-[20px] p-5 shadow-[0_4px_22px_rgba(0,0,0,0.015)] border border-neutral-100/40 space-y-3.5 text-left transition duration-150 relative"
                              >
                                {/* Top Row: Payee Avatar, Payee Name, Amount Owed on Right */}
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 w-2/3 min-w-0">
                                    <img 
                                      src={debt.toAvatar} 
                                      className="w-10 h-10 rounded-full object-cover border border-neutral-150/50 shadow-3xs shrink-0" 
                                      alt={debt.toName} 
                                    />
                                    <div className="min-w-0">
                                      <h4 className="text-[14px] font-semibold text-[#111111] truncate tracking-tight font-sans">
                                        {debt.toName.replace(' (You)', '')}
                                      </h4>
                                      <span className="text-[9px] font-mono text-gray-400 font-medium truncate block">
                                        {getRecipientUpi(debt)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end shrink-0 gap-1">
                                    <div className="text-[18px] font-bold font-sans tracking-tight text-[#E85D3A]">
                                      ₹{debt.amount.toLocaleString()}
                                    </div>
                                    <span className="px-2 py-0.5 bg-red-50 text-[#E85D3A] rounded-full text-[8px] font-bold uppercase tracking-wider">
                                      Pending
                                    </span>
                                  </div>
                                </div>

                                {/* Contextual Action Buttons for Debtor */}
                                <div className="flex flex-col gap-2 pt-1.5 border-t border-gray-150/40">
                                  <button
                                    onClick={() => handleStartPayment(debt)}
                                    className="w-full bg-[#E85D3A] hover:bg-[#d15030] text-white py-2 px-3 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95"
                                  >
                                    <Smartphone size={12} className="shrink-0" />
                                    <span>Pay ₹{debt.amount.toLocaleString()} to {debt.toName.replace(' (You)', '')}</span>
                                  </button>
                                  
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setSelectedDebt(debt);
                                        setSelectedUPIApp('Paytm');
                                        executeUPITransfer('Paytm', debt);
                                      }}
                                      className="flex-1 bg-[#002E6E] hover:bg-[#001D47] text-white py-2 px-3 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 border border-[#002E6E]"
                                      title="Pay via Paytm App"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#00BAF2] animate-ping shrink-0" />
                                      <span>Paytm App</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedDebt(debt);
                                        setPayGatewayState('qr-code');
                                      }}
                                      className="flex-1 border border-[#ECE7E1] hover:bg-neutral-50 py-2 px-3 rounded-xl text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 text-gray-700"
                                      title="Show QR Code"
                                    >
                                      <QrCode size={11} className="text-[#E85D3A] shrink-0" />
                                      <span>QR Scanner</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Section 2: Pending To Receive */}
                        {pendingToReceive.length > 0 && (
                          <div className="space-y-3 pt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block px-0.5">You Will Receive</span>
                            
                            {pendingToReceive.map((debt, index) => (
                              <div 
                                key={`p-receive-${index}`} 
                                className="bg-white rounded-[20px] p-5 shadow-[0_4px_22px_rgba(0,0,0,0.015)] border border-neutral-100/40 space-y-3.5 text-left transition duration-150"
                              >
                                {/* Top Row: Debtor Avatar, Debtor Name, Amount Receivable */}
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 w-2/3 min-w-0">
                                    <img 
                                      src={debt.fromAvatar} 
                                      className="w-10 h-10 rounded-full object-cover border border-neutral-150/50 shadow-3xs shrink-0" 
                                      alt={debt.fromName} 
                                    />
                                    <div className="min-w-0">
                                      <h4 className="text-[14px] font-semibold text-[#111111] truncate tracking-tight font-sans">
                                        {debt.fromName.replace(' (You)', '')}
                                      </h4>
                                      <span className="text-[9px] text-gray-400 font-medium block">
                                        Owes you share credit
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end shrink-0 gap-1">
                                    <div className="text-[18px] font-bold font-sans tracking-tight text-[#4DAA57]">
                                      ₹{debt.amount.toLocaleString()}
                                    </div>
                                    <span className="px-2 py-0.5 bg-emerald-50 text-[#4DAA57] rounded-full text-[8px] font-bold uppercase tracking-wider">
                                      Awaiting Transfer
                                    </span>
                                  </div>
                                </div>

                                {/* Contextual Action Buttons for Receiver */}
                                <div className="flex gap-2 pt-1.5 border-t border-gray-150/40">
                                  <button
                                    onClick={() => {
                                      onSettle(debt.fromMemberId, debt.toMemberId, debt.amount);
                                      setCompletedList(prev => [
                                        ...prev, 
                                        { 
                                          fromName: debt.fromName.replace(' (You)', ''), 
                                          toName: 'You', 
                                          amount: debt.amount,
                                          isPaidByMe: false
                                        }
                                      ]);
                                    }}
                                    className="w-full bg-[#4DAA57] hover:bg-emerald-600 text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95"
                                    title="Confirm that you have received this payment"
                                  >
                                    <Check size={14} strokeWidth={2.5} />
                                    <span>Received</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Section 3: Completed Settlements */}
                        <div className="border-t border-gray-150/80 pt-3">
                          <button
                            onClick={() => setShowCompletedSec(!showCompletedSec)}
                            className="w-full py-1.5 flex items-center justify-between text-gray-400 hover:text-gray-600 text-[10px] font-bold uppercase tracking-wider transition"
                          >
                            <span>Archived Sessions ({completedList.length})</span>
                            {showCompletedSec ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>

                          <AnimatePresence>
                            {showCompletedSec && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-2 mt-2 overflow-hidden"
                              >
                                {completedList.length === 0 ? (
                                  <p className="text-[9px] text-gray-400 italic py-1 px-0.5">No transfers cleared in the current browser session.</p>
                                ) : (
                                  completedList.map((item, idx) => (
                                    <div key={`comp-${idx}`} className="flex items-center justify-between p-2.5 bg-emerald-50/25 rounded-xl border border-emerald-100/40 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="w-4.5 h-4.5 bg-[#4DAA57]/10 text-[#4DAA57] rounded-full flex items-center justify-center">
                                          <Check size={10} strokeWidth={3} />
                                        </div>
                                        <span className="font-semibold text-gray-600 text-[10px]">
                                          {item.isPaidByMe ? `You paid ${item.toName}` : `${item.fromName} paid you`}
                                        </span>
                                      </div>
                                      <span className="font-bold text-[#4DAA57] text-[11px]">₹{item.amount.toLocaleString()}</span>
                                    </div>
                                  ))
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                      </div>
                    )}
                  </div>
                ) : (
                  // Secondary Tab: Group Optimized global path list
                  <div className="space-y-3">
                    <div className="bg-amber-50/20 border border-amber-100 p-3 rounded-xl flex items-start gap-2">
                      <ShieldAlert size={13} className="text-[#E85D3A] shrink-0 mt-0.5" />
                      <p className="text-[9px] text-gray-500 leading-normal font-medium">
                        Algorithmic simplification enabled. Displays peer transfers needed to completely eliminate global liabilities.
                      </p>
                    </div>

                    <div className="space-y-2.5 max-h-[48vh] overflow-y-auto pr-0.5">
                      {debts.map((item, idx) => {
                        const isInvolved = item.fromMemberId === currentUserId || item.toMemberId === currentUserId;
                        const isDebtorRole = item.fromMemberId === currentUserId;
                        const isReceiverRole = item.toMemberId === currentUserId;
                        return (
                          <div 
                            key={`all-debts-${idx}`} 
                            className={`p-3.5 border rounded-2xl transition bg-white shadow-xs ${
                              isInvolved 
                                ? 'border-[#E85D3A]/25 ring-1 ring-[#E85D3A]/5' 
                                : 'border-gray-150'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <img src={item.fromAvatar} className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-100" alt="from" />
                                <span className="font-bold text-gray-700 text-[11px]">
                                  {item.fromMemberId === currentUserId ? 'You' : item.fromName.split(' ')[0]}
                                </span>
                              </div>
                              
                              <div className="flex flex-col items-center flex-1 px-2">
                                <span className="text-[10px] font-bold text-gray-800">₹{item.amount.toLocaleString()}</span>
                                <ArrowRight size={10} className="text-gray-300" />
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-700 text-[11px]">
                                  {item.toMemberId === currentUserId ? 'You' : item.toName.split(' ')[0]}
                                </span>
                                <img src={item.toAvatar} className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-100" alt="to" />
                              </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider">
                                  {isDebtorRole ? 'You Owe' : isReceiverRole ? 'You Receive' : 'Peer Transfer'}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                  isDebtorRole 
                                    ? 'bg-red-50 text-[#E85D3A]' 
                                    : isReceiverRole 
                                      ? 'bg-emerald-50 text-[#4DAA57]' 
                                      : 'bg-neutral-100 text-gray-400'
                                }`}>
                                  {isDebtorRole ? 'Pending' : isReceiverRole ? 'Awaiting transfer' : 'Awaiting Peer Action'}
                                </span>
                              </div>

                              {/* Action Buttons purely matching current user's role */}
                              {isInvolved && (
                                <div className="mt-1 flex gap-2">
                                  {isDebtorRole ? (
                                    <div className="flex flex-col gap-1.5 w-full">
                                      <button
                                        onClick={() => handleStartPayment(item)}
                                        className="w-full bg-[#E85D3A] hover:bg-[#d15030] text-white py-1.5 px-3 rounded-lg text-[9px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                                      >
                                        <Smartphone size={10} />
                                        <span>Pay ₹{item.amount.toLocaleString()} to {item.toName.split(' ')[0]}</span>
                                      </button>
                                      <div className="flex gap-1.5 w-full">
                                        <button
                                          onClick={() => {
                                            setSelectedDebt(item);
                                            setSelectedUPIApp('Paytm');
                                            executeUPITransfer('Paytm', item);
                                          }}
                                          className="flex-1 bg-[#002E6E] hover:bg-[#001D47] text-white py-1 px-2.5 rounded-lg text-[8.5px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 border border-[#002E6E]"
                                        >
                                          <span className="w-1 h-1 bg-[#00BAF2] rounded-full animate-ping shrink-0" />
                                          <span>Paytm</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedDebt(item);
                                            setPayGatewayState('qr-code');
                                          }}
                                          className="flex-1 border border-gray-200 hover:bg-neutral-50 text-gray-600 font-semibold text-[8.5px] px-2 py-1 rounded-lg transition active:scale-95 cursor-pointer"
                                        >
                                          QR Code
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        onSettle(item.fromMemberId, item.toMemberId, item.amount);
                                        setCompletedList(prev => [
                                          ...prev, 
                                          { 
                                            fromName: item.fromName.replace(' (You)', ''), 
                                            toName: 'You', 
                                            amount: item.amount,
                                            isPaidByMe: false
                                          }
                                        ]);
                                      }}
                                      className="w-full bg-[#4DAA57] hover:bg-emerald-600 text-white py-1.5 px-3 rounded-lg text-[9px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
                                    >
                                      <Check size={10} strokeWidth={2.5} />
                                      <span>Received</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* UPI QR Code scanner view */}
            {payGatewayState === 'qr-code' && selectedDebt && (
              <motion.div
                key="upi-qr-display"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-left"
              >
                <div className="space-y-1">
                  <span className="text-[9px] bg-emerald-50 text-[#4DAA57] px-2 py-0.5 rounded font-bold tracking-wider block uppercase w-max">
                    UPI Receiver Profile
                  </span>
                  <h4 className="text-sm font-bold text-[#1D1D1D]">Settle via QR Scanner</h4>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                    Scan this dynamic code using any standard UPI applications (Google Pay, Paytm, PhonePe) to complete the Indian Rupee settlement.
                  </p>
                </div>

                <div className="bg-white border border-[#ECE7E1] rounded-2xl p-4.5 space-y-4 flex flex-col items-center">
                  
                  {/* Recipient card detail */}
                  <div className="flex items-center justify-between w-full border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <img src={selectedDebt.toAvatar} className="w-8.5 h-8.5 rounded-full object-cover border border-[#ECE7E1]" alt="payee" />
                      <div>
                        <div className="text-[11px] font-bold text-[#1D1D1D]">{selectedDebt.toName.replace(' (You)', '')}</div>
                        <div className="text-[8px] font-mono text-gray-400 font-medium flex items-center gap-1">
                          <span>{getRecipientUpi(selectedDebt)}</span>
                          <button 
                            onClick={() => copyUpiIdToClipboard(getRecipientUpi(selectedDebt))}
                            className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
                            title="Copy UPI string"
                          >
                            <Copy size={9} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] font-extrabold text-[#E85D3A]">₹{selectedDebt.amount.toLocaleString()}</div>
                      {copiedLink && (
                        <span className="text-[7.5px] text-[#4DAA57] font-bold block mt-0.5">Copied!</span>
                      )}
                    </div>
                  </div>

                  {/* QR Core Container with elegant scanner laser effect */}
                  <div className="relative p-3 bg-white border border-gray-150 rounded-xl flex items-center justify-center overflow-hidden w-44 h-44 shadow-inner">
                    
                    {/* Laser animation line */}
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E85D3A] to-transparent z-10"
                      animate={{ top: ['5%', '95%', '5%'] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* QR Code generator integration */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${getRecipientUpi(selectedDebt)}&pn=${selectedDebt.toName}&am=${selectedDebt.amount}&cu=INR`)}`}
                      className="w-full h-full object-contain relative z-5"
                      alt="UPI QR Code"
                    />
                  </div>

                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                    Dynamic payload: INR ₹{selectedDebt.amount}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setPayGatewayState('idle')}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-150 rounded-xl text-[10px] font-bold text-gray-500 transition text-center"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={executeQRSettlement}
                    className="flex-1 bg-[#4DAA57] hover:bg-emerald-600 text-white py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Check size={11} strokeWidth={3} />
                    <span>I've Transferred</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* UPI Selection Gateway sheet */}
            {payGatewayState === 'app-picker' && selectedDebt && (
              <motion.div 
                key="upi-app-gateway"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-left"
              >
                <div className="space-y-1">
                  <span className="text-[9px] bg-orange-100 text-[#E85D3A] px-2 py-0.5 rounded font-bold tracking-widest block uppercase w-max">
                    Secure Sandbox Corridor
                  </span>
                  <h4 className="text-sm font-bold text-[#1D1D1D]">Choose Settlement Gateway</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Verify your payment terminal app. Minto will open and fill details instantly.</p>
                </div>

                <div className="bg-white border border-[#ECE7E1] rounded-2xl p-4.5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={selectedDebt.toAvatar} className="w-10 h-10 rounded-full object-cover border border-[#ECE7E1]" alt="payee" />
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recipient</div>
                        <div className="text-xs font-bold text-[#1D1D1D]">{selectedDebt.toName.replace(' (You)', '')}</div>
                        <div className="text-[8px] font-mono text-gray-400 font-bold">{getRecipientUpi(selectedDebt)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Amount</div>
                      <div className="text-base font-bold text-[#E85D3A]">₹{selectedDebt.amount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-wider block">Installed UPI Apps</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Google Pay', 'PhonePe', 'Paytm'] as const).map(app => {
                        const isSelected = selectedUPIApp === app;
                        let activeStyles = 'bg-orange-50/50 border-orange-200 text-[#E85D3A] ring-1 ring-orange-200';
                        if (isSelected) {
                          if (app === 'Google Pay') {
                            activeStyles = 'bg-[#E8F0FE] border-[#4285F4] text-[#1967D2] ring-1 ring-[#4285F4]';
                          } else if (app === 'PhonePe') {
                            activeStyles = 'bg-[#F3E8FF] border-[#673AB7] text-[#512DA8] ring-1 ring-[#673AB7]';
                          } else if (app === 'Paytm') {
                            activeStyles = 'bg-[#E0F7FA] border-[#00B0FF] text-[#002E6E] ring-1 ring-[#00B0FF]';
                          }
                        }
                        return (
                          <button
                            key={app}
                            onClick={() => setSelectedUPIApp(app)}
                            className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                              isSelected 
                                ? activeStyles 
                                : 'bg-neutral-50/40 border-gray-150 text-gray-600 hover:bg-neutral-50'
                            }`}
                          >
                            <span className="text-[10px] font-bold">{app}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setPayGatewayState('idle')}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-150 rounded-xl text-[10px] font-bold text-gray-500 transition text-center"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => executeUPITransfer()}
                    className="flex-1 bg-[#E85D3A] hover:bg-[#d15030] text-white py-2.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
                  >
                    <span>Authorize & Pay</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Connecting corridor loader */}
            {payGatewayState === 'connecting' && selectedDebt && (
              <motion.div 
                key="gateway-connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 text-center space-y-6"
              >
                <div className="w-12 h-12 rounded-full border-3 border-[#E85D3A] border-t-transparent mx-auto animate-spin" />
                
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold text-gray-600 uppercase tracking-widest">{selectedUPIApp} Connection</h4>
                  <p className="text-[11px] text-gray-400 font-medium animate-pulse">{loadingText}</p>
                </div>

                <div className="bg-neutral-50 border border-[#ECE7E1] p-4 rounded-xl max-w-[260px] mx-auto text-left space-y-2 shadow-xs">
                  <div className="flex justify-between text-[8px] text-gray-400 font-bold tracking-wider uppercase">
                    <span>Minto Sandbox Payload</span>
                    <span>Secure</span>
                  </div>
                  <div className="text-[11px] font-bold text-gray-700 leading-snug">
                    Deep Link Intent: Transfer ₹{selectedDebt.amount} to {selectedDebt.toName}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Transaction Success Confirmation */}
            {payGatewayState === 'success' && selectedDebt && (
              <motion.div 
                key="gateway-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-5"
              >
                <div className="w-12 h-12 bg-emerald-50 text-[#4DAA57] rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={24} strokeWidth={2.5} className="animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-[#1D1D1D] tracking-tight">Settlement Completed!</h4>
                  <p className="text-[10px] text-gray-500 font-medium max-w-[220px] mx-auto leading-relaxed">
                    Successfully recorded transfer of <strong className="text-gray-800">₹{selectedDebt.amount.toLocaleString()}</strong> to {' '}
                    <strong className="text-gray-800">{selectedDebt.toName.replace(' (You)', '')}</strong> in the workspace ledger.
                  </p>
                </div>

                <div className="bg-neutral-50 border border-[#ECE7E1] p-2.5 rounded-xl text-[8.5px] font-mono text-gray-400 tracking-wider font-bold">
                  MT_{Math.floor(100000 + Math.random() * 900000)}_UPI
                </div>

                <button
                  onClick={handleDismissSuccess}
                  className="w-full bg-[#1D1D1D] hover:bg-black text-white text-[10px] font-bold py-2.5 rounded-xl transition active:scale-95 cursor-pointer"
                >
                  Return to Minto
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
