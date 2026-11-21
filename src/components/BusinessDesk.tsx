import React, { useState } from 'react';
import { Briefcase, Building2, Home, Sliders, Users } from 'lucide-react';
import { CREW_ROSTER, LIFESTYLE_TIERS, RECORD_LABELS, STUDIO_TIERS } from '../data/worldData';
import { GameState, Skills } from '../types/game';
import { formatCash, formatCompact } from '../utils/format';

interface BusinessDeskProps {
  state: GameState;
  onTrainSkill: (skill: keyof Skills) => void;
  onSignLabel: (labelId: string, negotiate: boolean) => void;
  onBuyoutLabel: () => void;
  onHireCrew: (crewId: string) => void;
  onUpgradeStudio: () => void;
  onUpgradeLifestyle: () => void;
}

export const BusinessDesk: React.FC<BusinessDeskProps> = ({
  state,
  onTrainSkill,
  onSignLabel,
  onBuyoutLabel,
  onHireCrew,
  onUpgradeStudio,
  onUpgradeLifestyle,
}) => {
  const [section, setSection] = useState<'skills' | 'labels' | 'crew' | 'gear'>('skills');
  const { artist } = state;

  const nextStudio = STUDIO_TIERS[artist.studioLevel + 1];
  const currentStudio = STUDIO_TIERS[artist.studioLevel];
  const nextLifestyle = LIFESTYLE_TIERS[artist.lifestyleLevel + 1];
  const currentLifestyle = LIFESTYLE_TIERS[artist.lifestyleLevel];

  const skillMeta: { key: keyof Skills; label: string; desc: string }[] = [
    { key: 'songwriting', label: 'Songwriting & Pen', desc: 'Drives core lyrical depth and quality ceiling.' },
    { key: 'vocals', label: 'Vocals & Delivery', desc: 'Improves hook catchiness and studio takes.' },
    { key: 'production', label: 'Beat Production', desc: 'Boosts self-produced beats and mix control.' },
    { key: 'stagecraft', label: 'Stage Presence', desc: 'Increases live tour revenue and fan conversion.' },
    { key: 'marketing', label: 'Marketing & Rollout', desc: 'Multiplies single debut reach and press hype.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Career Craft, Labels & Management</h2>
          <p className="text-xs text-neutral-400">
            Reinvest royalties into your skills, studio hardware, executive crew, and label strategy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-md border border-white/10 bg-[#13161D] p-1">
          {[
            { id: 'skills', label: 'Skill Training' },
            { id: 'labels', label: 'Record Labels' },
            { id: 'crew', label: 'Crew & Team' },
            { id: 'gear', label: 'Studio & Living' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id as typeof section)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                section === tab.id ? 'bg-[#E5A93C] text-[#0B0D11]' : 'text-neutral-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {section === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillMeta.map((s) => {
            const val = artist.skills[s.key];
            const cost = Math.round(250 + val * 35);
            return (
              <div key={s.key} className="rounded-lg border border-white/10 bg-[#13161D] p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{s.label}</span>
                    <span className="font-mono-tabular text-sm font-bold text-[#E5A93C]">{val}/100</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#0B0D11] overflow-hidden">
                    <div className="h-full rounded-full bg-[#E5A93C]" style={{ width: `${val}%` }} />
                  </div>
                  <p className="text-xs text-neutral-400">{s.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onTrainSkill(s.key)}
                  disabled={val >= 100 || artist.energy < 1 || artist.cash < cost}
                  className="w-full rounded-md border border-white/15 bg-[#0B0D11] py-2.5 text-xs font-semibold text-white transition-colors hover:border-[#E5A93C] hover:text-[#FDE68A] disabled:opacity-40"
                >
                  {val >= 100 ? 'Mastered' : `Train (${formatCash(cost)} · 1 AP)`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {section === 'labels' && (
        <div className="space-y-6">
          {artist.labelContract ? (
            <div className="rounded-lg border border-[#E5A93C]/40 bg-[#13161D] p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[#E5A93C] font-medium">Active Recording Contract</p>
                  <h3 className="text-xl font-bold text-white">{artist.labelContract.labelName}</h3>
                </div>
                <button
                  type="button"
                  onClick={onBuyoutLabel}
                  disabled={artist.cash < artist.labelContract.buyoutCost}
                  className="rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-2 text-xs font-semibold text-[#FCA5A5] hover:bg-[#EF4444]/20 disabled:opacity-40"
                >
                  Buy Out Contract ({formatCash(artist.labelContract.buyoutCost)})
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-4 text-xs tabular-nums">
                <div>
                  <span className="block text-neutral-400">Your Royalty Split</span>
                  <span className="font-mono-tabular text-sm font-semibold text-white">
                    {Math.round(artist.labelContract.royaltySplit * 100)}%
                  </span>
                </div>
                <div>
                  <span className="block text-neutral-400">Albums Delivered</span>
                  <span className="font-mono-tabular text-sm font-semibold text-white">
                    {artist.labelContract.albumsDelivered} / {artist.labelContract.albumsRequired}
                  </span>
                </div>
                <div>
                  <span className="block text-neutral-400">Unrecouped Advance</span>
                  <span className="font-mono-tabular text-sm font-semibold text-[#E5A93C]">
                    {formatCash(artist.labelContract.advanceRemaining)}
                  </span>
                </div>
                <div>
                  <span className="block text-neutral-400">Promo Multiplier</span>
                  <span className="font-mono-tabular text-sm font-semibold text-[#22C55E]">
                    {artist.labelContract.promoBonus}x
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 bg-[#13161D] p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-[#22C55E]" />
                <div>
                  <p className="text-sm font-semibold text-white">Independent Status (100% Royalties & Masters)</p>
                  <p className="text-xs text-neutral-400">
                    Sign a label deal below for massive upfront cash advances and radio promo multipliers.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RECORD_LABELS.map((lbl) => {
              const eligible = artist.monthlyListeners >= lbl.minListeners;
              return (
                <div key={lbl.id} className="rounded-lg border border-white/10 bg-[#13161D] p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-[#E5A93C]">{lbl.tier}</p>
                      <h4 className="text-base font-bold text-white">{lbl.name}</h4>
                    </div>
                    <span className={`font-mono-tabular text-xs ${eligible ? 'text-[#22C55E]' : 'text-neutral-400'}`}>
                      {eligible ? 'Offer Open' : `Need ${formatCompact(lbl.minListeners)}`}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400">{lbl.description}</p>

                  <div className="grid grid-cols-3 gap-2 border-y border-white/10 py-3 text-xs tabular-nums">
                    <div>
                      <span className="block text-neutral-400">Advance</span>
                      <span className="font-mono-tabular font-semibold text-[#22C55E]">{formatCash(lbl.advance)}</span>
                    </div>
                    <div>
                      <span className="block text-neutral-400">Split</span>
                      <span className="font-mono-tabular font-semibold text-white">{Math.round(lbl.royaltySplit * 100)}%</span>
                    </div>
                    <div>
                      <span className="block text-neutral-400">Promo</span>
                      <span className="font-mono-tabular font-semibold text-[#E5A93C]">{lbl.promoBonus}x · {lbl.albumsRequired} Alb</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onSignLabel(lbl.id, false)}
                      disabled={Boolean(artist.labelContract) || !eligible}
                      className="flex-1 rounded-md bg-white/10 py-2 text-xs font-semibold text-white hover:bg-[#E5A93C] hover:text-[#0B0D11] disabled:opacity-40"
                    >
                      Accept Deal
                    </button>
                    <button
                      type="button"
                      onClick={() => onSignLabel(lbl.id, true)}
                      disabled={Boolean(artist.labelContract) || !eligible}
                      className="flex-1 rounded-md border border-[#E5A93C]/50 py-2 text-xs font-semibold text-[#FDE68A] hover:bg-[#E5A93C]/15 disabled:opacity-40"
                    >
                      Negotiate Higher
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {section === 'crew' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CREW_ROSTER.map((member) => {
            const hired = artist.crewIds.includes(member.id);
            const eligible = artist.monthlyListeners >= member.minListeners;
            return (
              <div key={member.id} className="rounded-lg border border-white/10 bg-[#13161D] p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs text-[#E5A93C] font-medium">
                      <Users className="h-3.5 w-3.5" />
                      {member.role}
                    </span>
                    <span className="font-mono-tabular text-xs text-neutral-400">
                      {formatCash(member.weeklySalary)}/wk
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">{member.name}</h4>
                  <p className="text-xs text-neutral-300">{member.benefit}</p>
                </div>

                {hired ? (
                  <div className="rounded-md border border-[#22C55E]/30 bg-[#22C55E]/10 py-2 text-center text-xs font-semibold text-[#22C55E]">
                    On Your Executive Team
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onHireCrew(member.id)}
                    disabled={!eligible || artist.cash < member.hireCost}
                    className="w-full rounded-md bg-white/10 py-2.5 text-xs font-semibold text-white hover:bg-[#E5A93C] hover:text-[#0B0D11] disabled:opacity-40"
                  >
                    {!eligible
                      ? `Requires ${formatCompact(member.minListeners)} Listeners`
                      : `Hire (${formatCash(member.hireCost)} signing)`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {section === 'gear' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Studio Rig Upgrade */}
          <div className="rounded-lg border border-white/10 bg-[#13161D] p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#E5A93C] font-medium">
              <Sliders className="h-4 w-4" />
              <span>Recording Hardware</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Current: {currentStudio.name}</h3>
              <p className="mt-1 text-xs text-neutral-400">{currentStudio.description}</p>
              <p className="mt-2 font-mono-tabular text-xs text-neutral-300">
                Quality Cap: {currentStudio.qualityCap}/100 · +{currentStudio.bonus} Quality Bonus
              </p>
            </div>

            {nextStudio ? (
              <div className="border-t border-white/10 pt-4 space-y-3">
                <p className="text-xs text-neutral-200">
                  Next Tier: <strong className="text-white">{nextStudio.name}</strong> (Cap {nextStudio.qualityCap}, +{nextStudio.bonus} Quality)
                </p>
                <button
                  type="button"
                  onClick={onUpgradeStudio}
                  disabled={artist.cash < nextStudio.cost}
                  className="w-full rounded-md bg-[#E5A93C] py-2.5 text-xs font-semibold text-[#0B0D11] hover:bg-[#F0B94E] disabled:opacity-40"
                >
                  Upgrade Studio ({formatCash(nextStudio.cost)})
                </button>
              </div>
            ) : (
              <div className="border-t border-white/10 pt-4 text-xs font-semibold text-[#22C55E]">
                Maximum World-Class Studio Tier Reached
              </div>
            )}
          </div>

          {/* Lifestyle & Energy Upgrade */}
          <div className="rounded-lg border border-white/10 bg-[#13161D] p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#E5A93C] font-medium">
              <Home className="h-4 w-4" />
              <span>Residence & Stamina</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Current: {currentLifestyle.name}</h3>
              <p className="mt-1 text-xs text-neutral-400">{currentLifestyle.description}</p>
              <p className="mt-2 font-mono-tabular text-xs text-neutral-300">
                Weekly Rent: {formatCash(currentLifestyle.weeklyCost)} · Max Energy: {currentLifestyle.maxEnergy} AP/wk
              </p>
            </div>

            {nextLifestyle ? (
              <div className="border-t border-white/10 pt-4 space-y-3">
                <p className="text-xs text-neutral-200">
                  Next Tier: <strong className="text-white">{nextLifestyle.name}</strong> ({nextLifestyle.maxEnergy} AP/wk · {formatCash(nextLifestyle.weeklyCost)}/wk)
                </p>
                <button
                  type="button"
                  onClick={onUpgradeLifestyle}
                  disabled={artist.cash < nextLifestyle.upgradeCost}
                  className="w-full rounded-md bg-[#E5A93C] py-2.5 text-xs font-semibold text-[#0B0D11] hover:bg-[#F0B94E] disabled:opacity-40"
                >
                  Move Up ({formatCash(nextLifestyle.upgradeCost)})
                </button>
              </div>
            ) : (
              <div className="border-t border-white/10 pt-4 text-xs font-semibold text-[#22C55E]">
                Icon Estate Tier Reached
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
