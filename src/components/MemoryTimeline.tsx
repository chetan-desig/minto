import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Heart, Share2, MapPin, Calendar, Sparkles, 
  MessageCircle, Image, ArrowRight, Instagram 
} from 'lucide-react';
import { Trip, Memory } from '../types';

interface MemoryTimelineProps {
  trip: Trip;
  memories: Memory[];
  onAddMemory: (photoUrl: string, caption: string, location: string) => void;
}

export default function MemoryTimeline({ trip, memories, onAddMemory }: MemoryTimelineProps) {
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [showRecap, setShowRecap] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newLocation, setNewLocation] = useState('Seminyak, Bali');
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [likesState, setLikesState] = useState<Record<string, { count: number; liked: boolean }>>({});
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [sharePlatform, setSharePlatform] = useState('');

  const preloadedPhotos = [
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80', // Beach bonfire sunset
    'https://images.unsplash.com/photo-1473116763269-255448993767?auto=format&fit=crop&w=600&q=80', // Palm trees coastline
    'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&w=600&q=80', // Tropical shores waves
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'  // Coral diving dive
  ];

  const handleCardFlip = (id: string, e: React.MouseEvent) => {
    // Avoid flipping when clicking the heart button or likes text
    const target = e.target as HTMLElement;
    if (target.closest('.no-flip')) return;
    
    setFlippedCardId(flippedCardId === id ? null : id);
  };

  const handleLike = (id: string, currentLikes: number) => {
    const isLiked = likesState[id]?.liked;
    setLikesState(prev => ({
      ...prev,
      [id]: {
        count: isLiked ? (prev[id]?.count ?? currentLikes) - 1 : (prev[id]?.count ?? currentLikes) + 1,
        liked: !isLiked
      }
    }));
  };

  const handleShareClick = (platform: string) => {
    setSharePlatform(platform);
    setShowShareSuccess(true);
    setTimeout(() => {
      setShowShareSuccess(false);
    }, 2500);
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim()) return;
    onAddMemory(
      preloadedPhotos[selectedPhotoIdx % preloadedPhotos.length],
      newCaption,
      newLocation || 'Bali Beachfront'
    );
    setNewCaption('');
  };

  // Trip stats for Recap card
  const daysTravelled = '6 Days';
  const totalSpend = trip.spent || 44500;
  const topContributor = 'Ananya (₹15,400 paid)';
  const membersCount = trip.members.length;

  return (
    <div className="space-y-6 font-sans">
      {/* Memories Actions and Trip Recap card Launcher */}
      <div className="flex gap-2">
        <button
          id="generate-recap-btn"
          onClick={() => setShowRecap(true)}
          className="flex-1 bg-gradient-to-r from-[#E85D3A] to-[#F4D06F] text-white py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Sparkles size={14} />
          <span>Generate Trip Recap</span>
        </button>
      </div>

      {/* Memory Creation Form Container */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-[#E85D3A]" />
          <h4 className="text-xs font-black text-[#111111] uppercase tracking-widest">Capture a Moment</h4>
        </div>

        <form onSubmit={handleCreateMemory} className="space-y-3">
          <textarea 
            id="new-memory-caption"
            value={newCaption}
            onChange={(e) => setNewCaption(e.target.value)}
            placeholder="What made this moment magical? (e.g. Aman danced on beach table!)"
            className="w-full text-xs font-medium text-gray-700 bg-[#F8F8F6] border border-gray-100 focus:border-[#E85D3A] focus:bg-white focus:outline-none p-3.5 rounded-2xl resize-none h-16 transition"
            rows={2}
          />

          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
              <MapPin size={12} className="text-gray-400" />
              <input 
                id="new-memory-location"
                type="text" 
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Where?" 
                className="bg-transparent text-[10px] font-bold text-gray-700 w-24 focus:outline-none"
              />
            </div>

            {/* Photo selector thumbnails */}
            <div className="flex gap-1">
              {preloadedPhotos.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhotoIdx(idx)}
                  className={`w-7 h-7 rounded-lg overflow-hidden border transition ${
                    selectedPhotoIdx === idx ? 'border-[#E85D3A] ring-2 ring-orange-100' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={url} className="w-full h-full object-cover" alt="recap select" />
                </button>
              ))}
            </div>
          </div>

          <button
            id="save-moment-btn"
            type="submit"
            disabled={!newCaption.trim()}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              newCaption.trim() 
                ? 'bg-[#111111] hover:bg-black text-white shadow-xs cursor-pointer' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Log Moment with Splits</span>
            <ArrowRight size={12} />
          </button>
        </form>
      </div>

      {/* Memory Timeline List */}
      <div className="space-y-6">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-mono">Trip Photobook &amp; Logs</span>
        
        {memories.length === 0 ? (
          <div className="text-center py-10 bg-white border border-gray-100 rounded-[32px] p-6 space-y-3">
            <div className="w-16 h-16 bg-orange-50 text-[#E85D3A] rounded-full flex items-center justify-center mx-auto">
              <Image size={28} />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#111111]">No memories captured yet</h4>
              <p className="text-xs text-secondary max-w-xs mx-auto">
                Capture scenic landscape snapshots or write silly caps. Minto binds bills directly to real moments.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {memories.map((mem) => {
              const isFlipped = flippedCardId === mem.id;
              const likeInfo = likesState[mem.id] || { count: mem.likes, liked: false };
              return (
                <div 
                  key={mem.id} 
                  className="perspective-1000 cursor-pointer"
                  onClick={(e) => handleCardFlip(mem.id, e)}
                >
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="transform-style-3d relative w-full aspect-[4/5] sm:aspect-[3/4] bg-white rounded-[24px] shadow-sm border border-gray-100 p-4 pb-6 flex flex-col justify-between"
                  >
                    {/* FRONT SIDE */}
                    <div className={`backface-hidden w-full h-full flex flex-col justify-between ${isFlipped ? 'pointer-events-none' : ''}`}>
                      {/* Polaroid Photo Frame */}
                      <div className="w-full aspect-square rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-150">
                        <img 
                          src={mem.photoUrl} 
                          className="w-full h-full object-cover select-none" 
                          alt="timeline moment" 
                        />
                        <div className="absolute top-3.5 left-3.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[9px] font-mono font-bold flex items-center gap-1">
                          <MapPin size={10} className="text-[#F4D06F]" />
                          <span>{mem.location}</span>
                        </div>
                      </div>

                      {/* Polaroid Caption and interactive block */}
                      <div className="pt-4 px-1 space-y-2.5">
                        <p className="text-sm font-bold text-[#111111] leading-relaxed italic tracking-tight font-sans">
                          &ldquo;{mem.caption}&rdquo;
                        </p>

                        <div className="flex items-center justify-between border-t border-gray-50 pt-3 no-flip">
                          <div className="flex items-center gap-3">
                            <button
                              id={`like-mem-${mem.id}-btn`}
                              onClick={() => handleLike(mem.id, mem.likes)}
                              className="text-gray-400 hover:text-[#FF6B6B] transition flex items-center gap-1 text-xs font-bold"
                            >
                              <Heart size={14} className={likeInfo.liked ? 'fill-[#FF6B6B] text-[#FF6B6B]' : ''} />
                              <span>{likeInfo.count}</span>
                            </button>
                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 font-mono">
                              <Calendar size={10} /> {mem.date}
                            </span>
                          </div>

                          {mem.expenseName && (
                            <span className="text-[9px] bg-orange-50 text-[#E85D3A] px-2 py-1 rounded font-black font-sans shrink-0 border border-orange-100/50">
                              TAP FOR SPLITS
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* BACK SIDE (FLIPPED STAGE DETAILS) */}
                    <div 
                      className="backface-hidden absolute inset-0 bg-[#111111] rounded-[24px] p-6 text-white rotateY-180 flex flex-col justify-between shadow-2xl"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start border-b border-white/10 pb-3">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-gray-450 uppercase tracking-widest block">Associated Expense</span>
                            <h4 className="text-base font-black text-white leading-tight">{mem.expenseName || 'Custom Photo Share'}</h4>
                          </div>
                          {mem.amount && <div className="text-lg font-black text-[#F4D06F] font-mono">₹{mem.amount}</div>}
                        </div>

                        <div className="space-y-3">
                          <span className="text-[9px] font-mono font-bold text-gray-450 uppercase tracking-widest block">Group Split Breakdown</span>
                          <div className="space-y-2">
                            {trip.members.map((member, idx) => {
                              const amountOwed = mem.amount ? Math.round(mem.amount / trip.members.length) : 0;
                              return (
                                <div key={idx} className="flex justify-between text-xs font-mono font-medium">
                                  <div className="flex items-center gap-1.5">
                                    <img src={member.avatar} className="w-5 h-5 rounded-full border border-white/20" alt="member" />
                                    <span className="text-gray-300 font-bold">{member.name.split(' ')[0]}</span>
                                  </div>
                                  <span className="text-white/80 font-bold">₹{amountOwed}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="text-[10px] text-[#F4D06F] bg-white/5 px-3 py-1.5 rounded-full font-bold">
                          TAP CARD TO FLIP PHOTO
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TRIP RECAP POPUP DIALOG / INSTAGRAM SHARE CARD */}
      <AnimatePresence>
        {showRecap && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm overflow-hidden flex flex-col space-y-4"
            >
              {/* Actual share card */}
              <div className="bg-white rounded-[32px] overflow-hidden p-5 border border-gray-100 flex flex-col justify-between aspect-[3/4] relative shadow-2xl">
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointers-events-none"></div>
                <img 
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="recap cover" 
                />

                {/* Card Header overlay */}
                <div className="z-10 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl flex justify-between items-center border border-white/50 shadow-sm">
                  <div className="flex items-center gap-1.5 font-bold font-sans text-md text-[#111111]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E85D3A]"></span>
                    <span>Minto Recap</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Goa Trip &apos;26</span>
                </div>

                {/* Bottom stats layout */}
                <div className="z-10 text-white space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-[#F4D06F] tracking-widest uppercase font-mono">Money for Moments</span>
                    <h2 className="text-2xl font-black tracking-tight leading-none text-white font-sans">{trip.name}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-left border-t border-white/20">
                    <div>
                      <span className="text-[8px] font-mono text-gray-300 font-bold uppercase tracking-widest block">DAYS LOGGED</span>
                      <span className="text-xs font-black text-white">{daysTravelled}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-gray-300 font-bold uppercase tracking-widest block">MEMBERS COUNT</span>
                      <span className="text-xs font-black text-white">{membersCount} companions</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-gray-300 font-bold uppercase tracking-widest block">TOTAL SPLIT SPEND</span>
                      <span className="text-xs font-black text-white">₹{totalSpend.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-mono text-gray-300 font-bold uppercase tracking-widest block">TOP SPENDER</span>
                      <span className="text-xs font-black text-white truncate block max-w-[120px]">{topContributor.split(' ')[0]}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-200 leading-relaxed font-sans italic pt-2 border-t border-white/10">
                    &ldquo;Best garlic prawns, beach scooters and deep scuba dives. We built memories, not arguments!&rdquo;
                  </p>
                </div>
              </div>

              {/* Share actions row triggers growth loop */}
              <div className="space-y-2 bg-[#111111] p-4 rounded-[24px]">
                <p className="text-xs text-gray-400 font-bold text-center">Share Moment Recap with Tribe</p>
                <div className="flex gap-2">
                  <button
                    id="share-whatsapp-btn"
                    onClick={() => handleShareClick('WhatsApp')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    id="share-instagram-btn"
                    onClick={() => handleShareClick('Instagram')}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Instagram size={14} />
                    <span>Instagram</span>
                  </button>
                  <button
                    id="close-recap-dialog"
                    onClick={() => setShowRecap(false)}
                    className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl text-xs font-bold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share success popup notification */}
      <AnimatePresence>
        {showShareSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 bg-emerald-600 text-white py-3 px-4 rounded-2xl flex items-center gap-2 shadow-lg z-50 font-bold text-xs"
          >
            <Sparkles size={16} className="text-[#F4D06F] shrink-0" />
            <span>Success: Recap package compiled &amp; exported to {sharePlatform}!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
