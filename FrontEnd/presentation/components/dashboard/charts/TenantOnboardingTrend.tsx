import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  YAxis,
} from "recharts";
import { useTheme } from "../../../hooks/useTheme";

const data = [
  { name: "Sep", value: 4 },
  { name: "Oct", value: 7 },
  { name: "Nov", value: 5 },
  { name: "Dec", value: 8 },
  { name: "Jan", value: 10 },
  { name: "Feb", value: 3 }, // Highlighted Current Month
];

const TenantOnboardingTrend: React.FC = () => {
  const { isDarkMode } = useTheme();
  const brandColor = isDarkMode ? "#f97316" : "#3b82f6";

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: isDarkMode ? "#52525b" : "#94a3b8",
              fontSize: 10,
              fontWeight: 700,
            }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              backgroundColor: isDarkMode ? "#18181b" : "#fff",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              fontSize: "12px",
              fontWeight: 700,
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={38}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  index === data.length - 1
                    ? brandColor
                    : isDarkMode
                      ? "#27272a"
                      : "#e2e8f0"
                }
                className={
                  index === data.length - 1
                    ? "filter drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                    : ""
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TenantOnboardingTrend;
