import React from 'react';
import { Award, Crown, Trophy } from 'lucide-react';
import { GameState } from '../types/game';
import { formatCompact } from '../utils/format';

interface AwardsHallProps {
  state: GameState;
  onRetireCareer: () => void;
}

export const AwardsHall: React.FC<AwardsHallProps> = ({ state, onRetireCareer }) => {
  const { awards, artist, legacyScore } = state;
  const wins = awards.filter((a) => a.won);

  const milestones = [
    { label: 'Break Top 50 Chart', done: artist.peakChartPosition !== null },
    { label: 'Reach Top 10 Hit', done: artist.peakChartPosition !== null && artist.peakChartPosition <= 10 },
    { label: 'Claim a Global #1 Hit', done: artist.numberOneHits >= 1 },
    { label: '1,000,000 Monthly Listeners', done: artist.monthlyListeners >= 1_000_000 },
    { label: 'Earn First RIAA Gold or Platinum', done: state.tracks.some((t) => t.artistId === 'player' && t.certification !== 'None') },
    { label: 'Win an Aurelia Music Award', done: wins.length >= 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-lg border border-white/10 bg-[#13161D] p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-[#E5A93C]" />
            <div>
              <p className="text-xs text-neutral-400">Hall of Fame Trajectory</p>
              <h2 className="text-2xl font-bold font-mono-tabular text-white">{legacyScore.toLocaleString()} pts</h2>
            </div>
          </div>

          <div className="space-y-2.5 border-t border-white/10 pt-4">
            {milestones.map((m) => (
              <div key={m.label} className="flex items-center justify-between text-xs">
                <span className={m.done ? 'text-white font-medium' : 'text-neutral-500'}>{m.label}</span>
                <span className={`font-semibold ${m.done ? 'text-[#22C55E]' : 'text-neutral-600'}`}>
                  {m.done ? 'Achieved' : 'Locked'}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <p className="text-xs text-neutral-400 leading-relaxed">
              Ready to cement your career in music history? You can retire at any time to view your complete Hall of Fame legacy report.
            </p>
            <button
              type="button"
              onClick={onRetireCareer}
              className="w-full rounded-md border border-white/15 bg-[#0B0D11] py-2.5 text-xs font-semibold text-neutral-200 hover:border-[#E5A93C] hover:text-white"
            >
              Retire & View Legacy Report
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-lg border border-white/10 bg-[#13161D] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#E5A93C]" />
              <h3 className="text-base font-semibold text-white">The Aurelia Music Awards</h3>
            </div>
            <span className="font-mono-tabular text-xs text-neutral-400">
              {wins.length} Wins · {awards.length} Nominations
            </span>
          </div>

          <p className="text-xs text-neutral-400">
            Ceremonies are held every 52nd week. Top-charting singles, albums, and breakout years earn nominations and $25,000 winner grants.
          </p>

          {awards.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Award className="h-8 w-8 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-400">
                No nominations yet. Keep climbing the Hot 50 toward Year-End Week 52!
              </p>
              <p className="text-[11px] font-mono-tabular text-neutral-500">
                Current Total Streams: {formatCompact(artist.totalStreams)}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {awards.map((awd) => (
                <div key={awd.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-semibold text-white">{awd.category}</p>
                    <p className="text-[11px] text-neutral-400">Year {awd.year} · "{awd.workTitle}"</p>
                  </div>
                  <span className={`font-semibold ${awd.won ? 'text-[#E5A93C]' : 'text-neutral-400'}`}>
                    {awd.won ? 'Winner' : 'Nominee'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
