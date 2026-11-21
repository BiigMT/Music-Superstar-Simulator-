import React from 'react';
import {
  ArrowUpRight, Award, CalendarDays, Disc3, Flame, Headphones,
  Mic2, Music2, Radio, TrendingUp, Users, Wallet, Zap
} from 'lucide-react';
import { ASSETS, LIFESTYLE_TIERS, STUDIO_TIERS } from '../data/worldData';
import { GameState, NavTab } from '../types/game';
import { formatCash, formatCompact } from '../utils/format';

interface OverviewDeckProps {
  state: GameState;
  onNavigate: (tab: NavTab) => void;
}

export const OverviewDeck: React.FC<OverviewDeckProps> = ({ state, onNavigate }) => {
  const { artist, lastDigest, hotChart, tracks, albums, socialFeed } = state;
  const portrait = ASSETS.portraits.find((p) => p.id === artist.portraitId) ?? ASSETS.portraits[0];
  const studio = STUDIO_TIERS[artist.studioLevel] ?? STUDIO_TIERS[0];
  const lifestyle = LIFESTYLE_TIERS[artist.lifestyleLevel] ?? LIFESTYLE_TIERS[0];
  const playerTracks = tracks.filter((t) => t.artistId === 'player');
  const unreleased = playerTracks.filter((t) => !t.released);
  const activeChart = hotChart.filter((c) => c.artistId === 'player').slice(0, 3);
  const latestTrack = [...playerTracks].reverse()[0];
  const latestPost = socialFeed[0];
  const weekInYear = ((state.week - 1) % 52) + 1;
  const nextMove = unreleased.length ? 'Finish and release your next record' : playerTracks.length ? 'Build hype for your next single' : 'Record your debut single';

  return (
    <div className="career-home space-y-5 sm:space-y-6">
      <section className="career-hero">
        <img src={portrait.src} alt="" className="career-hero__image" referrerPolicy="no-referrer" />
        <div className="career-hero__shade" />
        <div className="career-hero__content">
          <div className="flex flex-wrap items-center gap-2">
            <span className="career-eyebrow"><span className="career-live-dot" /> ARTIST CAREER</span>
            <span className="career-season">YEAR {state.year} · WEEK {weekInYear}</span>
          </div>
          <p className="mt-4 text-sm font-semibold text-amber-200">{artist.city} · {artist.genre}</p>
          <h1 className="career-artist-name">{artist.name}</h1>
          <p className="career-artist-subtitle">{artist.archetype} <span>•</span> {artist.labelContract ? artist.labelContract.labelName : 'Independent artist'}</p>
          <div className="career-hero__actions">
            <button className="career-primary-action" onClick={() => onNavigate('studio')}><Mic2 size={17}/> Open the studio <ArrowUpRight size={16}/></button>
            <button className="career-secondary-action" onClick={() => onNavigate('social')}><Radio size={16}/> Make some noise</button>
          </div>
        </div>
        <div className="career-hero__rank">
          <span>CAREER PEAK</span>
          <strong>{artist.peakChartPosition ? `#${artist.peakChartPosition}` : '—'}</strong>
          <small>Global Hot 50</small>
        </div>
      </section>

      <section className="career-stat-strip" aria-label="Career stats">
        <div className="career-stat"><span className="career-stat__icon"><Wallet size={17}/></span><div><small>Cash</small><strong className={artist.cash < 0 ? 'text-red-300' : ''}>{formatCash(artist.cash)}</strong></div></div>
        <div className="career-stat"><span className="career-stat__icon"><Headphones size={17}/></span><div><small>Monthly listeners</small><strong>{formatCompact(artist.monthlyListeners)}</strong></div></div>
        <div className="career-stat"><span className="career-stat__icon"><Users size={17}/></span><div><small>Followers</small><strong>{formatCompact(artist.followers)}</strong></div></div>
        <div className="career-stat"><span className="career-stat__icon"><Flame size={17}/></span><div><small>Hype</small><strong>{artist.hype}<em>/100</em></strong></div></div>
      </section>

      <section className="career-home-grid">
        <div className="career-panel career-next-move">
          <div className="career-panel__heading"><div><span className="career-section-kicker">YOUR CAREER</span><h2>What’s next?</h2></div><span className="career-week-badge">W{weekInYear}</span></div>
          <p className="career-next-move__lead">{nextMove}</p>
          <p className="career-muted-copy">{unreleased.length ? `You have ${unreleased.length} master${unreleased.length === 1 ? '' : 's'} in your vault waiting for the right moment.` : 'Make a move this week. Every session, release and connection can change your trajectory.'}</p>
          <div className="career-action-list">
            <button onClick={() => onNavigate('studio')}><span className="career-action-icon"><Mic2 size={18}/></span><span><strong>Recording studio</strong><small>Create, mix and release music</small></span><ArrowUpRight size={17}/></button>
            <button onClick={() => onNavigate('tour')}><span className="career-action-icon"><CalendarDays size={18}/></span><span><strong>Book a show</strong><small>Take your music to the stage</small></span><ArrowUpRight size={17}/></button>
            <button onClick={() => onNavigate('business')}><span className="career-action-icon"><Award size={18}/></span><span><strong>Build your team</strong><small>Labels, crew and career upgrades</small></span><ArrowUpRight size={17}/></button>
          </div>
          <div className="career-energy"><span><Zap size={15}/> Weekly energy</span><div className="career-energy__bars">{Array.from({length: artist.maxEnergy}, (_, i) => <i key={i} className={i < artist.energy ? 'is-filled' : ''}/>)}</div><strong>{artist.energy}/{artist.maxEnergy}</strong></div>
        </div>

        <div className="career-panel career-spotlight">
          <div className="career-panel__heading"><div><span className="career-section-kicker">THE SPOTLIGHT</span><h2>Your music</h2></div><button className="career-text-link" onClick={() => onNavigate('charts')}>Charts <ArrowUpRight size={14}/></button></div>
          {activeChart.length ? <div className="career-chart-list">{activeChart.map((entry) => <div className="career-chart-row" key={entry.trackId}><span className="career-chart-rank">#{entry.rank}</span><div className="career-chart-cover"><Disc3 size={20}/></div><div className="career-chart-info"><strong>{entry.title}</strong><small>{formatCompact(entry.weeklyStreams)} streams this week</small></div><TrendingUp size={16} className="text-emerald-300"/></div>)}</div> : <div className="career-empty-music"><div className="career-vinyl"><Disc3 size={30}/></div><strong>Your first hit is waiting.</strong><p>Record a track, find your sound and release it to the world.</p><button onClick={() => onNavigate('studio')}>Make your first record <ArrowUpRight size={15}/></button></div>}
          <div className="career-mini-summary"><div><small>In your vault</small><strong>{unreleased.length} <em>unreleased</em></strong></div><div><small>Number-one hits</small><strong>{artist.numberOneHits}</strong></div><div><small>Total streams</small><strong>{formatCompact(artist.totalStreams)}</strong></div></div>
        </div>
      </section>

      <section className="career-home-grid career-home-grid--lower">
        <div className="career-panel">
          <div className="career-panel__heading"><div><span className="career-section-kicker">WEEKLY RECAP</span><h2>{lastDigest ? `Week ${lastDigest.week} in review` : 'Your story starts here'}</h2></div></div>
          {lastDigest ? <><div className="career-recap-metrics"><div><small>Streams</small><strong>{formatCompact(lastDigest.streamsEarned)}</strong></div><div><small>Royalties</small><strong className="text-emerald-300">+{formatCash(lastDigest.royaltiesEarned)}</strong></div><div><small>Net income</small><strong className={lastDigest.netCashDelta >= 0 ? 'text-emerald-300' : 'text-red-300'}>{lastDigest.netCashDelta >= 0 ? '+' : ''}{formatCash(lastDigest.netCashDelta)}</strong></div></div>{lastDigest.highlights.slice(0, 2).map((h, i) => <p className="career-highlight" key={i}><span>✦</span>{h}</p>)}</> : <p className="career-muted-copy">Every artist starts somewhere. Record your debut, build your audience and let the industry notice.</p>}
        </div>
        <div className="career-panel career-world-panel">
          <div className="career-panel__heading"><div><span className="career-section-kicker">BEHIND THE SCENES</span><h2>Industry pulse</h2></div><button className="career-text-link" onClick={() => onNavigate('industry')}>Explore <ArrowUpRight size={14}/></button></div>
          <div className="career-world-line"><span className="career-world-icon"><Music2 size={17}/></span><div><strong>{latestTrack ? `“${latestTrack.title}”` : 'The debut era begins'}</strong><small>{latestTrack ? (latestTrack.released ? 'Your latest release is out in the world.' : 'A new master is waiting in the vault.') : 'Your first studio session could change everything.'}</small></div></div>
          <div className="career-world-line"><span className="career-world-icon"><Users size={17}/></span><div><strong>{latestPost ? latestPost.authorName : 'The industry is moving'}</strong><small>{latestPost ? latestPost.content : 'Build relationships, find collaborators and watch your rivals.'}</small></div></div>
          <div className="career-career-footer"><span><Headphones size={15}/> {studio.name}</span><span>{lifestyle.name}</span></div>
        </div>
      </section>
    </div>
  );
};
