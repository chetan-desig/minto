import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, ChevronRight, Sparkles, Utensils, 
  Compass, Car, Home, Wine, Coins, Sliders, DollarSign, Camera 
} from 'lucide-react';
import { Member, SplitType } from '../types';

interface AddExpenseProps {
  onClose: () => void;
  onAdd: (expenseData: {
    name: string;
    amount: number;
    paidById: string;
    splitType: SplitType;
    category: string;
    customSplits?: Record<string, number>;
    photoUrl?: string;
    caption?: string;
  }) => void;
  members: Member[];
  prefilled?: { name: string; amount: number; category: string; caption: string } | null;
}

const CATEGORIES = [
  { name: 'Food', icon: Utensils, bg: 'bg-[#FF7A59]/10', text: 'text-[#FF7A59]' },
  { name: 'Activities', icon: Compass, bg: 'bg-[#4361EE]/10', text: 'text-[#4361EE]' },
  { name: 'Transport', icon: Car, bg: 'bg-[#F4D06F]/10', text: 'text-[#E0A812]' },
  { name: 'Lodging', icon: Home, bg: 'bg-[#4CD37D]/10', text: 'text-[#2DAA5E]' },
  { name: 'Drinks', icon: Wine, bg: 'bg-[#FF6B6B]/10', text: 'text-[#FF6B6B]' },
  { name: 'Others', icon: Coins, bg: 'bg-[#E85D3A]/10', text: 'text-[#E85D3A]' }
];

// Beautiful Unsplash photos for Memories matching categories
const MEM_PHOTOS: Record<string, string[]> = {
  'Food': [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  ],
  'Activities': [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80'
  ],
  'Transport': [
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80'
  ],
  'Lodging': [
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80'
  ],
  'Drinks': [
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80'
  ],
  'Others': [
    'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=600&q=80'
  ]
};

