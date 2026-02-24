
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface OccupancyGaugeProps {
  percentage: number;
}

const OccupancyGauge: React.FC<OccupancyGaugeProps> = ({ percentage }) => {
  const { isDarkMode } = useTheme();
  
  const data = [
    { name: 'Occupied', value: percentage },
    { name: 'Vacant', value: 100 - percentage },
  ];

  // Logic: Green < 70, Amber 70-90, Red > 90
  const getAccentColor = () => {
    if (percentage < 70) return '#10b981'; // Emerald 500
    if (percentage <= 90) return '#f59e0b'; // Amber 500
    return '#ef4444'; // Red 500
  };

  const accentColor = getAccentColor();
  const bgColor = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  return (
    <div className="h-24 w-24 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={40}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill={accentColor} />
            <Cell fill={bgColor} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-lg font-black dark:text-white leading-none">{percentage}%</span>
      </div>
    </div>
  );
};

export default OccupancyGauge;
