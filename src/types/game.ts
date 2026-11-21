export type GameScreen = 'TITLE_MENU' | 'CHARACTER_CREATE' | 'PLAYING' | 'PAUSED' | 'CAREER_SUMMARY';

export type NavTab = 'overview' | 'studio' | 'charts' | 'social' | 'tour' | 'business' | 'awards';

export type Genre = 'Hip-Hop' | 'Pop' | 'R&B' | 'Rock' | 'Electronic';

export type Archetype = 'Bedroom Producer' | 'Street Lyricist' | 'Viral Vocalist' | 'Indie Prodigy';

export type Certification = 'None' | 'Gold' | 'Platinum' | 'Multi-Platinum' | 'Diamond';

export type SongTheme =
  | 'Rise & Ambition'
  | 'Heartbreak & Midnight'
  | 'Club Anthem'
  | 'Street Chronicles'
  | 'Summer Euphoria'
  | 'Diss / Confrontation'
  | 'Introspective Soul';

export interface MixSettings {
  bass: number;   // 0 - 100
  drums: number;  // 0 - 100
  melody: number; // 0 - 100
  vocals: number; // 0 - 100
}

export interface Skills {
  songwriting: number;
  vocals: number;
  production: number;
  stagecraft: number;
  marketing: number;
}

export interface ArtistProfile {
  name: string;
  genre: Genre;
  archetype: Archetype;
  city: string;
  portraitId: string;
  cash: number;
  hype: number;            // 0 - 100
  reputation: number;      // 0 - 100
  monthlyListeners: number;
  followers: number;
  energy: number;
  maxEnergy: number;
  skills: Skills;
  studioLevel: number;     // 0 - 4
  lifestyleLevel: number;  // 0 - 4
  labelId: string;         // 'independent' or label id
  labelContract: LabelContractState | null;
  crewIds: string[];
  totalStreams: number;
  totalSales: number;
  peakChartPosition: number | null;
  numberOneHits: number;
}

export interface LabelContractState {
  labelId: string;
  labelName: string;
  royaltySplit: number; // artist's percentage e.g. 0.25 -> 25%
  albumsRequired: number;
  albumsDelivered: number;
  advanceRemaining: number;
  promoBonus: number;
  signedWeek: number;
  buyoutCost: number;
}

export interface ProducerOption {
  id: string;
  name: string;
  specialty: Genre;
  cost: number;
  qualityBonus: number;
  bpm: number;
  description: string;
}

export interface Track {
  id: string;
  title: string;
  artistId: string; // 'player' or rival id
  artistName: string;
  genre: Genre;
  theme: SongTheme;
  producerName: string;
  bpm: number;
  quality: number; // 1 - 100
  mixScore: number; // 0 - 12 bonus
  featuredArtistId: string | null;
  featuredArtistName: string | null;
  isDissTrack: boolean;
  dissTargetId: string | null;
  hasMusicVideo: boolean;
  albumId: string | null;
  released: boolean;
  releaseWeek: number | null;
  weeklyStreams: number;
  totalStreams: number;
  totalUnits: number; // streams/150 + sales
  chartPosition: number | null;
  peakPosition: number | null;
  weeksOnChart: number;
  certification: Certification;
  viralScore: number; // temporary viral multiplier
  coverIndex: number;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  genre: Genre;
  format: 'EP' | 'Album';
  trackIds: string[];
  quality: number;
  released: boolean;
  releaseWeek: number | null;
  weeklyUnits: number;
  totalUnits: number;
  chartPosition: number | null;
  peakPosition: number | null;
  weeksOnChart: number;
  certification: Certification;
  coverIndex: number;
}

export interface RivalArtist {
  id: string;
  name: string;
  genre: Genre;
  city: string;
  labelName: string;
  hype: number;
  monthlyListeners: number;
  followers: number;
  relationship: number; // -100 (arch rival) to +100 (close ally)
  skillRating: number;
  personality: 'Humble' | 'Cocky' | 'Mysterious' | 'Volatile';
  activeFeud: boolean;
  lastReleaseWeek: number;
}

export interface ChartEntry {
  rank: number;
  prevRank: number | null;
  trackId: string;
  title: string;
  artistId: string;
  artistName: string;
  featuredArtistName: string | null;
  genre: Genre;
  weeklyStreams: number;
  totalStreams: number;
  weeksOnChart: number;
  peakPosition: number;
  certification: Certification;
}

export interface AlbumChartEntry {
  rank: number;
  prevRank: number | null;
  albumId: string;
  title: string;
  artistId: string;
  artistName: string;
  genre: Genre;
  format: 'EP' | 'Album';
  weeklyUnits: number;
  totalUnits: number;
  weeksOnChart: number;
  peakPosition: number;
}

export interface SocialPost {
  id: string;
  week: number;
  authorId: string;
  authorName: string;
  handle: string;
  isPlayer: boolean;
  category: 'Release' | 'Snippet' | 'Feud' | 'Press' | 'Milestone' | 'Fan';
  content: string;
  likes: number;
  reposts: number;
}

export interface TourBooking {
  id: string;
  venueName: string;
  tierName: string;
  cityCount: number;
  capacityPerShow: number;
  ticketPrice: number;
  weeksRemaining: number;
  totalWeeks: number;
  projectedGross: number;
  earnedSoFar: number;
  completed: boolean;
}

export interface MerchLine {
  id: string;
  name: string;
  itemType: 'Tee' | 'Hoodie' | 'Vinyl Box' | 'Cap';
  price: number;
  unitCost: number;
  unitsSold: number;
  weeklyDemand: number;
  weeksActive: number;
}

export interface AwardRecord {
  id: string;
  year: number;
  category: string;
  workTitle: string;
  won: boolean;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  cashDelta?: number;
  hypeDelta?: number;
  repDelta?: number;
  energyDelta?: number;
  listenersDelta?: number;
  skillBoost?: Partial<Skills>;
  outcomeText: string;
}

export interface IndustryEvent {
  id: string;
  title: string;
  kicker: string;
  description: string;
  choices: EventChoice[];
}

export interface WeeklyDigest {
  week: number;
  year: number;
  streamsEarned: number;
  royaltiesEarned: number;
  tourEarned: number;
  merchEarned: number;
  upkeepPaid: number;
  netCashDelta: number;
  listenersDelta: number;
  highlights: string[];
  certificationsEarned: string[];
}

export interface GameState {
  week: number;
  year: number;
  artist: ArtistProfile;
  tracks: Track[];
  albums: Album[];
  rivals: RivalArtist[];
  hotChart: ChartEntry[];
  albumChart: AlbumChartEntry[];
  socialFeed: SocialPost[];
  activeTours: TourBooking[];
  completedToursCount: number;
  merchLines: MerchLine[];
  awards: AwardRecord[];
  genreTrends: Record<Genre, number>; // 0.85 to 1.35 multiplier
  pendingEvent: IndustryEvent | null;
  lastDigest: WeeklyDigest | null;
  snippetBoostActive: boolean;
  interviewCooldown: number;
  retired: boolean;
  legacyScore: number;
}
