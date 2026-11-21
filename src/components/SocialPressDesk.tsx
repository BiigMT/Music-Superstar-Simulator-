import React, { useState } from 'react';
import { Flame, Handshake, Heart, MessageSquare, Mic, Radio, Repeat2 } from 'lucide-react';
import { GameState } from '../types/game';
import { formatCompact } from '../utils/format';

interface SocialPressDeskProps {
  state: GameState;
  onSocialAction: (action: 'snippet' | 'interview' | 'callout', targetRivalId?: string) => void;
  onGiftRival: (rivalId: string) => void;
}

export const SocialPressDesk: React.FC<SocialPressDeskProps> = ({
  state,
  onSocialAction,
  onGiftRival,
}) => {
  const [selectedRivalId, setSelectedRivalId] = useState(state.rivals[0]?.id ?? '');
  const { artist } = state;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* Left: Promo Actions & Pulse Feed */}
      <div className="xl:col-span-7 space-y-6">
        <div className="rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-lg font-bold text-white">Promo & Press Desk</h2>
            <p className="text-xs text-neutral-400">
              Drive organic buzz before releasing music. Each action uses 1 Energy AP.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onSocialAction('snippet')}
              disabled={artist.energy < 1 || state.snippetBoostActive}
              className="rounded-md border border-white/10 bg-[#0B0D11] p-4 text-left transition-colors hover:border-[#E5A93C] disabled:opacity-45"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <Mic className="h-4 w-4 text-[#E5A93C]" />
                  Drop Studio Snippet
                </span>
                <span className="text-[11px] font-mono-tabular text-[#E5A93C]">1 AP</span>
              </div>
              <p className="mt-1.5 text-xs text-neutral-400">
                {state.snippetBoostActive
                  ? 'Active: Your next Single release gets +35% debut streams!'
                  : '+6 Hype and +35% debut streams on your next single drop.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onSocialAction('interview')}
              disabled={artist.energy < 1 || state.interviewCooldown > 0}
              className="rounded-md border border-white/10 bg-[#0B0D11] p-4 text-left transition-colors hover:border-[#E5A93C] disabled:opacity-45"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <Radio className="h-4 w-4 text-[#E5A93C]" />
                  Press & Radio Run
                </span>
                <span className="text-[11px] font-mono-tabular text-[#E5A93C]">
                  {state.interviewCooldown > 0 ? `${state.interviewCooldown}w CD` : '1 AP'}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-neutral-400">
                +9 Hype, +4 Reputation, and rapid listener conversion across radio.
              </p>
            </button>
          </div>
        </div>

        {/* Social Feed */}
        <div className="rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-semibold text-white">Pulse Social Feed</h3>
            <span className="font-mono-tabular text-xs text-neutral-400">
              {formatCompact(artist.followers)} Followers
            </span>
          </div>

          <div className="divide-y divide-white/5 max-h-[520px] overflow-y-auto pr-1">
            {state.socialFeed.map((post) => (
              <div key={post.id} className="py-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`font-semibold truncate ${post.isPlayer ? 'text-[#FDE68A]' : 'text-white'}`}>
                      {post.authorName}
                    </span>
                    <span className="text-neutral-500 truncate">{post.handle}</span>
                    <span className="text-neutral-600" aria-hidden="true">·</span>
                    <span className="text-neutral-400">W{post.week}</span>
                  </div>
                  <span
                    className={`text-[11px] font-medium shrink-0 ${
                      post.category === 'Feud'
                        ? 'text-[#EF4444]'
                        : post.category === 'Milestone'
                          ? 'text-[#E5A93C]'
                          : 'text-neutral-400'
                    }`}
                  >
                    {post.category}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-neutral-200">{post.content}</p>
                <div className="flex items-center gap-5 text-[11px] text-neutral-400 font-mono-tabular">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-neutral-500" />
                    {formatCompact(post.likes)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Repeat2 className="h-3.5 w-3.5 text-neutral-500" />
                    {formatCompact(post.reposts)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Industry Artists, Alliances & Beefs */}
      <div className="xl:col-span-5 rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-base font-semibold text-white">Industry Peers & Rivals</h3>
          <p className="text-xs text-neutral-400">
            Build allies (60+ respect) for free features, or spark a feud for instant viral hype.
          </p>
        </div>

        <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {state.rivals.map((rival) => {
            const selected = selectedRivalId === rival.id;
            return (
              <div
                key={rival.id}
                onClick={() => setSelectedRivalId(rival.id)}
                className={`cursor-pointer rounded-md border p-3.5 transition-colors ${
                  selected ? 'border-[#E5A93C] bg-[#1C202B]' : 'border-white/10 bg-[#0B0D11] hover:border-white/25'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {rival.name}
                      {rival.activeFeud && <span className="ml-2 text-[11px] text-[#EF4444]">(Active Feud)</span>}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {rival.genre} · {rival.labelName} · {formatCompact(rival.monthlyListeners)} listeners
                    </p>
                  </div>
                  <span
                    className={`font-mono-tabular text-xs font-semibold ${
                      rival.relationship >= 40
                        ? 'text-[#22C55E]'
                        : rival.relationship <= -20
                          ? 'text-[#EF4444]'
                          : 'text-neutral-300'
                    }`}
                  >
                    {rival.relationship > 0 ? `+${rival.relationship}` : rival.relationship}
                  </span>
                </div>

                {selected && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onGiftRival(rival.id);
                      }}
                      disabled={artist.cash < 750 || artist.energy < 1}
                      className="inline-flex items-center gap-1.5 rounded border border-white/15 bg-[#0B0D11] px-3 py-1.5 text-xs font-medium text-neutral-200 hover:border-[#22C55E] disabled:opacity-40"
                    >
                      <Handshake className="h-3.5 w-3.5 text-[#22C55E]" />
                      <span>Send Studio Gift ($750 · 1 AP)</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSocialAction('callout', rival.id);
                      }}
                      disabled={artist.energy < 1}
                      className="inline-flex items-center gap-1.5 rounded border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-1.5 text-xs font-medium text-[#FCA5A5] hover:bg-[#EF4444]/20 disabled:opacity-40"
                    >
                      <Flame className="h-3.5 w-3.5 text-[#EF4444]" />
                      <span>Call Out Online (1 AP)</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-1">
          <MessageSquare className="h-3.5 w-3.5 text-[#E5A93C] shrink-0" />
          <span>Want to escalate a beef? Record a Diss track inside the Studio Desk.</span>
        </p>
      </div>
    </div>
  );
};
