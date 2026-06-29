import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  House, Compass, Receipt, User, 
  Sparkles, Plus, Camera as ScanIcon, Smartphone, 
  Wifi, Battery, RefreshCw, CheckCircle2, ArrowRight,
  ArrowUpRight, ArrowDownLeft, Coins, Check, Link as LinkIcon, QrCode
} from 'lucide-react';

import { Trip, Expense, Member, Memory, ActivityLog, TabName, UseCase } from './types';
import { 
  INITIAL_TRIPS, INITIAL_EXPENSES, INITIAL_MEMORIES, 
  INITIAL_ACTIVITIES, calculateSimplifiedSettlements 
} from './data';

import Onboarding from './components/Onboarding';
import Workspace from './components/Workspace';
import AddExpense from './components/AddExpense';
import ReceiptScanner from './components/ReceiptScanner';
import SettleUp from './components/SettleUp';
import Profile from './components/Profile';
import CreateTrip from './components/CreateTrip';
import MemoryTimeline from './components/MemoryTimeline';

export default function App() {
  // 1. Storage & Core States
  const [useCase, setUseCase] = useState<UseCase>('Trips');
  const [upiHandle, setUpiHandle] = useState('arjun@ybl');
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('minto_v2_userName') || 'Arjun';
  });
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return localStorage.getItem('minto_v2_userAvatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
  });
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  const [onboarded, setOnboarded] = useState<boolean>(() => {
    const val = localStorage.getItem('minto_v2_onboarded');
    return val === 'true';
  });

  const [activeTab, setActiveTab] = useState<TabName>('Home');
  const [activeTripId, setActiveTripId] = useState('t1');

  const [trips, setTrips] = useState<Trip[]>(() => {
    const val = localStorage.getItem('minto_v2_trips');
    return val ? JSON.parse(val) : INITIAL_TRIPS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const val = localStorage.getItem('minto_v2_expenses');
    return val ? JSON.parse(val) : INITIAL_EXPENSES;
  });

  const [memories, setMemories] = useState<Memory[]>(() => {
    const val = localStorage.getItem('minto_v2_memories');
    return val ? JSON.parse(val) : INITIAL_MEMORIES;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const val = localStorage.getItem('minto_v2_activities');
    return val ? JSON.parse(val) : INITIAL_ACTIVITIES;
  });

  // Dialog/Modal overlays states
  const [showScanner, setShowScanner] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showJoinTrip, setShowJoinTrip] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinSuccessMsg, setJoinSuccessMsg] = useState('');
  const [prefilledScan, setPrefilledScan] = useState<{ name: string; amount: number; category: string; caption: string } | null>(null);
  
  // Growth Loop micro-interaction trigger
  const [showBigConfetti, setShowBigConfetti] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('minto_v2_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('minto_v2_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('minto_v2_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('minto_v2_activities', JSON.stringify(activities));
  }, [activities]);

  const handleOnboardingComplete = (nameVal: string, upi: string) => {
    setUserName(nameVal);
    localStorage.setItem('minto_v2_userName', nameVal);
    setUpiHandle(upi);

    setOnboarded(true);
    localStorage.setItem('minto_v2_onboarded', 'true');
    setActiveTab('Home');
    
    // Immediately open the Create Trip modal
    setShowCreateTrip(true);
    
    // Trigger confetti micro-interaction
    setShowBigConfetti(true);
    setTimeout(() => setShowBigConfetti(false), 3000);
  };

  // 2. Action Logic Controllers
  const handleAddExpenseSubmit = (data: {
    name: string;
    amount: number;
    paidById: string;
    splitType: any;
    category: string;
    customSplits?: Record<string, number>;
    photoUrl?: string;
    caption?: string;
  }) => {
    const newId = `exp_${Date.now()}`;
    const newExpenseObj: Expense = {
      id: newId,
      tripId: activeTripId,
      name: data.name,
      amount: data.amount,
      paidById: data.paidById,
      splitType: data.splitType,
      customSplits: data.customSplits,
      date: new Date().toISOString().split('T')[0],
      category: data.category,
      photoUrl: data.photoUrl,
      caption: data.caption
    };

    // Update expenses list
    setExpenses([newExpenseObj, ...expenses]);

    // Update active trip members amount paid/owed totals for exact accountability
    const updatedTrips = trips.map(t => {
      if (t.id === activeTripId) {
        const costPerMember = data.amount / t.members.length;
        const updatedMembers = t.members.map(m => {
          let extraPaid = 0;
          let extraOwed = 0;

          if (m.id === data.paidById) {
            extraPaid = data.amount;
          }

          if (data.splitType === 'Equal') {
            extraOwed = costPerMember;
          } else if (data.splitType === 'Custom' && data.customSplits) {
            extraOwed = data.customSplits[m.id] || 0;
          } else if (data.splitType === 'Percentage' && data.customSplits) {
            const pct = data.customSplits[m.id] || 0;
            extraOwed = (pct / 100) * data.amount;
          } else {
            extraOwed = costPerMember;
          }

          return {
            ...m,
            amountPaid: Math.round((m.amountPaid + extraPaid) * 100) / 100,
            amountOwed: Math.round((m.amountOwed + extraOwed) * 100) / 100
          };
        });

        return {
          ...t,
          spent: Math.round((t.spent + data.amount) * 100) / 100,
          members: updatedMembers
        };
      }
      return t;
    });

    setTrips(updatedTrips);

    // Track activity feed
    const payerName = trips.find(t => t.id === activeTripId)?.members.find(m => m.id === data.paidById)?.name.split(' ')[0] || 'Member';
    const newActivity: ActivityLog = {
      id: `act_${Date.now()}`,
      tripId: activeTripId,
      type: 'Expense Added',
      text: `${payerName} added "${data.name}" • ₹${data.amount.toLocaleString()}`,
      timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setActivities([newActivity, ...activities]);

    // Push photo to Memories tab if any
    if (data.photoUrl) {
      const activeTrip = trips.find(t => t.id === activeTripId);
      const newMemoryObj: Memory = {
        id: `mem_${Date.now()}`,
        tripId: activeTripId,
        photoUrl: data.photoUrl,
        caption: data.caption || `Snaps of ${data.name}`,
        expenseName: data.name,
        amount: data.amount,
        location: activeTrip?.destination || 'Goa beach',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        likes: 1
      };
      setMemories([newMemoryObj, ...memories]);
    }

    setShowAddExpense(false);
    setPrefilledScan(null);

    // Blast celebration confetti
    setShowBigConfetti(true);
    setTimeout(() => setShowBigConfetti(false), 3000);
  };

  const handleDeleteExpense = (expenseId: string) => {
    const expObj = expenses.find(e => e.id === expenseId);
    if (!expObj) return;

    // Deduct from lists
    setExpenses(expenses.filter(e => e.id !== expenseId));

    // Restore member ledger tabs
    const updatedTrips = trips.map(t => {
      if (t.id === activeTripId) {
        const costPerMember = expObj.amount / t.members.length;
        const restoredMembers = t.members.map(m => {
          let refundPaid = 0;
          let refundOwed = 0;

          if (m.id === expObj.paidById) {
            refundPaid = expObj.amount;
          }

          if (expObj.splitType === 'Equal') {
            refundOwed = costPerMember;
          } else if (expObj.splitType === 'Custom' && expObj.customSplits) {
            refundOwed = expObj.customSplits[m.id] || 0;
          } else if (expObj.splitType === 'Percentage' && expObj.customSplits) {
            const pct = expObj.customSplits[m.id] || 0;
            refundOwed = (pct / 100) * expObj.amount;
          } else {
            refundOwed = costPerMember;
          }

          return {
            ...m,
            amountPaid: Math.max(0, Math.round((m.amountPaid - refundPaid) * 100) / 100),
            amountOwed: Math.max(0, Math.round((m.amountOwed - refundOwed) * 100) / 100)
          };
        });

        return {
          ...t,
          spent: Math.max(0, Math.round((t.spent - expObj.amount) * 100) / 100),
          members: restoredMembers
        };
      }
      return t;
    });

    setTrips(updatedTrips);
  };

  const handleScanDone = (scannedData: { name: string; amount: number; category: string; caption: string }) => {
    setPrefilledScan(scannedData);
    setShowScanner(false);
    setShowAddExpense(true);
  };

  // Settle simplified debt UPI callback
  const handleSettleDebtDone = (fromId: string, toId: string, amount: number) => {
    const updatedTrips = trips.map(t => {
      if (t.id === activeTripId) {
        const updatedMembers = t.members.map(m => {
          // Debtor spent more to balance out
          if (m.id === fromId) {
            return {
              ...m,
              amountPaid: Math.round((m.amountPaid + amount) * 100) / 100
            };
          }
          // Creditor paid total shifts down by the repayment
          if (m.id === toId) {
            return {
              ...m,
              amountPaid: Math.round((m.amountPaid - amount) * 100) / 100
            };
          }
          return m;
        });
        return {
          ...t,
          members: updatedMembers
        };
      }
      return t;
    });

    setTrips(updatedTrips);

    // Track activity
    const debtorName = trips.find(t => t.id === activeTripId)?.members.find(m => m.id === fromId)?.name || 'Someone';
    const creditorName = trips.find(t => t.id === activeTripId)?.members.find(m => m.id === toId)?.name || 'Someone';
    const newActivity: ActivityLog = {
      id: `act_settle_${Date.now()}`,
      tripId: activeTripId,
      type: 'Settlement Completed',
      text: `${debtorName.split(' ')[0]} settled with ${creditorName.split(' ')[0]} via UPI • ₹${amount.toLocaleString()}`,
      timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setActivities([newActivity, ...activities]);
  };

  const handleAddMemory = (photoUrl: string, caption: string, location: string) => {
    const newMemoryObj: Memory = {
      id: `mem_user_${Date.now()}`,
      tripId: activeTripId,
      photoUrl,
      caption,
      location,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      likes: 0
    };
    setMemories([newMemoryObj, ...memories]);
    
    const newActivity: ActivityLog = {
      id: `act_mem_${Date.now()}`,
      tripId: activeTripId,
      type: 'Expense Added',
      text: `Added polaroid snapshot memory: "${caption}" at ${location}`,
      timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setActivities([newActivity, ...activities]);

    setShowBigConfetti(true);
    setTimeout(() => setShowBigConfetti(false), 3000);
  };

  const handleUpdateProfile = (name: string, avatar: string) => {
    setUserName(name);
    setUserAvatar(avatar);
    localStorage.setItem('minto_v2_userName', name);
    localStorage.setItem('minto_v2_userAvatar', avatar);

    // Dynamic propagation to all trips
    const updatedTrips = trips.map(t => {
      const updatedMembers = t.members.map(m => {
        if (m.id === 'm1') {
          return {
            ...m,
            name: `${name} (You)`,
            avatar: avatar
          };
        }
        return m;
      });
      return {
        ...t,
        members: updatedMembers
      };
    });
    setTrips(updatedTrips);
  };

  const handleResetSeeds = () => {
    localStorage.removeItem('minto_v2_trips');
    localStorage.removeItem('minto_v2_expenses');
    localStorage.removeItem('minto_v2_memories');
    localStorage.removeItem('minto_v2_activities');
    localStorage.removeItem('minto_v2_onboarded');
    localStorage.removeItem('minto_v2_userName');
    localStorage.removeItem('minto_v2_userAvatar');
    
    setTrips(INITIAL_TRIPS);
    setExpenses(INITIAL_EXPENSES);
    setMemories(INITIAL_MEMORIES);
    setActivities(INITIAL_ACTIVITIES);
    setUserName('Arjun');
    setUserAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');
    setOnboarded(false);
    setActiveTab('Home');
    setActiveTripId('t1');
  };

  const handleCreateTrip = (newTrip: Trip) => {
    setTrips([newTrip, ...trips]);
    setActiveTripId(newTrip.id);
    setActiveTab('Trips');
    setShowCreateTrip(false);

    // Track activity log
    const newActivity: ActivityLog = {
      id: `act_create_${Date.now()}`,
      tripId: newTrip.id,
      type: 'Trip Created',
      text: `Arjun created the trip "${newTrip.name}"`,
      timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setActivities([newActivity, ...activities]);

    // Blast celebration confetti
    setShowBigConfetti(true);
    setTimeout(() => setShowBigConfetti(false), 3000);
  };

  const handleJoinTripWithCode = (code: string) => {
    const trimmed = code.trim().toLowerCase();
    
    // Check if they want to join t2 or t3 or create a mock trip
    let matchedTrip = trips.find(t => t.id === trimmed || t.name.toLowerCase().includes(trimmed));
    
    if (matchedTrip) {
      // Add Arjun if not exists
      const hasArjun = matchedTrip.members.some(m => m.id === 'm1');
      if (!hasArjun) {
        matchedTrip.members.push({
          id: 'm1',
          name: 'Arjun (You)',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          upiId: 'arjun@upi',
          amountPaid: 0,
          amountOwed: 0,
          role: 'Member'
        });
      }
      setActiveTripId(matchedTrip.id);
      setActiveTab('Trips');
      setShowJoinTrip(false);
      setJoinCode('');
      setJoinSuccessMsg('');
      
      const newActivity: ActivityLog = {
        id: `act_join_${Date.now()}`,
        tripId: matchedTrip.id,
        type: 'Member Joined',
        text: `Arjun joined the trip "${matchedTrip.name}" via invite code`,
        timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setActivities([newActivity, ...activities]);
      
      setShowBigConfetti(true);
      setTimeout(() => setShowBigConfetti(false), 3000);
    } else {
      // Create a gorgeous mock trip that satisfies the request instantly
      const newTripId = `trip_join_${Date.now()}`;
      const mockTrip: Trip = {
        id: newTripId,
        name: `${code.toUpperCase()} Getaway`,
        destination: 'Nusa Penida, Bali',
        dates: 'Nov 12 - Nov 16, 2026',
        budget: 50000,
        spent: 0,
        coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        members: [
          {
            id: 'm1',
            name: 'Arjun (You)',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            upiId: 'arjun@upi',
            amountPaid: 0,
            amountOwed: 0,
            role: 'Owner'
          },
          { id: 'm_j1', name: 'Ananya', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', role: 'Member', amountPaid: 0, amountOwed: 0, upiId: 'ananya@paytm' },
          { id: 'm_j2', name: 'Dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', role: 'Member', amountPaid: 0, amountOwed: 0, upiId: 'dev@okaxis' }
        ]
      };
      
      setTrips([mockTrip, ...trips]);
      setActiveTripId(mockTrip.id);
      setActiveTab('Trips');
      setShowJoinTrip(false);
      setJoinCode('');
      setJoinSuccessMsg('');
 
      const newActivity: ActivityLog = {
        id: `act_join_${Date.now()}`,
        tripId: mockTrip.id,
        type: 'Member Joined',
        text: `Arjun entered code "${code}" and joined ${mockTrip.name}!`,
        timestamp: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setActivities([newActivity, ...activities]);

      setShowBigConfetti(true);
      setTimeout(() => setShowBigConfetti(false), 3000);
    }
  };

  // Helper variables for Home View dashboards
  const activeTripObj = trips.find(t => t.id === activeTripId) || trips[0];
  const activeTripExpenses = expenses.filter(e => e.tripId === activeTripId);
  const activeTripMemories = memories.filter(e => e.tripId === activeTripId);
  const totalSpent = activeTripExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Bottom tabs definition
  const bottomTabs = [
    { name: 'Home' as TabName, icon: House },
    { name: 'Trips' as TabName, icon: Compass },
    { name: 'Activity' as TabName, icon: Receipt },
    { name: 'Memories' as TabName, icon: Sparkles },
    { name: 'Profile' as TabName, icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#111111] flex items-center justify-center sm:py-6 sm:px-4 relative overflow-hidden font-sans">
      
      {/* Background design elements to give terminal a highly elegant portfolio aesthetic */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#E85D3A]/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F4D06F]/10 rounded-full blur-3xl -z-10 pb-10"></div>

      {/* Floating Sparkly Micro-confetti celebration */}
      <AnimatePresence>
        {showBigConfetti && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex flex-col justify-center items-center"
          >
            <div className="absolute inset-x-0 bottom-1/3 flex justify-center gap-1">
              {[...Array(60)].map((_, i) => {
                const colors = ['#E85D3A', '#F4D06F', '#4CD37D', '#4361EE', '#FF6B6B'];
                const randColor = colors[Math.floor(Math.random() * colors.length)];
                return (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full shadow-xs absolute self-center"
                    style={{ backgroundColor: randColor }}
                    animate={{
                      y: [0, -250 - Math.random() * 150, 100],
                      x: [0, -180 + Math.random() * 360],
                      scale: [1, 1.2, 0.4],
                      rotate: [0, 360 * Math.random()]
                    }}
                    transition={{
                      duration: 2.2 + Math.random() * 0.8,
                      ease: 'easeOut'
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE HANDSET CONTAINER - FULL SCREEN ON MOBILE, SEAMLESS CONTAINER */}
      <div 
        className="w-full h-screen sm:h-[840px] sm:max-w-[420px] bg-white sm:rounded-[40px] sm:shadow-[0_24px_64px_rgba(30,30,20,0.08)] flex flex-col relative overflow-hidden transition-all duration-300 shrink-0"
      >
        {/* Dynamic header row with indicator */}
        {onboarded && (
          <div className="flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur-md px-5 py-3.5 shrink-0 select-none text-left">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E85D3A] animate-pulse"></span>
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#111111] uppercase font-mono">Minto Ledger</span>
                <span className="text-[9px] text-[#6B7280] font-bold block mt-0.5">Status: Operational</span>
              </div>
            </div>
          </div>
        )}

        {/* Outer App Frame scroll window */}
        <div className="flex-1 overflow-y-auto bg-[#F8F8F6] pt-6 pb-20 px-5 box-border">
          <AnimatePresence mode="wait">
            {!onboarded ? (
              <motion.div 
                key="onboarding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-[#F8F8F6]"
              >
                <Onboarding onComplete={handleOnboardingComplete} />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                {/* A. HOME OVERVIEW TAB */}
                {activeTab === 'Home' && (
                  <div className="space-y-6">
                    {/* Greeting Header */}
                    <div className="flex items-center justify-between text-left pt-2">
                       <div>
                        <h2 className="text-2xl font-black text-[#111111] tracking-tight">Hi {userName} 👋</h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Make memories, not money disputes.</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-orange-100 text-[#E85D3A] flex items-center justify-center font-bold relative cursor-pointer overflow-hidden border border-orange-200" onClick={() => setActiveTab('Profile')}>
                        {userAvatar ? (
                          <img src={userAvatar} className="w-full h-full object-cover" alt="User avatar" />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                    </div>

                    {/* Airbnb-style Active Trip Hero Card (240px - 280px height constraint) */}
                    {activeTripObj && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setActiveTab('Trips')}
                        className="relative h-[256px] rounded-[28px] overflow-hidden shadow-[0_12px_32px_rgba(30,30,20,0.15)] p-4.5 text-white text-left group cursor-pointer transition hover:shadow-[0_16px_36px_rgba(30,30,20,0.2)] border border-gray-150/10 isolate"
                      >
                        {/* Background Cover Photo - using isolation & absolute layers to guarantee visibility */}
                        <img 
                          src={activeTripObj.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'} 
                          alt={activeTripObj.name} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 z-0"
                          referrerPolicy="no-referrer"
                        />
                        {/* Dark Gradient Overlay to ensure robust contrast for white text / transparent buttons */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25 z-10" />

                        {/* Relative stacking content layer */}
                        <div className="relative z-20 h-full flex flex-col justify-between">
                          {/* Top Section */}
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/95 text-white px-2.5 py-1 rounded-full font-mono shadow-xs backdrop-blur-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                              Active Trip
                            </span>
                            
                            {/* Member Avatars */}
                            <div className="flex -space-x-2">
                              {activeTripObj.members.slice(0, 4).map((m) => (
                                <img 
                                  key={m.id} 
                                  src={m.avatar} 
                                  title={m.name}
                                  className="w-6.5 h-6.5 rounded-full border-2 border-slate-900 object-cover shadow-sm" 
                                  alt={m.name} 
                                />
                              ))}
                              {activeTripObj.members.length > 4 && (
                                <div className="w-6.5 h-6.5 rounded-full bg-slate-900 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black shadow-sm text-gray-200">
                                  +{activeTripObj.members.length - 4}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Middle Section: Trip Meta & Budget Progress */}
                          <div className="space-y-2 mt-auto">
                            <div>
                              <h3 className="text-base font-black tracking-tight leading-tight flex items-center gap-1.5 text-white">
                                <span>{activeTripObj.name}</span>
                                <ArrowRight size={14} className="text-[#E85D3A] shrink-0 group-hover:translate-x-1 transition-transform" />
                              </h3>
                              <p className="text-[10px] text-white/75 font-semibold tracking-wide">
                                {activeTripObj.destination} • {activeTripObj.dates}
                              </p>
                            </div>

                            {/* Budget progress tracker bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-mono font-medium">
                                <span className="text-white/80">Spent: <strong className="text-white font-black">₹{totalSpent.toLocaleString()}</strong></span>
                                <span className="text-white/80">Left: <strong className="text-emerald-400 font-black">₹{Math.max(0, activeTripObj.budget - totalSpent).toLocaleString()}</strong></span>
                              </div>
                              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#E85D3A] to-amber-400 rounded-full transition-all duration-500" 
                                  style={{ width: `${Math.min(100, Math.round((totalSpent / activeTripObj.budget) * 100))}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Bottom Quick Actions section with high-contrast, premium, legible buttons */}
                          <div className="flex items-center gap-2 pt-2.5 border-t border-white/15 mt-2 shrink-0">
                            <button
                              id="hero-add-expense-btn"
                              onClick={(e) => {
                                e.stopPropagation(); // prevent card tap action
                                setShowAddExpense(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#E85D3A] hover:bg-[#d15030] text-white rounded-xl text-[10px] font-black tracking-wide uppercase transition active:scale-95 shadow-md cursor-pointer"
                            >
                              <Plus size={12} strokeWidth={3} />
                              Add Expense
                            </button>
                            
                            <button
                              id="hero-settle-up-btn"
                              onClick={(e) => {
                                e.stopPropagation(); // prevent card tap action
                                setShowSettleUp(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white/20 hover:bg-white/30 text-white border border-white/20 rounded-xl text-[10px] font-black tracking-wide uppercase transition active:scale-95 shadow-md backdrop-blur-md cursor-pointer"
                            >
                              <Check size={12} strokeWidth={3} />
                              Settle Up
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Primary CTA Buttons (Create / Join Trip) */}
                    <div className="space-y-2 text-left">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Main Operations</span>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Create Trip CTA */}
                        <motion.button
                          id="home-action-create-trip"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowCreateTrip(true)}
                          className="bg-[#E85D3A] hover:bg-[#d15030] text-white p-4 rounded-[24px] shadow-sm flex flex-col justify-between items-start h-28 text-left transition cursor-pointer relative overflow-hidden group border border-orange-450"
                        >
                          <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center font-black">
                            <Plus size={16} />
                          </div>
                          <div>
                            <span className="text-xs font-black block leading-none">Create Trip</span>
                            <span className="text-[9px] text-orange-100/80 font-medium">Start new ledger</span>
                          </div>
                        </motion.button>

                        {/* Join Trip CTA */}
                        <motion.button
                          id="home-action-join-trip"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowJoinTrip(true)}
                          className="bg-[#111111] hover:bg-[#1f1f1f] text-white p-4 rounded-[24px] shadow-sm flex flex-col justify-between items-start h-28 text-left transition cursor-pointer border border-gray-800"
                        >
                          <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center">
                            <LinkIcon size={14} />
                          </div>
                          <div>
                            <span className="text-xs font-black block leading-none">Join Trip</span>
                            <span className="text-[9px] text-gray-400 font-medium font-sans">Paste code or QR</span>
                          </div>
                        </motion.button>
                      </div>
                    </div>

                    {/* Recent Trips Section */}
                    <div className="space-y-2.5 text-left">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">All Group Trips ({trips.length})</span>
                      <div className="space-y-2">
                        {trips.map((t) => {
                          const isActive = t.id === activeTripId;
                          const tExpenses = expenses.filter(e => e.tripId === t.id);
                          const tSpent = tExpenses.reduce((sum, e) => sum + e.amount, 0);
                          
                          return (
                            <div 
                              id={`select-trip-row-${t.id}`}
                              key={t.id}
                              onClick={() => {
                                setActiveTripId(t.id);
                                setActiveTab('Trips');
                              }}
                              className={`p-3.5 rounded-2xl border transition text-left flex items-center justify-between cursor-pointer ${
                                isActive 
                                  ? 'border-[#E85D3A] bg-white ring-2 ring-[#E85D3A]/5' 
                                  : 'border-gray-100 bg-white hover:border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-orange-50 text-[#E85D3A] flex items-center justify-center font-bold">
                                  {t.name[0] || 'T'}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-black text-[#111111] truncate">{t.name}</h4>
                                  <span className="text-[9px] text-gray-400 font-medium block truncate">
                                    {t.destination} • {t.members.length} members
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-mono font-black text-[#111111]">₹{tSpent.toLocaleString()}</div>
                                <span className="text-[8px] font-mono text-gray-400 uppercase block">spent</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Access Action Bar */}
                    <div className="bg-white border border-gray-100/60 p-3 rounded-2xl flex items-center justify-between text-left shadow-3xs">
                      <div className="flex items-center gap-2">
                        <Coins size={14} className="text-[#E85D3A]" />
                        <span className="text-[10px] font-bold text-gray-500">Need to settle split balances?</span>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveTab('Trips');
                        }}
                        className="text-[9px] font-black bg-orange-50 text-[#E85D3A] px-2.5 py-1 rounded-lg hover:bg-orange-100"
                      >
                        Settle Up Account
                      </button>
                    </div>
                  </div>
                )}

                {/* B. ACTIVE WORKSPACE / TRIPS TABS */}
                {activeTab === 'Trips' && (
                  <Workspace 
                    trip={activeTripObj} 
                    expenses={activeTripExpenses}
                    members={activeTripObj.members}
                    activities={activities.filter(a => a.tripId === activeTripId)}
                    onOpenAddExpense={() => setShowAddExpense(true)}
                    onOpenScanner={() => setShowScanner(true)}
                    onOpenSettleUp={() => setShowSettleUp(true)}
                    onDeleteExpense={handleDeleteExpense}
                  />
                )}

                {/* C. ACTIVITY TAB (Recent Expenses & Settlements + Timeline events) */}
                {activeTab === 'Activity' && (
                  <div className="space-y-5">
                    <div className="text-left">
                      <h2 className="text-2xl font-black text-[#111111] tracking-tight">Recent Activity</h2>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Expenses &amp; Settlements</span>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl p-4.5 space-y-4 shadow-3xs text-left">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono block">Timeline of occurrences</span>
                      
                      <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                        {activities.map((act) => {
                          const isExpense = act.text.includes('added') || act.type === 'Expense Added';
                          const isRepay = act.text.includes('settled') || act.type === 'Settlement Completed';
                          
                          return (
                            <div key={act.id} className="flex gap-3 items-start relative pl-1">
                              <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0 border border-white shadow-2xs ${
                                isExpense ? 'bg-orange-50 text-[#E85D3A]' : 
                                isRepay ? 'bg-emerald-50 text-emerald-600' : 
                                'bg-gray-50 text-gray-400'
                              }`}>
                                {isExpense ? <ArrowUpRight size={13} /> : 
                                 isRepay ? <CheckCircle2 size={13} /> : 
                                 <Sparkles size={11} />}
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <p className="text-xs font-semibold text-gray-700 leading-relaxed font-sans">
                                  {act.text}
                                </p>
                                <span className="text-[9px] font-mono text-gray-400 block mt-0.5">{act.timestamp}</span>
                              </div>
                            </div>
                          );
                        })}

                        {activities.length === 0 && (
                          <div className="py-6 text-center text-xs text-gray-400 italic">No events recorded in system log yet.</div>
                        )}
                      </div>
                    </div>

                    {/* Quick Expenses Stream list */}
                    <div className="space-y-2.5 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Trip Balance Ledger Summary</span>
                        <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{activeTripExpenses.length} entries</span>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-3xl p-4.5 space-y-3.5 shadow-3xs">
                        {activeTripExpenses.slice(0, 5).map((exp) => (
                          <div key={exp.id} className="flex items-center justify-between pb-3 border-b border-gray-100/60 last:border-0 last:pb-0">
                            <div>
                              <h4 className="text-xs font-bold text-[#111111]">{exp.name}</h4>
                              <span className="text-[9px] font-mono text-gray-400">Paid by {activeTripObj.members.find(m => m.id === exp.paidById)?.name.split(' ')[0]} • {exp.splitType} split</span>
                            </div>
                            <span className="text-xs font-mono font-black text-[#111111]">₹{exp.amount.toLocaleString()}</span>
                          </div>
                        ))}

                        {activeTripExpenses.length === 0 && (
                          <div className="py-6 text-center text-xs text-gray-400 italic">No expenses have been split yet. Click Trips tab to edit.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* D. MEMORIES OS JOURNAL TAB VIEW */}
                {activeTab === 'Memories' && (
                  <MemoryTimeline 
                    trip={activeTripObj}
                    memories={activeTripMemories}
                    onAddMemory={handleAddMemory}
                  />
                )}

                {/* E. USER SETTINGS / PROFILE TABS */}
                {activeTab === 'Profile' && (
                  <div className="space-y-4">
                    <div className="text-left">
                      <h2 className="text-2xl font-black text-[#111111] tracking-tight">Minto Settings</h2>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Manage accounts and sandbox</span>
                    </div>

                    <Profile 
                      currentUseCase={useCase}
                      upiHandle={upiHandle}
                      onUpdateUPI={setUpiHandle}
                      trips={trips}
                      activeTripId={activeTripId}
                      onSwitchTrip={setActiveTripId}
                      onLogout={handleResetSeeds}
                      userName={userName}
                      userAvatar={userAvatar}
                      onUpdateProfile={handleUpdateProfile}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic bottom floating Apple-Wallet-styled touch navigation tab bar */}
        {onboarded && (
          <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-150/40 px-8 py-3 pb-4 z-40 flex items-center justify-between">
            {bottomTabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  id={`bottom-nav-${tab.name.toLowerCase()}-btn`}
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name);
                    // Reset scanner and overlays
                    setShowScanner(false);
                    setShowAddExpense(false);
                    setShowSettleUp(false);
                  }}
                  className={`flex items-center justify-center p-2 rounded-xl transition-all ${
                    isActive ? 'text-[#E85D3A] bg-orange-50/70 scale-105' : 'text-gray-400 hover:text-gray-650 hover:bg-gray-50/50'
                  }`}
                  title={tab.name}
                >
                  <TabIcon size={22} className={isActive ? 'transition' : ''} />
                </button>
              );
            })}
          </div>
        )}

        {/* DIALOGS VIEWPORT CONTAINER */}
        <AnimatePresence>
          {showScanner && (
            <ReceiptScanner 
              onClose={() => setShowScanner(false)} 
              onScanComplete={handleScanDone}
              members={activeTripObj.members}
            />
          )}

          {showCreateTrip && (
            <CreateTrip 
              onClose={() => setShowCreateTrip(false)}
              onCreate={handleCreateTrip}
            />
          )}

          {showJoinTrip && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#111111]/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                className="bg-white rounded-t-[32px] sm:rounded-[36px] p-6 w-full max-w-[400px] border border-gray-150 shadow-2xl relative text-left"
              >
                <h3 className="text-lg font-black text-[#111111] mb-1 font-sans">Join Group Trip</h3>
                <p className="text-xs text-gray-500 font-medium mb-5">Paste the group invite code, WhatsApp link, or join a trip preset.</p>
                
                <div className="space-y-4">
                  {/* Join code entry */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Invite Code</label>
                    <input 
                      id="join-trip-code-input"
                      type="text"
                      placeholder="e.g., HILLS22, GOA, SUNDER"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-150 focus:border-[#E85D3A] focus:outline-none px-4 py-3.5 rounded-2xl text-xs font-mono font-bold tracking-wider text-[#111111] uppercase transition"
                    />
                  </div>

                  {/* Preset invites suggestion for quick testing */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase block">Pending invitations (Touch to join)</span>
                    
                    {trips.filter(t => t.id !== activeTripId).map(t => (
                      <div 
                        key={t.id}
                        onClick={() => setJoinCode(t.id)}
                        className="p-3 bg-orange-50/5 hover:bg-orange-50/20 border border-gray-100 rounded-2xl flex items-center justify-between cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2">
                          <Compass size={14} className="text-[#E85D3A]" />
                          <span className="text-xs font-bold text-gray-700">{t.name}</span>
                        </div>
                        <span className="text-[9px] text-[#E85D3A] font-bold">Code: {t.id}</span>
                      </div>
                    ))}
                    
                    {trips.filter(t => t.id !== activeTripId).length === 0 && (
                      <div className="text-[10px] text-gray-400 italic">No other trips discovered on network.</div>
                    )}
                  </div>
                  
                  <div className="flex gap-2.5 pt-2">
                    <button
                      id="cancel-join-trip-btn"
                      type="button"
                      onClick={() => {
                        setShowJoinTrip(false);
                        setJoinCode('');
                      }}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-100 py-3 rounded-2xl text-xs font-bold text-gray-500 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      id="submit-join-trip-btn"
                      type="button"
                      disabled={!joinCode.trim()}
                      onClick={() => handleJoinTripWithCode(joinCode)}
                      className="flex-1 bg-[#111111] hover:bg-black text-white py-3 rounded-2xl text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                    >
                      Join Trip Group
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showAddExpense && (
            <AddExpense 
              onClose={() => {
                setShowAddExpense(false);
                setPrefilledScan(null);
              }}
              onAdd={handleAddExpenseSubmit}
              members={activeTripObj.members}
              prefilled={prefilledScan}
            />
          )}

          {showSettleUp && (
            <SettleUp 
              onClose={() => setShowSettleUp(false)}
              debts={calculateSimplifiedSettlements(activeTripExpenses, activeTripObj.members)}
              members={activeTripObj.members}
              onSettle={handleSettleDebtDone}
            />
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
