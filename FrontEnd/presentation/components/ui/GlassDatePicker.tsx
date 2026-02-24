import React, { useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useClickOutside } from '../../hooks/useClickOutside';

type Period = 'Day' | 'Week' | 'Month' | 'Year';

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const GlassDatePicker: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [period, setPeriod] = useState<Period>('Day');
  const [selectedDate, setSelectedDate] = useState(new Date()); // The actual value
  const [viewDate, setViewDate] = useState(new Date()); // The navigation state
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useClickOutside(containerRef, useCallback(() => setIsOpen(false), []));

  // Calendar Logic
  const getDaysArray = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun

    const days = [];
    // Padding for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Styles based on theme
  const activeTabClass = isDarkMode 
    ? "bg-white/10 text-white shadow-sm" 
    : "bg-white text-gray-900 shadow-sm";
  
  const inactiveTabClass = isDarkMode
    ? "text-gray-400 hover:text-white hover:bg-white/5"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50";

  const accentColorClass = isDarkMode ? "bg-accent text-white" : "bg-emerald-500 text-white";
  const accentTextClass = isDarkMode ? "text-accent" : "text-emerald-500";
  const hoverAccentClass = isDarkMode ? "hover:bg-accent-strong" : "hover:bg-emerald-600";

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300
          ${isOpen 
            ? (isDarkMode ? 'bg-white/10 ring-2 ring-orange-500/20' : 'bg-white ring-2 ring-emerald-500/20') 
            : (isDarkMode ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white/50 hover:bg-white/80 border border-white/40')
          }
        `}
      >
        <div className={`flex items-center gap-2 text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
          <span className={isDarkMode ? 'text-accent' : 'text-emerald-600'}>{period}</span>
          <span className="w-1 h-1 rounded-full bg-gray-400"></span>
          <span>{formatDate(selectedDate)}</span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className={`
          absolute right-0 top-full mt-4 w-80 z-50 
          glass-card rounded-3xl p-5 
          animate-in fade-in zoom-in-95 duration-200
        `}>
          
          {/* Tabs */}
          <div className={`flex p-1 rounded-xl mb-6 ${isDarkMode ? 'bg-black/20' : 'bg-gray-100/50'}`}>
            {['Day', 'Week', 'Month', 'Year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as Period)}
                className={`
                  flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200
                  ${period === p ? activeTabClass : inactiveTabClass}
                `}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="text-left">
              <h3 className={`text-lg font-bold leading-none ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {months[viewDate.getMonth()]}
              </h3>
              <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {viewDate.getFullYear()}
              </p>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={handlePrevMonth}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={handleNextMonth}
                className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="mb-6">
            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-3 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                <div key={day} className={`text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* Days */}
            <div className="grid grid-cols-7 gap-y-1 gap-x-1">
              {getDaysArray().map((day, index) => {
                if (day === null) return <div key={`empty-${index}`} />;
                
                const isSelected = 
                  day === selectedDate.getDate() && 
                  viewDate.getMonth() === selectedDate.getMonth() && 
                  viewDate.getFullYear() === selectedDate.getFullYear();

                const isToday = 
                    day === new Date().getDate() && 
                    viewDate.getMonth() === new Date().getMonth() &&
                    viewDate.getFullYear() === new Date().getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                      ${isSelected 
                        ? `${accentColorClass} shadow-lg shadow-${isDarkMode ? 'orange' : 'emerald'}-500/30 scale-105` 
                        : isDarkMode 
                          ? 'text-gray-300 hover:bg-white/10' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                      ${!isSelected && isToday ? (isDarkMode ? 'ring-1 ring-orange-500 text-accent' : 'ring-1 ring-emerald-500 text-emerald-600') : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer / Apply */}
          <div className={`pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDate(selectedDate)}
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all
                  ${accentColorClass} ${hoverAccentClass}
                `}
              >
                <Check size={14} strokeWidth={3} />
                Apply
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default GlassDatePicker;