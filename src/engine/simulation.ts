import {
  ARCHETYPES,
  CREW_ROSTER,
  GENRES,
  GENRE_MIX_TARGETS,
  INDUSTRY_EVENTS,
  INITIAL_RIVALS,
  LIFESTYLE_TIERS,
  PRODUCERS,
  RECORD_LABELS,
  RIVAL_SONG_TITLES,
  STUDIO_TIERS,
  TOUR_VENUES,
} from '../data/worldData';
import {
  Album,
  AlbumChartEntry,
  Archetype,
  AwardRecord,
  Certification,
  ChartEntry,
  EventChoice,
  GameState,
  Genre,
  MixSettings,
  RivalArtist,
  Skills,
  SocialPost,
  SongTheme,
  TourBooking,
  Track,
} from '../types/game';
import { clamp, formatCompact, uid } from '../utils/format';

const SAVE_KEY = 'platinum_era_save_v1';

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota issues
  }
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore
  }
}

export function computeCertification(units: number): Certification {
  if (units >= 10_000_000) return 'Diamond';
  if (units >= 2_000_000) return 'Multi-Platinum';
  if (units >= 1_000_000) return 'Platinum';
  if (units >= 500_000) return 'Gold';
  return 'None';
}

export function calculateMixScore(genre: Genre, mix: MixSettings): number {
  const target = GENRE_MIX_TARGETS[genre];
  const diff =
    Math.abs(mix.bass - target.bass) +
    Math.abs(mix.drums - target.drums) +
    Math.abs(mix.melody - target.melody) +
    Math.abs(mix.vocals - target.vocals);
  // Max diff is 400, sweet spot is diff <= 30 -> up to +12 quality
  const accuracy = clamp(1 - diff / 140, 0, 1);
  return Math.round(accuracy * 12);
}

function createInitialRivalTracks(rivals: RivalArtist[]): { tracks: Track[]; albums: Album[] } {
  const tracks: Track[] = [];
  const albums: Album[] = [];

  rivals.forEach((rival, rIdx) => {
    const pool = RIVAL_SONG_TITLES[rival.genre];
    const count = 4;
    const albumTrackIds: string[] = [];

    for (let i = 0; i < count; i++) {
      const title = pool[(rIdx * 3 + i) % pool.length];
      const decay = 1 - i * 0.22;
      const weeklyStreams = Math.round(
        rival.monthlyListeners * (0.28 + Math.random() * 0.22) * decay * (rival.hype / 80)
      );
      const totalStreams = weeklyStreams * (2 + i * 3);
      const totalUnits = Math.round(totalStreams / 150);
      const trackId = `rt_${rival.id}_${i}`;
      albumTrackIds.push(trackId);
      tracks.push({
        id: trackId,
        title: i === 0 ? title : `${title} (${i === 1 ? 'Remix' : 'Pt. ' + i})`.replace(' (Pt. 2)', '').replace(' (Pt. 3)', ' II'),
        artistId: rival.id,
        artistName: rival.name,
        genre: rival.genre,
        theme: 'Rise & Ambition',
        producerName: 'Major Studio',
        bpm: 120,
        quality: clamp(rival.skillRating + Math.round((Math.random() - 0.3) * 10), 65, 98),
        mixScore: 9,
        featuredArtistId: null,
        featuredArtistName: null,
        isDissTrack: false,
        dissTargetId: null,
        hasMusicVideo: i === 0,
        albumId: `ra_${rival.id}`,
        released: true,
        releaseWeek: -i * 3,
        weeklyStreams,
        totalStreams,
        totalUnits,
        chartPosition: null,
        peakPosition: null,
        weeksOnChart: 1 + i * 2,
        certification: computeCertification(totalUnits),
        viralScore: 1,
        coverIndex: rIdx % 5,
      });
    }

    const albumUnits = Math.round(rival.monthlyListeners * 0.012);
    albums.push({
      id: `ra_${rival.id}`,
      title: `${rival.name.split(' ')[0]}'s Midnight Era`,
      artistId: rival.id,
      artistName: rival.name,
      genre: rival.genre,
      format: 'Album',
      trackIds: albumTrackIds,
      quality: rival.skillRating,
      released: true,
      releaseWeek: -2,
      weeklyUnits: albumUnits,
      totalUnits: albumUnits * 4,
      chartPosition: null,
      peakPosition: null,
      weeksOnChart: 4,
      certification: computeCertification(albumUnits * 4),
      coverIndex: rIdx % 5,
    });
  });

  // Add extra indie/global filler hits so Hot 50 always has 50 active songs
  GENRES.forEach((g, gIdx) => {
    const titles = RIVAL_SONG_TITLES[g];
    for (let j = 0; j < 2; j++) {
      const rival = rivals[(gIdx * 2 + j) % rivals.length];
      const weeklyStreams = Math.round(180_000 + Math.random() * 550_000);
      tracks.push({
        id: `rf_${g}_${j}`,
        title: titles[(j + 5) % titles.length],
        artistId: rival.id,
        artistName: rival.name,
        genre: g,
        theme: 'Club Anthem',
        producerName: 'Session Master',
        bpm: 126,
        quality: 78 + j * 4,
        mixScore: 8,
        featuredArtistId: null,
        featuredArtistName: null,
        isDissTrack: false,
        dissTargetId: null,
        hasMusicVideo: false,
        albumId: null,
        released: true,
        releaseWeek: -4,
        weeklyStreams,
        totalStreams: weeklyStreams * 4,
        totalUnits: Math.round((weeklyStreams * 4) / 150),
        chartPosition: null,
        peakPosition: null,
        weeksOnChart: 4,
        certification: 'None',
        viralScore: 1,
        coverIndex: (gIdx + j) % 5,
      });
    }
  });

  return { tracks, albums };
}

