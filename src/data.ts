import { Trip, Member, Expense, Memory, Settlement, ActivityLog } from './types';

export const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'Arjun (You)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', upiId: 'arjun@upi', amountPaid: 12500, amountOwed: 8400, role: 'Owner' },
  { id: 'm2', name: 'Ananya', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', upiId: 'ananya@okhdfcbank', amountPaid: 15400, amountOwed: 8400, role: 'Admin' },
  { id: 'm3', name: 'Dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', upiId: 'dev@okaxis', amountPaid: 4500, amountOwed: 8400, role: 'Member' },
  { id: 'm4', name: 'Rahul', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80', upiId: 'rahul@paytm', amountPaid: 0, amountOwed: 8400, role: 'Member' },
  { id: 'm5', name: 'Meera', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', upiId: 'meera@ybl', amountPaid: 12100, amountOwed: 10900, role: 'Member' }
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 't1',
    name: 'Bali Beaches & Temples',
    destination: 'Bali, Indonesia',
    dates: 'Oct 12 - Oct 18, 2026',
    budget: 60000,
    spent: 44500,
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    members: INITIAL_MEMBERS
  },
  {
    id: 't2',
    name: 'Kyoto Temples & Gardens',
    destination: 'Kyoto, Japan',
    dates: 'Dec 05 - Dec 14, 2026',
    budget: 80000,
    spent: 0,
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    members: [
      { id: 'm1', name: 'Arjun (You)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', upiId: 'arjun@upi', amountPaid: 0, amountOwed: 0, role: 'Owner' },
      { id: 'm2', name: 'Ananya', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', upiId: 'ananya@okhdfcbank', amountPaid: 0, amountOwed: 0, role: 'Admin' },
      { id: 'm3', name: 'Dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', upiId: 'dev@okaxis', amountPaid: 0, amountOwed: 0, role: 'Member' }
    ]
  },
  {
    id: 't3',
    name: 'Swiss Alps Ski Holiday',
    destination: 'Zermatt, Switzerland',
    dates: 'Jan 22 - Jan 25, 2027',
    budget: 35000,
    spent: 0,
    coverImage: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80',
    members: [
      { id: 'm1', name: 'Arjun (You)', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', upiId: 'arjun@upi', amountPaid: 0, amountOwed: 0, role: 'Owner' },
      { id: 'm2', name: 'Ananya', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', upiId: 'ananya@okhdfcbank', amountPaid: 0, amountOwed: 0, role: 'Member' }
    ]
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e1',
    tripId: 't1',
    name: 'Nusa Penida Beachside Lunch',
    amount: 6500,
    paidById: 'm1',
    splitType: 'Equal',
    date: '2026-10-12',
    category: 'Food',
    caption: 'Best local satay and fresh beach breezes!'
  },
  {
    id: 'e2',
    tripId: 't1',
    name: 'Scuba Diving at Tulamben Shipwreck',
    amount: 15400,
    paidById: 'm2',
    splitType: 'Equal',
    date: '2026-10-13',
    category: 'Activities',
    photoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    caption: 'Down 12 meters to see the USS Liberty shipwreck. Pure bliss.'
  },
  {
    id: 'e3',
    tripId: 't1',
    name: 'Ubud Scooter Rentals',
    amount: 4500,
    paidById: 'm3',
    splitType: 'Equal',
    date: '2026-10-14',
    category: 'Transport',
    caption: 'Chasing jungle winds under a heavy moonlit Ubud sky.'
  },
  {
    id: 'e4',
    tripId: 't1',
    name: 'Seminyak Luxury Pool Villa',
    amount: 12100,
    paidById: 'm5',
    splitType: 'Equal',
    date: '2026-10-15',
    category: 'Lodging',
    photoUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80',
    caption: 'Waking up to visual luxury. Mornings in Seminyak.'
  },
  {
    id: 'e5',
    tripId: 't1',
    name: 'Potato Head Sunset Cocktails',
    amount: 6000,
    paidById: 'm1',
    splitType: 'Equal',
    date: '2026-10-16',
    category: 'Drinks',
    caption: 'Deep house beats and golden hour tropical shades.'
  }
];

export const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'mem1',
    tripId: 't1',
    photoUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80',
    caption: 'First group surf! Arjun stood on the board for 5 whole seconds!',
    expenseName: 'Nusa Penida Beachside Lunch',
    amount: 6500,
    location: 'Seminyak Beach',
    date: 'Oct 13, 2026',
    likes: 12
  },
  {
    id: 'mem2',
    tripId: 't1',
    photoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    caption: 'Submerged deep with Ananya, Dev and the coral reefs of Tulamben Shipwreck.',
    expenseName: 'Scuba Diving at Tulamben Shipwreck',
    amount: 15400,
    location: 'Tulamben',
    date: 'Oct 14, 2026',
    likes: 24
  },
  {
    id: 'mem3',
    tripId: 't1',
    photoUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=600&q=80',
    caption: 'Our home away from home. Morning yoga sessions right beside the Seminyak private pool!',
    expenseName: 'Seminyak Luxury Pool Villa',
    amount: 12100,
    location: 'Seminyak Villa',
    date: 'Oct 16, 2026',
    likes: 18
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [
  { id: 'act1', tripId: 't1', type: 'Trip Created', text: 'Arjun created the workspace "Bali Beaches & Temples"', timestamp: 'Oct 12, 10:30 AM' },
  { id: 'act2', tripId: 't1', type: 'Member Joined', text: 'Ananya, Dev, Rahul and Meera joined the trip via Invite link', timestamp: 'Oct 12, 11:15 AM' },
  { id: 'act3', tripId: 't1', type: 'Expense Added', text: 'Arjun added "Nusa Penida Beachside Lunch" • ₹6,500', timestamp: 'Oct 12, 02:45 PM' },
  { id: 'act4', tripId: 't1', type: 'Expense Added', text: 'Ananya added "Scuba Diving at Tulamben Shipwreck" • ₹15,400', timestamp: 'Oct 13, 05:30 PM' },
  { id: 'act5', tripId: 't1', type: 'Expense Added', text: 'Dev added "Ubud Scooter Rentals" • ₹4,500', timestamp: 'Oct 14, 01:10 AM' }
];

export interface SimplifiedDebt {
  fromMemberId: string;
  fromName: string;
  fromAvatar: string;
  toMemberId: string;
  toName: string;
  toAvatar: string;
  toUpiId?: string;
  amount: number;
}

/**
 * Calculates simplified settlements using a greedy algorithm.
 * Groups net balances: positive balances are creditors, negative are debtors.
 * Successively match debtors with creditors to minimize the number of transaction edges.
 */
export function calculateSimplifiedSettlements(expenses: Expense[], members: Member[]): SimplifiedDebt[] {
  const memberBalances: Record<string, number> = {};
  
  // Set initial balances to 0
  members.forEach(m => {
    memberBalances[m.id] = 0;
  });

  // Calculate net balances based on expenses
  expenses.forEach(exp => {
    const paidBy = exp.paidById;
    const amount = exp.amount;
    
    // Payer is credited the full amount
    if (memberBalances[paidBy] !== undefined) {
      memberBalances[paidBy] += amount;
    }

    // Split logic
    if (exp.splitType === 'Equal') {
      const splitAmount = amount / members.length;
      members.forEach(m => {
        memberBalances[m.id] -= splitAmount;
      });
    } else if (exp.splitType === 'Custom' && exp.customSplits) {
      members.forEach(m => {
        const splitAmount = exp.customSplits?.[m.id] || 0;
        memberBalances[m.id] -= splitAmount;
      });
    } else if (exp.splitType === 'Percentage' && exp.customSplits) {
      members.forEach(m => {
        const pct = exp.customSplits?.[m.id] || 0;
        const splitAmount = (pct / 100) * amount;
        memberBalances[m.id] -= splitAmount;
      });
    } else {
      // Default to equal if not specified
      const splitAmount = amount / members.length;
      members.forEach(m => {
        memberBalances[m.id] -= splitAmount;
      });
    }
  });

  // Now, we have net balances. Let's filter out near zero balances and divide into Creditors and Debtors
  interface BalanceNode {
    id: string;
    name: string;
    avatar: string;
    upiId?: string;
    balance: number;
  }

  const creditors: BalanceNode[] = [];
  const debtors: BalanceNode[] = [];

  members.forEach(m => {
    // Round to 2 decimals to prevent floating point issues
    const bal = Math.round(memberBalances[m.id] * 100) / 100;
    if (bal > 0.5) {
      const memberInfo = members.find(mi => mi.id === m.id) || m;
      creditors.push({ id: m.id, name: memberInfo.name, avatar: memberInfo.avatar, upiId: memberInfo.upiId, balance: bal });
    } else if (bal < -0.5) {
      const memberInfo = members.find(mi => mi.id === m.id) || m;
      debtors.push({ id: m.id, name: memberInfo.name, avatar: memberInfo.avatar, upiId: memberInfo.upiId, balance: -bal });
    }
  });

  // Sort creditors descending, debtors descending
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  const debts: SimplifiedDebt[] = [];
  
  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const cred = creditors[cIdx];
    const debt = debtors[dIdx];

    const payAmount = Math.min(cred.balance, debt.balance);
    
    if (payAmount > 0.5) {
      debts.push({
        fromMemberId: debt.id,
        fromName: debt.name,
        fromAvatar: debt.avatar,
        toMemberId: cred.id,
        toName: cred.name,
        toAvatar: cred.avatar,
        toUpiId: cred.upiId || 'minto@paytm',
        amount: Math.round(payAmount)
      });
    }

    cred.balance -= payAmount;
    debt.balance -= payAmount;

    if (cred.balance < 0.5) {
      cIdx++;
    }
    if (debt.balance < 0.5) {
      dIdx++;
    }
  }

  return debts;
}

// Global Category Icons/Colors helper
export function getCategoryStyles(category: string) {
  const norm = category.toLowerCase();
  if (norm.includes('food') || norm.includes('dining') || norm.includes('drink')) {
    return { icon: 'Utensils', bg: 'bg-[#F6C453]/15', text: 'text-[#D99A1A]' };
  } else if (norm.includes('scuba') || norm.includes('activity') || norm.includes('sport') || norm.includes('fun')) {
    return { icon: 'Compass', bg: 'bg-[#FF8A65]/15', text: 'text-[#FF8A65]' };
  } else if (norm.includes('scoot') || norm.includes('transport') || norm.includes('cab')) {
    return { icon: 'Car', bg: 'bg-[#5B8DEF]/15', text: 'text-[#5B8DEF]' };
  } else if (norm.includes('villa') || norm.includes('lodging') || norm.includes('stay') || norm.includes('hotel')) {
    return { icon: 'Home', bg: 'bg-[#4DAA57]/15', text: 'text-[#4DAA57]' };
  } else if (norm.includes('shop') || norm.includes('gift')) {
    return { icon: 'ShoppingBag', bg: 'bg-[#B388FF]/15', text: 'text-[#B388FF]' };
  } else {
    return { icon: 'Coins', bg: 'bg-[#C7C7C7]/20', text: 'text-[#6B7280]' };
  }
}
