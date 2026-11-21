export function formatCash(amount: number): string {
  const abs = Math.abs(Math.round(amount));
  const prefix = amount < 0 ? '-$' : '$';
  if (abs >= 1_000_000_000) {
    return `${prefix}${(abs / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${prefix}${(abs / 1_000_000).toFixed(2)}M`;
  }
  return `${prefix}${abs.toLocaleString('en-US')}`;
}

export function formatCompact(num: number): string {
  const abs = Math.abs(Math.round(num));
  if (abs >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 10_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return Math.round(num).toLocaleString('en-US');
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
