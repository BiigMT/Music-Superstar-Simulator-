import React, { useEffect } from 'react';
import { ArrowUpRight, Disc3, Play, Plus, Volume2, VolumeX } from 'lucide-react';
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

export const TitleScreen: React.FC<TitleScreenProps> = ({ savedGame, muted, onToggleMute, onNewCareer, onContinueCareer }) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        savedGame ? onContinueCareer() : onNewCareer();
      } else if (e.key.toLowerCase() === 'm') onToggleMute();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [savedGame, onContinueCareer, onNewCareer, onToggleMute]);

  const week = savedGame ? ((savedGame.week - 1) % 52) + 1 : 1;
  return (
    <div className="ss-title-screen">
      <div className="ss-title-grain" aria-hidden="true"/>
      <header className="ss-title-header">
        <div className="ss-title-brand"><span className="ss-brand-disc"><Disc3 size={19}/></span><div><strong>MS<span>®</span></strong><small>CAREER SIMULATION</small></div></div>
        <button className="ss-audio-toggle" onClick={onToggleMute} aria-label={muted ? 'Unmute audio' : 'Mute audio'}>{muted ? <VolumeX size={16}/> : <Volume2 size={16}/>}<span>{muted ? 'SOUND OFF' : 'SOUND ON'}</span></button>
      </header>
      <main className="ss-title-content">
        <div className="ss-title-copy">
          <div className="ss-eyebrow"><i/> THE INDUSTRY IS YOURS TO TAKE</div>
          <h1><span>MUSIC</span><em>SUPERSTAR</em><small>SIMULATOR</small></h1>
          <p>From bedroom demos to sold-out arenas.<br/>Every move builds your legacy.</p>
          <div className="ss-title-actions">
            {savedGame && <button className="ss-primary-button" onClick={onContinueCareer}><Play size={17} fill="currentColor"/> CONTINUE CAREER <ArrowUpRight size={16}/></button>}
            <button className={savedGame ? 'ss-secondary-button' : 'ss-primary-button'} onClick={onNewCareer}>{savedGame ? <Plus size={17}/> : <Play size={17} fill="currentColor"/>}{savedGame ? ' START NEW CAREER' : ' CREATE YOUR ARTIST'}<ArrowUpRight size={16}/></button>
          </div>
        </div>
        <div className="ss-title-art" aria-hidden="true">
          <img src={ASSETS.titleBackdrop} alt="" referrerPolicy="no-referrer"/>
          <div className="ss-art-overlay"/>
          <div className="ss-art-label"><span>01 / THE FIRST RECORD</span><strong>MAKE<br/>HISTORY.</strong><i>YOUR ERA STARTS HERE</i></div>
          <div className="ss-art-stamp">EST.<br/>2026</div>
        </div>
      </main>
      <footer className="ss-title-footer">
        <div><span>01</span> BUILD YOUR SOUND <b>—</b> <span>02</span> OWN THE CHARTS <b>—</b> <span>03</span> LEAVE A LEGACY</div>
        {savedGame && <section className="ss-save-strip"><div className="ss-save-status"><i/> AUTOSAVE FOUND</div><strong>{savedGame.artist.name}</strong><span>{savedGame.artist.genre} / {savedGame.artist.city}</span><span>Y{savedGame.year} · W{week}</span><b>{formatCash(savedGame.artist.cash)}</b><small>{formatCompact(savedGame.artist.monthlyListeners)} listeners</small></section>}
      </footer>
    </div>
  );
};
