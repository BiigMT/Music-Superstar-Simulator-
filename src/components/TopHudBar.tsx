import React from 'react';
import { FastForward, Pause, Volume2, VolumeX, Zap, Users, Flame, Wallet } from 'lucide-react';
import { GameState } from '../types/game';
import { formatCash, formatCompact } from '../utils/format';
interface TopHudBarProps { state: GameState; muted: boolean; onToggleMute: () => void; onPause: () => void; onAdvanceWeek: () => void; }
export const TopHudBar: React.FC<TopHudBarProps> = ({ state, muted, onToggleMute, onPause, onAdvanceWeek }) => {
 const { artist, week, year } = state; const weekInYear = ((week - 1) % 52) + 1;
 return <header className="career-topbar">
  <div className="career-topbar__identity"><div className="career-brand-mark">MW<span>•</span></div><div className="career-topbar__artist"><strong>{artist.name}</strong><small>{artist.genre} <span>·</span> {artist.labelContract ? artist.labelContract.labelName : 'Independent'}</small></div></div>
  <div className="career-topbar__season"><span>CAREER TIMELINE</span><strong>YEAR {year} <i> / </i> WEEK {weekInYear}</strong></div>
  <div className="career-topbar__metrics">
   <div><small><Wallet size={11}/> Cash</small><strong className={artist.cash < 0 ? 'is-negative' : ''}>{formatCash(artist.cash)}</strong></div>
   <div><small><Users size={11}/> Fans</small><strong>{formatCompact(artist.followers)}</strong></div>
   <div><small><Flame size={11}/> Hype</small><strong className="hud-hype">{artist.hype}%</strong></div>
   <div className="career-topbar__energy"><small><Zap size={11}/> Energy</small><strong><Zap size={12}/>{artist.energy}/{artist.maxEnergy}</strong></div>
  </div>
  <div className="career-topbar__controls"><button type="button" onClick={onToggleMute} aria-label={muted ? 'Unmute audio' : 'Mute audio'} title={muted ? 'Unmute (M)' : 'Mute (M)'}>{muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}</button><button type="button" onClick={onPause} aria-label="Pause and save" title="Pause / Save (Esc)"><Pause size={17}/></button><button type="button" className="career-advance-button" onClick={onAdvanceWeek}><span>Next week</span><FastForward size={16}/></button></div>
 </header>;
};
