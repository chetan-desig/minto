import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Coins, Calendar, Check, 
  MessageSquare, Phone, QrCode, Copy, Sparkles, Plus, Trash2, ArrowRight
} from 'lucide-react';
import { Trip, Member } from '../types';

interface CreateTripProps {
  onClose: () => void;
  onCreate: (newTrip: Trip) => void;
}

export default function CreateTrip({ onClose, onCreate }: CreateTripProps) {
  // Step 1: Input Details Form, Step 2: Success Screen
  const [step, setStep] = useState<1 | 2>(1);
  
  // Trip Details State
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('Oct 12 - Oct 18, 2026');
  const [budget, setBudget] = useState('45000');
  
  // Companions state inside trip creation
  const [friendName, setFriendName] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<string[]>(['Ananya', 'Dev']);
  const [activeInviteMethod, setActiveInviteMethod] = useState<'WhatsApp' | 'Phone' | 'QR' | 'Link'>('WhatsApp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [sentWhatsapp, setSentWhatsapp] = useState(false);

  // Validation
  const isFormValid = tripName.trim() !== '' && destination.trim() !== '' && dates.trim() !== '';

  const handleCreateTripBtn = () => {
    if (isFormValid) {
      setStep(2);
    }
  };

  const handleOpenTrip = () => {
    const newTripId = `trip_${Date.now()}`;
    const defaultCoverImages = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80'
    ];
    const coverImage = defaultCoverImages[Math.floor(Math.random() * defaultCoverImages.length)];

    // Create member list starting with the logged user Arjun
    const tripMembers: Member[] = [
      {
        id: 'm1',
        name: 'Arjun (You)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        upiId: 'arjun@upi',
        amountPaid: 0,
        amountOwed: 0,
        role: 'Owner'
      },
      ...invitedMembers.map((name, idx) => ({
        id: `m_new_${idx}_${Date.now()}`,
        name: name,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + (idx + 4) * 1234}?auto=format&fit=crop&w=150&q=80`,
        upiId: `${name.toLowerCase()}@paytm`,
        amountPaid: 0,
        amountOwed: 0,
        role: 'Member' as const
      }))
    ];

    const finalTrip: Trip = {
      id: newTripId,
      name: tripName,
      destination: destination,
      dates: dates,
      budget: parseInt(budget) || 0,
      spent: 0,
      coverImage: coverImage,
      members: tripMembers
    };

    onCreate(finalTrip);
  };

  const addFriendName = (e: React.FormEvent) => {
    e.preventDefault();
    if (friendName.trim() && !invitedMembers.includes(friendName.trim())) {
      setInvitedMembers([...invitedMembers, friendName.trim()]);
      setFriendName('');
    }
  };

  const removeFriendName = (index: number) => {
    setInvitedMembers(invitedMembers.filter((_, i) => i !== index));
  };

  const getInviteText = () => {
    return `🏖️ Join my "${tripName || 'Trip'}" group workspace on Minto to track expenses & settle peer charges instantly via UPI. Limit: ₹${parseInt(budget).toLocaleString() || '45,000'}`;
  };

  const triggerMockWhatsApp = () => {
    setSentWhatsapp(true);
    setTimeout(() => {
      setSentWhatsapp(false);
      // Give visual alert/interaction that doesn't block iframe
    }, 2000);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(`https://minto.app/join/t_${Date.now().toString().slice(-4)}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#111111]/75 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="bg-[#F8F8F6] w-full max-w-[420px] h-[90vh] sm:h-[820px] rounded-t-[32px] sm:rounded-[36px] overflow-hidden flex flex-col shadow-2xl relative border border-gray-150"
      >
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100">
          <div>
            <h3 className="text-xs font-black text-[#111111] uppercase tracking-widest font-mono">Create Your Trip</h3>
            <span className="text-[9px] font-bold text-gray-400">
              {step === 1 ? 'Design Workspace' : 'Setup success'}
            </span>
          </div>
          <button 
            id="close-create-trip-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 text-left"
              >
                <div className="space-y-1">
                  <h4 className="text-xl font-black tracking-tight text-[#111111]">Plan Your Next Escape</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Set up your group. Split dinner, tickets, and bookings perfectly.
                  </p>
                </div>

                {/* Main Inputs list */}
                <div className="space-y-4 pt-1">
                  {/* Trip Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Trip Name</label>
                    <input 
                      id="create-trip-name-input"
                      type="text"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      placeholder="e.g., Goa Sunsets & Surf"
                      className="w-full bg-white border border-gray-150 focus:border-[#E85D3A] focus:outline-none px-4 py-3.5 rounded-2xl text-xs font-bold text-[#111111] transition"
                    />
                  </div>

                  {/* Destination */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Select Destination</label>
                    <div className="relative">
                      <input 
                        id="create-trip-destination-input"
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g., Goa, India"
                        className="w-full bg-white border border-gray-150 focus:border-[#E85D3A] focus:outline-none pl-10 pr-4 py-3.5 rounded-2xl text-xs font-bold text-[#111111] transition"
                      />
                      <MapPin size={13} className="absolute left-3.5 top-4 text-[#E85D3A]" />
                    </div>
                  </div>

                  {/* dates */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Choose Dates</label>
                    <div className="relative">
                      <input 
                        id="create-trip-dates-input"
                        type="text"
                        value={dates}
                        onChange={(e) => setDates(e.target.value)}
                        placeholder="e.g., Oct 12 - Oct 18, 2026"
                        className="w-full bg-white border border-gray-150 focus:border-[#E85D3A] focus:outline-none pl-10 pr-4 py-3.5 rounded-2xl text-xs font-bold text-[#111111] transition"
                      />
                      <Calendar size={13} className="absolute left-3.5 top-4 text-[#F6C453]" />
                    </div>
                  </div>

                  {/* Optional Budget */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Optional Budget (₹)</label>
                    <div className="relative">
                      <input 
                        id="create-trip-budget-input"
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g., 50000"
                        className="w-full bg-white border border-gray-150 focus:border-[#E85D3A] focus:outline-none pl-10 pr-4 py-3.5 rounded-2xl font-mono text-xs font-bold text-[#111111] transition"
                      />
                      <Coins size={13} className="absolute left-3.5 top-4 text-emerald-500" />
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium block pl-1">Leave blank or enter limit to manage collective tabs.</span>
                  </div>
                </div>

                {/* Primary form submit: Create Trip */}
                <div className="pt-6">
                  <button
                    id="create-trip-submit-btn"
                    onClick={handleCreateTripBtn}
                    disabled={!isFormValid}
                    className={`w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition uppercase tracking-wider cursor-pointer ${
                      isFormValid 
                        ? 'bg-[#E85D3A] hover:bg-[#d15030] text-white' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>Create Trip</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ) : (
              // Step 2: Immediate TRIP CREATED SUCCESS SCREEN
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-center"
              >
                {/* Celebratory Tick */}
                <div className="inline-block relative">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-3xs border border-emerald-100">
                    <Check size={28} strokeWidth={3.5} className="animate-bounce" />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-1 text-[9px]"><Sparkles size={8} /></span>
                </div>

                <div className="space-y-1.5 px-3">
                  <span className="text-[9px] font-mono font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">🎉 Trip Created successfully</span>
                  <h4 className="text-xl font-black text-[#111111] tracking-tight">Your Workspace is Live!</h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
                    Adventure workspace generated for <strong className="text-[#111111] font-bold">{tripName}</strong>. Invite friends to start co-planning.
                  </p>
                </div>

                {/* Trip Card Preview */}
                <div className="bg-white border border-gray-150 rounded-[24px] p-4 text-left shadow-3xs relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 text-[8px] bg-sky-50 text-sky-600 rounded font-black tracking-wider uppercase font-mono border border-sky-100">Cover Active</span>
                      <h5 className="text-sm font-black text-[#111111] truncate">{tripName}</h5>
                      <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <MapPin size={10} className="text-[#E85D3A]" />
                        <span>{destination} ({dates})</span>
                      </p>
                    </div>
                    {budget && (
                      <div className="text-right">
                        <span className="text-[8px] font-bold uppercase block text-gray-400">Budget limit</span>
                        <span className="text-xs font-mono font-black text-[#111111]">₹{parseInt(budget).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Micro list of preloaded members */}
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-400">Trip Members Count</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#E85D3A] text-white text-[8px] flex items-center justify-center font-bold border border-white">C</div>
                        {invitedMembers.slice(0, 3).map((f, i) => (
                          <div key={i} className="w-5 h-5 rounded-full bg-slate-900 text-white text-[8px] flex items-center justify-center font-bold border border-white">
                            {f[0]}
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] font-bold text-[#111111]">{invitedMembers.length + 1} Joined</span>
                    </div>
                  </div>
                </div>

                {/* Invite Friends Flow Channels (WhatsApp as preselected primary) */}
                <div className="space-y-2.5 pt-2 text-left">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">Invite Friends Channels</span>
                  
                  {/* Tab Selector */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {([
                      { id: 'WhatsApp', icon: MessageSquare, label: 'WhatsApp', highlightColors: 'border-emerald-200 text-emerald-600 bg-emerald-50/10' },
                      { id: 'Phone', icon: Phone, label: 'Phone', highlightColors: 'border-gray-200 text-gray-600' },
                      { id: 'QR', icon: QrCode, label: 'QR Code', highlightColors: 'border-gray-200 text-gray-650' },
                      { id: 'Link', icon: Copy, label: 'Copy Link', highlightColors: 'border-gray-200 text-gray-650' }
                    ] as const).map((ch) => {
                      const Icon = ch.icon;
                      const isActive = activeInviteMethod === ch.id;
                      return (
                        <button
                          id={`invite-method-${ch.id.toLowerCase()}-btn`}
                          key={ch.id}
                          type="button"
                          onClick={() => setActiveInviteMethod(ch.id)}
                          className={`py-2 px-1 rounded-xl text-[9px] border flex flex-col items-center justify-center gap-1 font-bold transition cursor-pointer ${
                            isActive 
                              ? 'border-[#E85D3A] bg-orange-50/10 text-[#E85D3A] ring-1 ring-[#E85D3A]/25 shadow-3xs' 
                              : 'border-gray-150 bg-white hover:border-gray-300 text-gray-500'
                          }`}
                        >
                          <Icon size={13} />
                          <span>{ch.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive Tab Panel */}
                  <div className="bg-white border border-gray-150 rounded-[20px] p-3 text-xs leading-normal">
                    {activeInviteMethod === 'WhatsApp' && (
                      <div className="space-y-2">
                        <span className="text-[8px] font-mono font-black text-emerald-600 uppercase bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">Primary Indian Option</span>
                        <p className="text-[10px] text-gray-400/80 italic line-clamp-2 leading-tight">💬 &ldquo;{getInviteText()}&rdquo;</p>
                        <button
                          id="invite-whatsapp-cta"
                          onClick={triggerMockWhatsApp}
                          className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition uppercase tracking-wider cursor-pointer"
                        >
                          <MessageSquare size={12} />
                          <span>{sentWhatsapp ? 'WhatsApp Invite Triggered' : 'Send WhatsApp Invite'}</span>
                        </button>
                      </div>
                    )}

                    {activeInviteMethod === 'Phone' && (
                      <div className="space-y-2">
                        <span className="text-[8px] font-mono font-bold text-gray-400 uppercase">Input Mobile Number</span>
                        <div className="flex gap-2">
                          <input 
                            id="invite-phone-input"
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Mobile phone (+91)"
                            className="flex-1 bg-[#F8F8F6] border border-gray-150 focus:bg-white focus:border-[#E85D3A] focus:outline-none px-2.5 py-1.5 rounded-xl text-[10px] font-semibold text-[#111111]"
                          />
                          <button
                            id="invite-phone-cta"
                            disabled={!phoneNumber}
                            className="bg-[#111111] text-white px-3 py-1.5 rounded-xl text-[9px] font-bold transition disabled:opacity-40"
                          >
                            Send SMS
                          </button>
                        </div>
                      </div>
                    )}

                    {activeInviteMethod === 'QR' && (
                      <div className="flex flex-col items-center justify-center text-center p-1 space-y-1.5">
                        <QrCode size={70} className="text-[#111111] animate-pulse" strokeWidth={1.5} />
                        <span className="text-[9px] text-gray-400 font-semibold leading-none">Friends scan this code to synch in live</span>
                      </div>
                    )}

                    {activeInviteMethod === 'Link' && (
                      <div className="space-y-2">
                        <div className="bg-[#F8F8F6] border border-gray-105 px-2.5 py-1.5 rounded-xl font-mono text-[9px] text-[#222222] truncate">
                          https://minto.app/join/t_{tripName.toLowerCase().replace(/\s+/g, '') || 'trip'}
                        </div>
                        <button
                          id="invite-copy-link-cta"
                          onClick={copyInviteLink}
                          className="w-full bg-[#E85D3A] hover:bg-[#d15030] text-white py-2 px-3 rounded-xl text-[9.5px] font-black flex items-center justify-center gap-1 transition uppercase tracking-wider cursor-pointer"
                        >
                          <Copy size={11} />
                          <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Main CTAs: Primary Invite Friends vs. Open Trip */}
                <div className="pt-3.5 space-y-2 flex flex-col">
                  {/* Primary CTA: Invite Friends */}
                  <button
                    id="primary-cta-invite-friends"
                    onClick={() => {
                      if (activeInviteMethod !== 'WhatsApp') {
                        setActiveInviteMethod('WhatsApp');
                      }
                      triggerMockWhatsApp();
                    }}
                    className="w-full bg-[#111111] hover:bg-black text-white py-3.5 px-4 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 uppercase tracking-wider cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>Invite Friends</span>
                  </button>

                  {/* Secondary CTA: Open Trip */}
                  <button
                    id="secondary-cta-open-trip"
                    onClick={handleOpenTrip}
                    className="w-full border border-gray-150 bg-white hover:bg-gray-50 text-gray-500 py-3 rounded-xl text-[10px] font-bold text-center transition active:scale-95 uppercase tracking-wider cursor-pointer"
                  >
                    Open Trip
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
