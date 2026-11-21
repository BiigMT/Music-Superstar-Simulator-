import React, { useEffect } from 'react';
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { ASSETS } from '../data/worldData';
import { GameState } from '../types/game';
import { formatCash, formatCompact } from '../utils/format';

interface TitleScreenProps {
  savedGame: GameState | null;
  muted: boolean;
  onToggleMute: () => void;
  onNewCareer: () => void;
  onContinueCareer: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  savedGame,
  muted,
  onToggleMute,
  onNewCareer,
  onContinueCareer,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (savedGame) {
          onContinueCareer();
        } else {
          onNewCareer();
        }
      } else if (e.key.toLowerCase() === 'm') {
        onToggleMute();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [savedGame, onContinueCareer, onNewCareer, onToggleMute]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0B0D11] flex flex-col justify-between">
      {/* Key-Art Atmospheric Studio Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={ASSETS.titleBackdrop}
          alt="Midnight mastering studio control room"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D11] via-[#0B0D11]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D11] via-transparent to-[#0B0D11]/50" />
      </div>

      {/* Minimal Top Utility Row */}
      <div className="relative z-10 flex items-center justify-end px-6 py-5 sm:px-10">
        <button
          type="button"
          onClick={onToggleMute}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#13161D]/80 px-3.5 py-2 text-xs font-medium text-neutral-300 transition-colors hover:border-[#E5A93C]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C]"
          aria-label={muted ? 'Unmute audio' : 'Mute audio'}
        >
          {muted ? <VolumeX className="h-4 w-4 text-neutral-400" /> : <Volume2 className="h-4 w-4 text-[#E5A93C]" />}
          <span className="whitespace-nowrap">{muted ? 'Audio Muted' : 'Audio Active'}</span>
        </button>
      </div>

      {/* Hero Lockup in Left Calm Negative Space */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-6 sm:px-12">
        <div className="max-w-xl space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-[#E5A93C]">
              ARTIST LIFE SIMULATION
            </p>

            {/* Bespoke Inline SVG Title Lockup */}
            <div className="pt-1">
              <svg
                viewBox="0 0 540 128"
                className="w-full max-w-[490px] h-auto"
                role="img"
                aria-label="Music Superstar Simulator"
              >
                <defs>
                  <linearGradient id="goldPlaque" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#E5A93C" />
                    <stop offset="100%" stopColor="#B47B1B" />
                  </linearGradient>
                </defs>
                {/* Minimal Vinyl Groove Crest */}
                <circle cx="38" cy="64" r="34" fill="none" stroke="url(#goldPlaque)" strokeWidth="2.5" />
                <circle cx="38" cy="64" r="24" fill="none" stroke="#E5A93C" strokeOpacity="0.4" strokeWidth="1" />
                <circle cx="38" cy="64" r="14" fill="none" stroke="#E5A93C" strokeOpacity="0.65" strokeWidth="1.2" />
                <circle cx="38" cy="64" r="4.5" fill="url(#goldPlaque)" />
                {/* Title Typography */}
                <text
                  x="90"
                  y="62"
                  fill="#F3F4F6"
                  fontFamily="Syne, sans-serif"
                  fontWeight="800"
                  fontSize="50"
                  letterSpacing="-1.5"
                >
                  PLATINUM
                </text>
                <text
                  x="92"
                  y="108"
                  fill="url(#goldPlaque)"
                  fontFamily="Syne, sans-serif"
                  fontWeight="700"
                  fontSize="38"
                  letterSpacing="8"
                >
                  ERA
                </text>
              </svg>
            </div>

            <p className="max-w-md text-base leading-relaxed text-neutral-300">
              Build your artist from the first studio session to global superstardom. Make records, grow your fanbase, compete on the charts, navigate the industry and headline your own tour.
            </p>
          </div>

          {/* Primary Action Stack */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            {savedGame ? (
              <>
                <button
                  type="button"
                  onClick={onContinueCareer}
                  className="inline-flex items-center justify-center gap-2.5 rounded-md bg-[#E5A93C] px-7 py-3.5 text-sm font-semibold text-[#0B0D11] transition-transform duration-150 hover:bg-[#F0B94E] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE68A] whitespace-nowrap"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Continue Career</span>
                </button>
                <button
                  type="button"
                  onClick={onNewCareer}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-[#13161D]/90 px-6 py-3.5 text-sm font-medium text-neutral-200 transition-colors hover:border-white/30 hover:bg-[#1C202B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A93C] whitespace-nowrap"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Start New Career</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onNewCareer}
                className="inline-flex items-center justify-center gap-2.5 rounded-md bg-[#E5A93C] px-8 py-4 text-sm font-semibold text-[#0B0D11] transition-transform duration-150 hover:bg-[#F0B94E] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE68A] whitespace-nowrap"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start New Career</span>
              </button>
            )}
          </div>

          {/* Clean Unboxed Saved Career Summary (if present) */}
          {savedGame && (
            <div className="border-t border-white/10 pt-4 text-xs text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums">
              <span className="font-semibold text-neutral-200">{savedGame.artist.name}</span>
              <span aria-hidden="true">·</span>
              <span>{savedGame.artist.genre}</span>
              <span aria-hidden="true">·</span>
              <span>Year {savedGame.year}, Week {savedGame.week}</span>
              <span aria-hidden="true">·</span>
              <span>{formatCompact(savedGame.artist.monthlyListeners)} monthly listeners</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#E5A93C]">{formatCash(savedGame.artist.cash)}</span>
            </div>
          )}
        </div>
      </main>

      {/* Flat Single Control-Hint Line */}
      <footer className="relative z-10 px-6 py-5 sm:px-12">
        <p className="font-mono-tabular text-xs text-neutral-400">
          Enter Start · Space Advance Week · 1–7 Switch Desk · Esc Pause · M Mute
        </p>
      </footer>
    </div>
  );
};
