interface LineChartProps {
  data: {
    label: string;
    value: number;
  }[];
  title?: string;
  height?: number;
  color?: string;
  showDots?: boolean;
  yAxisLabel?: string;
}

export function LineChart({
  data,
  title,
  height = 200,
  color = "stroke-indigo-500",
  showDots = true,
  yAxisLabel,
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
        {title && (
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            {title}
          </h3>
        )}
        <div
          class="flex items-center justify-center text-zinc-500 dark:text-zinc-400"
          style={{ height: `${height}px` }}
        >
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  const padding = 40;
  const chartWidth = 600;
  const chartHeight = height;
  const pointSpacing = (chartWidth - padding * 2) / (data.length - 1 || 1);

  // Generate path for the line
  const pathPoints = data.map((point, index) => {
    const x = padding + index * pointSpacing;
    const y =
      chartHeight -
      padding -
      ((point.value - minValue) / range) * (chartHeight - padding * 2);
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  });

  const linePath = pathPoints.join(" ");

  // Generate area fill path
  const areaPath =
    linePath +
    ` L ${padding + (data.length - 1) * pointSpacing} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  return (
    <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 transition-colors">
      {title && (
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          {title}
        </h3>
      )}
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        class="w-full"
        style={{ height: `${height}px` }}
      >
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => {
          const y = padding + (i * (chartHeight - padding * 2)) / 4;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={chartWidth - padding}
              y2={y}
              class="stroke-zinc-200 dark:stroke-zinc-700"
              stroke-width="1"
            />
          );
        })}

        {/* Area fill */}
        <path
          d={areaPath}
          class={`${color.replace("stroke", "fill")} opacity-10`}
        />

        {/* Line */}
        <path
          d={linePath}
          class={color}
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        {/* Data points */}
        {showDots &&
          data.map((point, index) => {
            const x = padding + index * pointSpacing;
            const y =
              chartHeight -
              padding -
              ((point.value - minValue) / range) * (chartHeight - padding * 2);
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  class={`${color.replace("stroke", "fill")} opacity-75`}
                />
                <circle
                  cx={x}
                  cy={y}
                  r="2"
                  class="fill-white dark:fill-zinc-800"
                />
              </g>
            );
          })}

        {/* Y-axis labels */}
        {[...Array(5)].map((_, i) => {
          const value = maxValue - (i * range) / 4;
          const y = padding + (i * (chartHeight - padding * 2)) / 4;
          return (
            <text
              key={i}
              x={padding - 10}
              y={y + 4}
              text-anchor="end"
              class="text-xs fill-zinc-600 dark:fill-zinc-400"
            >
              {value.toFixed(0)}
            </text>
          );
        })}

        {/* X-axis labels */}
        {data.map((point, index) => {
          const x = padding + index * pointSpacing;
          const showLabel = index % Math.ceil(data.length / 6) === 0;
          if (!showLabel) return null;
          return (
            <text
              key={index}
              x={x}
              y={chartHeight - padding + 20}
              text-anchor="middle"
              class="text-xs fill-zinc-600 dark:fill-zinc-400"
            >
              {point.label}
            </text>
          );
        })}
      </svg>

      {yAxisLabel && (
        <p class="text-xs text-zinc-500 dark:text-zinc-500 text-center mt-2">
          {yAxisLabel}
        </p>
      )}
    </div>
  );
}
