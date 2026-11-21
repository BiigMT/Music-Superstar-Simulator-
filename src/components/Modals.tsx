import React from 'react';
import { Award, Play, RotateCcw, Save, Trophy } from 'lucide-react';
import { EventChoice, GameState, IndustryEvent } from '../types/game';
import { formatCash, formatCompact } from '../utils/format';

interface EventModalProps {
  event: IndustryEvent;
  onSelectChoice: (choice: EventChoice) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onSelectChoice }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-lg rounded-lg border border-[#E5A93C]/40 bg-[#13161D] p-6 space-y-5 shadow-2xl">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E5A93C]">{event.kicker}</p>
          <h3 className="text-xl font-bold text-white">{event.title}</h3>
        </div>

        <p className="text-sm leading-relaxed text-neutral-300">{event.description}</p>

        <div className="space-y-2.5">
          {event.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectChoice(c)}
              className="w-full rounded-md border border-white/15 bg-[#0B0D11] p-4 text-left transition-colors hover:border-[#E5A93C] hover:bg-[#1C202B]"
            >
              <span className="block text-sm font-semibold text-white">{c.label}</span>
              <span className="mt-1 block text-xs text-[#E5A93C]">{c.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface PauseModalProps {
  onResume: () => void;
  onSaveAndQuit: () => void;
  onRestartNew: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onSaveAndQuit,
  onRestartNew,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-sm rounded-lg border border-white/15 bg-[#13161D] p-6 space-y-5 shadow-2xl">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#E5A93C]">Session Paused</p>
          <h3 className="mt-1 text-xl font-bold text-white">Game Menu</h3>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#E5A93C] py-3 text-sm font-semibold text-[#0B0D11] hover:bg-[#F0B94E]"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Resume Career</span>
          </button>

          <button
            type="button"
            onClick={onSaveAndQuit}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-[#0B0D11] py-3 text-sm font-medium text-white hover:border-[#E5A93C]"
          >
            <Save className="h-4 w-4 text-[#E5A93C]" />
            <span>Save & Return to Title</span>
          </button>

          <button
            type="button"
            onClick={onRestartNew}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-[#0B0D11] py-3 text-sm font-medium text-neutral-300 hover:border-[#EF4444] hover:text-[#FCA5A5]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Start Fresh Artist</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface CareerSummaryModalProps {
  state: GameState;
  onPlayAgain: () => void;
  onContinuePlaying: () => void;
}

export const CareerSummaryModal: React.FC<CareerSummaryModalProps> = ({
  state,
  onPlayAgain,
  onContinuePlaying,
}) => {
  const { artist, awards, legacyScore } = state;
  const awardWins = awards.filter((a) => a.won).length;
  const plaques = state.tracks.filter((t) => t.artistId === 'player' && t.certification !== 'None').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <div className="w-full max-w-xl rounded-lg border border-[#E5A93C]/50 bg-[#13161D] p-7 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <Trophy className="h-10 w-10 text-[#E5A93C] mx-auto" />
          <p className="text-xs uppercase tracking-[0.18em] text-[#E5A93C]">Hall of Fame Legacy Report</p>
          <h2 className="text-3xl font-bold text-white">{artist.name}</h2>
          <p className="text-xs text-neutral-400">
            {artist.genre} Icon · {state.year} Years Active ({state.week} Weeks)
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-white/10 py-5 text-center tabular-nums">
          <div>
            <span className="block text-[11px] text-neutral-400">Legacy Score</span>
            <span className="font-mono-tabular text-lg font-bold text-[#E5A93C]">{legacyScore.toLocaleString()}</span>
          </div>
          <div>
            <span className="block text-[11px] text-neutral-400">Total Streams</span>
            <span className="font-mono-tabular text-lg font-bold text-white">{formatCompact(artist.totalStreams)}</span>
          </div>
          <div>
            <span className="block text-[11px] text-neutral-400">Net Worth</span>
            <span className="font-mono-tabular text-lg font-bold text-[#22C55E]">{formatCash(artist.cash)}</span>
          </div>
          <div>
            <span className="block text-[11px] text-neutral-400">#1 Hits</span>
            <span className="font-mono-tabular text-lg font-bold text-white">{artist.numberOneHits}</span>
          </div>
          <div>
            <span className="block text-[11px] text-neutral-400">RIAA Plaques</span>
            <span className="font-mono-tabular text-lg font-bold text-white">{plaques}</span>
          </div>
          <div>
            <span className="block text-[11px] text-neutral-400">Aurelia Wins</span>
            <span className="font-mono-tabular text-lg font-bold text-white">{awardWins}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onContinuePlaying}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-[#0B0D11] py-3 text-sm font-medium text-neutral-200 hover:border-white/30"
          >
            <Award className="h-4 w-4 text-[#E5A93C]" />
            <span>Keep Playing</span>
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-[#E5A93C] py-3 text-sm font-semibold text-[#0B0D11] hover:bg-[#F0B94E]"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
