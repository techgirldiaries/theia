interface BarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  title?: string;
  height?: number;
  showValues?: boolean;
}

export function BarChart({
  data,
  title,
  height = 200,
  showValues = true,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
      {title && (
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <div class="relative" style={{ height: `${height}px` }}>
        {/* Y-axis grid lines */}
        <div class="absolute inset-0 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              class="border-t border-zinc-200 dark:border-zinc-700"
            />
          ))}
        </div>

        {/* Bars */}
        <div class="absolute inset-0 flex items-end justify-around gap-x-2 px-2">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * 100;
            const colorClass = item.color || "bg-indigo-500";

            return (
              <div
                key={index}
                class="flex flex-col items-center justify-end flex-1"
                style={{ maxWidth: `${barWidth}%` }}
              >
                {showValues && item.value > 0 && (
                  <span class="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {item.value}
                  </span>
                )}
                <div
                  class={`w-full ${colorClass} rounded-t transition-all duration-300 hover:opacity-80`}
                  style={{ height: `${barHeight}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div class="flex justify-around mt-2 gap-x-2">
        {data.map((item, index) => (
          <div
            key={index}
            class="text-xs text-zinc-600 dark:text-zinc-400 text-center flex-1 truncate"
            style={{ maxWidth: `${barWidth}%` }}
            title={item.label}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
