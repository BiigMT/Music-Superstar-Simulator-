import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Disc3 } from 'lucide-react';
import { ARCHETYPES, ASSETS, CITIES, GENRES } from '../data/worldData';
import { Archetype, Genre } from '../types/game';
import { formatCash, formatCompact } from '../utils/format';

interface CharacterCreateProps {
  onBack: () => void;
  onStart: (params: {
    name: string;
    genre: Genre;
    archetype: Archetype;
    city: string;
    portraitId: string;
  }) => void;
}

export const CharacterCreate: React.FC<CharacterCreateProps> = ({ onBack, onStart }) => {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState<Genre>('Hip-Hop');
  const [archetype, setArchetype] = useState<Archetype>('Street Lyricist');
  const [city, setCity] = useState('Atlanta');
  const [portraitId, setPortraitId] = useState('hiphop');

  const selectedArch = ARCHETYPES[archetype];
  const selectedPortrait = ASSETS.portraits.find((p) => p.id === portraitId) ?? ASSETS.portraits[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      name: name.trim() || 'Aurelia Vance',
      genre,
      archetype,
      city,
      portraitId,
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0D11] px-4 py-8 sm:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#E5A93C]">Artist Debut Setup</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-white">Create Your Artist</h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#13161D] px-4 py-2 text-xs font-medium text-neutral-300 transition-colors hover:border-white/25 hover:text-white whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Portrait Preview & Archetype Summary */}
          <div className="lg:col-span-5 rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-5">
            <div className="aspect-square w-full overflow-hidden rounded-md bg-[#0B0D11] border border-white/10 relative">
              <img
                src={selectedPortrait.src}
                alt={selectedPortrait.label}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
                <p className="text-xs text-[#E5A93C] font-medium">{genre} · {city}</p>
                <p className="text-xl font-bold text-white truncate">
                  {name.trim() || 'Aurelia Vance'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-400">Select Artist Persona</p>
              <div className="grid grid-cols-3 gap-2.5">
                {ASSETS.portraits.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPortraitId(p.id)}
                    className={`group rounded-md border p-1.5 text-left transition-colors ${
                      portraitId === p.id
                        ? 'border-[#E5A93C] bg-[#1C202B]'
                        : 'border-white/10 bg-[#0B0D11] hover:border-white/25'
                    }`}
                  >
                    <img
                      src={p.src}
                      alt={p.label}
                      referrerPolicy="no-referrer"
                      className="aspect-square w-full rounded object-cover"
                    />
                    <span className="mt-1.5 block truncate text-[11px] font-medium text-neutral-300">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Starting Bankroll</span>
                <span className="font-mono-tabular font-semibold text-[#22C55E]">{formatCash(selectedArch.cash)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Monthly Listeners</span>
                <span className="font-mono-tabular font-semibold text-white">{formatCompact(selectedArch.listeners)}</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Initial Hype</span>
                <span className="font-mono-tabular font-semibold text-[#E5A93C]">{selectedArch.hype} / 100</span>
              </div>
            </div>
          </div>

          {/* Right Column: Identity, Genre, Background */}
          <div className="lg:col-span-7 rounded-lg border border-white/10 bg-[#13161D] p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="artist-name" className="block text-xs font-medium text-neutral-300">
                  Stage Name
                </label>
                <input
                  id="artist-name"
                  type="text"
                  maxLength={28}
                  placeholder="e.g. Kairo Vale"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-[#0B0D11] px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-[#E5A93C] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="origin-city" className="block text-xs font-medium text-neutral-300">
                  Home City
                </label>
                <select
                  id="origin-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-[#0B0D11] px-3.5 py-2.5 text-sm text-white focus:border-[#E5A93C] focus:outline-none"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Genre */}
            <div className="space-y-2.5">
              <p className="text-xs font-medium text-neutral-300">Primary Sound & Chart Genre</p>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGenre(g);
                      if (g === 'Hip-Hop' || g === 'R&B') setPortraitId('hiphop');
                      else if (g === 'Pop' || g === 'Electronic') setPortraitId('pop');
                      else setPortraitId('rock');
                    }}
                    className={`rounded-md border px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                      genre === g
                        ? 'border-[#E5A93C] bg-[#E5A93C]/15 text-[#FDE68A]'
                        : 'border-white/10 bg-[#0B0D11] text-neutral-300 hover:border-white/25'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Archetype */}
            <div className="space-y-2.5">
              <p className="text-xs font-medium text-neutral-300">Career Origin Archetype</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(ARCHETYPES) as Archetype[]).map((archKey) => {
                  const info = ARCHETYPES[archKey];
                  const active = archetype === archKey;
                  return (
                    <button
                      key={archKey}
                      type="button"
                      onClick={() => setArchetype(archKey)}
                      className={`rounded-md border p-3.5 text-left transition-colors ${
                        active
                          ? 'border-[#E5A93C] bg-[#1C202B]'
                          : 'border-white/10 bg-[#0B0D11] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white">{archKey}</span>
                        <span className="text-[11px] font-medium text-[#E5A93C] whitespace-nowrap">{info.perk}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">{info.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/10 pt-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Disc3 className="h-4 w-4 text-[#E5A93C] shrink-0" />
                <span>You begin independent with full ownership of your masters.</span>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md bg-[#E5A93C] px-6 py-3 text-sm font-semibold text-[#0B0D11] transition-transform duration-150 hover:bg-[#F0B94E] active:scale-[0.98] whitespace-nowrap shrink-0"
              >
                <span>Launch Career</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
