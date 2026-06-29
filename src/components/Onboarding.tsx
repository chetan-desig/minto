import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Compass, Check, ArrowRight, ChevronLeft, 
  Coins, Smartphone, Users, Zap, ShieldCheck
} from 'lucide-react';
import { UPIProvider } from '../types';

interface OnboardingProps {
  onComplete: (userName: string, upiId: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  
  // Custom Profile Data (No hardcoded demo trips preplaced)
  const [name, setName] = useState('Arjun');
  const [selectedUPI, setSelectedUPI] = useState<UPIProvider>('PhonePe');
  const [upiHandle, setUpiHandle] = useState('arjun@ybl');

  const benefitSlides = [
    {
      title: "Split trip expenses without spreadsheets.",
      desc: "Add restaurant bills, fuel stops, and hotel charges in under 5 seconds. Minto handles the rest.",
      icon: Compass,
      color: "bg-orange-50 text-[#E85D3A]",
      visual: (
        <div className="space-y-3 w-full bg-white border border-gray-150 p-4 rounded-2xl shadow-3xs text-left">
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">📝 Quick Split Entry</span>
          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚕</span>
              <div>
                <p className="text-xs font-bold text-[#111111]">Airport Cabs Booking</p>
                <p className="text-[10px] text-gray-400">Equal split • 4 friends</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#E85D3A]">₹2,400</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍛</span>
              <div>
                <p className="text-xs font-bold text-[#111111]">Seafood Dinner feast</p>
                <p className="text-[10px] text-gray-400">Paid by Arjun</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#E85D3A]">₹4,200</span>
          </div>
        </div>
      )
    },
    {
      title: "See who owes what without calculations.",
      desc: "Minto automatically simplifies debts. One net payment to settle multiple shared moments.",
      icon: Coins,
      color: "bg-emerald-50 text-emerald-600",
      visual: (
        <div className="space-y-3 w-full bg-white border border-gray-150 p-4 rounded-2xl shadow-3xs text-left">
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">🤝 Simplified Accountability</span>
          <div className="flex items-center gap-3 bg-orange-50/20 px-3 py-2.5 rounded-xl border border-orange-100/30">
            <div className="w-6 h-6 rounded-full bg-orange-100 text-[#E85D3A] flex items-center justify-center text-[10px] font-bold">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#111111] truncate">Ananya owes Arjun</p>
              <p className="text-[10px] text-gray-400 font-medium">Auto-simplified balance</p>
            </div>
            <span className="text-xs font-mono font-black text-emerald-600">₹1,850</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">D</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-600 truncate">Dev owes Ananya</p>
            </div>
            <span className="text-xs font-mono font-semibold text-gray-500">₹450</span>
          </div>
        </div>
      )
    },
    {
      title: "Settle instantly using UPI.",
      desc: "Zero loaded wallets or separate bank transfers. Open PhonePe, GPay, or Paytm directly with pre-filled inputs.",
      icon: Zap,
      color: "bg-indigo-50 text-indigo-600",
      visual: (
        <div className="space-y-3 w-full bg-white border border-gray-150 p-4 rounded-2xl shadow-3xs text-left">
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">⚡ One-Tap Settlements</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border border-violet-100 rounded-xl flex items-center gap-2 bg-violet-50/5">
              <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center text-[9px] text-white font-black">P</div>
              <span className="text-[9px] font-bold text-[#111111]">PhonePe</span>
            </div>
            <div className="p-2 border border-blue-100 rounded-xl flex items-center gap-2 bg-blue-50/5">
              <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[9px] text-white font-black">G</div>
              <span className="text-[9px] font-bold text-[#111111]">Google Pay</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 bg-[#F8F8F6] p-2 rounded-xl border border-gray-100/50">
            <span>Instant UPI deep-link routing</span>
            <ShieldCheck size={14} className="text-emerald-500" />
          </div>
        </div>
      )
    }
  ];

  const upiProviders = [
    { name: 'PhonePe' as UPIProvider, color: 'border-violet-200 hover:border-violet-400 bg-violet-50/10', logoColor: 'bg-violet-600', txt: 'PhonePe' },
    { name: 'Google Pay' as UPIProvider, color: 'border-blue-200 hover:border-blue-400 bg-blue-50/10', logoColor: 'bg-blue-600', txt: 'G Pay' },
    { name: 'Paytm' as UPIProvider, color: 'border-cyan-200 hover:border-cyan-400 bg-cyan-50/10', logoColor: 'bg-cyan-500', txt: 'Paytm' },
    { name: 'BHIM' as UPIProvider, color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/10', logoColor: 'bg-emerald-600', txt: 'BHIM' }
  ];

  const handleNext = () => {
    if (step < benefitSlides.length) {
      setStep(step + 1);
    } else {
      if (name.trim()) {
        onComplete(name.trim(), upiHandle.trim());
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="h-full w-full bg-[#F8F8F6] flex flex-col items-center justify-between p-5 pb-8 font-sans overflow-y-auto min-h-[400px]">
      {/* Header Row */}
      <div className="w-full max-w-md flex items-center justify-between pt-2">
        {step > 0 && (
          <button 
            id="onboarding-back-btn"
            onClick={handleBack} 
            className="p-2 hover:bg-gray-100 rounded-full text-[#666666] transition cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <div className="mx-auto flex items-center gap-1.5 font-black text-lg tracking-tight text-[#111111]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E85D3A] inline-block animate-pulse"></span>
          <span>Minto</span>
        </div>
        {step > 0 && (
          <span className="text-[10px] font-mono text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-150">
            {step}/{benefitSlides.length}
          </span>
        )}
      </div>

      {/* Main Slide Carousel container */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center py-4">
        <AnimatePresence mode="wait">
          {step < benefitSlides.length ? (
            <motion.div
              key={`slide-${step}`}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.25 }}
              className="text-center space-y-5"
              id={`onboarding-slide-${step}`}
            >
              {/* Animated Icon Anchor */}
              <div className="mx-auto flex items-center justify-center">
                <div className={`p-4 rounded-[20px] shadow-3xs ${benefitSlides[step].color}`}>
                  {React.createElement(benefitSlides[step].icon, { size: 28 })}
                </div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-2 px-3">
                <h1 className="text-2xl font-black tracking-tight text-[#111111] leading-tight">
                  {benefitSlides[step].title}
                </h1>
                <p className="text-gray-500 font-medium text-xs leading-relaxed max-w-[280px] mx-auto">
                  {benefitSlides[step].desc}
                </p>
              </div>

              {/* Beautiful Visual Preview */}
              <div className="w-full max-w-xs mx-auto pt-2">
                {benefitSlides[step].visual}
              </div>

              {/* CTA Next Button */}
              <div className="pt-4 max-w-xs mx-auto">
                <button
                  id={`onboarding-next-btn-${step}`}
                  onClick={handleNext}
                  className="w-full bg-[#111111] hover:bg-black text-white py-3 px-6 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer leading-[1]"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ) : (
            // Slide 3: Traveler profile setup and "Create Your First Trip" single CTA
            <motion.div
              key="slide-profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="text-center space-y-6"
              id="onboarding-profile-slide"
            >
              <div className="space-y-1">
                <div className="w-12 h-12 rounded-[18px] bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-1.5 shadow-3xs">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-[#111111] tracking-tight">Create your Minto Profile</h2>
                <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
                  Enter your traveler details below to enable seamless direct settlements inside your trip workspaces.
                </p>
              </div>

              <div className="bg-white border border-gray-150 rounded-[24px] p-4.5 shadow-3xs text-left space-y-4">
                {/* Username Input */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Traveler Name</label>
                  <input 
                    id="onboarding-username-input"
                    type="text" 
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      // Update upi ID prefix based on name safely
                      setUpiHandle(`${e.target.value.toLowerCase().replace(/\s+/g, '')}@ybl`);
                    }}
                    placeholder="Enter your name"
                    className="w-full bg-gray-55 border border-gray-150 focus:border-[#E85D3A] focus:bg-white focus:outline-none py-3 px-4 rounded-xl font-semibold text-xs text-[#111111] transition"
                  />
                </div>

                {/* Default UPI Wallet Select */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Choose UPI App</label>
                  <div className="grid grid-cols-4 gap-2">
                    {upiProviders.map((prov) => (
                      <button
                        id={`upi-prov-${prov.name.toLowerCase()}-btn`}
                        key={prov.name}
                        type="button"
                        onClick={() => {
                          setSelectedUPI(prov.name);
                          const prefix = name.toLowerCase().replace(/\s+/g, '') || 'traveler';
                          if (prov.name === 'PhonePe') setUpiHandle(`${prefix}@ybl`);
                          else if (prov.name === 'Google Pay') setUpiHandle(`${prefix}@okaxis`);
                          else if (prov.name === 'Paytm') setUpiHandle(`${prefix}@paytm`);
                          else setUpiHandle(`${prefix}@upi`);
                        }}
                        className={`py-2 px-1 rounded-xl border text-center font-bold text-[9px] transition flex flex-col items-center justify-center gap-1.5 ${
                          selectedUPI === prov.name 
                            ? 'border-[#E85D3A] bg-orange-50/10 text-[#E85D3A] ring-1 ring-[#E85D3A]/20' 
                            : 'border-gray-100 hover:border-gray-300 text-gray-500'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md ${prov.logoColor} flex items-center justify-center text-[8px] text-white font-bold`}>
                          {prov.name[0]}
                        </div>
                        <span>{prov.txt}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* UPI ID input */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Receiving UPI Handle</label>
                  <div className="relative">
                    <input 
                      id="onboarding-upi-id-input"
                      type="text" 
                      value={upiHandle}
                      onChange={(e) => setUpiHandle(e.target.value)}
                      placeholder="username@upi"
                      className="w-full bg-gray-55 border border-gray-150 focus:border-[#E85D3A] focus:bg-white focus:outline-none py-3 px-4 rounded-xl font-mono text-xs font-semibold text-[#111111] pr-10 transition"
                    />
                    <div className="absolute right-3 top-3 text-emerald-500">
                      <Check size={16} strokeWidth={3} />
                    </div>
                  </div>
                  <span className="text-[9.5px] text-gray-400 font-medium leading-normal block">
                    Your companions split costs directly into this UPI link without loaded wallets.
                  </span>
                </div>
              </div>

              {/* SINGLE CTA: Create Your First Trip */}
              <button
                id="onboarding-get-started-btn"
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full bg-[#E85D3A] hover:bg-[#d15030] text-white py-4 px-6 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition disabled:opacity-40 cursor-pointer uppercase tracking-wider"
              >
                <span>Create Your First Trip</span>
                <Sparkles size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide indicators */}
      <div className="w-full max-w-md flex justify-center gap-1.5 pt-2">
        {Array.from({ length: benefitSlides.length + 1 }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === i ? 'w-5 bg-[#E85D3A]' : 'w-1.5 bg-gray-200'
            }`} 
          />
        ))}
      </div>
    </div>
  );
}