function buildCharts(
  tracks: Track[],
  albums: Album[],
  prevHot: ChartEntry[],
  prevAlbums: AlbumChartEntry[]
): { hotChart: ChartEntry[]; albumChart: AlbumChartEntry[]; updatedTracks: Track[]; updatedAlbums: Album[] } {
  const prevRankMap = new Map<string, number>();
  prevHot.forEach((e) => prevRankMap.set(e.trackId, e.rank));

  const prevAlbRankMap = new Map<string, number>();
  prevAlbums.forEach((e) => prevAlbRankMap.set(e.albumId, e.rank));

  const releasedTracks = tracks.filter((t) => t.released && t.weeklyStreams > 0);
  releasedTracks.sort((a, b) => b.weeklyStreams - a.weeklyStreams);

  const hotChart: ChartEntry[] = releasedTracks.slice(0, 50).map((t, idx) => {
    const rank = idx + 1;
    const prevRank = prevRankMap.get(t.id) ?? null;
    const newPeak = t.peakPosition === null ? rank : Math.min(t.peakPosition, rank);
    return {
      rank,
      prevRank,
      trackId: t.id,
      title: t.title,
      artistId: t.artistId,
      artistName: t.artistName,
      featuredArtistName: t.featuredArtistName,
      genre: t.genre,
      weeklyStreams: t.weeklyStreams,
      totalStreams: t.totalStreams,
      weeksOnChart: t.weeksOnChart + 1,
      peakPosition: newPeak,
      certification: t.certification,
    };
  });

  const hotRankLookup = new Map<string, ChartEntry>();
  hotChart.forEach((e) => hotRankLookup.set(e.trackId, e));

  const updatedTracks = tracks.map((t) => {
    const entry = hotRankLookup.get(t.id);
    if (!entry) {
      return { ...t, chartPosition: null };
    }
    return {
      ...t,
      chartPosition: entry.rank,
      peakPosition: entry.peakPosition,
      weeksOnChart: entry.weeksOnChart,
    };
  });

  const releasedAlbums = albums.filter((a) => a.released && a.weeklyUnits > 0);
  releasedAlbums.sort((a, b) => b.weeklyUnits - a.weeklyUnits);

  const albumChart: AlbumChartEntry[] = releasedAlbums.slice(0, 20).map((a, idx) => {
    const rank = idx + 1;
    const prevRank = prevAlbRankMap.get(a.id) ?? null;
    const newPeak = a.peakPosition === null ? rank : Math.min(a.peakPosition, rank);
    return {
      rank,
      prevRank,
      albumId: a.id,
      title: a.title,
      artistId: a.artistId,
      artistName: a.artistName,
      genre: a.genre,
      format: a.format,
      weeklyUnits: a.weeklyUnits,
      totalUnits: a.totalUnits,
      weeksOnChart: a.weeksOnChart + 1,
      peakPosition: newPeak,
    };
  });

  const albRankLookup = new Map<string, AlbumChartEntry>();
  albumChart.forEach((e) => albRankLookup.set(e.albumId, e));

  const updatedAlbums = albums.map((a) => {
    const entry = albRankLookup.get(a.id);
    if (!entry) return { ...a, chartPosition: null };
    return {
      ...a,
      chartPosition: entry.rank,
      peakPosition: entry.peakPosition,
      weeksOnChart: entry.weeksOnChart,
    };
  });

  return { hotChart, albumChart, updatedTracks, updatedAlbums };
}

export function createInitialCareer(params: {
  name: string;
  genre: Genre;
  archetype: Archetype;
  city: string;
  portraitId: string;
}): GameState {
  const arch = ARCHETYPES[params.archetype];
  const rivals: RivalArtist[] = INITIAL_RIVALS.map((r) => ({ ...r }));
  const { tracks: rivalTracks, albums: rivalAlbums } = createInitialRivalTracks(rivals);
  const { hotChart, albumChart, updatedTracks, updatedAlbums } = buildCharts(rivalTracks, rivalAlbums, [], []);

  const welcomePost: SocialPost = {
    id: uid('post'),
    week: 1,
    authorId: 'player',
    authorName: params.name,
    handle: `@${params.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'artist'}`,
    isPlayer: true,
    category: 'Fan',
    content: `Day one out of ${params.city}. Locked in the studio working on my first ${params.genre} record.`,
    likes: Math.round(arch.listeners * 0.04),
    reposts: Math.round(arch.listeners * 0.008),
  };

  const chartPost: SocialPost = {
    id: uid('post'),
    week: 1,
    authorId: 'pulse_news',
    authorName: 'ChartPulse Daily',
    handle: '@chartpulsedaily',
    isPlayer: false,
    category: 'Press',
    content: `${hotChart[0]?.artistName ?? 'Nova Lane'} holds #1 on the Global Hot 50 with "${hotChart[0]?.title ?? 'Electric Mirage'}". New voices are rising fast.`,
    likes: 14200,
    reposts: 2940,
  };

  return {
    week: 1,
    year: 1,
    artist: {
      name: params.name.trim() || 'Aurelia',
      genre: params.genre,
      archetype: params.archetype,
      city: params.city,
      portraitId: params.portraitId,
      cash: arch.cash,
      hype: arch.hype,
      reputation: 50,
      monthlyListeners: arch.listeners,
      followers: Math.round(arch.listeners * 0.45),
      energy: 3,
      maxEnergy: 3,
      skills: { ...arch.skills },
      studioLevel: 0,
      lifestyleLevel: 0,
      labelId: 'independent',
      labelContract: null,
      crewIds: [],
      totalStreams: 0,
      totalSales: 0,
      peakChartPosition: null,
      numberOneHits: 0,
    },
    tracks: updatedTracks,
    albums: updatedAlbums,
    rivals,
    hotChart,
    albumChart,
    socialFeed: [welcomePost, chartPost],
    activeTours: [],
    completedToursCount: 0,
    merchLines: [],
    awards: [],
    genreTrends: {
      'Hip-Hop': 1.12,
      'Pop': 1.15,
      'R&B': 1.0,
      'Rock': 0.96,
      'Electronic': 1.04,
    },
    pendingEvent: null,
    lastDigest: null,
    snippetBoostActive: false,
    interviewCooldown: 0,
    retired: false,
    legacyScore: 0,
  };
}

export function produceTrack(
  state: GameState,
  params: {
    title: string;
    theme: SongTheme;
    producerId: string;
    mix: MixSettings;
    featuredRivalId: string | null;
    dissTargetId: string | null;
    coverIndex: number;
  }
): { nextState: GameState; track?: Track; error?: string } {
  const { artist } = state;
  if (artist.energy < 1) {
    return { nextState: state, error: 'Not enough Energy AP this week. Advance the week to recover.' };
  }

  const producer = PRODUCERS.find((p) => p.id === params.producerId) ?? PRODUCERS[0];
  let featureCost = 0;
  let featuredRival: RivalArtist | undefined;

  if (params.featuredRivalId) {
    featuredRival = state.rivals.find((r) => r.id === params.featuredRivalId);
    if (featuredRival) {
      // Feature fee scales with rival listeners unless relationship is very high (>=60)
      featureCost =
        featuredRival.relationship >= 60
          ? 0
          : Math.round(Math.max(1500, featuredRival.monthlyListeners * 0.0035));
    }
  }

  const totalCost = producer.cost + featureCost;
  if (artist.cash < totalCost) {
    return { nextState: state, error: `Insufficient funds. Need $${totalCost.toLocaleString()} for beat & feature.` };
  }

  const studio = STUDIO_TIERS[artist.studioLevel] ?? STUDIO_TIERS[0];
  const hasEngineer = artist.crewIds.includes('engineer');
  const mixScore = calculateMixScore(artist.genre, params.mix);

  const skillAvg =
    artist.skills.songwriting * 0.36 +
    artist.skills.vocals * 0.32 +
    artist.skills.production * 0.32;

  const genreMatchBonus = producer.specialty === artist.genre ? 4 : 0;
  const variance = Math.round((Math.random() - 0.3) * 6);

  const rawQuality =
    26 +
    skillAvg * 0.5 +
    studio.bonus +
    producer.qualityBonus +
    genreMatchBonus +
    (hasEngineer ? 6 : 0) +
    mixScore +
    variance;

  const quality = clamp(Math.round(rawQuality), 24, Math.min(100, studio.qualityCap + (producer.cost > 5000 ? 6 : 0)));

  const newTrack: Track = {
    id: uid('trk'),
    title: params.title.trim() || 'Untitled Master',
    artistId: 'player',
    artistName: artist.name,
    genre: artist.genre,
    theme: params.theme,
    producerName: producer.name,
    bpm: producer.bpm,
    quality,
    mixScore,
    featuredArtistId: featuredRival?.id ?? null,
    featuredArtistName: featuredRival?.name ?? null,
    isDissTrack: Boolean(params.dissTargetId),
    dissTargetId: params.dissTargetId,
    hasMusicVideo: false,
    albumId: null,
    released: false,
    releaseWeek: null,
    weeklyStreams: 0,
    totalStreams: 0,
    totalUnits: 0,
    chartPosition: null,
    peakPosition: null,
    weeksOnChart: 0,
    certification: 'None',
    viralScore: 1,
    coverIndex: params.coverIndex,
  };

  // Improve skills slightly from studio practice
  const nextSkills: Skills = {
    ...artist.skills,
    songwriting: clamp(artist.skills.songwriting + 1, 1, 100),
    production: clamp(artist.skills.production + (producer.id === 'self' ? 2 : 1), 1, 100),
    vocals: clamp(artist.skills.vocals + 1, 1, 100),
  };

  const updatedRivals = state.rivals.map((r) => {
    if (featuredRival && r.id === featuredRival.id) {
      return { ...r, relationship: clamp(r.relationship + 12, -100, 100) };
    }
    return r;
  });

  return {
    track: newTrack,
    nextState: {
      ...state,
      artist: {
        ...artist,
        cash: artist.cash - totalCost,
        energy: artist.energy - 1,
        skills: nextSkills,
      },
      rivals: updatedRivals,
      tracks: [newTrack, ...state.tracks],
    },
  };
}

