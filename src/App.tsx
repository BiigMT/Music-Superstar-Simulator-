import React, { useCallback, useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  Briefcase,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Mic2,
  Newspaper,
} from 'lucide-react';
import { synth } from './audio/synthEngine';
import { AwardsHall } from './components/AwardsHall';
import { BusinessDesk } from './components/BusinessDesk';
import { CharacterCreate } from './components/CharacterCreate';
import { ChartsBoard } from './components/ChartsBoard';
import { CareerSummaryModal, EventModal, PauseModal } from './components/Modals';
import { OverviewDeck } from './components/OverviewDeck';
import { IndustryDesk } from './components/IndustryDesk';
import { SocialPressDesk } from './components/SocialPressDesk';
import { StudioDesk } from './components/StudioDesk';
import { TitleScreen } from './components/TitleScreen';
import { TopHudBar } from './components/TopHudBar';
import { TourMerchDesk } from './components/TourMerchDesk';
import {
  advanceWeek,
  bookTour,
  buyoutLabelContract,
  clearSavedGame,
  createInitialCareer,
  doSocialAction,
  hireCrewMember,
  launchMerchDrop,
  loadGameState,
  produceTrack,
  releaseProject,
  releaseSingle,
  resolveEventChoice,
  saveGameState,
  shootMusicVideo,
  signLabelDeal,
  trainSkill,
  upgradeLifestyle,
  upgradeStudio,
} from './engine/simulation';
import {
  Archetype,
  EventChoice,
  GameScreen,
  GameState,
  Genre,
  MixSettings,
  NavTab,
  Skills,
  SongTheme,
} from './types/game';
import { clamp, uid } from './utils/format';

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'studio', label: 'Studio', icon: Mic2 },
  { id: 'charts', label: 'Charts', icon: BarChart3 },
  { id: 'social', label: 'Social', icon: MessageSquare },
  { id: 'tour', label: 'Touring', icon: MapPin },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'awards', label: 'Awards', icon: Award },
  { id: 'industry', label: 'Industry', icon: Newspaper },
];

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('TITLE_MENU');
  const [savedGame, setSavedGame] = useState<GameState | null>(() => loadGameState());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [muted, setMuted] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: 'info' | 'success' | 'error' } | null>(null);

  const notify = useCallback((text: string, tone: 'info' | 'success' | 'error' = 'info') => {
    setToast({ text, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      synth.setMuted(next);
      return next;
    });
  }, []);

  const commitState = useCallback((next: GameState) => {
    setGameState(next);
    setSavedGame(next);
    saveGameState(next);
  }, []);

  const handleStartNewCareer = (params: {
    name: string;
    genre: Genre;
    archetype: Archetype;
    city: string;
    portraitId: string;
  }) => {
    synth.playFanfare();
    const fresh = createInitialCareer(params);
    commitState(fresh);
    setActiveTab('overview');
    setScreen('PLAYING');
    notify(`Welcome to the industry, ${fresh.artist.name}.`, 'success');
  };

  const handleContinueCareer = () => {
    if (!savedGame) return;
    synth.playClick();
    setGameState(savedGame);
    setActiveTab('overview');
    setScreen('PLAYING');
  };

  const handleAdvanceWeek = useCallback(() => {
    if (!gameState || gameState.pendingEvent) return;
    const next = advanceWeek(gameState);
    if (next.lastDigest?.certificationsEarned.length || next.artist.numberOneHits > gameState.artist.numberOneHits) {
      synth.playFanfare();
    } else {
      synth.playWeekAdvance();
    }
    commitState(next);
  }, [gameState, commitState]);

  // Global keyboard shortcuts during active play
  useEffect(() => {
    if (screen !== 'PLAYING' && screen !== 'PAUSED') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || tag === 'select';

      if (e.key === 'Escape') {
        e.preventDefault();
        synth.playClick();
        setScreen((prev) => (prev === 'PAUSED' ? 'PLAYING' : 'PAUSED'));
        return;
      }

      if (isTyping || screen !== 'PLAYING') return;

      if (e.key === ' ') {
        e.preventDefault();
        handleAdvanceWeek();
      } else if (e.key.toLowerCase() === 'm') {
        toggleMute();
      } else if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (NAV_ITEMS[idx]) {
          synth.playClick();
          setActiveTab(NAV_ITEMS[idx].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, handleAdvanceWeek, toggleMute]);

  // Action Handlers
  const handleProduceTrack = (params: {
    title: string;
    theme: SongTheme;
    producerId: string;
    mix: MixSettings;
    featuredRivalId: string | null;
    dissTargetId: string | null;
    coverIndex: number;
  }) => {
    if (!gameState) return;
    const res = produceTrack(gameState, params);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    if (res.track) {
      if (res.track.isDissTrack) synth.playFeudHit();
      else synth.playRecordMaster();
      commitState(res.nextState);
      notify(`Mastered "${res.track.title}" (Quality ${res.track.quality}/100 · Mix +${res.track.mixScore})`, 'success');
    }
  };

  const handleReleaseSingle = (trackId: string) => {
    if (!gameState) return;
    const res = releaseSingle(gameState, trackId);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    const released = res.nextState.tracks.find((t) => t.id === trackId);
    if (released?.chartPosition === 1) synth.playFanfare();
    else synth.playRecordMaster();
    commitState(res.nextState);
    notify(
      released?.chartPosition
        ? `"${released.title}" debuted at #${released.chartPosition} on the Global Hot 50!`
        : `"${released?.title}" released worldwide!`,
      'success'
    );
  };

  const handleShootVideo = (trackId: string, tier: 'indie' | 'cinematic') => {
    if (!gameState) return;
    const res = shootMusicVideo(gameState, trackId, tier);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    synth.playCash();
    commitState(res.nextState);
    notify(`Music video wrapped! Viral multiplier boosted.`, 'success');
  };

  const handleReleaseProject = (params: {
    title: string;
    format: 'EP' | 'Album';
    trackIds: string[];
    coverIndex: number;
  }) => {
    if (!gameState) return;
    const res = releaseProject(gameState, params);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    synth.playFanfare();
    commitState(res.nextState);
    notify(`${params.format} "${params.title}" dropped globally!`, 'success');
  };

  const handleSocialAction = (action: 'snippet' | 'interview' | 'callout', targetRivalId?: string) => {
    if (!gameState) return;
    const res = doSocialAction(gameState, action, targetRivalId);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    if (action === 'callout') synth.playFeudHit();
    else synth.playClick();
    commitState(res.nextState);
    notify(
      action === 'snippet'
        ? 'Snippet posted! Your next single debut is boosted +35%.'
        : action === 'interview'
          ? 'Press interview aired! Hype and monthly listeners climbed.'
          : 'Public callout posted! Feud hype surged.',
      'success'
    );
  };

  const handleGiftRival = (rivalId: string) => {
    if (!gameState) return;
    if (gameState.artist.energy < 1 || gameState.artist.cash < 750) {
      notify('Need $750 and 1 Energy AP to send a studio gift.', 'error');
      return;
    }
    const target = gameState.rivals.find((r) => r.id === rivalId);
    if (!target) return;
    synth.playCash();
    const next: GameState = {
      ...gameState,
      artist: {
        ...gameState.artist,
        cash: gameState.artist.cash - 750,
        energy: gameState.artist.energy - 1,
      },
      rivals: gameState.rivals.map((r) =>
        r.id === rivalId
          ? { ...r, relationship: clamp(r.relationship + 22, -100, 100), activeFeud: false }
          : r
      ),
      socialFeed: [
        {
          id: uid('post'),
          week: gameState.week,
          authorId: target.id,
          authorName: target.name,
          handle: `@${target.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          isPlayer: false,
          category: 'Fan' as const,
          content: `Appreciate the hospitality @${gameState.artist.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'artist'}. We ought to lock in a session soon.`,
          likes: Math.round(target.followers * 0.015),
          reposts: Math.round(target.followers * 0.003),
        },
        ...gameState.socialFeed,
      ].slice(0, 60),
    };
    commitState(next);
    notify(`Relationship with ${target.name} improved (+22).`, 'success');
  };

  const handleBookTour = (venueId: string, ticketPrice: number) => {
    if (!gameState) return;
    const res = bookTour(gameState, venueId, ticketPrice);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    synth.playCash();
    commitState(res.nextState);
    notify('Tour booked! Ticket revenue will arrive each week.', 'success');
  };

  const handleLaunchMerch = (params: { name: string; itemType: 'Tee' | 'Hoodie' | 'Vinyl Box' | 'Cap'; price: number }) => {
    if (!gameState) return;
    const res = launchMerchDrop(gameState, params);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    synth.playCash();
    commitState(res.nextState);
    notify(`Launched "${params.name}" merch line!`, 'success');
  };

  const handleRetireMerch = (merchId: string) => {
    if (!gameState) return;
    synth.playClick();
    commitState({
      ...gameState,
      merchLines: gameState.merchLines.filter((m) => m.id !== merchId),
    });
  };

  const handleTrainSkill = (skill: keyof Skills) => {
    if (!gameState) return;
    const res = trainSkill(gameState, skill);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    synth.playClick();
    commitState(res.nextState);
    notify(`Trained ${skill}!`, 'success');
  };

  const handleSignLabel = (labelId: string, negotiate: boolean) => {
    if (!gameState) return;
    const res = signLabelDeal(gameState, labelId, negotiate);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    synth.playFanfare();
    commitState(res.nextState);
    if (res.message) notify(res.message, 'success');
  };

  const handleBuyoutLabel = () => {
    if (!gameState) return;
    const res = buyoutLabelContract(gameState);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    synth.playCash();
    commitState(res.nextState);
    notify('Contract bought out! You are independent again.', 'success');
  };

  const handleHireCrew = (crewId: string) => {
    if (!gameState) return;
    const res = hireCrewMember(gameState, crewId);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    synth.playCash();
    commitState(res.nextState);
    notify('New executive hired to your team!', 'success');
  };

  const handleUpgradeStudio = () => {
    if (!gameState) return;
    const res = upgradeStudio(gameState);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    synth.playFanfare();
    commitState(res.nextState);
    notify('Recording studio upgraded!', 'success');
  };

  const handleUpgradeLifestyle = () => {
    if (!gameState) return;
    const res = upgradeLifestyle(gameState);
    if (res.error) {
      notify(res.error, 'error');
      return;
    }
    synth.playCash();
    commitState(res.nextState);
    notify('Residence upgraded! Weekly Energy capacity updated.', 'success');
  };

  const handleSelectEventChoice = (choice: EventChoice) => {
    if (!gameState) return;
    synth.playClick();
    const next = resolveEventChoice(gameState, choice);
    commitState(next);
    notify(choice.outcomeText, 'info');
  };

  // Screen Routing
  if (screen === 'TITLE_MENU') {
    return (
      <TitleScreen
        savedGame={savedGame}
        muted={muted}
        onToggleMute={toggleMute}
        onNewCareer={() => {
          synth.playClick();
          setScreen('CHARACTER_CREATE');
        }}
        onContinueCareer={handleContinueCareer}
      />
    );
  }

  if (screen === 'CHARACTER_CREATE') {
    return (
      <CharacterCreate
        onBack={() => {
          synth.playClick();
          setScreen('TITLE_MENU');
        }}
        onStart={handleStartNewCareer}
      />
    );
  }

  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-[#0B0D11] text-[#F3F4F6] flex flex-col">
      <TopHudBar
        state={gameState}
        muted={muted}
        onToggleMute={toggleMute}
        onPause={() => {
          synth.playClick();
          setScreen('PAUSED');
        }}
        onAdvanceWeek={handleAdvanceWeek}
      />

      {/* Main Playfield Shell */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-6 px-4 py-6 pb-28 sm:px-6 lg:pb-8">
        {/* Desktop Studio Rack Sidebar */}
        <aside className="hidden lg:flex w-52 shrink-0 flex-col gap-1.5">
          {NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  synth.playClick();
                  setActiveTab(item.id);
                }}
                className={`flex items-center justify-between rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#1C202B] text-[#FDE68A] border border-[#E5A93C]/40'
                    : 'text-neutral-300 border border-transparent hover:bg-[#13161D] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${active ? 'text-[#E5A93C]' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </span>
                <span className="font-mono-tabular text-[11px] text-neutral-500">{idx + 1}</span>
              </button>
            );
          })}
        </aside>

        {/* Active Desk Viewport */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <OverviewDeck state={gameState} onNavigate={(tab) => { synth.playClick(); setActiveTab(tab); }} />
          )}
          {activeTab === 'studio' && (
            <StudioDesk
              state={gameState}
              onProduceTrack={handleProduceTrack}
              onReleaseSingle={handleReleaseSingle}
              onShootVideo={handleShootVideo}
              onReleaseProject={handleReleaseProject}
            />
          )}
          {activeTab === 'charts' && <ChartsBoard state={gameState} />}
          {activeTab === 'social' && (
            <SocialPressDesk
              state={gameState}
              onSocialAction={handleSocialAction}
              onGiftRival={handleGiftRival}
            />
          )}
          {activeTab === 'tour' && (
            <TourMerchDesk
              state={gameState}
              onBookTour={handleBookTour}
              onLaunchMerch={handleLaunchMerch}
              onRetireMerch={handleRetireMerch}
            />
          )}
          {activeTab === 'business' && (
            <BusinessDesk
              state={gameState}
              onTrainSkill={handleTrainSkill}
              onSignLabel={handleSignLabel}
              onBuyoutLabel={handleBuyoutLabel}
              onHireCrew={handleHireCrew}
              onUpgradeStudio={handleUpgradeStudio}
              onUpgradeLifestyle={handleUpgradeLifestyle}
            />
          )}
          {activeTab === 'industry' && <IndustryDesk state={gameState} onNavigate={(tab) => { synth.playClick(); setActiveTab(tab); }} />}
          {activeTab === 'awards' && (
            <AwardsHall
              state={gameState}
              onRetireCareer={() => {
                synth.playFanfare();
                setScreen('CAREER_SUMMARY');
              }}
            />
          )}
        </main>
      </div>

      {/* Mobile Compact Bottom Rack (<= 15% viewport height) */}
      <nav className="fixed bottom-0 inset-x-0 z-30 flex lg:hidden items-center gap-1 justify-start overflow-x-auto overscroll-x-contain border-t border-white/10 bg-[#0B0D11]/95 px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                synth.playClick();
                setActiveTab(item.id);
              }}
              className={`flex flex-col items-center justify-center gap-0.5 rounded px-2 py-1.5 text-[10px] font-medium min-w-[68px] shrink-0 ${
                active ? 'text-[#E5A93C]' : 'text-neutral-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Non-blocking Toast Feedback */}
      {toast && (
        <div className="pointer-events-none fixed bottom-16 lg:bottom-6 right-4 sm:right-6 z-40 max-w-sm">
          <div
            className={`rounded-md border px-4 py-3 text-xs font-medium shadow-xl ${
              toast.tone === 'error'
                ? 'border-[#EF4444]/50 bg-[#1C1214] text-[#FCA5A5]'
                : toast.tone === 'success'
                  ? 'border-[#E5A93C]/50 bg-[#13161D] text-[#FDE68A]'
                  : 'border-white/15 bg-[#13161D] text-neutral-100'
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      {/* Modals */}
      {gameState.pendingEvent && screen === 'PLAYING' && (
        <EventModal event={gameState.pendingEvent} onSelectChoice={handleSelectEventChoice} />
      )}

      {screen === 'PAUSED' && (
        <PauseModal
          onResume={() => {
            synth.playClick();
            setScreen('PLAYING');
          }}
          onSaveAndQuit={() => {
            synth.stopBeatPreview();
            saveGameState(gameState);
            setSavedGame(gameState);
            setScreen('TITLE_MENU');
          }}
          onRestartNew={() => {
            synth.stopBeatPreview();
            clearSavedGame();
            setSavedGame(null);
            setScreen('CHARACTER_CREATE');
          }}
        />
      )}

      {screen === 'CAREER_SUMMARY' && (
        <CareerSummaryModal
          state={gameState}
          onContinuePlaying={() => {
            synth.playClick();
            setScreen('PLAYING');
          }}
          onPlayAgain={() => {
            clearSavedGame();
            setSavedGame(null);
            setScreen('CHARACTER_CREATE');
          }}
        />
      )}
    </div>
  );
}
