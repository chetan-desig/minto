import { motion } from 'motion/react';
import { Trip, Expense, Member } from '../types';
import { getCategoryStyles } from '../data';
import { Wallet, TrendingUp, Award, PieChart } from 'lucide-react';

interface AnalyticsProps {
  trip: Trip;
  expenses: Expense[];
  members: Member[];
}

export default function Analytics({ trip, expenses, members }: AnalyticsProps) {
  const totalBudget = trip.budget;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // 1. Category breakdown calculations
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const categories = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    percentage: totalSpent > 0 ? (value / totalSpent) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  // 2. Member contributions calculation
  const memberPaidTotals: Record<string, number> = {};
  members.forEach(m => {
    memberPaidTotals[m.id] = 0;
  });
  expenses.forEach(e => {
    if (memberPaidTotals[e.paidById] !== undefined) {
      memberPaidTotals[e.paidById] += e.amount;
    }
  });

  const contributions = members.map(m => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar,
    totalPaid: memberPaidTotals[m.id] || 0
  })).sort((a, b) => b.totalPaid - a.totalPaid);

  const topContributor = contributions[0];

  // 3. Simple Spending Trend over some simulated timeline dates
  // Group expenses by date (sorted)
  const dateTotals: Record<string, number> = {};
  expenses.forEach(e => {
    // take the day only e.g. Oct 12
    const d = new Date(e.date);
    const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) || e.date;
    dateTotals[dayStr] = (dateTotals[dayStr] || 0) + e.amount;
  });

  const trendData = Object.entries(dateTotals).map(([date, amount]) => ({
    date,
    amount
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Generate simple path coordinates for SVG Spending Graph
  // Assuming width=300, height=80
  const buildTrendPath = () => {
    if (trendData.length < 2) return '';
    const maxVal = Math.max(...trendData.map(d => d.amount), 5000);
    const stepX = 260 / (trendData.length - 1);
    
    let path = `M 20 ${80 - (trendData[0].amount / maxVal) * 60}`;
    for (let i = 1; i < trendData.length; i++) {
      const x = 20 + i * stepX;
      const y = 80 - (trendData[i].amount / maxVal) * 60;
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  const trendPath = buildTrendPath();

  // Highlight color codes for Donut Segments
  const colorPalette = ['#E85D3A', '#4CD37D', '#F4D06F', '#4361EE', '#FF6B6B', '#9B5DE5'];

  return (
    <div className="space-y-6 font-sans">
      {/* Mini Card Numeric Widgets */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Spend */}
        <div className="bg-white border border-gray-100 p-4 rounded-3xl shadow-xs">
          <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
            <TrendingUp size={12} className="text-[#E85D3A]" />
            <span>Total Spend</span>
          </div>
          <div className="mt-1 text-2xl font-black text-[#111111] font-mono">₹{totalSpent.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium">Over {expenses.length} split items</div>
        </div>

        {/* Budget Remaining */}
        <div className="bg-white border border-gray-100 p-4 rounded-3xl shadow-xs">
          <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
            <Wallet size={12} className="text-[#4CD37D]" />
            <span>Budget Saved</span>
          </div>
          <div className={`mt-1 text-2xl font-black font-mono ${remainingBudget < 5000 ? 'text-[#FF6B6B]' : 'text-emerald-500'}`}>
            ₹{remainingBudget.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium">
            {Math.round(budgetUtilization)}% of ₹{totalBudget.toLocaleString()} used
          </div>
        </div>
      </div>

      {/* Top Contributor Showcase */}
      {topContributor && topContributor.totalPaid > 0 && (
        <div className="bg-orange-50/20 border border-orange-100 p-4 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E85D3A] text-white flex items-center justify-center font-bold relative shrink-0">
              <Award size={18} />
              <span className="absolute -top-1 -right-1 bg-[#F4D06F] text-amber-950 text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">1</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-mono">TOP SPENDER</span>
              <span className="text-sm font-black text-[#111111]">{topContributor.name}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-mono">PAID TOTAL</span>
            <span className="text-sm font-black text-[#E85D3A] font-mono">₹{topContributor.totalPaid.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Donut Chart Block: Category Breakdown */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart size={16} className="text-[#E85D3A]" />
            <h4 className="text-xs font-black text-[#111111] uppercase tracking-widest">Share Breakdown</h4>
          </div>
          <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{categories.length} categories</span>
        </div>

        {totalSpent === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400 italic font-medium">
            No payments logged to visualize shares. Add first expense!
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 pt-1">
            {/* SVG Donut implementation */}
            <div className="relative w-28 h-28 transform -rotate-90">
              <svg width="112" height="112" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#F1F3F5" strokeWidth="4.5" />
                {(() => {
                  let accumPct = 0;
                  return categories.map((cat, idx) => {
                    const strokeDash = `${cat.percentage} ${100 - cat.percentage}`;
                    const strokeOffset = 100 - accumPct + 25; // 25 to start orienting upwards
                    accumPct += cat.percentage;
                    return (
                      <circle
                        key={cat.name}
                        cx="18"
                        cy="18"
                        r="14"
                        fill="transparent"
                        stroke={colorPalette[idx % colorPalette.length]}
                        strokeWidth="4.5"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap={cat.percentage > 4 ? 'round' : 'butt'}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-90">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono">Spent</span>
                <span className="text-xs font-black text-[#111111] font-mono">₹{Math.round(totalSpent/100)/10}k</span>
              </div>
            </div>

            {/* Labels right list */}
            <div className="flex-1 space-y-2 max-h-32 overflow-y-auto">
              {categories.map((cat, idx) => {
                const style = getCategoryStyles(cat.name);
                return (
                  <div key={cat.name} className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: colorPalette[idx % colorPalette.length] }} 
                      />
                      <span className="text-gray-700 font-bold truncate">{cat.name}</span>
                    </div>
                    <span className="text-[#111111] font-mono font-bold shrink-0">{Math.round(cat.percentage)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Spending Trend Line Chart (Curved Area Chart) */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-3">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Daily Spending Trajectory</span>
        {trendData.length < 2 ? (
          <div className="text-center py-4 text-xs text-secondary italic">Log expenses over multiple days to map trend lines</div>
        ) : (
          <div className="pt-2">
            <svg viewBox="0 0 300 100" className="w-full h-24 overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E85D3A" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#E85D3A" stopOpacity="0.00" />
                </linearGradient>
              </defs>
              
              {/* Grid line */}
              <line x1="20" y1="80" x2="280" y2="80" stroke="#F1F3F5" strokeWidth="1" />
              <line x1="20" y1="50" x2="280" y2="50" stroke="#F1F1F1" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="20" y1="20" x2="280" y2="20" stroke="#F1F1F1" strokeWidth="1" strokeDasharray="3,3" />

              {/* Shaded Area */}
              {trendPath && (
                <path 
                  d={`${trendPath} L ${20 + (trendData.length - 1) * (260 / (trendData.length - 1))} 80 L 20 80 Z`} 
                  fill="url(#trendGradient)" 
                />
              )}

              {/* Curve Line */}
              {trendPath && (
                <path 
                  d={trendPath} 
                  fill="none" 
                  stroke="#E85D3A" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Interactive Dot Anchors */}
              {trendData.map((d, i) => {
                const maxVal = Math.max(...trendData.map(dt => dt.amount), 5000);
                const stepX = 260 / (trendData.length - 1);
                const x = 20 + i * stepX;
                const y = 80 - (d.amount / maxVal) * 60;
                return (
                  <circle 
                    key={i} 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="#FFFFFF" 
                    stroke="#E85D3A" 
                    strokeWidth="2" 
                    className="cursor-pointer hover:r-6 transition"
                  />
                );
              })}
            </svg>
            
            {/* Legend dates display */}
            <div className="flex justify-between px-4 text-[9px] font-bold text-gray-400 font-mono pt-1">
              {trendData.map((d, i) => (
                <span key={i}>{d.date}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contribution Ranking */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-3">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Companion Paying leaderboard</span>
        <div className="space-y-3.5 pt-1">
          {contributions.map((cnt, idx) => {
            const maxPaid = Math.max(...contributions.map(c => c.totalPaid), 1);
            const ratio = (cnt.totalPaid / maxPaid) * 100;
            return (
              <div key={cnt.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={cnt.avatar} className="w-5 h-5 rounded-full" alt="leaderboard avatar" />
                    <span className="font-bold text-gray-700">{cnt.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[#111111]">₹{cnt.totalPaid.toLocaleString()}</span>
                </div>
                <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#E85D3A] rounded-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${ratio}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