export function shootMusicVideo(state: GameState, trackId: string, tier: 'indie' | 'cinematic'): { nextState: GameState; error?: string } {
  const cost = tier === 'cinematic' ? 14000 : 2200;
  if (state.artist.energy < 1) {
    return { nextState: state, error: 'Not enough Energy AP this week.' };
  }
  if (state.artist.cash < cost) {
    return { nextState: state, error: `Need $${cost.toLocaleString()} to shoot this video.` };
  }
  const target = state.tracks.find((t) => t.id === trackId && t.artistId === 'player');
  if (!target || target.hasMusicVideo) {
    return { nextState: state, error: 'Track already has a music video.' };
  }

  const videoBoost = tier === 'cinematic' ? 1.55 : 1.28;
  const hypeGain = tier === 'cinematic' ? 11 : 5;

  return {
    nextState: {
      ...state,
      artist: {
        ...state.artist,
        cash: state.artist.cash - cost,
        energy: state.artist.energy - 1,
        hype: clamp(state.artist.hype + hypeGain, 0, 100),
      },
      tracks: state.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              hasMusicVideo: true,
              viralScore: Number((t.viralScore * videoBoost).toFixed(2)),
            }
          : t
      ),
      socialFeed: [
        {
          id: uid('post'),
          week: state.week,
          authorId: 'player',
          authorName: state.artist.name,
          handle: `@${state.artist.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'artist'}`,
          isPlayer: true,
          category: 'Release' as const,
          content: `Official music video for "${target.title}" is wrapped and live! ${tier === 'cinematic' ? 'Big-budget visual era.' : 'Raw street visuals.'}`,
          likes: Math.round(state.artist.followers * 0.08 + 120),
          reposts: Math.round(state.artist.followers * 0.02 + 25),
        },
        ...state.socialFeed,
      ].slice(0, 60),
    },
  };
}

