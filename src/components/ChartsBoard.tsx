import React, { useState } from 'react';
import { Award, Disc3, TrendingDown, TrendingUp } from 'lucide-react';
import { ASSETS } from '../data/worldData';
import { GameState } from '../types/game';
import { formatCompact } from '../utils/format';

interface ChartsBoardProps {
  state: GameState;
}

export const ChartsBoard: React.FC<ChartsBoardProps> = ({ state }) => {
  const [view, setView] = useState<'songs' | 'albums' | 'artists' | 'catalog'>('songs');

  const artistRankings = [
    {
      id: 'player',
      name: state.artist.name,
      genre: state.artist.genre,
      label: state.artist.labelContract?.labelName ?? 'Independent',
      listeners: state.artist.monthlyListeners,
      hype: state.artist.hype,
      isPlayer: true,
    },
    ...state.rivals.map((r) => ({
      id: r.id,
      name: r.name,
      genre: r.genre,
      label: r.labelName,
      listeners: r.monthlyListeners,
      hype: r.hype,
      isPlayer: false,
    })),
  ].sort((a, b) => b.listeners - a.listeners);

  const playerTracks = state.tracks.filter((t) => t.artistId === 'player');
  const playerAlbums = state.albums.filter((a) => a.artistId === 'player');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Global Music Charts & Certifications</h2>
          <p className="text-xs text-neutral-400">
            Updated every week across all streaming platforms and digital storefronts.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-md border border-white/10 bg-[#13161D] p-1">
          {[
            { id: 'songs', label: 'Hot 50 Songs' },
            { id: 'albums', label: 'Top 20 Albums' },
            { id: 'artists', label: 'Power Rankings' },
            { id: 'catalog', label: 'Your Plaques' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id as typeof view)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                view === tab.id ? 'bg-[#E5A93C] text-[#0B0D11]' : 'text-neutral-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'songs' && (
        <div className="rounded-lg border border-white/10 bg-[#13161D] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-[#0B0D11]/60 text-[11px] uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="py-3 px-4 w-14">Rank</th>
                  <th className="py-3 px-4 w-16">Move</th>
                  <th className="py-3 px-4">Track & Artist</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Genre</th>
                  <th className="py-3 px-4 text-right">Weekly Streams</th>
                  <th className="py-3 px-4 text-right hidden md:table-cell">Peak / Wks</th>
                  <th className="py-3 px-4 text-right hidden lg:table-cell">RIAA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 tabular-nums">
                {state.hotChart.map((row) => {
                  const isPlayer = row.artistId === 'player';
                  const delta = row.prevRank ? row.prevRank - row.rank : null;
                  return (
                    <tr
                      key={row.trackId}
                      className={isPlayer ? 'bg-[#E5A93C]/10' : 'hover:bg-white/[0.02]'}
                    >
                      <td className="py-3 px-4 font-mono-tabular font-bold text-sm text-white">
                        {row.rank === 1 ? <span className="text-[#E5A93C]">#1</span> : `#${row.rank}`}
                      </td>
                      <td className="py-3 px-4 font-mono-tabular">
                        {delta === null ? (
                          <span className="text-[#E5A93C] font-semibold">NEW</span>
                        ) : delta > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-[#22C55E]">
                            <TrendingUp className="h-3 w-3" />+{delta}
                          </span>
                        ) : delta < 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-[#EF4444]">
                            <TrendingDown className="h-3 w-3" />{delta}
                          </span>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <p className={`font-semibold ${isPlayer ? 'text-[#FDE68A]' : 'text-white'}`}>
                          {row.title}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {row.artistName}
                          {row.featuredArtistName ? ` feat. ${row.featuredArtistName}` : ''}
                        </p>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-neutral-300">{row.genre}</td>
                      <td className="py-3 px-4 text-right font-mono-tabular text-neutral-200">
                        {formatCompact(row.weeklyStreams)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-tabular text-neutral-400 hidden md:table-cell">
                        #{row.peakPosition} · {row.weeksOnChart}w
                      </td>
                      <td className="py-3 px-4 text-right hidden lg:table-cell text-neutral-300">
                        {row.certification !== 'None' ? (
                          <span className="text-[#E5A93C] font-medium">{row.certification}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'albums' && (
        <div className="rounded-lg border border-white/10 bg-[#13161D] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-[#0B0D11]/60 text-[11px] uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="py-3 px-4 w-14">Rank</th>
                  <th className="py-3 px-4">Project & Artist</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Format</th>
                  <th className="py-3 px-4 text-right">Weekly Units</th>
                  <th className="py-3 px-4 text-right">Total Units</th>
                  <th className="py-3 px-4 text-right hidden md:table-cell">Peak / Wks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 tabular-nums">
                {state.albumChart.map((row) => {
                  const isPlayer = row.artistId === 'player';
                  return (
                    <tr key={row.albumId} className={isPlayer ? 'bg-[#E5A93C]/10' : 'hover:bg-white/[0.02]'}>
                      <td className="py-3 px-4 font-mono-tabular font-bold text-sm text-white">#{row.rank}</td>
                      <td className="py-3 px-4">
                        <p className={`font-semibold ${isPlayer ? 'text-[#FDE68A]' : 'text-white'}`}>{row.title}</p>
                        <p className="text-[11px] text-neutral-400">{row.artistName} · {row.genre}</p>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell text-neutral-300">{row.format}</td>
                      <td className="py-3 px-4 text-right font-mono-tabular text-neutral-200">
                        {formatCompact(row.weeklyUnits)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-tabular text-neutral-300">
                        {formatCompact(row.totalUnits)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-tabular text-neutral-400 hidden md:table-cell">
                        #{row.peakPosition} · {row.weeksOnChart}w
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'artists' && (
        <div className="rounded-lg border border-white/10 bg-[#13161D] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-[#0B0D11]/60 text-[11px] uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="py-3 px-4 w-14">Rank</th>
                <th className="py-3 px-4">Artist</th>
                <th className="py-3 px-4 hidden sm:table-cell">Label</th>
                <th className="py-3 px-4 text-right">Monthly Listeners</th>
                <th className="py-3 px-4 text-right">Hype</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 tabular-nums">
              {artistRankings.map((a, i) => (
                <tr key={a.id} className={a.isPlayer ? 'bg-[#E5A93C]/10' : 'hover:bg-white/[0.02]'}>
                  <td className="py-3 px-4 font-mono-tabular font-bold text-white">#{i + 1}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${a.isPlayer ? 'text-[#FDE68A]' : 'text-white'}`}>
                      {a.name}
                    </span>
                    <span className="ml-2 text-[11px] text-neutral-400">{a.genre}</span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell text-neutral-300">{a.label}</td>
                  <td className="py-3 px-4 text-right font-mono-tabular text-white">
                    {formatCompact(a.listeners)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-tabular text-[#E5A93C]">{a.hype}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-4">
            <img
              src={ASSETS.albumAbstract}
              alt="Custom embossed vinyl plaque"
              referrerPolicy="no-referrer"
              className="aspect-square w-full rounded-md object-cover border border-white/10"
            />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">RIAA Plaque Thresholds</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Every 150 streams equals 1 certified unit. Reach Gold (500K), Platinum (1M), Multi-Platinum (2M), and Diamond (10M) for $5,000 plaque bonuses and Hall of Fame score.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-4">
            <h3 className="text-base font-semibold text-white">Your Complete Discography</h3>
            {playerTracks.length === 0 && playerAlbums.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6">No releases in your catalog yet.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {playerAlbums.map((alb) => (
                  <div key={alb.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <Disc3 className="h-4 w-4 text-[#E5A93C]" />
                      <div>
                        <p className="font-semibold text-white">{alb.title} ({alb.format})</p>
                        <p className="text-[11px] text-neutral-400">
                          {formatCompact(alb.totalUnits)} units · Peak {alb.peakPosition ? `#${alb.peakPosition}` : 'Uncharted'}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#E5A93C]">
                      {alb.certification !== 'None' ? `${alb.certification} Plaque` : 'Standard'}
                    </span>
                  </div>
                ))}

                {playerTracks.filter((t) => t.released).map((trk) => (
                  <div key={trk.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <Award className={`h-4 w-4 ${trk.certification !== 'None' ? 'text-[#E5A93C]' : 'text-neutral-500'}`} />
                      <div>
                        <p className="font-semibold text-white">{trk.title}</p>
                        <p className="text-[11px] text-neutral-400 tabular-nums">
                          {formatCompact(trk.totalStreams)} streams · Peak {trk.peakPosition ? `#${trk.peakPosition}` : 'Uncharted'}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${trk.certification !== 'None' ? 'text-[#E5A93C]' : 'text-neutral-400'}`}>
                      {trk.certification !== 'None' ? `${trk.certification}` : 'Single'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
