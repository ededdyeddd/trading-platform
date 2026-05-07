"use client";

export function SentimentBar({
  buy,
  sell,
}: {
  buy: number;
  sell: number;
}) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px]">
      <span className="w-7 text-sell tabular-nums">{sell}%</span>
      <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-l-full bg-sell"
          style={{ width: `${sell}%` }}
        />
        <div
          className="h-full rounded-r-full bg-buy"
          style={{ width: `${buy}%` }}
        />
      </div>
      <span className="w-7 text-right text-buy tabular-nums">{buy}%</span>
    </div>
  );
}