export function releaseSingle(state: GameState, trackId: string): { nextState: GameState; error?: string } {
  const track = state.tracks.find((t) => t.id === trackId && t.artistId === 'player');
  if (!track) return { nextState: state, error: 'Track not found.' };
  if (track.released) return { nextState: state, error: 'Track is already released.' };

  const { artist } = state;
  const labelPromo = artist.labelContract?.promoBonus ?? 1.0;
  const snippetMult = state.snippetBoostActive ? 1.35 : 1.0;
  const trendMult = state.genreTrends[track.genre] ?? 1.0;
  const featRival = track.featuredArtistId ? state.rivals.find((r) => r.id === track.featuredArtistId) : null;
  const featStreams = featRival ? featRival.monthlyListeners * 0.085 : 0;

  const debutStreams = Math.round(
    (artist.monthlyListeners * (0.45 + track.quality / 95) + artist.hype * 900 + featStreams) *
      labelPromo *
      snippetMult *
      trendMult *
      track.viralScore *
      (1 + artist.skills.marketing / 150)
  );

  const hypeGain = Math.round(6 + track.quality / 14 + (track.hasMusicVideo ? 5 : 0) + (featRival ? 7 : 0));
  const newFollowers = Math.round(debutStreams * 0.035);
  const newListeners = Math.round(debutStreams * 0.14);

  let updatedRivals = state.rivals;
  const extraPosts: SocialPost[] = [];

  if (track.isDissTrack && track.dissTargetId) {
    const rival = state.rivals.find((r) => r.id === track.dissTargetId);
    if (rival) {
      updatedRivals = state.rivals.map((r) =>
        r.id === rival.id
          ? { ...r, relationship: clamp(r.relationship - 45, -100, 100), activeFeud: true, hype: clamp(r.hype + 6, 0, 100) }
          : r
      );
      extraPosts.push({
        id: uid('post'),
        week: state.week,
        authorId: rival.id,
        authorName: rival.name,
        handle: `@${rival.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        isPlayer: false,
        category: 'Feud',
        content: `Everybody talking about "${track.title}"... keep that same energy when my response drops.`,
        likes: Math.round(rival.followers * 0.03),
        reposts: Math.round(rival.followers * 0.009),
      });
    }
  }

  const releasePost: SocialPost = {
    id: uid('post'),
    week: state.week,
    authorId: 'player',
    authorName: artist.name,
    handle: `@${artist.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'artist'}`,
    isPlayer: true,
    category: 'Release',
    content: `"${track.title}"${track.featuredArtistName ? ` feat. ${track.featuredArtistName}` : ''} is OUT NOW everywhere.`,
    likes: Math.round(artist.followers * 0.09 + 160),
    reposts: Math.round(artist.followers * 0.025 + 40),
  };

  const nextTracks = state.tracks.map((t) =>
    t.id === trackId
      ? {
          ...t,
          released: true,
          releaseWeek: state.week,
          weeklyStreams: debutStreams,
          totalStreams: debutStreams,
          totalUnits: Math.round(debutStreams / 150),
        }
      : t
  );

  const { hotChart, albumChart, updatedTracks, updatedAlbums } = buildCharts(
    nextTracks,
    state.albums,
    state.hotChart,
    state.albumChart
  );

  const charted = updatedTracks.find((t) => t.id === trackId);
  const peak =
    charted?.chartPosition !== null && charted?.chartPosition !== undefined
      ? artist.peakChartPosition === null
        ? charted.chartPosition
        : Math.min(artist.peakChartPosition, charted.chartPosition)
      : artist.peakChartPosition;

  const hitNumOne = charted?.chartPosition === 1 ? 1 : 0;

  return {
    nextState: {
      ...state,
      artist: {
        ...artist,
        hype: clamp(artist.hype + hypeGain, 0, 100),
        followers: artist.followers + newFollowers,
        monthlyListeners: artist.monthlyListeners + newListeners,
        totalStreams: artist.totalStreams + debutStreams,
        peakChartPosition: peak,
        numberOneHits: artist.numberOneHits + hitNumOne,
      },
      rivals: updatedRivals,
      tracks: updatedTracks,
      albums: updatedAlbums,
      hotChart,
      albumChart,
      snippetBoostActive: false,
      socialFeed: [...extraPosts, releasePost, ...state.socialFeed].slice(0, 60),
    },
  };
}

export function releaseProject(
  state: GameState,
  params: { title: string; format: 'EP' | 'Album'; trackIds: string[]; coverIndex: number }
): { nextState: GameState; error?: string } {
  const selected = state.tracks.filter((t) => params.trackIds.includes(t.id) && t.artistId === 'player' && !t.albumId);
  const minTracks = params.format === 'EP' ? 3 : 6;
  if (selected.length < minTracks) {
    return { nextState: state, error: `A ${params.format} requires at least ${minTracks} tracks not yet on another album.` };
  }

  const { artist } = state;
  const avgQuality = Math.round(selected.reduce((sum, t) => sum + t.quality, 0) / selected.length);
  const labelPromo = artist.labelContract?.promoBonus ?? 1.0;
  const trendMult = state.genreTrends[artist.genre] ?? 1.0;

  const firstWeekUnits = Math.round(
    (artist.monthlyListeners * 0.032 + artist.hype * 260 + avgQuality * 85) *
      (params.format === 'Album' ? 1.45 : 1.0) *
      labelPromo *
      trendMult
  );

  const albumId = uid('alb');
  const newAlbum: Album = {
    id: albumId,
    title: params.title.trim() || `${artist.name} ${params.format}`,
    artistId: 'player',
    artistName: artist.name,
    genre: artist.genre,
    format: params.format,
    trackIds: selected.map((t) => t.id),
    quality: avgQuality,
    released: true,
    releaseWeek: state.week,
    weeklyUnits: firstWeekUnits,
    totalUnits: firstWeekUnits,
    chartPosition: null,
    peakPosition: null,
    weeksOnChart: 0,
    certification: computeCertification(firstWeekUnits),
    coverIndex: params.coverIndex,
  };

  // Release any unreleased tracks inside the project and boost all album tracks
  const nextTracks = state.tracks.map((t) => {
    if (!params.trackIds.includes(t.id)) return t;
    const boostStreams = Math.round(
      (artist.monthlyListeners * 0.35 + firstWeekUnits * 18) * (t.quality / 80) * labelPromo
    );
    return {
      ...t,
      albumId,
      released: true,
      releaseWeek: t.releaseWeek ?? state.week,
      weeklyStreams: t.weeklyStreams + boostStreams,
      totalStreams: t.totalStreams + boostStreams,
      totalUnits: t.totalUnits + Math.round(boostStreams / 150),
    };
  });

  // Fulfill label contract quota if Album
  let nextContract = artist.labelContract;
  let contractNote = '';
  if (nextContract && params.format === 'Album') {
    const delivered = nextContract.albumsDelivered + 1;
    if (delivered >= nextContract.albumsRequired) {
      contractNote = ` Contract fulfilled with ${nextContract.labelName}! You are a Free Agent.`;
      nextContract = null;
    } else {
      nextContract = { ...nextContract, albumsDelivered: delivered };
    }
  }

  const { hotChart, albumChart, updatedTracks, updatedAlbums } = buildCharts(
    nextTracks,
    [newAlbum, ...state.albums],
    state.hotChart,
    state.albumChart
  );

  const releasePost: SocialPost = {
    id: uid('post'),
    week: state.week,
    authorId: 'player',
    authorName: artist.name,
    handle: `@${artist.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'artist'}`,
    isPlayer: true,
    category: 'Release',
    content: `My new ${params.format} "${newAlbum.title}" (${selected.length} tracks) just dropped worldwide!${contractNote}`,
    likes: Math.round(artist.followers * 0.14 + 350),
    reposts: Math.round(artist.followers * 0.04 + 90),
  };

  const addedStreams = selected.length * firstWeekUnits * 15;

  return {
    nextState: {
      ...state,
      artist: {
        ...artist,
        hype: clamp(artist.hype + (params.format === 'Album' ? 20 : 12), 0, 100),
        monthlyListeners: artist.monthlyListeners + Math.round(firstWeekUnits * 4.2),
        followers: artist.followers + Math.round(firstWeekUnits * 1.4),
        totalStreams: artist.totalStreams + addedStreams,
        totalSales: artist.totalSales + firstWeekUnits,
        labelContract: nextContract,
        labelId: nextContract ? nextContract.labelId : 'independent',
      },
      tracks: updatedTracks,
      albums: updatedAlbums,
      hotChart,
      albumChart,
      socialFeed: [releasePost, ...state.socialFeed].slice(0, 60),
    },
  };
}

export function trainSkill(state: GameState, skill: keyof Skills): { nextState: GameState; error?: string } {
  const { artist } = state;
  if (artist.energy < 1) {
    return { nextState: state, error: 'Not enough Energy AP this week.' };
  }
  const current = artist.skills[skill];
  if (current >= 100) {
    return { nextState: state, error: 'Skill is already mastered at 100.' };
  }
  const cost = Math.round(250 + current * 35);
  if (artist.cash < cost) {
    return { nextState: state, error: `Training costs $${cost.toLocaleString()}.` };
  }
  const gain = current < 50 ? 4 : current < 80 ? 3 : 2;
  return {
    nextState: {
      ...state,
      artist: {
        ...artist,
        cash: artist.cash - cost,
        energy: artist.energy - 1,
        skills: {
          ...artist.skills,
          [skill]: clamp(current + gain, 1, 100),
        },
      },
    },
  };
}

export function doSocialAction(
  state: GameState,
  action: 'snippet' | 'interview' | 'callout',
  targetRivalId?: string
): { nextState: GameState; error?: string } {
  const { artist } = state;
  if (artist.energy < 1) {
    return { nextState: state, error: 'Need 1 Energy AP for this promotion action.' };
  }

  if (action === 'snippet') {
    const newLikes = Math.round(artist.followers * 0.06 + artist.hype * 12 + 80);
    return {
      nextState: {
        ...state,
        snippetBoostActive: true,
        artist: {
          ...artist,
          energy: artist.energy - 1,
          hype: clamp(artist.hype + 6, 0, 100),
          followers: artist.followers + Math.round(newLikes * 0.15),
        },
        socialFeed: [
          {
            id: uid('post'),
            week: state.week,
            authorId: 'player',
            authorName: artist.name,
            handle: `@${artist.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'artist'}`,
            isPlayer: true,
            category: 'Snippet' as const,
            content: `Studio snippet preview — should I drop this next week? (Next single debut boosted +35%)`,
            likes: newLikes,
            reposts: Math.round(newLikes * 0.22),
          },
          ...state.socialFeed,
        ].slice(0, 60),
      },
    };
  }

  if (action === 'interview') {
    if (state.interviewCooldown > 0) {
      return { nextState: state, error: `Press circuit cooling down (${state.interviewCooldown}w left).` };
    }
    const listenerGain = Math.round(2500 + artist.hype * 420 + artist.skills.marketing * 180);
    return {
      nextState: {
        ...state,
        interviewCooldown: 3,
        artist: {
          ...artist,
          energy: artist.energy - 1,
          hype: clamp(artist.hype + 9, 0, 100),
          reputation: clamp(artist.reputation + 4, 0, 100),
          monthlyListeners: artist.monthlyListeners + listenerGain,
          followers: artist.followers + Math.round(listenerGain * 0.25),
        },
        socialFeed: [
          {
            id: uid('post'),
            week: state.week,
            authorId: 'pulse_news',
            authorName: 'ChartPulse Daily',
            handle: '@chartpulsedaily',
            isPlayer: false,
            category: 'Press' as const,
            content: `${artist.name} opened up in a viral radio sit-down about ${artist.city} roots and upcoming records.`,
            likes: Math.round(artist.followers * 0.08 + 450),
            reposts: Math.round(artist.followers * 0.02 + 110),
          },
          ...state.socialFeed,
        ].slice(0, 60),
      },
    };
  }

  // Callout / Beef
  const rival = state.rivals.find((r) => r.id === targetRivalId);
  if (!rival) return { nextState: state, error: 'Select a rival artist first.' };

  const hypeGain = Math.round(8 + (rival.hype / 20));
  return {
    nextState: {
      ...state,
      artist: {
        ...artist,
        energy: artist.energy - 1,
        hype: clamp(artist.hype + hypeGain, 0, 100),
        reputation: clamp(artist.reputation - 3, 0, 100),
        followers: artist.followers + Math.round(rival.followers * 0.003),
      },
      rivals: state.rivals.map((r) =>
        r.id === rival.id
          ? { ...r, relationship: clamp(r.relationship - 30, -100, 100), activeFeud: true }
          : r
      ),
      socialFeed: [
        {
          id: uid('post'),
          week: state.week,
          authorId: rival.id,
          authorName: rival.name,
          handle: `@${rival.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          isPlayer: false,
          category: 'Feud' as const,
          content: `@${artist.name.toLowerCase().replace(/[^a-z0-9]/g, '')} talking crazy online when my catalog does triple those numbers. Cute.`,
          likes: Math.round(rival.followers * 0.02),
          reposts: Math.round(rival.followers * 0.006),
        },
        {
          id: uid('post'),
          week: state.week,
          authorId: 'player',
          authorName: artist.name,
          handle: `@${artist.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'artist'}`,
          isPlayer: true,
          category: 'Feud' as const,
          content: `Respect is earned in the booth, not by label bots @${rival.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.`,
          likes: Math.round(artist.followers * 0.1 + 320),
          reposts: Math.round(artist.followers * 0.035 + 85),
        },
        ...state.socialFeed,
      ].slice(0, 60),
    },
  };
}

export function bookTour(
  state: GameState,
  venueId: string,
  ticketPrice: number
): { nextState: GameState; error?: string } {
  const venue = TOUR_VENUES.find((v) => v.id === venueId);
  if (!venue) return { nextState: state, error: 'Invalid tour circuit.' };
  if (state.activeTours.length >= 1) {
    return { nextState: state, error: 'Finish your current tour run before booking another.' };
  }
  if (state.artist.monthlyListeners < venue.minListeners) {
    return {
      nextState: state,
      error: `Need at least ${formatCompact(venue.minListeners)} monthly listeners to headline ${venue.venueName}.`,
    };
  }
  if (state.artist.cash < venue.bookingCost) {
    return { nextState: state, error: `Booking deposit requires $${venue.bookingCost.toLocaleString()}.` };
  }
  if (state.artist.energy < 1) {
    return { nextState: state, error: 'Need 1 Energy AP to finalize tour logistics.' };
  }

  const priceFactor = clamp(venue.suggestedPrice / Math.max(10, ticketPrice), 0.35, 1.25);
  const fanFactor = clamp(state.artist.monthlyListeners / (venue.minListeners * 2.2), 0.55, 1.15);
  const tourDirBonus = state.artist.crewIds.includes('tour_director') ? 1.22 : 1.0;
  const sellThrough = clamp(priceFactor * fanFactor * tourDirBonus, 0.28, 1.0);

  const projectedGross = Math.round(venue.cityCount * venue.capacityPerShow * sellThrough * ticketPrice);

  const booking: TourBooking = {
    id: uid('tour'),
    venueName: venue.venueName,
    tierName: venue.tierName,
    cityCount: venue.cityCount,
    capacityPerShow: venue.capacityPerShow,
    ticketPrice,
    weeksRemaining: venue.totalWeeks,
    totalWeeks: venue.totalWeeks,
    projectedGross,
    earnedSoFar: 0,
    completed: false,
  };

  return {
    nextState: {
      ...state,
      artist: {
        ...state.artist,
        cash: state.artist.cash - venue.bookingCost,
        energy: state.artist.energy - 1,
        hype: clamp(state.artist.hype + 6, 0, 100),
      },
      activeTours: [booking],
    },
  };
}

export function launchMerchDrop(
  state: GameState,
  params: { name: string; itemType: 'Tee' | 'Hoodie' | 'Vinyl Box' | 'Cap'; price: number }
): { nextState: GameState; error?: string } {
  const unitCosts: Record<'Tee' | 'Hoodie' | 'Vinyl Box' | 'Cap', number> = {
    Cap: 9,
    Tee: 14,
    Hoodie: 28,
    'Vinyl Box': 22,
  };
  const setupCost = 1200;
  if (state.artist.cash < setupCost) {
    return { nextState: state, error: `Merch production setup costs $${setupCost.toLocaleString()}.` };
  }
  if (state.merchLines.length >= 4) {
    return { nextState: state, error: 'Maximum 4 active merch drops at once. Retire an older line first.' };
  }

  return {
    nextState: {
      ...state,
      artist: {
        ...state.artist,
        cash: state.artist.cash - setupCost,
      },
      merchLines: [
        {
          id: uid('merch'),
          name: params.name.trim() || `${state.artist.name} Tour ${params.itemType}`,
          itemType: params.itemType,
          price: params.price,
          unitCost: unitCosts[params.itemType],
          unitsSold: 0,
          weeklyDemand: Math.max(15, Math.round(state.artist.followers * 0.008)),
          weeksActive: 0,
        },
        ...state.merchLines,
      ],
    },
  };
}

export function signLabelDeal(state: GameState, labelId: string, negotiate: boolean): { nextState: GameState; message?: string; error?: string } {
  if (state.artist.labelContract) {
    return { nextState: state, error: 'You are already under an active label contract.' };
  }
  const label = RECORD_LABELS.find((l) => l.id === labelId);
  if (!label) return { nextState: state, error: 'Label not found.' };
  if (state.artist.monthlyListeners < label.minListeners) {
    return {
      nextState: state,
      error: `Requires ${formatCompact(label.minListeners)} monthly listeners to sign with ${label.name}.`,
    };
  }

  const hasManager = state.artist.crewIds.includes('manager');
  const splitBoost = negotiate ? (hasManager ? 0.06 : 0.03) : 0;
  const advanceBoost = negotiate ? (hasManager ? 1.2 : 1.1) : 1.0;

  const finalAdvance = Math.round(label.advance * advanceBoost);
  const finalSplit = Number(Math.min(0.6, label.royaltySplit + splitBoost).toFixed(2));

  return {
    message: `Signed with ${label.name}! Received $${finalAdvance.toLocaleString()} advance at ${Math.round(finalSplit * 100)}% royalty split.`,
    nextState: {
      ...state,
      artist: {
        ...state.artist,
        cash: state.artist.cash + finalAdvance,
        hype: clamp(state.artist.hype + 12, 0, 100),
        labelId: label.id,
        labelContract: {
          labelId: label.id,
          labelName: label.name,
          royaltySplit: finalSplit,
          albumsRequired: label.albumsRequired,
          albumsDelivered: 0,
          advanceRemaining: finalAdvance,
          promoBonus: label.promoBonus,
          signedWeek: state.week,
          buyoutCost: Math.round(finalAdvance * 1.25),
        },
      },
      socialFeed: [
        {
          id: uid('post'),
          week: state.week,
          authorId: 'pulse_news',
          authorName: 'ChartPulse Daily',
          handle: '@chartpulsedaily',
          isPlayer: false,
          category: 'Press' as const,
          content: `BREAKING: ${state.artist.name} signs a ${label.albumsRequired}-album deal with ${label.name}.`,
          likes: Math.round(state.artist.followers * 0.1 + 800),
          reposts: Math.round(state.artist.followers * 0.03 + 220),
        },
        ...state.socialFeed,
      ].slice(0, 60),
    },
  };
}

export function buyoutLabelContract(state: GameState): { nextState: GameState; error?: string } {
  const contract = state.artist.labelContract;
  if (!contract) return { nextState: state, error: 'No active contract.' };
  if (state.artist.cash < contract.buyoutCost) {
    return { nextState: state, error: `Buyout costs $${contract.buyoutCost.toLocaleString()}.` };
  }
  return {
    nextState: {
      ...state,
      artist: {
        ...state.artist,
        cash: state.artist.cash - contract.buyoutCost,
        labelId: 'independent',
        labelContract: null,
      },
    },
  };
}

export function hireCrewMember(state: GameState, crewId: string): { nextState: GameState; error?: string } {
  if (state.artist.crewIds.includes(crewId)) {
    return { nextState: state, error: 'Already on your team.' };
  }
  const member = CREW_ROSTER.find((c) => c.id === crewId);
  if (!member) return { nextState: state, error: 'Crew member not found.' };
  if (state.artist.monthlyListeners < member.minListeners) {
    return { nextState: state, error: `Requires ${formatCompact(member.minListeners)} monthly listeners.` };
  }
  if (state.artist.cash < member.hireCost) {
    return { nextState: state, error: `Signing fee is $${member.hireCost.toLocaleString()}.` };
  }
  return {
    nextState: {
      ...state,
      artist: {
        ...state.artist,
        cash: state.artist.cash - member.hireCost,
        crewIds: [...state.artist.crewIds, crewId],
      },
    },
  };
}

export function upgradeStudio(state: GameState): { nextState: GameState; error?: string } {
  const nextLevel = state.artist.studioLevel + 1;
  const tier = STUDIO_TIERS[nextLevel];
  if (!tier) return { nextState: state, error: 'Studio is at maximum tier.' };
  if (state.artist.cash < tier.cost) {
    return { nextState: state, error: `Upgrade requires $${tier.cost.toLocaleString()}.` };
  }
  return {
    nextState: {
      ...state,
      artist: {
        ...state.artist,
        cash: state.artist.cash - tier.cost,
        studioLevel: nextLevel,
      },
    },
  };
}

export function upgradeLifestyle(state: GameState): { nextState: GameState; error?: string } {
  const nextLevel = state.artist.lifestyleLevel + 1;
  const tier = LIFESTYLE_TIERS[nextLevel];
  if (!tier) return { nextState: state, error: 'Lifestyle is at maximum tier.' };
  if (state.artist.cash < tier.upgradeCost) {
    return { nextState: state, error: `Upgrade requires $${tier.upgradeCost.toLocaleString()}.` };
  }
  return {
    nextState: {
      ...state,
      artist: {
        ...state.artist,
        cash: state.artist.cash - tier.upgradeCost,
        lifestyleLevel: nextLevel,
        maxEnergy: tier.maxEnergy,
        energy: Math.max(state.artist.energy, tier.maxEnergy),
      },
    },
  };
}

export function resolveEventChoice(state: GameState, choice: EventChoice): GameState {
  const { artist } = state;
  const nextSkills: Skills = {
    songwriting: clamp(artist.skills.songwriting + (choice.skillBoost?.songwriting ?? 0), 1, 100),
    vocals: clamp(artist.skills.vocals + (choice.skillBoost?.vocals ?? 0), 1, 100),
    production: clamp(artist.skills.production + (choice.skillBoost?.production ?? 0), 1, 100),
    stagecraft: clamp(artist.skills.stagecraft + (choice.skillBoost?.stagecraft ?? 0), 1, 100),
    marketing: clamp(artist.skills.marketing + (choice.skillBoost?.marketing ?? 0), 1, 100),
  };

  return {
    ...state,
    pendingEvent: null,
    artist: {
      ...artist,
      cash: artist.cash + (choice.cashDelta ?? 0),
      hype: clamp(artist.hype + (choice.hypeDelta ?? 0), 0, 100),
      reputation: clamp(artist.reputation + (choice.repDelta ?? 0), 0, 100),
      energy: clamp(artist.energy + (choice.energyDelta ?? 0), 0, artist.maxEnergy),
      monthlyListeners: Math.max(100, artist.monthlyListeners + (choice.listenersDelta ?? 0)),
      skills: nextSkills,
    },
    socialFeed: [
      {
        id: uid('post'),
        week: state.week,
        authorId: 'pulse_news',
        authorName: 'Industry Wire',
        handle: '@industrywire',
        isPlayer: false,
        category: 'Press' as const,
        content: `${artist.name}: ${choice.outcomeText}`,
        likes: Math.round(artist.followers * 0.05 + 240),
        reposts: Math.round(artist.followers * 0.015 + 45),
      },
      ...state.socialFeed,
    ].slice(0, 60),
  };
}

export function advanceWeek(state: GameState): GameState {
  const nextWeek = state.week + 1;
  const nextYear = Math.floor((nextWeek - 1) / 52) + 1;
  const isAwardWeek = nextWeek > 1 && nextWeek % 52 === 0;

  let { artist } = state;
  const highlights: string[] = [];
  const certsEarned: string[] = [];
  const newPosts: SocialPost[] = [];

  // 1. Shift Genre Trends slightly every 4 weeks
  const nextTrends = { ...state.genreTrends };
  if (nextWeek % 4 === 0) {
    GENRES.forEach((g) => {
      const delta = (Math.random() - 0.5) * 0.14;
      nextTrends[g] = Number(clamp(nextTrends[g] + delta, 0.85, 1.35).toFixed(2));
    });
  }

  // 2. Process tracks streaming & decay
  let weeklyPlayerStreams = 0;
  let updatedTracks = state.tracks.map((t) => {
    if (!t.released) return t;
    const age = Math.max(1, nextWeek - (t.releaseWeek ?? nextWeek));
    // High quality songs hold legs longer; occasional viral surge
    const retention = clamp(0.76 + t.quality / 480 - age * 0.004, 0.55, 0.94);
    const viralSpike = t.artistId === 'player' && t.quality >= 75 && Math.random() < 0.08 ? 1.45 : 1.0;

    let nextWeekly = Math.round(t.weeklyStreams * retention * viralSpike);
    if (nextWeekly < 800 && t.artistId === 'player') {
      nextWeekly = Math.round(Math.max(250, artist.monthlyListeners * 0.015));
    }

    const nextTotal = t.totalStreams + nextWeekly;
    const nextUnits = Math.round(nextTotal / 150);
    const nextCert = computeCertification(nextUnits);

    if (t.artistId === 'player') {
      weeklyPlayerStreams += nextWeekly;
      if (viralSpike > 1) {
        highlights.push(`"${t.title}" caught a viral algorithmic wave (+45% streams)!`);
      }
      if (nextCert !== t.certification && nextCert !== 'None') {
        certsEarned.push(`${nextCert} Single: "${t.title}"`);
        highlights.push(`RIAA ${nextCert} Plaque awarded for "${t.title}"!`);
      }
    }

    return {
      ...t,
      weeklyStreams: nextWeekly,
      totalStreams: nextTotal,
      totalUnits: nextUnits,
      certification: nextCert,
    };
  });

  // 3. Process albums
  let updatedAlbums = state.albums.map((a) => {
    if (!a.released) return a;
    const nextWeeklyUnits = Math.round(a.weeklyUnits * clamp(0.74 + a.quality / 500, 0.62, 0.91));
    const nextTotal = a.totalUnits + nextWeeklyUnits;
    const nextCert = computeCertification(nextTotal);
    if (a.artistId === 'player' && nextCert !== a.certification && nextCert !== 'None') {
      certsEarned.push(`${nextCert} ${a.format}: "${a.title}"`);
      highlights.push(`RIAA ${nextCert} Plaque awarded for ${a.format} "${a.title}"!`);
    }
    return {
      ...a,
      weeklyUnits: nextWeeklyUnits,
      totalUnits: nextTotal,
      certification: nextCert,
    };
  });

  // 4. Rival NPC AI drops new songs occasionally so charts stay fresh
  const updatedRivals = state.rivals.map((r) => {
    if (nextWeek - r.lastReleaseWeek >= 5 && Math.random() < 0.24) {
      const pool = RIVAL_SONG_TITLES[r.genre];
      const title = pool[Math.floor(Math.random() * pool.length)];
      const weeklyStreams = Math.round(
        r.monthlyListeners * (0.28 + Math.random() * 0.25) * (nextTrends[r.genre] ?? 1.0)
      );
      const newTrack: Track = {
        id: uid('rt'),
        title,
        artistId: r.id,
        artistName: r.name,
        genre: r.genre,
        theme: 'Club Anthem',
        producerName: 'Label Studio',
        bpm: 124,
        quality: clamp(r.skillRating + Math.round((Math.random() - 0.3) * 12), 68, 99),
        mixScore: 10,
        featuredArtistId: null,
        featuredArtistName: null,
        isDissTrack: r.activeFeud && Math.random() < 0.4,
        dissTargetId: r.activeFeud ? 'player' : null,
        hasMusicVideo: true,
        albumId: null,
        released: true,
        releaseWeek: nextWeek,
        weeklyStreams,
        totalStreams: weeklyStreams,
        totalUnits: Math.round(weeklyStreams / 150),
        chartPosition: null,
        peakPosition: null,
        weeksOnChart: 0,
        certification: 'None',
        viralScore: 1,
        coverIndex: Math.floor(Math.random() * 5),
      };
      updatedTracks = [newTrack, ...updatedTracks];
      if (newTrack.isDissTrack) {
        highlights.push(`${r.name} dropped a diss track "${title}" aimed at you!`);
        newPosts.push({
          id: uid('post'),
          week: nextWeek,
          authorId: r.id,
          authorName: r.name,
          handle: `@${r.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          isPlayer: false,
          category: 'Feud',
          content: `Just dropped "${title}". Let's see who really owns this genre.`,
          likes: Math.round(r.followers * 0.04),
          reposts: Math.round(r.followers * 0.012),
        });
      }
      return { ...r, lastReleaseWeek: nextWeek, hype: clamp(r.hype + 4, 30, 99) };
    }
    return r;
  });

  // Trim old non-player dead tracks to keep memory fast
  updatedTracks = updatedTracks.filter(
    (t) => t.artistId === 'player' || t.weeklyStreams > 45_000 || (nextWeek - (t.releaseWeek ?? 0)) < 12
  );

  // 5. Royalties Calculation (~$0.0038 per stream before label split)
  const grossStreamCash = Math.round(weeklyPlayerStreams * 0.0038);
  let royaltiesEarned = grossStreamCash;
  let nextContract = artist.labelContract;

  if (nextContract) {
    // Label takes its cut and recoups advance
    const artistCut = Math.round(grossStreamCash * nextContract.royaltySplit);
    if (nextContract.advanceRemaining > 0) {
      const recoup = Math.min(nextContract.advanceRemaining, artistCut);
      nextContract = {
        ...nextContract,
        advanceRemaining: nextContract.advanceRemaining - recoup,
      };
      royaltiesEarned = artistCut - recoup;
    } else {
      royaltiesEarned = artistCut;
    }
  }

  // Plaque bonus cash
  const plaqueCash = certsEarned.length * 5000;

  // 6. Active Tours
  let tourEarned = 0;
  let completedToursDelta = 0;
  let tourListenersGain = 0;
  const nextTours: TourBooking[] = [];

  state.activeTours.forEach((tour) => {
    const stageBonus = 1 + artist.skills.stagecraft / 180;
    const weeklyShowCash = Math.round((tour.projectedGross / tour.totalWeeks) * stageBonus);
    tourEarned += weeklyShowCash;
    tourListenersGain += Math.round((tour.capacityPerShow * tour.cityCount) / tour.totalWeeks * 0.25);

    const remaining = tour.weeksRemaining - 1;
    if (remaining <= 0) {
      completedToursDelta += 1;
      highlights.push(`Wrapped ${tour.venueName} (${tour.cityCount} cities) cleanly!`);
    } else {
      nextTours.push({
        ...tour,
        weeksRemaining: remaining,
        earnedSoFar: tour.earnedSoFar + weeklyShowCash,
      });
    }
  });

  // 7. Merch Sales
  let merchEarned = 0;
  const nextMerch = state.merchLines.map((m) => {
    const demand = Math.round(
      Math.max(
        4,
        (artist.followers * 0.0045 + artist.hype * 2.5) *
          (state.activeTours.length > 0 ? 1.8 : 1.0) *
          clamp(38 / Math.max(15, m.price), 0.4, 1.4)
      )
    );
    const profitPerUnit = Math.max(2, m.price - m.unitCost);
    merchEarned += demand * profitPerUnit;
    return {
      ...m,
      unitsSold: m.unitsSold + demand,
      weeklyDemand: demand,
      weeksActive: m.weeksActive + 1,
    };
  });

  // 8. Weekly Upkeep (Lifestyle + Crew Salaries)
  const lifestyle = LIFESTYLE_TIERS[artist.lifestyleLevel] ?? LIFESTYLE_TIERS[0];
  const crewSalary = artist.crewIds.reduce((sum, cid) => {
    const found = CREW_ROSTER.find((c) => c.id === cid);
    return sum + (found?.weeklySalary ?? 0);
  }, 0);
  const upkeepPaid = lifestyle.weeklyCost + crewSalary;

  // 9. Hype decay & Monthly Listeners update
  const hasPublicist = artist.crewIds.includes('publicist');
  const hypeDecay = hasPublicist ? 1.5 : 3.2;
  const nextHype = clamp(Math.round(Math.max(lifestyle.hypeFloor, artist.hype - hypeDecay)), 0, 100);

  const listenerChange =
    Math.round(weeklyPlayerStreams * 0.045) + tourListenersGain - Math.round(artist.monthlyListeners * 0.025);
  const nextListeners = Math.max(500, artist.monthlyListeners + listenerChange);
  const nextFollowers = Math.max(200, artist.followers + Math.round(Math.max(0, listenerChange) * 0.35));

  // 10. Rebuild Charts
  const { hotChart, albumChart, updatedTracks: finalTracks, updatedAlbums: finalAlbums } = buildCharts(
    updatedTracks,
    updatedAlbums,
    state.hotChart,
    state.albumChart
  );

  // Check player chart milestones
  const playerChartTracks = hotChart.filter((c) => c.artistId === 'player');
  let peakPos = artist.peakChartPosition;
  let newNumOnes = 0;

  playerChartTracks.forEach((c) => {
    if (peakPos === null || c.rank < peakPos) {
      peakPos = c.rank;
      highlights.push(`New career chart peak: "${c.title}" reached #${c.rank} on the Global Hot 50!`);
    }
    if (c.rank === 1 && c.prevRank !== 1) {
      newNumOnes += 1;
      highlights.push(`"${c.title}" hit #1 on the Global Hot 50!`);
      newPosts.push({
        id: uid('post'),
        week: nextWeek,
        authorId: 'pulse_news',
        authorName: 'ChartPulse Daily',
        handle: '@chartpulsedaily',
        isPlayer: false,
        category: 'Milestone',
        content: `HISTORIC: ${artist.name}'s "${c.title}" officially claims #1 on the Global Hot 50!`,
        likes: 64000,
        reposts: 18500,
      });
    }
  });

  // 11. Annual Aurelia Awards every 52nd week
  const newAwards: AwardRecord[] = [];
  if (isAwardWeek) {
    const bestTrack = finalTracks
      .filter((t) => t.artistId === 'player' && t.released)
      .sort((a, b) => b.totalStreams - a.totalStreams)[0];
    const bestAlbum = finalAlbums
      .filter((a) => a.artistId === 'player' && a.released)
      .sort((a, b) => b.totalUnits - a.totalUnits)[0];

    if (nextYear === 2 && nextListeners >= 80_000) {
      const won = nextListeners >= 220_000;
      newAwards.push({
        id: uid('awd'),
        year: nextYear - 1,
        category: 'Best New Artist',
        workTitle: artist.name,
        won,
      });
      highlights.push(won ? 'WON Aurelia Award: Best New Artist!' : 'Nominated for Best New Artist at The Aurelias.');
    }

    if (bestTrack && bestTrack.peakPosition !== null && bestTrack.peakPosition <= 25) {
      const won = bestTrack.peakPosition <= 5 || bestTrack.quality >= 88;
      newAwards.push({
        id: uid('awd'),
        year: nextYear - 1,
        category: `${artist.genre} Song of the Year`,
        workTitle: bestTrack.title,
        won,
      });
      highlights.push(
        won
          ? `WON Aurelia Award: ${artist.genre} Song of the Year ("${bestTrack.title}")!`
          : `Nominated: ${artist.genre} Song of the Year ("${bestTrack.title}").`
      );
    }

    if (bestAlbum && bestAlbum.peakPosition !== null && bestAlbum.peakPosition <= 10) {
      const won = bestAlbum.peakPosition <= 3 || bestAlbum.quality >= 90;
      newAwards.push({
        id: uid('awd'),
        year: nextYear - 1,
        category: 'Album of the Year',
        workTitle: bestAlbum.title,
        won,
      });
      highlights.push(
        won
          ? `WON Aurelia Award: Album of the Year ("${bestAlbum.title}")!`
          : `Nominated: Album of the Year ("${bestAlbum.title}").`
      );
    }
  }

  // 12. Random Industry Event (~25% chance per week if none pending)
  const triggerEvent =
    !isAwardWeek && Math.random() < 0.25
      ? INDUSTRY_EVENTS[Math.floor(Math.random() * INDUSTRY_EVENTS.length)]
      : null;

  const netCashDelta = royaltiesEarned + tourEarned + merchEarned + plaqueCash - upkeepPaid;
  const awardBonusCash = newAwards.filter((a) => a.won).length * 25000;

  const updatedArtist = {
    ...artist,
    cash: artist.cash + netCashDelta + awardBonusCash,
    hype: nextHype,
    monthlyListeners: nextListeners,
    followers: nextFollowers,
    energy: lifestyle.maxEnergy,
    maxEnergy: lifestyle.maxEnergy,
    totalStreams: artist.totalStreams + weeklyPlayerStreams,
    labelContract: nextContract,
    labelId: nextContract ? nextContract.labelId : 'independent',
    peakChartPosition: peakPos,
    numberOneHits: artist.numberOneHits + newNumOnes,
  };

  const legacyScore = Math.round(
    updatedArtist.totalStreams / 50_000 +
      updatedArtist.numberOneHits * 250 +
      state.awards.concat(newAwards).filter((a) => a.won).length * 300 +
      updatedArtist.monthlyListeners / 20_000
  );

  const nextState: GameState = {
    ...state,
    week: nextWeek,
    year: nextYear,
    artist: updatedArtist,
    tracks: finalTracks,
    albums: finalAlbums,
    rivals: updatedRivals,
    hotChart,
    albumChart,
    activeTours: nextTours,
    completedToursCount: state.completedToursCount + completedToursDelta,
    merchLines: nextMerch,
    awards: [...newAwards, ...state.awards],
    genreTrends: nextTrends,
    pendingEvent: triggerEvent,
    interviewCooldown: Math.max(0, state.interviewCooldown - 1),
    socialFeed: [...newPosts, ...state.socialFeed].slice(0, 60),
    legacyScore,
    lastDigest: {
      week: nextWeek,
      year: nextYear,
      streamsEarned: weeklyPlayerStreams,
      royaltiesEarned,
      tourEarned,
      merchEarned,
      upkeepPaid,
      netCashDelta: netCashDelta + awardBonusCash,
      listenersDelta: listenerChange,
      highlights: highlights.slice(0, 4),
      certificationsEarned: certsEarned,
    },
  };

  saveGameState(nextState);
  return nextState;
}
