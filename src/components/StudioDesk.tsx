import React, { useEffect, useState } from 'react';
import { Disc3, Film, Flame, Mic2, Play, Sliders, Square, Volume2, Wand2 } from 'lucide-react';
import { synth } from '../audio/synthEngine';
import {
  ALBUM_COVER_STYLES,
  GENRE_MIX_TARGETS,
  PLAYER_TITLE_SUGGESTIONS,
  PRODUCERS,
  SONG_THEMES,
  STUDIO_TIERS,
} from '../data/worldData';
import { calculateMixScore } from '../engine/simulation';
import { GameState, MixSettings, SongTheme } from '../types/game';
import { formatCash, formatCompact } from '../utils/format';

interface StudioDeskProps {
  state: GameState;
  onProduceTrack: (params: {
    title: string;
    theme: SongTheme;
    producerId: string;
    mix: MixSettings;
    featuredRivalId: string | null;
    dissTargetId: string | null;
    coverIndex: number;
  }) => void;
  onReleaseSingle: (trackId: string) => void;
  onShootVideo: (trackId: string, tier: 'indie' | 'cinematic') => void;
  onReleaseProject: (params: {
    title: string;
    format: 'EP' | 'Album';
    trackIds: string[];
    coverIndex: number;
  }) => void;
}

