import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Disc3, Sparkles } from 'lucide-react';
import { ARCHETYPES, ASSETS, CITIES, GENRES } from '../data/worldData';
import { Archetype, Genre } from '../types/game';
import { formatCash, formatCompact } from '../utils/format';

interface CharacterCreateProps {
  onBack: () => void;
  onStart: (params: { name: string; genre: Genre; archetype: Archetype; city: string; portraitId: string }) => void;
}

export const CharacterCreate: React.FC<CharacterCreateProps> = ({ onBack, onStart }) => {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState<Genre>('Hip-Hop');
  const [archetype, setArchetype] = useState<Archetype>('Street Lyricist');
  const [city, setCity] = useState('Atlanta');
  const [portraitId, setPortraitId] = useState('hiphop');
  const selectedArch = ARCHETYPES[archetype];
  const selectedPortrait = ASSETS.portraits.find((p) => p.id === portraitId) ?? ASSETS.portraits[0];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ name: name.trim() || 'Aurelia Vance', genre, archetype, city, portraitId });
  };

  return (
    <div className="ss-create-screen">
      <header className="ss-create-header"><button type="button" onClick={onBack}><ArrowLeft size={17}/> BACK TO TITLE</button><div><Disc3 size={19}/><span>MUSIC SUPERSTAR <small>ARTIST SETUP</small></span></div><span className="ss-step-tag">01 / 01 <b>DEBUT</b></span></header>
      <form onSubmit={submit} className="ss-create-layout">
        <section className="ss-create-preview">
          <div className="ss-preview-top"><span>ARTIST IDENTITY</span><span>PREVIEW / LIVE</span></div>
          <div className="ss-preview-image"><img src={selectedPortrait.src} alt={selectedPortrait.label} referrerPolicy="no-referrer"/><div className="ss-preview-fade"/><div className="ss-preview-name"><small>{city.toUpperCase()} / {genre.toUpperCase()}</small><h2>{name.trim() || 'YOUR STAGE NAME'}</h2><span>{archetype.toUpperCase()}</span></div></div>
          <div className="ss-portrait-select"><label>CHOOSE YOUR LOOK</label><div>{ASSETS.portraits.map(p=><button type="button" key={p.id} className={portraitId===p.id?'selected':''} onClick={()=>setPortraitId(p.id)} title={p.label}><img src={p.src} alt={p.label} referrerPolicy="no-referrer"/></button>)}</div></div>
          <div className="ss-starting-stats"><div><small>STARTING CASH</small><strong>{formatCash(selectedArch.cash)}</strong></div><div><small>MONTHLY LISTENERS</small><strong>{formatCompact(selectedArch.listeners)}</strong></div><div><small>INITIAL HYPE</small><strong>{selectedArch.hype}<i>/100</i></strong></div></div>
        </section>
        <section className="ss-create-form">
          <div className="ss-form-heading"><div><span>YOUR STORY, YOUR SOUND</span><h1>Build your artist.</h1></div><Sparkles size={22}/></div>
          <div className="ss-form-field"><label htmlFor="artist-name">STAGE NAME</label><input id="artist-name" maxLength={28} placeholder="Enter your artist name" value={name} onChange={e=>setName(e.target.value)}/></div>
          <div className="ss-form-field"><label htmlFor="origin-city">HOMETOWN</label><select id="origin-city" value={city} onChange={e=>setCity(e.target.value)}>{CITIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <div className="ss-form-field"><label>CHOOSE YOUR SOUND</label><div className="ss-genre-grid">{GENRES.map(g=><button type="button" key={g} className={genre===g?'selected':''} onClick={()=>{setGenre(g);if(g==='Hip-Hop'||g==='R&B')setPortraitId('hiphop');else if(g==='Pop'||g==='Electronic')setPortraitId('pop');else setPortraitId('rock')}}>{g}</button>)}</div></div>
          <div className="ss-form-field"><label>YOUR BEGINNING</label><div className="ss-origin-list">{(Object.keys(ARCHETYPES) as Archetype[]).map(a=>{const info=ARCHETYPES[a];return <button type="button" key={a} className={archetype===a?'selected':''} onClick={()=>setArchetype(a)}><span><strong>{a}</strong><small>{info.subtitle}</small></span><b>{info.perk}</b></button>})}</div></div>
          <div className="ss-create-bottom"><span><Disc3 size={14}/> INDEPENDENT. YOUR MASTERS. YOUR MOVE.</span><button type="submit">START YOUR ERA <ArrowUpRight size={17}/></button></div>
        </section>
      </form>
    </div>
  );
};
