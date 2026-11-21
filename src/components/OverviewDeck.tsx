import React from 'react';
import {
  ArrowUpRight, Award, CalendarDays, Disc3, Flame, Headphones,
  Mic2, Music2, Radio, TrendingUp, Users, Wallet, Zap, Star
} from 'lucide-react';
import { ASSETS, LIFESTYLE_TIERS, STUDIO_TIERS } from '../data/worldData';
import { GameState, NavTab } from '../types/game';
import { formatCash, formatCompact } from '../utils/format';

interface OverviewDeckProps {
  state: GameState;
  onNavigate: (tab: NavTab) => void;
}

export const OverviewDeck: React.FC<OverviewDeckProps> = ({ state, onNavigate }) => {
  const { artist, lastDigest, hotChart, tracks, socialFeed } = state;
  const portrait = ASSETS.portraits.find((p) => p.id === artist.portraitId) ?? ASSETS.portraits[0];
  const studio = STUDIO_TIERS[artist.studioLevel] ?? STUDIO_TIERS[0];
  const lifestyle = LIFESTYLE_TIERS[artist.lifestyleLevel] ?? LIFESTYLE_TIERS[0];
  const playerTracks = tracks.filter((t) => t.artistId === 'player');
  const unreleased = playerTracks.filter((t) => !t.released);
  const activeChart = hotChart.filter((c) => c.artistId === 'player').slice(0, 3);
  const latestTrack = [...playerTracks].reverse()[0];
  const latestPost = socialFeed[0];
  const weekInYear = ((state.week - 1) % 52) + 1;
  const nextMove = unreleased.length ? 'Release your next record' : playerTracks.length ? 'Build hype for your next single' : 'Record your debut single';

  return (
    <div className="career-home ms-dashboard">
      <div className="ms-dashboard-topline">
        <div><span className="ms-overline">CAREER HUB</span><strong>{artist.city} <i>·</i> {artist.genre}</strong></div>
        <div className="ms-date-chip"><CalendarDays size={14}/><span>YEAR {state.year} <b>W{weekInYear}</b></span></div>
      </div>

      <section className="ms-artist-card">
        <div className="ms-portrait-wrap">
          <div className="ms-portrait-glow"/>
          <img src={portrait.src} alt={artist.name} className="ms-portrait" referrerPolicy="no-referrer"/>
          <div className="ms-portrait-label"><span className="career-live-dot"/> YOUR ARTIST</div>
        </div>
        <div className="ms-artist-details">
          <span className="ms-overline">THE RISE OF</span>
          <h1>{artist.name}</h1>
          <p>{artist.archetype} <span>·</span> {artist.labelContract ? artist.labelContract.labelName : 'Independent artist'}</p>
          <div className="ms-fame-row"><div className="ms-fame-ring"><Star size={18}/></div><div><strong>{artist.hype}<small>/100</small></strong><span>HYPE & REPUTATION</span></div></div>
          <div className="ms-popularity"><div className="ms-popularity-label"><span>POPULARITY</span><strong>{formatCompact(artist.followers)} <small>FANS</small></strong></div><div className="ms-meter"><i style={{width:`${Math.min(100,Math.max(2,artist.hype))}%`}}/></div></div>
          <div className="ms-artist-actions">
            <button className="ms-action-primary" onClick={() => onNavigate('studio')}><Mic2 size={16}/> OPEN STUDIO <ArrowUpRight size={15}/></button>
            <button className="ms-action-secondary" onClick={() => onNavigate('social')}><Radio size={15}/> PROMOTE</button>
          </div>
        </div>
      </section>

      <section className="ms-two-stats">
        <button className="ms-info-tile" onClick={() => onNavigate('business')}><div><strong className="ms-stat-purple">{formatCash(artist.cash)}</strong><span>AVAILABLE CASH</span></div><Wallet size={18}/></button>
        <button className="ms-info-tile" onClick={() => onNavigate('charts')}><div><strong className="ms-stat-teal">{formatCompact(artist.monthlyListeners)}</strong><span>MONTHLY LISTENERS</span></div><Headphones size={18}/></button>
      </section>

      <button className="ms-news-strip" onClick={() => onNavigate('industry')}><span className="ms-news-icon"><Flame size={17}/></span><span className="ms-news-copy"><small>INDUSTRY UPDATE</small><strong>{latestPost ? latestPost.content : 'The music industry is moving. Make your next move.'}</strong></span><ArrowUpRight size={17}/></button>

      <section className="ms-two-stats ms-enrollment-row">
        <button className="ms-enrollment-card" onClick={() => onNavigate('business')}><span className="ms-enrollment-icon"><Award size={19}/></span><div><strong>PRODUCER</strong><small>{studio.name.toUpperCase()}</small></div><ArrowUpRight size={16}/></button>
        <button className="ms-enrollment-card" onClick={() => onNavigate('business')}><span className="ms-enrollment-icon ms-enrollment-blue"><Users size={19}/></span><div><strong>CAREER STATUS</strong><small>{artist.labelContract ? 'SIGNED TO LABEL' : 'INDEPENDENT ARTIST'}</small></div><ArrowUpRight size={16}/></button>
      </section>

      <section className="ms-shortcuts">
        <button onClick={() => onNavigate('studio')}><span className="ms-shortcut-icon"><Mic2 size={21}/></span><strong>STUDIO</strong><small>{unreleased.length} IN VAULT</small></button>
        <button onClick={() => onNavigate('industry')}><span className="ms-shortcut-icon ms-icon-teal"><Users size={21}/></span><strong>ARTISTS</strong><small>NETWORK</small></button>
        <button onClick={() => onNavigate('charts')}><span className="ms-shortcut-icon ms-icon-blue"><TrendingUp size={21}/></span><strong>CHARTS</strong><small>GLOBAL HOT 50</small></button>
        <button onClick={() => onNavigate('social')}><span className="ms-shortcut-icon ms-icon-pink"><Radio size={21}/></span><strong>HYPE</strong><small>{artist.hype}/100</small></button>
      </section>

      <section className="ms-time-card">
        <div className="ms-time-heading"><div><span className="ms-overline">YOUR NEXT MOVE</span><h2>{nextMove}</h2></div><span className="ms-week-badge">W{weekInYear}</span></div>
        <p>{unreleased.length ? `You have ${unreleased.length} mastered track${unreleased.length === 1 ? '' : 's'} ready for release.` : 'Every session, release and connection can change your career. Spend your energy wisely.'}</p>
        <div className="ms-time-actions"><button onClick={() => onNavigate('studio')}><Mic2 size={15}/> RECORD</button><button onClick={() => onNavigate('tour')}><CalendarDays size={15}/> BOOK SHOW</button><button onClick={() => onNavigate('business')}><Award size={15}/> BUSINESS</button></div>
        <div className="ms-energy-line"><span><Zap size={14}/> ENERGY</span><div>{Array.from({length: artist.maxEnergy}, (_, i) => <i key={i} className={i < artist.energy ? 'filled' : ''}/>)}</div><strong>{artist.energy}/{artist.maxEnergy}</strong></div>
      </section>

      <section className="ms-lower-grid">
        <div className="ms-content-card">
          <div className="ms-card-heading"><div><span className="ms-overline">THE SPOTLIGHT</span><h2>Your music</h2></div><button onClick={() => onNavigate('charts')}>CHARTS <ArrowUpRight size={13}/></button></div>
          {activeChart.length ? <div className="ms-chart-list">{activeChart.map((entry) => <div className="ms-chart-row" key={entry.trackId}><span>#{entry.rank}</span><div className="ms-track-art"><Disc3 size={19}/></div><div><strong>{entry.title}</strong><small>{formatCompact(entry.weeklyStreams)} streams this week</small></div><TrendingUp size={15}/></div>)}</div> : <div className="ms-empty-music"><Disc3 size={27}/><strong>Your first hit is waiting.</strong><p>Record your debut and release it to the world.</p><button onClick={() => onNavigate('studio')}>MAKE YOUR FIRST RECORD <ArrowUpRight size={13}/></button></div>}
          <div className="ms-mini-metrics"><div><small>UNRELEASED</small><strong>{unreleased.length}</strong></div><div><small>NO. 1 HITS</small><strong>{artist.numberOneHits}</strong></div><div><small>TOTAL STREAMS</small><strong>{formatCompact(artist.totalStreams)}</strong></div></div>
        </div>
        <div className="ms-content-card">
          <div className="ms-card-heading"><div><span className="ms-overline">WEEKLY RECAP</span><h2>{lastDigest ? `Week ${lastDigest.week}` : 'Your story begins'}</h2></div></div>
          {lastDigest ? <><div className="ms-recap-grid"><div><small>STREAMS</small><strong>{formatCompact(lastDigest.streamsEarned)}</strong></div><div><small>ROYALTIES</small><strong className="ms-stat-teal">+{formatCash(lastDigest.royaltiesEarned)}</strong></div></div>{lastDigest.highlights.slice(0,2).map((h,i)=><p className="ms-highlight" key={i}>✦ {h}</p>)}</> : <p className="ms-recap-copy">Every legend starts with one record. Your first studio session could change everything.</p>}
          <div className="ms-footer-tags"><span><Headphones size={13}/>{studio.name}</span><span>{lifestyle.name}</span></div>
          <div className="ms-last-track"><Music2 size={16}/><div><strong>{latestTrack ? latestTrack.title : 'Debut era begins'}</strong><small>{latestTrack ? (latestTrack.released ? 'Latest release' : 'Waiting in your vault') : 'Start your first recording'}</small></div></div>
        </div>
      </section>
    </div>
  );
};
