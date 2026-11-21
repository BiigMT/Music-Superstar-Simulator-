import React from 'react';
import { Award, Disc3, Mic2, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { ASSETS, GENRES, LIFESTYLE_TIERS, STUDIO_TIERS } from '../data/worldData';
import { GameState, NavTab } from '../types/game';
import { formatCash, formatCompact } from '../utils/format';

interface OverviewDeckProps {
  state: GameState;
  onNavigate: (tab: NavTab) => void;
}

export const OverviewDeck: React.FC<OverviewDeckProps> = ({ state, onNavigate }) => {
  const { artist, lastDigest, hotChart, tracks, albums } = state;
  const portrait = ASSETS.portraits.find((p) => p.id === artist.portraitId) ?? ASSETS.portraits[0];
  const studio = STUDIO_TIERS[artist.studioLevel] ?? STUDIO_TIERS[0];
  const lifestyle = LIFESTYLE_TIERS[artist.lifestyleLevel] ?? LIFESTYLE_TIERS[0];

  const playerTracks = tracks.filter((t) => t.artistId === 'player');
  const unreleasedTracks = playerTracks.filter((t) => !t.released);
  const activeChartTracks = hotChart.filter((c) => c.artistId === 'player');
  const releasedAlbums = albums.filter((a) => a.artistId === 'player' && a.released);

  return (
    <div className="space-y-6">
      {/* Artist Banner & Career Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 rounded-lg border border-white/10 bg-[#13161D] p-5 flex flex-col sm:flex-row gap-5">
          <img
            src={portrait.src}
            alt={artist.name}
            referrerPolicy="no-referrer"
            className="h-32 w-32 sm:h-40 sm:w-40 rounded-md object-cover border border-white/10 shrink-0"
          />
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
            <div>
              <p className="text-xs text-[#E5A93C] font-medium">
                {artist.archetype} · {artist.city}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white truncate">{artist.name}</h2>
              <p className="mt-1 text-xs text-neutral-400">
                Label: <span className="text-neutral-200">{artist.labelContract ? artist.labelContract.labelName : 'Independent (100% Masters)'}</span>
                <span className="mx-2" aria-hidden="true">·</span>
                Studio: <span className="text-neutral-200">{studio.name}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-3.5 tabular-nums">
              <div>
                <span className="block text-[11px] text-neutral-400">Total Streams</span>
                <span className="font-mono-tabular text-sm font-semibold text-white">
                  {formatCompact(artist.totalStreams)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-neutral-400">Followers</span>
                <span className="font-mono-tabular text-sm font-semibold text-white">
                  {formatCompact(artist.followers)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-neutral-400">Best Chart Peak</span>
                <span className="font-mono-tabular text-sm font-semibold text-[#E5A93C]">
                  {artist.peakChartPosition ? `#${artist.peakChartPosition}` : 'Uncharted'}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-neutral-400">#1 Hits</span>
                <span className="font-mono-tabular text-sm font-semibold text-white">
                  {artist.numberOneHits}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Studio & Career Actions */}
        <div className="lg:col-span-5 rounded-lg border border-white/10 bg-[#13161D] p-5 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Weekly Session Plan</h3>
            <p className="mt-1 text-xs text-neutral-400">
              You have <span className="font-mono-tabular font-semibold text-[#E5A93C]">{artist.energy} Energy AP</span> remaining this week ({lifestyle.name}).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('studio')}
              className="flex items-center gap-2.5 rounded-md border border-white/10 bg-[#0B0D11] px-3.5 py-3 text-left text-xs font-medium text-neutral-200 transition-colors hover:border-[#E5A93C]/60 hover:text-white"
            >
              <Mic2 className="h-4 w-4 text-[#E5A93C] shrink-0" />
              <span className="truncate">Record Track</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('charts')}
              className="flex items-center gap-2.5 rounded-md border border-white/10 bg-[#0B0D11] px-3.5 py-3 text-left text-xs font-medium text-neutral-200 transition-colors hover:border-[#E5A93C]/60 hover:text-white"
            >
              <Disc3 className="h-4 w-4 text-[#E5A93C] shrink-0" />
              <span className="truncate">Global Hot 50</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('social')}
              className="flex items-center gap-2.5 rounded-md border border-white/10 bg-[#0B0D11] px-3.5 py-3 text-left text-xs font-medium text-neutral-200 transition-colors hover:border-[#E5A93C]/60 hover:text-white"
            >
              <Users className="h-4 w-4 text-[#E5A93C] shrink-0" />
              <span className="truncate">Promo & Feuds</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('business')}
              className="flex items-center gap-2.5 rounded-md border border-white/10 bg-[#0B0D11] px-3.5 py-3 text-left text-xs font-medium text-neutral-200 transition-colors hover:border-[#E5A93C]/60 hover:text-white"
            >
              <Award className="h-4 w-4 text-[#E5A93C] shrink-0" />
              <span className="truncate">Skills & Labels</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Financial & Chart Digest + Market Genre Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-semibold text-white">
              {lastDigest ? `Week ${lastDigest.week} Performance Digest` : 'Debut Week Briefing'}
            </h3>
            {lastDigest && (
              <span
                className={`font-mono-tabular text-xs font-semibold ${
                  lastDigest.netCashDelta >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
                }`}
              >
                Net {lastDigest.netCashDelta >= 0 ? '+' : ''}{formatCash(lastDigest.netCashDelta)}
              </span>
            )}
          </div>

          {lastDigest ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 tabular-nums">
                <div>
                  <span className="block text-[11px] text-neutral-400">Weekly Streams</span>
                  <span className="font-mono-tabular text-sm font-semibold text-white">
                    {formatCompact(lastDigest.streamsEarned)}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-neutral-400">Royalties</span>
                  <span className="font-mono-tabular text-sm font-semibold text-[#22C55E]">
                    +{formatCash(lastDigest.royaltiesEarned)}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-neutral-400">Tour & Merch</span>
                  <span className="font-mono-tabular text-sm font-semibold text-[#22C55E]">
                    +{formatCash(lastDigest.tourEarned + lastDigest.merchEarned)}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-neutral-400">Upkeep Paid</span>
                  <span className="font-mono-tabular text-sm font-semibold text-neutral-300">
                    -{formatCash(lastDigest.upkeepPaid)}
                  </span>
                </div>
              </div>

              {lastDigest.highlights.length > 0 && (
                <div className="border-t border-white/10 pt-3 space-y-1.5">
                  {lastDigest.highlights.map((h, i) => (
                    <p key={i} className="text-xs text-neutral-200 flex items-center gap-2">
                      <span className="text-[#E5A93C] font-bold">·</span>
                      <span>{h}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 leading-relaxed">
              Step into the <button type="button" onClick={() => onNavigate('studio')} className="text-[#E5A93C] underline underline-offset-4 hover:text-[#FDE68A]">Recording Studio</button> to cut your debut single, dial in the mixing console for a quality bonus, and release it before advancing your first week.
            </p>
          )}
        </div>

        {/* Genre Market Momentum */}
        <div className="lg:col-span-5 rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-semibold text-white">Market Sound Demand</h3>
            <span className="text-xs text-neutral-400">Live Listener Appetite</span>
          </div>

          <div className="space-y-3">
            {GENRES.map((g) => {
              const mult = state.genreTrends[g] ?? 1.0;
              const pct = Math.round(mult * 100);
              const hot = mult >= 1.08;
              const cool = mult < 0.96;
              return (
                <div key={g} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <span className={`font-medium ${g === artist.genre ? 'text-[#E5A93C]' : 'text-neutral-200'}`}>
                      {g}
                    </span>
                    {g === artist.genre && <span className="text-[11px] text-neutral-400">(Yours)</span>}
                  </div>
                  <div className="flex-1 h-1.5 rounded-full bg-[#0B0D11] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${hot ? 'bg-[#22C55E]' : cool ? 'bg-neutral-500' : 'bg-[#E5A93C]'}`}
                      style={{ width: `${Math.min(100, Math.round(((mult - 0.7) / 0.7) * 100))}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 font-mono-tabular w-16 justify-end">
                    {hot ? (
                      <TrendingUp className="h-3.5 w-3.5 text-[#22C55E]" />
                    ) : cool ? (
                      <TrendingDown className="h-3.5 w-3.5 text-neutral-400" />
                    ) : null}
                    <span className={hot ? 'text-[#22C55E]' : 'text-neutral-300'}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Charting Tracks & Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Your Active Hot 50 Records</h3>
            <button
              type="button"
              onClick={() => onNavigate('charts')}
              className="text-xs text-[#E5A93C] hover:underline"
            >
              View Full Chart
            </button>
          </div>
          {activeChartTracks.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4">
              None of your singles are currently inside the Global Hot 50. Build hype and release high-quality tracks to break in.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {activeChartTracks.map((entry) => (
                <div key={entry.trackId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-tabular font-bold text-[#E5A93C] w-7">#{entry.rank}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{entry.title}</p>
                      <p className="text-[11px] text-neutral-400">
                        Peak #{entry.peakPosition} · {entry.weeksOnChart}w on chart
                      </p>
                    </div>
                  </div>
                  <span className="font-mono-tabular text-neutral-200 shrink-0">
                    {formatCompact(entry.weeklyStreams)}/wk
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Studio Vault & Releases</h3>
            <span className="font-mono-tabular text-xs text-neutral-400">
              {unreleasedTracks.length} unreleased · {releasedAlbums.length} projects
            </span>
          </div>
          {playerTracks.length === 0 ? (
            <p className="text-xs text-neutral-400 py-4">
              No tracks recorded yet. Head to the Studio Desk to lay down your first demo.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {playerTracks.slice(0, 4).map((trk) => (
                <div key={trk.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">
                      {trk.title}
                      {trk.featuredArtistName ? ` (feat. ${trk.featuredArtistName})` : ''}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Quality {trk.quality}/100 · {trk.released ? `${formatCompact(trk.totalStreams)} streams` : 'Unreleased Master'}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium shrink-0 ${trk.released ? 'text-[#22C55E]' : 'text-[#E5A93C]'}`}>
                    {trk.released ? 'Live' : 'In Vault'}
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
