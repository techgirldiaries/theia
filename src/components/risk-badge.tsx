interface RiskBadgeProps {
  score: number;
  label?: string;
}

export function RiskBadge({ score, label = "Risk Score" }: RiskBadgeProps) {
  const getRiskCategory = (score: number) => {
    if (score >= 86)
      return { label: "CRITICAL", color: "bg-red-600 dark:bg-red-700" };
    if (score >= 71)
      return { label: "HIGH", color: "bg-orange-600 dark:bg-orange-700" };
    if (score >= 46)
      return {
        label: "MEDIUM-HIGH",
        color: "bg-yellow-600 dark:bg-yellow-700",
      };
    if (score >= 26)
      return { label: "MEDIUM-LOW", color: "bg-blue-600 dark:bg-blue-700" };
    return { label: "LOW", color: "bg-green-600 dark:bg-green-700" };
  };

  const risk = getRiskCategory(score);

  return (
    <div class="inline-flex items-center gap-x-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
      <span class="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}:
      </span>
      <span
        class={`text-xs font-bold text-white px-2 py-0.5 rounded ${risk.color}`}
      >
        {score}/100
      </span>
      <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        {risk.label}
      </span>
    </div>
  );
}