export const StudioDesk: React.FC<StudioDeskProps> = ({
  state,
  onProduceTrack,
  onReleaseSingle,
  onShootVideo,
  onReleaseProject,
}) => {
  const { artist, tracks, rivals } = state;
  const studio = STUDIO_TIERS[artist.studioLevel] ?? STUDIO_TIERS[0];

  const suggestions = PLAYER_TITLE_SUGGESTIONS[artist.genre];
  const [title, setTitle] = useState(suggestions[0]);
  const [theme, setTheme] = useState<SongTheme>('Rise & Ambition');
  const [producerId, setProducerId] = useState('self');
  const [featuredRivalId, setFeaturedRivalId] = useState<string>('');
  const [dissTargetId, setDissTargetId] = useState<string>('');
  const [coverIndex, setCoverIndex] = useState(0);
  const [mix, setMix] = useState<MixSettings>({ bass: 72, drums: 72, melody: 70, vocals: 74 });
  const [isPlayingBeat, setIsPlayingBeat] = useState(false);

  // Project Packager State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectFormat, setProjectFormat] = useState<'EP' | 'Album'>('EP');
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  const selectedProducer = PRODUCERS.find((p) => p.id === producerId) ?? PRODUCERS[0];
  const liveMixScore = calculateMixScore(artist.genre, mix);
  const targetMix = GENRE_MIX_TARGETS[artist.genre];

  const featuredRival = rivals.find((r) => r.id === featuredRivalId);
  const featureCost = featuredRival
    ? featuredRival.relationship >= 60
      ? 0
      : Math.round(Math.max(1500, featuredRival.monthlyListeners * 0.0035))
    : 0;
  const totalSessionCost = selectedProducer.cost + featureCost;

  const playerTracks = tracks.filter((t) => t.artistId === 'player');
  const packagableTracks = playerTracks.filter((t) => !t.albumId);

  useEffect(() => {
    synth.updateBeatPreviewParams(artist.genre, mix);
  }, [artist.genre, mix]);

  useEffect(() => {
    return () => {
      synth.stopBeatPreview();
    };
  }, []);

  const toggleBeatPreview = () => {
    if (isPlayingBeat) {
      synth.stopBeatPreview();
      setIsPlayingBeat(false);
    } else {
      synth.startBeatPreview(artist.genre, selectedProducer.bpm, mix);
      setIsPlayingBeat(true);
    }
  };

  const handleRandomTitle = () => {
    const pick = suggestions[Math.floor(Math.random() * suggestions.length)];
    setTitle(pick);
  };

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    synth.stopBeatPreview();
    setIsPlayingBeat(false);
    onProduceTrack({
      title,
      theme,
      producerId,
      mix,
      featuredRivalId: featuredRivalId || null,
      dissTargetId: theme === 'Diss / Confrontation' && dissTargetId ? dissTargetId : null,
      coverIndex,
    });
    const nextSug = suggestions[(suggestions.indexOf(title) + 1) % suggestions.length];
    setTitle(nextSug);
  };

  const toggleProjectTrack = (id: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReleaseProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReleaseProject({
      title: projectTitle || `${artist.name} — ${projectFormat}`,
      format: projectFormat,
      trackIds: selectedTrackIds,
      coverIndex,
    });
    setSelectedTrackIds([]);
    setProjectTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Songwriting & Producer Setup */}
        <form
          onSubmit={handleRecord}
          className="xl:col-span-7 rounded-lg border border-white/10 bg-[#13161D] p-5 sm:p-6 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Recording & Mastering Booth</h2>
              <p className="text-xs text-neutral-400">
                {studio.name} (Max Raw Cap {studio.qualityCap}) · Costs 1 Energy AP
              </p>
            </div>
            <span className="font-mono-tabular text-xs font-semibold text-[#E5A93C]">
              Session Fee: {totalSessionCost === 0 ? 'Free' : formatCash(totalSessionCost)}
            </span>
          </div>

          {/* Track Title & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="track-title" className="block text-xs font-medium text-neutral-300">
                Song Title
              </label>
              <div className="flex gap-2">
                <input
                  id="track-title"
                  type="text"
                  maxLength={36}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 rounded-md border border-white/15 bg-[#0B0D11] px-3 py-2 text-sm text-white focus:border-[#E5A93C] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleRandomTitle}
                  className="rounded-md border border-white/15 bg-[#0B0D11] px-3 py-2 text-neutral-300 hover:border-[#E5A93C] hover:text-white"
                  title="Suggest Title"
                >
                  <Wand2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="track-theme" className="block text-xs font-medium text-neutral-300">
                Lyrical Theme
              </label>
              <select
                id="track-theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value as SongTheme)}
                className="w-full rounded-md border border-white/15 bg-[#0B0D11] px-3 py-2 text-sm text-white focus:border-[#E5A93C] focus:outline-none"
              >
                {SONG_THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Diss Target (conditional) */}
          {theme === 'Diss / Confrontation' && (
            <div className="rounded-md border border-[#EF4444]/30 bg-[#EF4444]/10 p-3.5 space-y-2">
              <label htmlFor="diss-target" className="flex items-center gap-2 text-xs font-semibold text-[#FCA5A5]">
                <Flame className="h-4 w-4 text-[#EF4444]" />
                <span>Name a Rival Artist to Diss (Sparks Public Feud & Viral Attention)</span>
              </label>
              <select
                id="diss-target"
                value={dissTargetId}
                onChange={(e) => setDissTargetId(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-[#0B0D11] px-3 py-2 text-sm text-white focus:border-[#EF4444] focus:outline-none"
              >
                <option value="">General Industry Shots (No Specific Target)</option>
                {rivals.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.genre} · {formatCompact(r.monthlyListeners)} listeners)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Producer & Feature Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="producer-select" className="block text-xs font-medium text-neutral-300">
                Beat & Producer
              </label>
              <select
                id="producer-select"
                value={producerId}
                onChange={(e) => setProducerId(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-[#0B0D11] px-3 py-2 text-sm text-white focus:border-[#E5A93C] focus:outline-none"
              >
                {PRODUCERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.cost === 0 ? 'Free' : formatCash(p.cost)} (+{p.qualityBonus} Qual)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-400">{selectedProducer.description}</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="feature-select" className="block text-xs font-medium text-neutral-300">
                Guest Feature (Optional)
              </label>
              <select
                id="feature-select"
                value={featuredRivalId}
                onChange={(e) => setFeaturedRivalId(e.target.value)}
                className="w-full rounded-md border border-white/15 bg-[#0B0D11] px-3 py-2 text-sm text-white focus:border-[#E5A93C] focus:outline-none"
              >
                <option value="">Solo Record (No Feature)</option>
                {rivals.map((r) => {
                  const fee = r.relationship >= 60 ? 0 : Math.round(Math.max(1500, r.monthlyListeners * 0.0035));
                  return (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.genre}) — {fee === 0 ? 'Free Ally Verse' : formatCash(fee)}
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-neutral-400">
                Allied artists (60+ relationship) drop free verses and cross-promote.
              </p>
            </div>
          </div>

          {/* Interactive 4-Band Mixing Console */}
          <div className="rounded-md border border-white/10 bg-[#0B0D11] p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#E5A93C]" />
                <span className="text-xs font-semibold text-white">
                  Interactive Mastering Console ({artist.genre} Sweet Spot)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono-tabular text-xs font-semibold text-[#22C55E]">
                  Mix Bonus: +{liveMixScore} / 12 Quality
                </span>
                <button
                  type="button"
                  onClick={toggleBeatPreview}
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    isPlayingBeat
                      ? 'bg-[#E5A93C] text-[#0B0D11]'
                      : 'border border-white/15 bg-[#13161D] text-neutral-200 hover:border-[#E5A93C]'
                  }`}
                >
                  {isPlayingBeat ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
                  <span>{isPlayingBeat ? 'Stop Beat' : 'Audition Beat'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {(['bass', 'drums', 'melody', 'vocals'] as (keyof MixSettings)[]).map((band) => {
                const val = mix[band];
                const ideal = targetMix[band];
                const inPocket = Math.abs(val - ideal) <= 10;
                return (
                  <div key={band} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-neutral-300 font-medium">{band}</span>
                      <span className={`font-mono-tabular ${inPocket ? 'text-[#22C55E]' : 'text-neutral-400'}`}>
                        {val}% {inPocket ? '· Balanced' : ''}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={val}
                      onChange={(e) => setMix({ ...mix, [band]: Number(e.target.value) })}
                      className="console-fader w-full"
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-[#E5A93C] shrink-0" />
              <span>Dial each channel into the {artist.genre} sweet-spot pocket for up to +12 bonus Track Quality.</span>
            </p>
          </div>

          {/* Cover Pressing Color + Submit */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 mr-1">Sleeve:</span>
              {ALBUM_COVER_STYLES.map((style, idx) => (
                <button
                  key={style.label}
                  type="button"
                  onClick={() => setCoverIndex(idx)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    coverIndex === idx ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: style.ring }}
                  title={style.label}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={artist.energy < 1 || artist.cash < totalSessionCost}
              className="inline-flex items-center gap-2 rounded-md bg-[#E5A93C] px-6 py-3 text-sm font-semibold text-[#0B0D11] transition-transform hover:bg-[#F0B94E] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Mic2 className="h-4 w-4" />
              <span>Record Master (1 AP)</span>
            </button>
          </div>
        </form>

        {/* Right: Studio Vault & Album / EP Packager */}
        <div className="xl:col-span-5 space-y-6">
          {/* Vault Tracks List */}
          <div className="rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">Master Tape Vault</h3>
              <span className="font-mono-tabular text-xs text-neutral-400">{playerTracks.length} Tracks</span>
            </div>

            {playerTracks.length === 0 ? (
              <p className="text-xs text-neutral-400 py-6 text-center">
                Your master vault is empty. Record your first single on the console.
              </p>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {playerTracks.map((trk) => (
                  <div
                    key={trk.id}
                    className="rounded-md border border-white/10 bg-[#0B0D11] p-3.5 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {trk.title}
                          {trk.featuredArtistName ? ` (feat. ${trk.featuredArtistName})` : ''}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {trk.producerName} · Quality <span className="text-[#E5A93C] font-mono-tabular font-semibold">{trk.quality}</span>/100
                          {trk.hasMusicVideo ? ' · Music Video' : ''}
                        </p>
                      </div>
                      <span className={`font-mono-tabular text-[11px] font-semibold shrink-0 ${trk.released ? 'text-[#22C55E]' : 'text-neutral-400'}`}>
                        {trk.released ? (trk.chartPosition ? `#${trk.chartPosition}` : 'Live') : 'Vault'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {!trk.released && (
                        <button
                          type="button"
                          onClick={() => onReleaseSingle(trk.id)}
                          className="rounded bg-[#E5A93C] px-3 py-1.5 text-xs font-semibold text-[#0B0D11] hover:bg-[#F0B94E]"
                        >
                          Release as Single
                        </button>
                      )}

                      {!trk.hasMusicVideo && (
                        <>
                          <button
                            type="button"
                            onClick={() => onShootVideo(trk.id, 'indie')}
                            disabled={artist.energy < 1 || artist.cash < 2200}
                            className="inline-flex items-center gap-1 rounded border border-white/15 bg-[#13161D] px-2.5 py-1.5 text-[11px] font-medium text-neutral-200 hover:border-[#E5A93C] disabled:opacity-40"
                          >
                            <Film className="h-3 w-3 text-[#E5A93C]" />
                            <span>Indie Video ($2.2k)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onShootVideo(trk.id, 'cinematic')}
                            disabled={artist.energy < 1 || artist.cash < 14000}
                            className="inline-flex items-center gap-1 rounded border border-white/15 bg-[#13161D] px-2.5 py-1.5 text-[11px] font-medium text-neutral-200 hover:border-[#E5A93C] disabled:opacity-40"
                          >
                            <Film className="h-3 w-3 text-[#E5A93C]" />
                            <span>Cinema Video ($14k)</span>
                          </button>
                        </>
                      )}

                      {trk.released && (
                        <span className="font-mono-tabular text-[11px] text-neutral-400 ml-auto">
                          {formatCompact(trk.totalStreams)} streams
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EP / Album Packager */}
          <form onSubmit={handleReleaseProjectSubmit} className="rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Disc3 className="h-4 w-4 text-[#E5A93C]" />
                <h3 className="text-base font-semibold text-white">Package EP or Studio Album</h3>
              </div>
              <div className="flex rounded-md border border-white/10 bg-[#0B0D11] p-0.5 text-xs">
                {(['EP', 'Album'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setProjectFormat(fmt)}
                    className={`rounded px-2.5 py-1 font-medium transition-colors ${
                      projectFormat === fmt ? 'bg-[#E5A93C] text-[#0B0D11]' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder={`${projectFormat} Title (e.g. Midnight Tape)`}
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full rounded-md border border-white/15 bg-[#0B0D11] px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-[#E5A93C] focus:outline-none"
            />

            <p className="text-xs text-neutral-400">
              Select at least <span className="text-white font-semibold">{projectFormat === 'EP' ? 3 : 6} tracks</span> ({selectedTrackIds.length} selected):
            </p>

            {packagableTracks.length === 0 ? (
              <p className="text-xs text-neutral-500">Record tracks first to assemble a project.</p>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {packagableTracks.map((t) => {
                  const checked = selectedTrackIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleProjectTrack(t.id)}
                      className={`w-full flex items-center justify-between rounded px-3 py-2 text-xs border transition-colors ${
                        checked
                          ? 'border-[#E5A93C] bg-[#E5A93C]/10 text-white'
                          : 'border-white/10 bg-[#0B0D11] text-neutral-300 hover:border-white/25'
                      }`}
                    >
                      <span className="truncate">{t.title}</span>
                      <span className="font-mono-tabular text-[#E5A93C] shrink-0 ml-2">Q{t.quality}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              disabled={selectedTrackIds.length < (projectFormat === 'EP' ? 3 : 6)}
              className="w-full rounded-md bg-white/10 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#E5A93C] hover:text-[#0B0D11] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Release {projectFormat} Worldwide
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
