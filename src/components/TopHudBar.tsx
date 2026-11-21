import React from 'react';
import { FastForward, Pause, Volume2, VolumeX, Zap } from 'lucide-react';
import { GameState } from '../types/game';
import { formatCash, formatCompact } from '../utils/format';

interface TopHudBarProps {
  state: GameState;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onAdvanceWeek: () => void;
}

export const TopHudBar: React.FC<TopHudBarProps> = ({
  state,
  muted,
  onToggleMute,
  onPause,
  onAdvanceWeek,
}) => {
  const { artist, week, year } = state;
  const weekInYear = ((week - 1) % 52) + 1;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0D11]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Zone 1: Artist Identity & Timeline */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white truncate">
            {artist.name}
          </span>
          <span className="hidden sm:inline text-xs text-neutral-400 whitespace-nowrap">
            {artist.genre} · Y{year} W{weekInYear}
          </span>
        </div>

        {/* Zone 2: Core Telemetry Metrics (Tabular Numerals, No Pills) */}
        <div className="flex items-center gap-5 sm:gap-7 text-xs tabular-nums">
          <div>
            <span className="block text-[11px] text-neutral-400">Cash</span>
            <span className={`font-mono-tabular text-sm font-semibold ${artist.cash < 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
              {formatCash(artist.cash)}
            </span>
          </div>

          <div className="hidden md:block">
            <span className="block text-[11px] text-neutral-400">Monthly Listeners</span>
            <span className="font-mono-tabular text-sm font-semibold text-white">
              {formatCompact(artist.monthlyListeners)}
            </span>
          </div>

          <div>
            <span className="block text-[11px] text-neutral-400">Hype</span>
            <span className="font-mono-tabular text-sm font-semibold text-[#E5A93C]">
              {artist.hype}/100
            </span>
          </div>

          <div>
            <span className="block text-[11px] text-neutral-400">Energy AP</span>
            <div className="flex items-center gap-1.5">
              <Zap className={`h-3.5 w-3.5 ${artist.energy > 0 ? 'text-[#E5A93C]' : 'text-neutral-500'}`} />
              <span className="font-mono-tabular text-sm font-semibold text-white">
                {artist.energy}/{artist.maxEnergy}
              </span>
            </div>
          </div>
        </div>

        {/* Zone 3: Audio, Pause, and Primary Advance Week CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-[#13161D] text-neutral-300 transition-colors hover:border-white/25 hover:text-white"
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
            title={muted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {muted ? <VolumeX className="h-4 w-4 text-neutral-400" /> : <Volume2 className="h-4 w-4 text-[#E5A93C]" />}
          </button>

          <button
            type="button"
            onClick={onPause}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-[#13161D] text-neutral-300 transition-colors hover:border-white/25 hover:text-white"
            aria-label="Pause and Save Menu"
            title="Pause / Save (Esc)"
          >
            <Pause className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onAdvanceWeek}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#E5A93C] px-4 sm:px-5 text-xs sm:text-sm font-semibold text-[#0B0D11] transition-transform duration-150 hover:bg-[#F0B94E] active:scale-[0.98] whitespace-nowrap"
          >
            <span>Advance Week</span>
            <FastForward className="h-4 w-4 fill-current" />
          </button>
        </div>
      </div>
    </header>
  );
};
