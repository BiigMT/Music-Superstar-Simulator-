import React, { useState } from 'react';
import { MapPin, ShoppingBag, Ticket } from 'lucide-react';
import { TOUR_VENUES } from '../data/worldData';
import { GameState } from '../types/game';
import { clamp, formatCash, formatCompact } from '../utils/format';

interface TourMerchDeskProps {
  state: GameState;
  onBookTour: (venueId: string, ticketPrice: number) => void;
  onLaunchMerch: (params: { name: string; itemType: 'Tee' | 'Hoodie' | 'Vinyl Box' | 'Cap'; price: number }) => void;
  onRetireMerch: (merchId: string) => void;
}

export const TourMerchDesk: React.FC<TourMerchDeskProps> = ({
  state,
  onBookTour,
  onLaunchMerch,
  onRetireMerch,
}) => {
  const [selectedVenueId, setSelectedVenueId] = useState(TOUR_VENUES[0].id);
  const selectedVenue = TOUR_VENUES.find((v) => v.id === selectedVenueId) ?? TOUR_VENUES[0];
  const [ticketPrice, setTicketPrice] = useState(selectedVenue.suggestedPrice);

  const [merchName, setMerchName] = useState('');
  const [merchType, setMerchType] = useState<'Tee' | 'Hoodie' | 'Vinyl Box' | 'Cap'>('Hoodie');
  const [merchPrice, setMerchPrice] = useState(55);

  const { artist, activeTours, merchLines } = state;

  const estSellThrough = Math.round(
    clamp(
      (selectedVenue.suggestedPrice / Math.max(10, ticketPrice)) *
        clamp(artist.monthlyListeners / (selectedVenue.minListeners * 2.2), 0.55, 1.15) *
        (artist.crewIds.includes('tour_director') ? 1.22 : 1.0),
      0.28,
      1.0
    ) * 100
  );

  const estGross = Math.round(
    selectedVenue.cityCount * selectedVenue.capacityPerShow * (estSellThrough / 100) * ticketPrice
  );

  const handleSelectVenue = (id: string) => {
    setSelectedVenueId(id);
    const v = TOUR_VENUES.find((item) => item.id === id);
    if (v) setTicketPrice(v.suggestedPrice);
  };

  const handleMerchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunchMerch({
      name: merchName || `${artist.name} ${merchType}`,
      itemType: merchType,
      price: merchPrice,
    });
    setMerchName('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* Left: Live Touring */}
      <div className="xl:col-span-7 rounded-lg border border-white/10 bg-[#13161D] p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white">Live Touring & Venues</h2>
            <p className="text-xs text-neutral-400">
              Completed Tours: <span className="font-mono-tabular text-white">{state.completedToursCount}</span> · Stagecraft {artist.skills.stagecraft}/100
            </p>
          </div>
        </div>

        {activeTours.length > 0 && (
          <div className="rounded-md border border-[#E5A93C]/50 bg-[#E5A93C]/10 p-4 space-y-2">
            {activeTours.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#FDE68A]">On Tour: {t.venueName}</p>
                  <p className="text-xs text-neutral-300">
                    {t.cityCount} Cities · {t.weeksRemaining} of {t.totalWeeks} weeks remaining
                  </p>
                </div>
                <div className="text-right font-mono-tabular">
                  <span className="block text-xs text-neutral-300">Earned So Far</span>
                  <span className="text-sm font-bold text-[#22C55E]">{formatCash(t.earnedSoFar)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TOUR_VENUES.map((v) => {
            const locked = artist.monthlyListeners < v.minListeners;
            const active = selectedVenueId === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => handleSelectVenue(v.id)}
                className={`rounded-md border p-3.5 text-left transition-colors ${
                  active ? 'border-[#E5A93C] bg-[#1C202B]' : 'border-white/10 bg-[#0B0D11] hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{v.tierName}</span>
                  <span className={`text-[11px] font-mono-tabular ${locked ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                    {locked ? `Need ${formatCompact(v.minListeners)}` : 'Unlocked'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-400">
                  {v.cityCount} cities · {v.capacityPerShow.toLocaleString()} cap · {v.totalWeeks}w run
                </p>
                <p className="mt-1.5 font-mono-tabular text-xs text-[#E5A93C]">
                  Deposit: {formatCash(v.bookingCost)}
                </p>
              </button>
            );
          })}
        </div>

        {/* Ticket Price Optimizer */}
        <div className="rounded-md border border-white/10 bg-[#0B0D11] p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-semibold text-white">
              <Ticket className="h-4 w-4 text-[#E5A93C]" />
              Ticket Price Strategy (Suggested {formatCash(selectedVenue.suggestedPrice)})
            </span>
            <span className="font-mono-tabular font-semibold text-[#E5A93C]">{formatCash(ticketPrice)} / ticket</span>
          </div>

          <input
            type="range"
            min={10}
            max={Math.max(60, selectedVenue.suggestedPrice * 2)}
            value={ticketPrice}
            onChange={(e) => setTicketPrice(Number(e.target.value))}
            className="console-fader w-full"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 tabular-nums pt-1">
            <span>
              Projected Attendance: <strong className="text-white">{estSellThrough}%</strong>
            </span>
            <span>
              Est. Gross Box Office: <strong className="text-[#22C55E]">{formatCash(estGross)}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onBookTour(selectedVenue.id, ticketPrice)}
          disabled={
            activeTours.length > 0 ||
            artist.monthlyListeners < selectedVenue.minListeners ||
            artist.cash < selectedVenue.bookingCost ||
            artist.energy < 1
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#E5A93C] py-3 text-sm font-semibold text-[#0B0D11] hover:bg-[#F0B94E] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MapPin className="h-4 w-4" />
          <span>Book {selectedVenue.venueName} ({formatCash(selectedVenue.bookingCost)} · 1 AP)</span>
        </button>
      </div>

      {/* Right: Merch Storefront */}
      <div className="xl:col-span-5 rounded-lg border border-white/10 bg-[#13161D] p-5 sm:p-6 space-y-5">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-lg font-bold text-white">Official Merch Drops</h3>
          <p className="text-xs text-neutral-400">
            Passive weekly income from your fanbase. Sales surge while on tour.
          </p>
        </div>

        <form onSubmit={handleMerchSubmit} className="space-y-3 rounded-md border border-white/10 bg-[#0B0D11] p-4">
          <input
            type="text"
            placeholder="Collection Name (e.g. Gold Era Tour Hoodie)"
            value={merchName}
            onChange={(e) => setMerchName(e.target.value)}
            className="w-full rounded-md border border-white/15 bg-[#13161D] px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-[#E5A93C] focus:outline-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={merchType}
              onChange={(e) => {
                const next = e.target.value as typeof merchType;
                setMerchType(next);
                setMerchPrice(next === 'Hoodie' ? 60 : next === 'Vinyl Box' ? 45 : next === 'Tee' ? 35 : 28);
              }}
              className="rounded-md border border-white/15 bg-[#13161D] px-3 py-2 text-xs text-white focus:border-[#E5A93C] focus:outline-none"
            >
              <option value="Hoodie">Heavyweight Hoodie ($28 cost)</option>
              <option value="Tee">Tour Graphic Tee ($14 cost)</option>
              <option value="Vinyl Box">Collector Vinyl ($22 cost)</option>
              <option value="Cap">Embroidered Cap ($9 cost)</option>
            </select>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Price:</span>
              <input
                type="number"
                min={15}
                max={180}
                value={merchPrice}
                onChange={(e) => setMerchPrice(Number(e.target.value))}
                className="w-full rounded-md border border-white/15 bg-[#13161D] px-2.5 py-2 text-xs font-mono-tabular text-white focus:border-[#E5A93C] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={artist.cash < 1200 || merchLines.length >= 4}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white/10 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#E5A93C] hover:text-[#0B0D11] disabled:opacity-40"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Launch Merch Line ($1,200 Setup)</span>
          </button>
        </form>

        <div className="space-y-2.5">
          {merchLines.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4 text-center">No active merch drops running.</p>
          ) : (
            merchLines.map((m) => (
              <div
                key={m.id}
                className="rounded-md border border-white/10 bg-[#0B0D11] p-3.5 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-white">{m.name}</p>
                  <p className="text-[11px] text-neutral-400 tabular-nums">
                    {m.itemType} · {formatCash(m.price)} retail · {m.unitsSold.toLocaleString()} sold
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRetireMerch(m.id)}
                  className="text-[11px] text-neutral-400 hover:text-[#EF4444]"
                >
                  Retire
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
