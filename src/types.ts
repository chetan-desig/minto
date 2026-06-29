export interface Member {
  id: string;
  name: string;
  avatar: string;
  upiId?: string;
  amountPaid: number;
  amountOwed: number;
  role: 'Owner' | 'Admin' | 'Member';
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  dates: string;
  budget: number;
  spent: number;
  coverImage: string;
  members: Member[];
}

export type SplitType = 'Equal' | 'Custom' | 'Percentage';

export interface Expense {
  id: string;
  tripId: string;
  name: string;
  amount: number;
  paidById: string;
  splitType: SplitType;
  customSplits?: Record<string, number>; // memberId -> amount or percent
  date: string;
  category: string;
  photoUrl?: string;
  caption?: string;
}

export interface Memory {
  id: string;
  tripId: string;
  photoUrl: string;
  caption: string;
  expenseName?: string;
  amount?: number;
  location: string;
  date: string;
  likes: number;
}

export interface Settlement {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  status: 'Pending' | 'Completed';
  date: string;
}

export interface ActivityLog {
  id: string;
  tripId?: string;
  type: 'Expense Added' | 'Settlement Completed' | 'Trip Created' | 'Member Joined';
  text: string;
  timestamp: string;
}

export type UseCase = 'Trips' | 'Roommates' | 'Couples' | 'Friends';
export type UPIProvider = 'PhonePe' | 'Google Pay' | 'Paytm' | 'BHIM';
export type TabName = 'Home' | 'Trips' | 'Activity' | 'Memories' | 'Profile';
export type WorkspaceTab = 'Expenses' | 'Settle Up' | 'Members' | 'Activity';