export default function AddExpense({ onClose, onAdd, members, prefilled }: AddExpenseProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('Food');
  const [paidById, setPaidById] = useState(members[0]?.id || 'm1');
  const [splitType, setSplitType] = useState<SplitType>('Equal');
  
  // Custom split values (rupees or percentages)
  const [customSplits, setCustomSplits] = useState<Record<string, number>>({});
  
  // Memory fields
  const [attachMemoryPic, setAttachMemoryPic] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState('');

  // Apply prefilled scanning parameters
  useEffect(() => {
    if (prefilled) {
      setName(prefilled.name);
      setAmountStr(prefilled.amount.toString());
      setCategory(prefilled.category);
      setCaption(prefilled.caption);
      if (MEM_PHOTOS[prefilled.category]) {
        setSelectedPhoto(MEM_PHOTOS[prefilled.category][0]);
        setAttachMemoryPic(true);
      }
    }
  }, [prefilled]);

  // Set default photo based on category change
  useEffect(() => {
    const photos = MEM_PHOTOS[category];
    if (photos && photos.length > 0) {
      setSelectedPhoto(photos[0]);
    }
  }, [category]);

  // Handle custom split defaults
  useEffect(() => {
    const amt = parseFloat(amountStr) || 0;
    const initialSplits: Record<string, number> = {};
    if (splitType === 'Custom') {
      const perPerson = Math.round((amt / members.length) * 100) / 100;
      members.forEach(m => {
        initialSplits[m.id] = perPerson;
      });
    } else if (splitType === 'Percentage') {
      const perPercent = Math.round((100 / members.length) * 10) / 10;
      members.forEach(m => {
        initialSplits[m.id] = perPercent;
      });
    }
    setCustomSplits(initialSplits);
  }, [splitType, amountStr, members]);

  const handleCustomSplitChange = (memberId: string, val: number) => {
    setCustomSplits(prev => ({
      ...prev,
      [memberId]: val
    }));
  };

  const handleNext = () => {
    if (step === 1 && (!name || !amountStr || parseFloat(amountStr) <= 0)) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const amt = parseFloat(amountStr) || 0;
    if (amt <= 0) return;

    // Validate splits
    let finalSplits: Record<string, number> = {};
    if (splitType === 'Custom') {
      finalSplits = { ...customSplits };
    } else if (splitType === 'Percentage') {
      finalSplits = { ...customSplits };
    }

    onAdd({
      name,
      amount: amt,
      paidById,
      splitType,
      category,
      customSplits: splitType === 'Equal' ? undefined : finalSplits,
      photoUrl: attachMemoryPic ? selectedPhoto : undefined,
      caption: attachMemoryPic ? (caption || `Moments from ${name}`) : undefined
    });
  };

  const amtValue = parseFloat(amountStr) || 0;
  const equalAmtPerMember = Math.round((amtValue / members.length) * 100) / 100;

  // Verify total custom sum
  const customSum = Object.keys(customSplits).reduce((sum, key) => sum + (customSplits[key] || 0), 0);
  const percentageSum = splitType === 'Percentage' ? Object.keys(customSplits).reduce((sum, key) => sum + (customSplits[key] || 0), 0) : 100;
  const isSplitValid = splitType === 'Equal' 
    || (splitType === 'Custom' && Math.abs(customSum - amtValue) < 2)
    || (splitType === 'Percentage' && Math.abs(percentageSum - 100) < 1);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        id="add-expense-container"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#E85D3A] flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h3 className="text-sm font-black text-[#111111]">Quick Add Expense</h3>
              <p className="text-[10px] text-gray-400 font-medium">Split equally or custom in seconds</p>
            </div>
          </div>
          <button 
            id="close-add-expense"
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 rounded-full transition text-[#666666]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress horizontal steps indicators */}
        <div className="flex px-5 pt-3 bg-white justify-between">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 flex items-center gap-1">
              <div className={`h-1.5 rounded-full flex-1 transition-all ${step >= i ? 'bg-[#E85D3A]' : 'bg-gray-100'}`} />
            </div>
          ))}
        </div>

        {/* Form Body Container */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Amount input block modeled like Monzo transaction bubble */}
                <div className="text-center bg-[#F8F8F6] p-6 rounded-3xl border border-gray-100/60 flex flex-col items-center justify-center space-y-1 relative">
                  <span className="text-[10px] uppercase tracking-widest text-[#666666] font-bold">How much?</span>
                  <div className="flex items-center justify-center font-mono">
                    <span className="text-2xl font-black text-[#111111] mr-1">₹</span>
                    <input 
                      id="expense-amount-input"
                      type="number" 
                      value={amountStr}
                      onChange={(e) => setAmountStr(e.target.value)}
                      placeholder="0.00"
                      className="text-4xl font-black text-[#111111] bg-transparent focus:outline-none w-48 text-center"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Expense name input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">What was this for?</label>
                  <input 
                    id="expense-name-input"
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sea Shack Butter Garlic Crab"
                    className="w-full bg-gray-50 border border-gray-100 focus:border-[#E85D3A] focus:bg-white focus:outline-none py-3.5 px-4 rounded-2xl text-sm font-semibold text-[#111111] transition"
                  />
                </div>

                {/* Categories grids */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => {
                      const CatIcon = cat.icon;
                      const isSel = category === cat.name;
                      return (
                        <button
                          id={`category-${cat.name.toLowerCase()}-btn`}
                          key={cat.name}
                          type="button"
                          onClick={() => setCategory(cat.name)}
                          className={`py-2 px-1 rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${
                            isSel 
                              ? 'border-[#E85D3A] bg-orange-50/10 text-[#E85D3A]' 
                              : 'border-gray-100 text-[#666666] hover:border-gray-200'
                          }`}
                        >
                          <div className={`p-1.5 rounded-xl ${isSel ? 'bg-orange-100/50' : cat.bg}`}>
                            <CatIcon size={14} className={isSel ? 'text-[#E85D3A]' : cat.text} />
                          </div>
                          <span className="text-[10px] font-bold">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Transform Expense to Memory block */}
                <div className="bg-orange-50/20 border border-dashed border-orange-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera size={16} className="text-[#E85D3A]" />
                      <span className="text-xs font-bold text-gray-700">Attach a Memory Photo</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        id="attach-memory-toggle"
                        type="checkbox" 
                        checked={attachMemoryPic} 
                        onChange={() => setAttachMemoryPic(!attachMemoryPic)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E85D3A]"></div>
                    </label>
                  </div>

                  {attachMemoryPic && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3 pt-2"
                    >
                      <input 
                        id="memory-caption-input"
                        type="text" 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Write a sweet photo caption... (e.g. Ananya loved it!)"
                        className="w-full bg-white border border-gray-100 focus:border-[#E85D3A] focus:outline-none py-2 px-3 rounded-xl text-xs font-semibold text-[#111111]"
                      />
                      <div className="flex gap-2 justify-center">
                        {MEM_PHOTOS[category]?.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedPhoto(url)}
                            className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                              selectedPhoto === url ? 'border-[#E85D3A]' : 'border-transparent opacity-60'
                            }`}
                          >
                            <img src={url} className="w-full h-full object-cover" alt="mem option" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <button
                  id="expense-step1-next"
                  type="button"
                  onClick={handleNext}
                  disabled={!name || !amountStr || parseFloat(amountStr) <= 0}
                  className={`w-full py-3.5 px-6 rounded-3xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    name && parseFloat(amountStr) > 0
                      ? 'bg-[#E85D3A] hover:bg-[#d15030] text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>Select Companion</span>
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1 text-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest font-mono">Who Paid?</span>
                  <div className="text-xl font-bold text-[#111111]">₹{amountStr} total spent</div>
                </div>

                <div className="space-y-2 pt-2 max-h-[50vh] overflow-y-auto">
                  {members.map(member => {
                    const isSelected = paidById === member.id;
                    return (
                      <button
                        id={`paidby-${member.id}-btn`}
                        key={member.id}
                        type="button"
                        onClick={() => setPaidById(member.id)}
                        className={`w-full p-3.5 rounded-2xl border transition flex items-center gap-3 ${
                          isSelected 
                            ? 'bg-orange-50/10 border-[#E85D3A] ring-2 ring-[#E85D3A]/5 shadow-sm' 
                            : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <img 
                          src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                          className="w-10 h-10 rounded-full border border-gray-100" 
                          alt={member.name}
                        />
                        <span className="font-bold text-sm text-[#111111] flex-1 text-left">{member.name}</span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#E85D3A] flex items-center justify-center text-white">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-200" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    id="expense-step2-back"
                    onClick={handleBack} 
                    className="flex-1 py-3.5 px-4 rounded-3xl border border-gray-100 text-xs font-bold text-[#666666] hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    id="expense-step2-next"
                    onClick={handleNext}
                    className="flex-2 bg-[#E85D3A] hover:bg-[#d15030] text-white py-3.5 px-6 rounded-3xl font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <span>Configure Split</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Custom Split type toggles */}
                <div className="bg-[#F8F8F6] p-1.5 rounded-2xl flex border border-gray-100">
                  {(['Equal', 'Custom', 'Percentage'] as SplitType[]).map(type => (
                    <button
                      id={`split-type-${type.toLowerCase()}-btn`}
                      key={type}
                      type="button"
                      onClick={() => setSplitType(type)}
                      className={`flex-1 py-2 text-xs font-black rounded-xl transition ${
                        splitType === type 
                          ? 'bg-white text-[#111111] shadow-sm' 
                          : 'text-[#666666] hover:text-[#111111]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Sliders / Details per members based on splitType */}
                <div className="bg-white border border-gray-100 rounded-3xl p-4 space-y-4 max-h-[46vh] overflow-y-auto">
                  {splitType === 'Equal' && (
                    <div className="py-4 text-center space-y-2">
                      <p className="text-xs font-semibold text-[#666666]">
                        Divided equally among all <span className="text-[#111111] font-bold">{members.length}</span> members.
                      </p>
                      <div className="text-2xl font-black text-[#E85D3A] font-mono">
                        ₹{equalAmtPerMember} <span className="text-xs font-semibold text-gray-400">/ each</span>
                      </div>
                    </div>
                  )}

                  {splitType === 'Custom' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 font-mono">
                        <span>Allocated Balance</span>
                        <span className={Math.abs(customSum - amtValue) < 2 ? 'text-emerald-500' : 'text-rose-500'}>
                          ₹{customSum} of ₹{amtValue}
                        </span>
                      </div>

                      {members.map(member => (
                        <div key={member.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-700">{member.name}</span>
                            <div className="flex items-center text-xs font-mono font-bold text-[#111111]">
                              <span>₹</span>
                              <input 
                                id={`custom-split-${member.id}`}
                                type="number" 
                                value={customSplits[member.id] || 0}
                                onChange={(e) => handleCustomSplitChange(member.id, parseFloat(e.target.value) || 0)}
                                className="w-16 bg-gray-50 text-right border-b border-gray-200 focus:outline-none focus:border-[#E85D3A] pr-1"
                              />
                            </div>
                          </div>
                          <input 
                            id={`slider-split-${member.id}`}
                            type="range" 
                            min="0" 
                            max={amountStr} 
                            value={customSplits[member.id] || 0}
                            onChange={(e) => handleCustomSplitChange(member.id, parseFloat(e.target.value) || 0)}
                            className="w-full accent-[#E85D3A]"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {splitType === 'Percentage' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-400 font-mono">
                        <span>Total Percent</span>
                        <span className={Math.abs(percentageSum - 100) < 1 ? 'text-emerald-500' : 'text-rose-500'}>
                          {percentageSum}% of 100%
                        </span>
                      </div>

                      {members.map(member => {
                        const mPercent = customSplits[member.id] || 0;
                        const mAmount = Math.round(((mPercent / 100) * amtValue) * 100) / 100;
                        return (
                          <div key={member.id} className="flex justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                              <img src={member.avatar} className="w-6 h-6 rounded-full" alt="split avatar" />
                              <span className="text-xs font-bold text-gray-700">{member.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-400 font-mono">₹{mAmount}</span>
                              <div className="flex items-center text-xs font-mono font-bold bg-gray-50 border border-gray-100 p-1.5 rounded-lg">
                                <input 
                                  id={`percent-split-${member.id}`}
                                  type="number" 
                                  value={customSplits[member.id] || 0}
                                  onChange={(e) => handleCustomSplitChange(member.id, parseFloat(e.target.value) || 0)}
                                  className="w-10 text-center bg-transparent focus:outline-none"
                                />
                                <span className="text-gray-400 font-mono">%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Validation Warnings */}
                {!isSplitValid && (
                  <div className="text-[10px] text-center text-[#FF6B6B] bg-rose-50 p-2.5 rounded-2xl border border-rose-100 font-medium">
                    {splitType === 'Custom' 
                      ? `Sum of splits (₹${customSum}) must equal total amount (₹${amtValue})`
                      : `Sum of percentages (${percentageSum}%) must exactly equal 100%`}
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    id="expense-step3-back"
                    onClick={handleBack} 
                    className="flex-1 py-3.5 px-4 rounded-3xl border border-gray-100 text-xs font-bold text-[#666666] hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    id="add-expense-submit"
                    onClick={handleSubmit}
                    disabled={!isSplitValid}
                    className={`flex-2 py-3.5 px-6 rounded-3xl font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer ${
                      isSplitValid
                        ? 'bg-[#E85D3A] hover:bg-[#d15030] text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Check size={16} />
                    <span>Confirm Split</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
