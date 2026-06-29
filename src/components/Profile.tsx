import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Compass, LogOut, HelpCircle, Smartphone, Check, Sparkles, Edit, Save, X } from 'lucide-react';
import { Trip, UseCase } from '../types';

interface ProfileProps {
  currentUseCase: UseCase;
  upiHandle: string;
  onUpdateUPI: (newUPI: string) => void;
  trips: Trip[];
  activeTripId: string;
  onSwitchTrip: (tripId: string) => void;
  onLogout: () => void;
  userName: string;
  userAvatar: string;
  onUpdateProfile: (name: string, avatar: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', // Arjun original
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', // Explorer man
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', // Female backpacker
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', // Styled hipster traveller
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', // Tech nomad female
];

export default function Profile({
  currentUseCase,
  upiHandle,
  onUpdateUPI,
  trips,
  activeTripId,
  onSwitchTrip,
  onLogout,
  userName,
  userAvatar,
  onUpdateProfile
}: ProfileProps) {
  const [newUPI, setNewUPI] = useState(upiHandle);
  const [isSaved, setIsSaved] = useState(false);
  
  // Profile Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [selectedAvatar, setSelectedAvatar] = useState(userAvatar);

  const handleSaveUPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUPI.trim() && newUPI.includes('@')) {
      onUpdateUPI(newUPI.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleSaveProfile = () => {
    if (editName.trim()) {
      onUpdateProfile(editName.trim(), selectedAvatar);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* User Info Card / Profile Editor */}
      <div className="bg-white border border-gray-150/60 rounded-[32px] p-6 shadow-xs relative overflow-hidden text-left">
        {/* Glow vector effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#E85D3A]/5 rounded-full blur-xl -z-10"></div>
        
        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div 
              key="view-profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <img 
                  src={userAvatar} 
                  className="w-16 h-16 rounded-full border border-gray-100 object-cover shadow-sm shrink-0" 
                  alt="Avatar" 
                />
                <div>
                  <span className="text-[9px] font-black text-[#E85D3A] uppercase tracking-widest font-mono bg-orange-50 px-2 py-0.5 rounded">Premium Traveler</span>
                  <h2 className="text-xl font-black text-[#111111] mt-1">{userName} 👋</h2>
                  <p className="text-xs text-[#666666] font-medium mt-0.5">Use Case: <span className="font-bold text-gray-800">{currentUseCase}</span> splits solver</p>
                </div>
              </div>
              <button
                id="edit-profile-trigger"
                onClick={() => {
                  setEditName(userName);
                  setSelectedAvatar(userAvatar);
                  setIsEditing(true);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition text-[#E85D3A] shrink-0 cursor-pointer"
                title="Edit profile information"
              >
                <Edit size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="edit-profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <h4 className="text-xs font-black text-[#111111] uppercase tracking-widest">Edit Traveler Profile</h4>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Name Input */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">Your Nickname</label>
                  <input 
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-150 focus:border-[#E85D3A] focus:outline-none px-3 py-2 rounded-xl text-xs font-semibold text-gray-800"
                    placeholder="Enter nickname"
                  />
                </div>

                {/* Avatar Picker Carousel */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase block">Select Travel Character</span>
                  <div className="flex gap-2 pb-1 overflow-x-auto">
                    {PRESET_AVATARS.map((url, idx) => {
                      const isSelected = selectedAvatar === url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedAvatar(url)}
                          className={`w-11 h-11 rounded-full overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                            isSelected ? 'border-[#E85D3A] scale-110 shadow-xs' : 'border-transparent opacity-65 hover:opacity-100'
                          }`}
                        >
                          <img src={url} className="w-full h-full object-cover" alt="preset selection" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="w-full bg-[#E85D3A] hover:bg-[#d15030] text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  <Save size={13} />
                  <span>Save Traveler Info</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Switch Workspace Selector (Trips module) */}
      <div className="bg-white border border-gray-150/60 rounded-[32px] p-5 shadow-xs space-y-4 text-left">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-[#E85D3A]" />
          <h4 className="text-xs font-black text-[#111111] uppercase tracking-widest">Travel Workspaces</h4>
        </div>

        <div className="space-y-2.5">
          {trips.map(t => {
            const isActive = t.id === activeTripId;
            return (
              <button
                id={`switch-trip-${t.id}-btn`}
                key={t.id}
                onClick={() => onSwitchTrip(t.id)}
                className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                  isActive 
                    ? 'border-[#E85D3A] bg-orange-50/5 shadow-xs' 
                    : 'bg-gray-50/50 border-gray-150/30 hover:bg-gray-50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={t.coverImage} className="w-11 h-11 object-cover rounded-xl border border-white shrink-0" alt="trip cover select" />
                  <div>
                    <h5 className="text-xs font-black text-[#111111]">{t.name}</h5>
                    <p className="text-[10px] text-gray-400 font-medium font-mono">{t.destination} • {t.dates}</p>
                  </div>
                </div>
                {isActive ? (
                  <span className="text-[9px] bg-[#E85D3A] text-white px-2.5 py-1 rounded-full font-black uppercase shrink-0">
                    ACTIVE
                  </span>
                ) : (
                  <span className="text-[9px] text-[#666666] bg-gray-100 px-2 py-1 rounded-full font-bold shrink-0">
                    SELECT
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* UPI Handle Config Block */}
      <div className="bg-white border border-gray-150/60 rounded-[32px] p-5 shadow-xs space-y-3 text-left">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Receiver UPI Handle</span>
        <form onSubmit={handleSaveUPI} className="space-y-3">
          <div className="relative">
            <input 
              id="profile-upi-input"
              type="text" 
              value={newUPI}
              onChange={(e) => setNewUPI(e.target.value)}
              placeholder="username@upi"
              className="w-full bg-gray-55 border border-gray-150 focus:border-[#E85D3A] focus:bg-white focus:outline-none py-3 px-4 rounded-2xl font-mono text-sm font-semibold text-[#111111]"
            />
            {isSaved && (
              <div className="absolute right-3.5 top-3.5 text-[#4CD37D] text-[9px] font-black bg-emerald-50 px-2 py-1 rounded animate-pulse">
                SAVED
              </div>
            )}
          </div>
          <button 
            id="profile-save-upi-btn"
            type="submit"
            className="w-full bg-[#111111] hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Smartphone size={14} />
            <span>Update Receiver Address</span>
          </button>
        </form>
      </div>

      {/* Logout Session Clear */}
      <div className="bg-rose-50/50 border border-rose-100 p-5 rounded-[28px] shrink-0 flex items-center justify-between text-left">
        <div>
          <h5 className="text-xs font-black text-[#111111]">Traveler Session</h5>
          <p className="text-[10px] text-gray-400 font-medium">Reset seeds &amp; log out of profile</p>
        </div>
        <button
          id="profile-logout-btn"
          onClick={onLogout}
          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
