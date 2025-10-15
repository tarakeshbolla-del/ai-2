export interface SolvedTicket {
  ticket_no: string;
  problem_description: string;
  solution_text: string;
  similarity?: number;
}

export interface AnalysisResult {
  predictedModule: string;
  predictedPriority: 'High' | 'Medium' | 'Low';
  similarIssues: SolvedTicket[];
  aiSuggestion: string;
}

export interface Kpi {
  name: string;
  value: string;
  change: string;
}

export type TrainingStatus = 'idle' | 'in_progress' | 'complete' | 'failed';

export interface EdaReport {
  fileName: string;
  fileSize: number;
  rowCount: number;
  columns: { name: string; type: string; missing: number }[];
}

export interface ChartData {
  name: string;
  value: number;
  // Fix: Add index signature to be compatible with recharts Pie component, which expects a more generic object type for its data prop.
  [key: string]: string | number;
}

export interface HeatmapData {
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  value: number;
}

export interface TimeSeriesData {
  labels: string[];
  data: number[];
}
