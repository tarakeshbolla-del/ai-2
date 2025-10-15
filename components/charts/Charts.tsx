
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useTheme } from '../Theme';
import { ChartData, HeatmapData, TimeSeriesData } from '../../types';
import { TICKET_MODULES, TICKET_PRIORITIES } from '../../constants';

interface RootCauseChartProps {
  data: ChartData[];
  onBarClick: (category: string) => void;
}
export const RootCauseChart: React.FC<RootCauseChartProps> = ({ data, onBarClick }) => {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? { text: '#E2E8F0', accent: '#22D3EE', grid: '#334155' } : { text: '#2C3E50', accent: '#0EA5E9', grid: '#E2E8F0' };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey="name" tick={{ fill: colors.text }} />
        <YAxis tick={{ fill: colors.text }} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme === 'dark' ? '#112E4A' : '#FFFFFF',
            borderColor: colors.grid,
          }}
          cursor={{ fill: 'rgba(119, 136, 153, 0.2)' }}
        />
        <Legend wrapperStyle={{ color: colors.text }}/>
        <Bar dataKey="value" name="Ticket Count" fill={colors.accent} onClick={(d) => onBarClick(d.name)} cursor="pointer" />
      </BarChart>
    </ResponsiveContainer>
  );
};


interface WordCloudProps {
  words: { text: string; value: number }[];
}
export const WordCloud: React.FC<WordCloudProps> = ({ words }) => {
  const maxVal = Math.max(...words.map(w => w.value));
  const minVal = Math.min(...words.map(w => w.value));

  const getFontSize = (value: number) => {
    if (maxVal === minVal) return '1rem';
    const size = 1 + ((value - minVal) / (maxVal - minVal)) * 1.5;
    return `${size}rem`;
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-4 min-h-[300px]">
      {words.map((word) => (
        <span key={word.text} style={{ fontSize: getFontSize(word.value) }}
            className="text-cyan-500 dark:text-cyan-400 font-bold transition-all duration-300 hover:scale-110">
            {word.text}
        </span>
      ))}
    </div>
  );
};

interface HeatmapProps {
  data: HeatmapData[];
}
export const BusinessImpactHeatmap: React.FC<HeatmapProps> = ({ data }) => {
    const getColor = (value: number) => {
        if (value > 80) return 'bg-red-500/80';
        if (value > 60) return 'bg-orange-500/80';
        if (value > 40) return 'bg-yellow-500/80';
        if (value > 20) return 'bg-cyan-500/80';
        return 'bg-cyan-500/60';
    };

    const gridData = TICKET_PRIORITIES.slice().reverse().map(prio => 
      TICKET_MODULES.map(cat => 
        data.find(d => d.priority === prio && d.category === cat)?.value || 0
      )
    );

    return (
        <div className="p-4">
            <div className="flex">
                <div className="w-32 flex-shrink-0">
                    {TICKET_PRIORITIES.slice().reverse().map(p => <div key={p} className="h-16 flex items-center justify-end pr-2 font-semibold text-slate-600 dark:text-slate-300">{p}</div>)}
                </div>
                <div className="flex-grow grid grid-cols-6 gap-1">
                    {gridData.flat().map((value, i) => (
                        <div key={i} className={`h-16 rounded flex items-center justify-center text-white font-bold text-lg ${getColor(value)}`}>
                            {value}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex">
                <div className="w-32 flex-shrink-0"></div>
                <div className="flex-grow grid grid-cols-6 gap-1 mt-1">
                    {TICKET_MODULES.map(cat => <div key={cat} className="text-center text-xs text-slate-500 dark:text-slate-400 transform -rotate-25 ">{cat}</div>)}
                </div>
            </div>
        </div>
    );
};


interface ClusterAnalysisChartProps {
    data: ChartData[];
}
export const ClusterAnalysisChart: React.FC<ClusterAnalysisChartProps> = ({ data }) => {
    const { theme } = useTheme();
    const colors = ['#0EA5E9', '#22D3EE', '#67E8F9', '#A5F3FC'];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#112E4A' : '#FFFFFF' }} />
                <Legend wrapperStyle={{ color: theme === 'dark' ? '#E2E8F0' : '#2C3E50' }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

interface SentimentTrendChartProps {
    data: TimeSeriesData;
}
export const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({ data }) => {
    const { theme } = useTheme();
    const colors = theme === 'dark' ? { text: '#E2E8F0', accent: '#22D3EE', grid: '#334155' } : { text: '#2C3E50', accent: '#0EA5E9', grid: '#E2E8F0' };

    const chartData = data.labels.map((label, index) => ({
        name: label,
        value: data.data[index] || 0,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="name" tick={{ fill: colors.text }} />
                <YAxis tick={{ fill: colors.text }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#112E4A' : '#FFFFFF',
                    borderColor: colors.grid,
                  }}
                />
                <Legend wrapperStyle={{ color: colors.text }}/>
                <Line type="monotone" dataKey="value" name="Frustration Index" stroke={colors.accent} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

