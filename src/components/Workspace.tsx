import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trip, Expense, Member, ActivityLog, WorkspaceTab, SplitType 
} from '../types';
import { calculateSimplifiedSettlements, getCategoryStyles } from '../data';
import * as Icons from 'lucide-react';
import Analytics from './Analytics';

interface WorkspaceProps {
  trip: Trip;
  expenses: Expense[];
  members: Member[];
  activities: ActivityLog[];
  onOpenAddExpense: () => void;
  onOpenScanner: () => void;
  onOpenSettleUp: () => void;
  onDeleteExpense: (expenseId: string) => void;
}

export default function Workspace({
  trip,
  expenses,
  members,
  activities,
  onOpenAddExpense,
  onOpenScanner,
  onOpenSettleUp,
  onDeleteExpense
}: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('Expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteSuccessMsg, setShowInviteSuccessMsg] = useState(false);
  const [successActionName, setSuccessActionName] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedExpenseForDetail, setSelectedExpenseForDetail] = useState<Expense | null>(null);
  const [showQuickActionsId, setShowQuickActionsId] = useState<string | null>(null);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = Math.max(0, trip.budget - totalSpent);
  const simplifiedDebts = calculateSimplifiedSettlements(expenses, members);
  
  // Calculate budget utilization for progress ring
  const utilizationPercent = Math.min(100, Math.round((totalSpent / trip.budget) * 100));

  // Helper inside workspace to render category icons reliably
  const renderCategoryIcon = (category: string, className: string) => {
    const norm = category.toLowerCase();
    if (norm.includes('food') || norm.includes('dining')) {
      return <Icons.Utensils className={className} size={15} />;
    } else if (norm.includes('activity') || norm.includes('scuba') || norm.includes('diving') || norm.includes('fun')) {
      return <Icons.Compass className={className} size={15} />;
    } else if (norm.includes('transport') || norm.includes('scooter') || norm.includes('cab')) {
      return <Icons.Car className={className} size={15} />;
    } else if (norm.includes('villa') || norm.includes('lodging') || norm.includes('stay')) {
      return <Icons.Home className={className} size={15} />;
    } else if (norm.includes('drink') || norm.includes('bar') || norm.includes('cocktail')) {
      return <Icons.Wine className={className} size={15} />;
    } else if (norm.includes('shop') || norm.includes('gift') || norm.includes('buy')) {
      return <Icons.ShoppingBag className={className} size={15} />;
    } else {
      return <Icons.Coins className={className} size={15} />;
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInviteCTA = (action: string) => {
    setSuccessActionName(action);
    setShowInviteSuccessMsg(true);
    setTimeout(() => {
      setShowInviteSuccessMsg(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. COVER HERO IMAGE CARD - HEIGHT 240 - Airbnb styled visual anchor */}
      <div className="relative h-[240px] rounded-[32px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-[#ECE7E1]">
        <img 
          src={trip.coverImage} 
          className="absolute inset-0 w-full h-full object-cover" 
          alt={trip.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"></div>
        
        {/* Detail content overlays */}
        <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col justify-between h-[88%]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] bg-white/20 backdrop-blur-md text-white py-1.5 px-3.5 rounded-full font-bold uppercase tracking-wider border border-white/10">
              Active Trip
            </span>
            
            {/* SVG Budget Progress Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center bg-black/30 backdrop-blur-md rounded-full p-1 border border-white/10" title="Budget Progress">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" fill="transparent" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  fill="transparent" 
                  stroke="#E85D3A" 
                  strokeWidth="3.5" 
                  strokeDasharray={`${utilizationPercent * 1.5} 150`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black leading-none">{utilizationPercent}%</span>
                <span className="text-[6px] text-gray-300 font-bold uppercase scale-90">spent</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-left">
            <div>
              <h2 className="text-2xl font-bold tracking-tight leading-none text-white">{trip.name}</h2>
              <p className="text-xs text-gray-200 mt-2 flex items-center gap-1.5 font-medium">
                <Icons.MapPin size={13} className="text-[#F6C453]" />
                <span>{trip.destination}</span>
              </p>
            </div>

            {/* Member avatar stacks style */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((m, idx) => (
                  <img 
                    key={m.id} 
                    src={m.avatar} 
                    className="w-6.5 h-6.5 rounded-full border border-black object-cover" 
                    alt={m.name} 
                    title={m.name}
                  />
                ))}
                {members.length > 4 && (
                  <div className="w-6.5 h-6.5 rounded-full bg-[#1D1D1D] text-[10px] text-white flex items-center justify-center font-bold border border-black">
                    +{members.length - 4}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-300 font-bold uppercase font-mono tracking-wider">{members.length} friends joined</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY NUMERIC CARDS WITH NO HEAVY BORDERS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#ECE7E1] p-4 rounded-[24px] text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block font-mono">Trip Budget</span>
          <span className="text-sm font-black text-[#1D1D1D] font-mono mt-1.5 block">₹{trip.budget.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-[#ECE7E1] p-4 rounded-[24px] text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block font-mono">Total Spent</span>
          <span className="text-sm font-black text-[#E85D3A] font-mono mt-1.5 block">₹{totalSpent.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-[#ECE7E1] p-4 rounded-[24px] text-center shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
          <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block font-mono">Remaining</span>
          <span className={`text-sm font-bold font-mono mt-1.5 block ${remaining < 5000 ? 'text-[#E85D3A]' : 'text-[#4DAA57]'}`}>
            ₹{remaining.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Redesigned Fintech Settlement Widget with precise Owe, Owed, and Net Position information */}
      {(() => {
        const currentUserObj = members.find(m => m.id === 'm1' || m.name.includes('(You)')) || members[0];
        const currentUserId = currentUserObj?.id || 'm1';

        const myDebtsToPay = simplifiedDebts.filter(d => d.fromMemberId === currentUserId);
        const myDebtsToReceive = simplifiedDebts.filter(d => d.toMemberId === currentUserId);

        const totalYouOwe = myDebtsToPay.reduce((sum, d) => sum + d.amount, 0);
        const totalYouAreOwed = myDebtsToReceive.reduce((sum, d) => sum + d.amount, 0);
        const netPosition = totalYouAreOwed - totalYouOwe;

        return (
          <div className="bg-white border border-[#ECE7E1] rounded-[24px] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h4 className="text-xs font-bold text-[#1D1D1D] uppercase tracking-wider">My Settlement Summary</h4>
                <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">Clear balances seamlessly in one click</p>
              </div>
              <button
                id="workspace-settle-up-banner-btn"
                onClick={onOpenSettleUp}
                className="bg-[#E85D3A] hover:bg-[#d15030] text-white text-[10px] font-bold px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Icons.Smartphone size={13} />
                <span>View Settlements</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3.5 pt-1">
              {/* You Owe block */}
              <div className="text-left bg-orange-50/10 border border-orange-100 rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-semibold text-[#E85D3A] uppercase tracking-wider block font-sans">You Owe</span>
                <span className="text-[15px] font-bold text-[#E85D3A] font-sans leading-none block">
                  ₹{totalYouOwe.toLocaleString()}
                </span>
              </div>

              {/* You Are Owed block */}
              <div className="text-left bg-emerald-50/10 border border-emerald-100 rounded-2xl p-3.5 space-y-1">
                <span className="text-[9px] font-semibold text-[#4DAA57] uppercase tracking-wider block font-sans">You Are Owed</span>
                <span className="text-[15px] font-bold text-[#4DAA57] font-sans leading-none block">
                  ₹{totalYouAreOwed.toLocaleString()}
                </span>
              </div>

              {/* Net Position block */}
              <div className={`text-left border rounded-2xl p-3.5 space-y-1 ${
                netPosition > 0 
                  ? 'bg-emerald-50/20 border-emerald-100' 
                  : netPosition < 0 
                    ? 'bg-orange-50/20 border-orange-100' 
                    : 'bg-gray-50 border-gray-100'
              }`}>
                <span className="text-[9px] font-semibold text-[#6B7280] uppercase tracking-wider block font-sans">Net Position</span>
                <span className={`text-[15px] font-bold font-sans leading-none block ${
                  netPosition > 0 
                    ? 'text-[#4DAA57]' 
                    : netPosition < 0 
                      ? 'text-[#E85D3A]' 
                      : 'text-gray-400'
                }`}>
                  {netPosition > 0 ? `+₹${netPosition.toLocaleString()}` : netPosition < 0 ? `-₹${Math.abs(netPosition).toLocaleString()}` : 'Settled 🎉'}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SPEND INSIGHTS & ANALYTICS COLLAPSIBLE ACCORDION */}
      <div className="bg-white border border-[#ECE7E1] rounded-[28px] p-4.5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-left">
        <button 
          id="toggle-spend-insights-btn"
          onClick={() => setShowAnalytics(!showAnalytics)}
          className="w-full flex items-center justify-between focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E85D3A]/10 text-[#E85D3A] flex items-center justify-center shrink-0">
              <Icons.PieChart size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-[#1D1D1D]">Spend Insights &amp; Analytics</h4>
              <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">Visualize shares, budgets and daily trends</p>
            </div>
          </div>
          <div className="text-gray-400 p-1.5 hover:text-[#1D1D1D] hover:bg-gray-50 rounded-lg transition">
            {showAnalytics ? <Icons.ChevronUp size={16} /> : <Icons.ChevronDown size={16} />}
          </div>
        </button>

        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-gray-100 pt-4"
            >
              <Analytics trip={trip} expenses={expenses} members={members} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. CORE SUB-TABS SELECTOR - Balances replaced with Settle Up */}
      <div className="bg-white p-1.5 rounded-[20px] flex border border-[#ECE7E1] shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        {(['Expenses', 'Settle Up', 'Members', 'Activity'] as WorkspaceTab[]).map(tab => (
          <button
            id={`workspace-tab-${tab.toLowerCase().replace(' ', '-')}-btn`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
              activeTab === tab 
                ? 'bg-[#1D1D1D] text-white shadow-sm' 
                : 'text-[#6B7280] hover:text-[#1D1D1D]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. ACTIVE TAB DETAILED BODY VIEWPORT */}
      <div className="pt-1">
        {activeTab === 'Expenses' && (
          <div className="space-y-4">
            {/* Search row */}
            <div className="relative">
              <input 
                id="expense-search-input"
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search beach beach shacks, scuba dives, cabins..." 
                className="w-full bg-white border border-[#ECE7E1] focus:border-[#E85D3A] focus:outline-none py-3 pl-10 pr-4 rounded-2xl text-xs font-medium text-[#1D1D1D] shadow-xs transition"
              />
              <Icons.Search className="absolute left-3.5 top-3.5 text-gray-400" size={14} />
            </div>

            {/* List timeline / Airbnb Activity Card Style */}
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-[32px] border border-[#ECE7E1] p-6 space-y-3">
                <div className="w-12 h-12 bg-orange-50 text-[#E85D3A] rounded-full flex items-center justify-center mx-auto">
                  <Icons.Coins size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1D1D1D]">No expenses split yet</h4>
                  <p className="text-[10px] text-[#6B7280] max-w-xs mx-auto">Log food outings, scooter transport, stays, and balance them seamlessly.</p>
                </div>
                <button
                  id="empty-add-expense-btn"
                  onClick={onOpenAddExpense}
                  className="bg-[#E85D3A] hover:bg-[#d15030] text-white text-[10px] font-black px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Add First Expense
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExpenses.map((exp) => {
                  const paidByMember = members.find(m => m.id === exp.paidById) || members[0];
                  
                  const getCategoryEmoji = (category: string) => {
                    const norm = category.toLowerCase();
                    if (norm.includes('food') || norm.includes('dining') || norm.includes('restaurant') || norm.includes('shack')) {
                      return '🍽';
                    } else if (norm.includes('stay') || norm.includes('lodging') || norm.includes('villa') || norm.includes('hotel') || norm.includes('cabin')) {
                      return '🏨';
                    } else if (norm.includes('transport') || norm.includes('scooter') || norm.includes('car') || norm.includes('cab') || norm.includes('fuel')) {
                      return '🚗';
                    } else if (norm.includes('activity') || norm.includes('scuba') || norm.includes('diving') || norm.includes('surf') || norm.includes('fun') || norm.includes('sport')) {
                      return '🏄';
                    } else if (norm.includes('shopping') || norm.includes('gift') || norm.includes('buy') || norm.includes('shop') || norm.includes('bar')) {
                      return '🛍';
                    } else {
                      return '📦';
                    }
                  };

                  const getAmountColor = (e: Expense) => {
                    if (simplifiedDebts.length === 0) {
                      return 'text-[#4DAA57]'; // Settled -> Green
                    }
                    if (e.paidById === 'm1') {
                      return 'text-[#E85D3A]'; // Pending -> Orange
                    }
                    return 'text-rose-500'; // Owed -> Red
                  };

                  let longPressTimer: NodeJS.Timeout;
                  const handlePressStart = () => {
                    longPressTimer = setTimeout(() => {
                      setShowQuickActionsId(exp.id);
                    }, 600);
                  };
                  const handlePressEnd = () => {
                    clearTimeout(longPressTimer);
                  };

                  return (
                    <div key={exp.id} className="relative overflow-hidden rounded-[20px]">
                      {/* Swipe Underlay Action indicators */}
                      <div className="absolute inset-0 bg-neutral-50 flex items-center justify-between px-6 rounded-[20px]">
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[11px] uppercase tracking-wider">
                          <Icons.Eye size={14} />
                          <span>Tap for Details</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#E85D3A] font-bold text-[11px] uppercase tracking-wider">
                          <span>Swipe Left to Delete</span>
                          <Icons.Trash2 size={14} />
                        </div>
                      </div>

                      {/* Interactive Drag Card */}
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: -120, right: 120 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                          if (info.offset.x < -80) {
                            onDeleteExpense(exp.id);
                            handleInviteCTA("Split expense successfully removed.");
                          } else if (info.offset.x > 80) {
                            setSelectedExpenseForDetail(exp);
                          }
                        }}
                        onMouseDown={handlePressStart}
                        onMouseUp={handlePressEnd}
                        onTouchStart={handlePressStart}
                        onTouchEnd={handlePressEnd}
                        onClick={() => setSelectedExpenseForDetail(exp)}
                        className="bg-white rounded-[20px] p-5 sm:p-6 shadow-[0_4px_22px_rgba(0,0,0,0.015)] border border-neutral-100/40 space-y-3.5 relative z-10 transition duration-150 cursor-pointer select-none touch-pan-y"
                        id={`expense-card-${exp.id}`}
                      >
                        {/* Top Row: Category emoji on left, title in center, amount on right */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 w-3/4 min-w-0">
                            <span className="text-[22px] leading-none shrink-0" role="img" aria-label="category">
                              {getCategoryEmoji(exp.category)}
                            </span>
                            <h4 className="text-[18px] font-semibold text-[#111111] truncate tracking-tight font-sans">
                              {exp.name}
                            </h4>
                          </div>
                          <div className={`text-[24px] font-bold font-sans tracking-tight shrink-0 ${getAmountColor(exp)}`}>
                            ₹{exp.amount.toLocaleString()}
                          </div>
                        </div>

                        {/* Second Row: Paid by user, Date */}
                        <div className="flex items-center justify-between text-left border-t border-gray-50/50 pt-3">
                          <span className="text-[14px] font-medium text-gray-500 font-sans">
                            Paid by {paidByMember.name.replace(' (You)', '')}
                          </span>
                          <span className="text-[12px] font-medium text-gray-400 font-sans">
                            {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                          </span>
                        </div>

                        {/* Third Row: Member avatar stack, Split type badge */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex -space-x-1.5 items-center shrink-0">
                            {members.slice(0, 3).map((m, idx) => (
                              <img 
                                key={idx} 
                                src={m.avatar} 
                                className="w-5 h-5 rounded-full border-2 border-white object-cover shadow-3xs shrink-0" 
                                alt={m.name} 
                              />
                            ))}
                            {members.length > 3 && (
                              <div className="w-5 h-5 rounded-full bg-gray-55 text-[8px] text-gray-500 font-black flex items-center justify-center border-2 border-white shadow-3xs">
                                +{members.length - 3}
                              </div>
                            )}
                          </div>
                          
                          <span className="text-[12px] font-semibold text-gray-400 capitalize font-sans">
                            {exp.splitType === 'Equal' ? 'Equal Split' : `${exp.splitType} Split`}
                          </span>
                        </div>

                        {/* Optional Fourth Row: Memory photo attachment with caption overlay */}
                        {exp.photoUrl && (
                          <div className="relative mt-2 h-[170px] rounded-[16px] overflow-hidden shadow-3xs group">
                            <img 
                              src={exp.photoUrl} 
                              className="absolute inset-0 w-full h-full object-cover" 
                              alt="travel moment" 
                            />
                            {/* Dark gradient overlay for modern editorial story looks */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"></div>
                            <div className="absolute bottom-3 left-3 right-3 text-left">
                              <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-md text-white rounded-md px-2 py-0.5 mb-1.5 border border-white/10">
                                📸 Memory Locked
                              </span>
                              <p className="text-[11.5px] font-medium leading-relaxed text-gray-100 line-clamp-2">
                                {exp.caption || `Captured during ${exp.name}`}
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Settle Up sub-tab (previously Balances) */}
        {activeTab === 'Settle Up' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#ECE7E1] rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest font-mono">My Settlements</span>
                <span className="text-[9px] bg-orange-50 text-[#E85D3A] px-2.5 py-0.5 rounded-full font-black uppercase font-sans">
                  Active
                </span>
              </div>

              {(() => {
                const currentUserObj = members.find(m => m.id === 'm1' || m.name.includes('(You)')) || members[0];
                const currentUserId = currentUserObj?.id || 'm1';

                const myDebtsToPay = simplifiedDebts.filter(d => d.fromMemberId === currentUserId);
                const myDebtsToReceive = simplifiedDebts.filter(d => d.toMemberId === currentUserId);

                if (myDebtsToPay.length === 0 && myDebtsToReceive.length === 0) {
                  return (
                    <div className="text-center py-10 space-y-3">
                      <div className="w-12 h-12 bg-emerald-50 text-[#4DAA57] rounded-full flex items-center justify-center mx-auto">
                        <Icons.CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1D1D1D]">🎉 Everything is settled</h4>
                        <p className="text-[10px] text-[#6B7280] mt-1">No pending payments in this trip.</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {/* Items I need to pay */}
                    {myDebtsToPay.map((debt, index) => (
                      <div key={`workspace-pay-${index}`} className="flex items-center justify-between py-3 px-1 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 text-left min-w-0">
                          <img src={debt.toAvatar} className="w-9 h-9 rounded-full border border-[#ECE7E1] object-cover shrink-0" alt={debt.toName} />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#1D1D1D] block truncate">{debt.toName.replace(' (You)', '')}</span>
                            <span className="text-[9px] text-[#E85D3A] font-semibold">Pending Settlement</span>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-[#E85D3A]">₹{debt.amount.toLocaleString()}</span>
                          <span className="text-[8px] bg-orange-50 text-[#E85D3A] px-1.5 py-0.5 rounded font-semibold block mt-1">You Owe</span>
                        </div>
                      </div>
                    ))}

                    {/* Items I will receive */}
                    {myDebtsToReceive.map((debt, index) => (
                      <div key={`workspace-receive-${index}`} className="flex items-center justify-between py-3 px-1 border-b border-gray-50 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 text-left min-w-0">
                          <img src={debt.fromAvatar} className="w-9 h-9 rounded-full border border-[#ECE7E1] object-cover shrink-0" alt={debt.fromName} />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#1D1D1D] block truncate">{debt.fromName.replace(' (You)', '')}</span>
                            <span className="text-[9px] text-gray-400 font-medium">Waiting for payment</span>
                          </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold text-[#4DAA57]">₹{debt.amount.toLocaleString()}</span>
                          <span className="text-[8px] bg-emerald-50 text-[#4DAA57] px-1.5 py-0.5 rounded font-semibold block mt-1">Pending to Receive</span>
                        </div>
                      </div>
                    ))}

                    <button
                      id="balances-settle-up-btn"
                      onClick={onOpenSettleUp}
                      className="w-full bg-[#E85D3A] hover:bg-[#d15030] text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer mt-3"
                    >
                      <Icons.Smartphone size={13} />
                      <span>One-Tap Settlement Screen</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Dedicated Members/Friends sub-tab */}
        {activeTab === 'Members' && (
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest block font-mono text-left">Active Group Members</span>
            <div className="space-y-2.5">
              {members.map((member) => {
                const netBalance = member.amountPaid - member.amountOwed;
                const isSettled = Math.abs(netBalance) < 1;
                
                return (
                  <div 
                    key={member.id} 
                    className="bg-white border border-[#ECE7E1] p-4 rounded-[24px] flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
                  >
                    <div className="flex items-center gap-3">
                      <img src={member.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt={member.name} />
                      <div className="text-left">
                        <h4 className="text-xs font-black text-[#1D1D1D] flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {member.role !== 'Member' && (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black font-mono uppercase ${
                              member.role === 'Owner' ? 'bg-orange-50 text-[#E85D3A]' : 'bg-[#5B8DEF]/10 text-[#5B8DEF]'
                            }`}>
                              {member.role}
                            </span>
                          )}
                        </h4>
                        
                        {/* SETTLEMENT STATUS indicator */}
                        <div className="mt-1 flex items-center gap-1 bg-[#FDFCFB]">
                          <span className={`w-1.5 h-1.5 rounded-full ${isSettled ? 'bg-[#4DAA57]' : netBalance > 0 ? 'bg-[#5B8DEF]' : 'bg-[#E85D3A]'}`}></span>
                          <span className="text-[9px] font-bold text-gray-500 font-sans">
                            {isSettled ? 'Settled Up' : netBalance > 0 ? `Owed ₹${Math.round(netBalance)}` : `Owes ₹${Math.round(Math.abs(netBalance))}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-[#4DAA57] font-mono" title="Paid">
                        +₹{member.amountPaid.toLocaleString()} paid
                      </div>
                      <div className="text-[9px] font-mono font-bold text-gray-405 mt-0.5" title="Owed share">
                        -₹{member.amountOwed.toLocaleString()} split
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'Activity' && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono text-left">Activity Log</span>
            <div className="bg-white border border-[#ECE7E1] rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-4">
              {activities.length === 0 ? (
                <p className="text-xs text-[#6B7280] italic text-center">No activity registered on workspace yet.</p>
              ) : (
                <div className="space-y-4 relative border-l border-gray-100 pl-4 ml-2 text-left">
                  {activities.map((act) => {
                    return (
                      <div key={act.id} className="relative">
                        {/* Bullet circle */}
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#E85D3A] border border-white" />
                        <span className="text-[9px] font-mono font-bold text-[#6B7280] block">{act.timestamp}</span>
                        <p className="text-xs font-semibold text-[#1D1D1D] mt-0.5 leading-relaxed">{act.text}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. MEMBERS MODULE - ALWAYS VISIBLE PERSISTENT PORTION */}
      <div className="bg-white rounded-[28px] border border-[#ECE7E1] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] text-left space-y-3.5 mt-2">
        <div className="flex justify-between items-center pb-2 border-b border-gray-50">
          <div>
            <h4 className="text-xs font-black text-[#1D1D1D] uppercase tracking-wider font-mono">Trip Companions &amp; invites</h4>
            <p className="text-[9px] text-[#6B7280] font-medium mt-0.5">Friends linked to exact expense accounts</p>
          </div>
          <span className="text-[9px] bg-orange-100/30 text-[#E85D3A] px-2 py-0.5 rounded-full font-bold uppercase font-mono">{members.length} friends</span>
        </div>

        {/* Persistent list row (always_visible: true spec conformity) */}
        <div className="grid grid-cols-2 gap-2.5">
          {members.map(m => {
            const net = m.amountPaid - m.amountOwed;
            const settled = Math.abs(net) < 1;
            return (
              <div key={m.id} className="flex items-center gap-2 bg-[#FFFDF8] border border-gray-100/70 p-2 rounded-xl">
                <img src={m.avatar} className="w-7 h-7 rounded-full object-cover border border-[#ECE7E1]" alt="tiny list avatar" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-[#1D1D1D] truncate">{m.name.split(' ')[0]}</p>
                  <p className={`text-[8px] font-bold ${settled ? 'text-[#4DAA57]' : net > 0 ? 'text-[#5B8DEF]' : 'text-[#E85D3A]'}`}>
                    {settled ? 'Settled up' : net > 0 ? `Owed ₹${Math.round(net)}` : `Owes ₹${Math.round(Math.abs(net))}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* COOP GROW TRIBE WHATSAPP invite CTAs */}
        <div className="bg-[#FFFDF8]/60 p-4 border border-[#ECE7E1] rounded-2xl space-y-2.5">
          <span className="text-[8.5px] font-black text-[#6B7280] uppercase tracking-wider block font-mono">Share invites with friends</span>
          
          {/* Primary CTA: WhatsApp invite */}
          <button 
            id="workspace-invite-whatsapp"
            onClick={() => handleInviteCTA('WhatsApp')}
            className="w-full bg-[#4DAA57] hover:bg-[#3d8c46] text-white py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Icons.MessageCircle size={14} />
            <span>Invite via WhatsApp</span>
          </button>

          {/* Secondary CTAs */}
          <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-gray-100">
            <button 
              id="workspace-invite-copylink"
              onClick={() => handleInviteCTA('Copy Link')}
              className="py-1.5 bg-white border border-[#ECE7E1] hover:bg-gray-50 text-[9px] font-bold text-[#1D1D1D] rounded-lg transition"
            >
              Copy Link
            </button>
            <button 
              id="workspace-invite-qr"
              onClick={() => handleInviteCTA('QR Code')}
              className="py-1.5 bg-white border border-[#ECE7E1] hover:bg-gray-50 text-[9px] font-bold text-[#1D1D1D] rounded-lg transition"
            >
              QR Code
            </button>
            <button 
              id="workspace-invite-phone"
              onClick={() => handleInviteCTA('Phone Number')}
              className="py-1.5 bg-white border border-[#ECE7E1] hover:bg-gray-50 text-[9px] font-bold text-[#1D1D1D] rounded-lg transition"
            >
              Phone No.
            </button>
          </div>
        </div>
      </div>

      {/* Floating alert/success micro notifications */}
      <AnimatePresence>
        {showInviteSuccessMsg && (
          <motion.div 
            key="success-msg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 bg-[#1D1D1D] text-white py-3 px-4 rounded-xl flex items-center gap-2 shadow-lg z-50 font-bold text-xs justify-center"
          >
            <Icons.Sparkles size={14} className="text-[#F6C453] shrink-0" />
            <span>Success: invitation {successActionName} compiled!</span>
          </motion.div>
        )}

        {/* Expense Details Dialog */}
        {selectedExpenseForDetail && (
          <motion.div 
            key="details-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#111111]/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedExpenseForDetail(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[28px] p-6 w-full max-w-[360px] text-left border border-gray-150 shadow-2xl space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-sans">
                    {(() => {
                      const cat = selectedExpenseForDetail.category.toLowerCase();
                      if (cat.includes('food') || cat.includes('dining')) return '🍽';
                      if (cat.includes('stay') || cat.includes('lodging')) return '🏨';
                      if (cat.includes('transport') || cat.includes('scooter')) return '🚗';
                      if (cat.includes('activity') || cat.includes('sport')) return '🏄';
                      if (cat.includes('shop')) return '🛍';
                      return '📦';
                    })()}
                  </span>
                  <span className="text-xs font-bold text-[#E85D3A] uppercase tracking-wider font-sans">{selectedExpenseForDetail.category}</span>
                </div>
                <button 
                  onClick={() => setSelectedExpenseForDetail(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition"
                >
                  <Icons.X size={15} />
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="text-[20px] font-bold text-[#111111] leading-tight font-sans">{selectedExpenseForDetail.name}</h4>
                <p className="text-[12px] text-gray-400 font-medium">Split logged on {new Date(selectedExpenseForDetail.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p>
              </div>

              <div className="bg-[#FFFDF8] border border-[#ECE7E1] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">Paid By</span>
                  <span className="text-sm font-semibold text-[#111111] font-sans">
                    {(members.find(m => m.id === selectedExpenseForDetail.paidById) || members[0])?.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-sans">Total Spent</span>
                  <span className="text-[20px] font-extrabold text-[#E85D3A] font-sans">
                    ₹{selectedExpenseForDetail.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Breakdown of shares */}
              <div className="space-y-2.5">
                <span className="text-[10.5px] font-bold text-gray-450 uppercase tracking-wider block font-sans">Split Share Details</span>
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {members.map(m => {
                    let shareAmount = selectedExpenseForDetail.amount / members.length;
                    if (selectedExpenseForDetail.splitType === 'Custom' && selectedExpenseForDetail.customSplits) {
                      shareAmount = selectedExpenseForDetail.customSplits[m.id] || 0;
                    } else if (selectedExpenseForDetail.splitType === 'Percentage' && selectedExpenseForDetail.customSplits) {
                      shareAmount = ((selectedExpenseForDetail.customSplits[m.id] || 0) / 100) * selectedExpenseForDetail.amount;
                    }

                    return (
                      <div key={m.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <img src={m.avatar} className="w-5.5 h-5.5 rounded-full object-cover border border-gray-100" alt={m.name} />
                          <span className="font-semibold text-gray-600 font-sans">{m.name.replace(' (You)', '')}</span>
                        </div>
                        <span className="font-bold text-[#111111] font-sans">₹{Math.round(shareAmount).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Photo Memory */}
              {selectedExpenseForDetail.photoUrl && (
                <div className="rounded-2xl overflow-hidden relative h-[140px] shadow-xs">
                  <img src={selectedExpenseForDetail.photoUrl} className="w-full h-full object-cover" alt="story cover" />
                  <div className="absolute inset-0 bg-black/60 flex items-end p-3">
                    <p className="text-[11px] font-medium text-gray-100 leading-snug font-sans">
                      💬 {selectedExpenseForDetail.caption}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    onDeleteExpense(selectedExpenseForDetail.id);
                    setSelectedExpenseForDetail(null);
                    handleInviteCTA("Deleted.");
                  }}
                  className="flex-1 py-2.5 border border-rose-100 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition hover:bg-rose-50"
                >
                  Delete Split
                </button>
                <button
                  onClick={() => setSelectedExpenseForDetail(null)}
                  className="flex-1 py-2.5 bg-[#111111] hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-wider text-center transition"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Quick Actions Draggable Context Sheet */}
        {showQuickActionsId && (
          <motion.div 
            key="quick-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#111111]/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowQuickActionsId(null)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-t-[28px] sm:rounded-[28px] p-6 w-full max-w-[380px] text-left border border-gray-150 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-sans">Quick Actions</h4>
                <p className="text-[14px] font-bold text-[#111111] mt-0.5 font-sans">
                  Manage &ldquo;{(expenses.find(e => e.id === showQuickActionsId))?.name}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => {
                    const exp = expenses.find(e => e.id === showQuickActionsId);
                    if (exp) setSelectedExpenseForDetail(exp);
                    setShowQuickActionsId(null);
                  }}
                  className="w-full p-3 hover:bg-gray-50 rounded-xl text-[11px] font-bold text-[#111111] flex items-center gap-2.5 transition text-left"
                >
                  <Icons.Eye size={15} className="text-emerald-500" />
                  <span>Show Split Breakdown Details</span>
                </button>
                <button
                  onClick={() => {
                    const exp = expenses.find(e => e.id === showQuickActionsId);
                    if (exp) {
                      const msg = `Split of ₹${exp.amount.toLocaleString()} for "${exp.name}" is logged on Minto. Paid by ${(members.find(m => m.id === exp.paidById) || members[0])?.name}.`;
                      navigator.clipboard.writeText(msg);
                      handleInviteCTA("Details copied to clipboard!");
                    }
                    setShowQuickActionsId(null);
                  }}
                  className="w-full p-3 hover:bg-gray-50 rounded-xl text-[11px] font-bold text-[#111111] flex items-center gap-2.5 transition text-left"
                >
                  <Icons.Copy size={15} className="text-amber-500" />
                  <span>Copy Split Details & Share Code</span>
                </button>
                <button
                  onClick={() => {
                    onDeleteExpense(showQuickActionsId);
                    setShowQuickActionsId(null);
                  }}
                  className="w-full p-3 hover:bg-rose-50 text-rose-600 rounded-xl text-[11px] font-bold flex items-center gap-2.5 transition text-left"
                >
                  <Icons.Trash2 size={15} />
                  <span>Delete Split Post Permanently</span>
                </button>
              </div>

              <button 
                onClick={() => setShowQuickActionsId(null)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-[#111111] font-bold rounded-xl text-[10px] uppercase text-center transition"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. QUICK-ADD FLOATING BOTTOM ACTIONS RAILS */}
      <div className="sticky bottom-6 left-0 right-0 flex justify-center gap-3 z-30 pt-4">
        <button
          id="floating-gallery-receipt-btn"
          onClick={onOpenScanner}
          className="bg-white border border-[#ECE7E1] hover:bg-gray-50 text-[#1D1D1D] py-3.5 px-5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
        >
          <Icons.Camera size={14} />
          <span>Scan Receipt</span>
        </button>
        <button
          id="floating-add-expense-btn"
          onClick={onOpenAddExpense}
          className="bg-[#E85D3A] hover:bg-[#d15030] text-white py-3.5 px-6 rounded-full font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
        >
          <Icons.Plus size={15} strokeWidth={3} />
          <span>Add Expense</span>
        </button>
      </div>
    </div>
  );
}
