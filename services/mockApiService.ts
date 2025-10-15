
import { AnalysisResult, SolvedTicket, Kpi, EdaReport, TrainingStatus, ChartData, HeatmapData, TimeSeriesData } from '../types';
import { TICKET_MODULES } from '../constants';

const mockDelay = <T,>(data: T, delay = 1000): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

const mockSimilarTickets: SolvedTicket[] = [
  { ticket_no: 'TKT-01928', problem_description: 'Cannot connect to the company VPN from my home network. It was working yesterday.', solution_text: 'Resolved by clearing the VPN client cache and re-entering credentials.', similarity: 0.92 },
  { ticket_no: 'TKT-01874', problem_description: 'VPN client is asking for a password I do not have.', solution_text: 'User was using their login password instead of the VPN-specific multi-factor authentication code. Instructed on correct procedure.', similarity: 0.88 },
  { ticket_no: 'TKT-02011', problem_description: 'My login password is not working for the VPN access page.', solution_text: 'The VPN requires a separate token from the authenticator app, not the standard Windows password. Case closed.', similarity: 0.85 },
];

export const fetchSimilarIssues = (query: string): Promise<SolvedTicket[]> => {
  if (query.length < 10) return Promise.resolve([]);
  return mockDelay(mockSimilarTickets.slice(0, 2), 500);
};

export const analyzeIssue = (text: string, image?: File, module?: string, priority?: string): Promise<AnalysisResult> => {
  const result: AnalysisResult = {
    predictedModule: module || 'VPN & Network',
    predictedPriority: (priority as 'High' | 'Medium' | 'Low') || 'Medium',
    similarIssues: mockSimilarTickets,
    aiSuggestion: `
### AI-Generated Solution Steps

Based on your description, here is a suggested course of action to resolve the VPN connection issue:

1.  **Restart Your VPN Client**:
    *   Completely close the VPN application. Don't just minimize it.
    *   Wait for 30 seconds.
    *   Re-open the application.

2.  **Verify Your Credentials**:
    *   Are you using the correct password? Many systems use a separate One-Time Password (OTP) from an authenticator app (like Google Authenticator or Duo) for VPN access.
    *   Ensure you are not using your standard computer login password.

3.  **Check Network Connection**:
    *   Can you access other websites like google.com? If not, the issue may be with your home internet.
    *   Try restarting your home router.

4.  **Clear Client Cache (Advanced)**:
    *   In your VPN client settings, look for an option to "Clear Cache" or "Reset Configuration".
    *   This often resolves issues caused by outdated connection data.

If these steps do not resolve your issue, please proceed with creating a support ticket.
    `,
  };
  return mockDelay(result, 2500);
};

export const postFeedback = (solved: boolean): Promise<{ status: string }> => {
  console.log(`Feedback received: ${solved ? 'Solved' : 'Not Solved'}`);
  return mockDelay({ status: 'success' }, 300);
};

export const getInitialDashboardData = () => {
    const kpis: Kpi[] = [
        { name: 'Ticket Deflection Rate', value: '34%', change: '+2.1%' },
        { name: 'Avg. Time to Resolution', value: '4.2h', change: '-0.3h' },
        { name: 'First Contact Resolution', value: '78%', change: '+1.5%' },
    ];
    const rootCauses: ChartData[] = [
        { name: 'Login/Password', value: 450 },
        { name: 'VPN Access', value: 300 },
        { name: 'Software Install', value: 190 },
        { name: 'Hardware Failure', value: 120 },
        { name: 'Email Sync', value: 80 },
    ];
    const heatmap: HeatmapData[] = TICKET_MODULES.flatMap(cat => 
        (['Low', 'Medium', 'High'] as const).map(prio => ({
            category: cat,
            priority: prio,
            value: Math.floor(Math.random() * 100)
        }))
    );
    return mockDelay({ kpis, rootCauses, heatmap }, 800);
};

export const uploadKnowledgeBase = (file: File): Promise<EdaReport> => {
    const report: EdaReport = {
        fileName: file.name,
        fileSize: file.size,
        rowCount: 12450,
        columns: [
            { name: 'ticket_no', type: 'string', missing: 0 },
            { name: 'date', type: 'datetime', missing: 5 },
            { name: 'problem_description', type: 'string', missing: 0 },
            { name: 'category', type: 'string', missing: 12 },
            { name: 'priority', type: 'string', missing: 8 },
            { name: 'solution_text', type: 'string', missing: 25 },
        ]
    };
    return mockDelay(report, 1500);
};

let trainingStatus: TrainingStatus = 'idle';
export const startTraining = (): Promise<{ jobId: string }> => {
    trainingStatus = 'in_progress';
    setTimeout(() => { trainingStatus = 'complete'; }, 15000); // Simulate 15s training
    return mockDelay({ jobId: `train_${Date.now()}` }, 200);
};

export const getTrainingStatus = (): Promise<{ status: TrainingStatus }> => {
    return mockDelay({ status: trainingStatus }, 250);
};


export const getAnalyticsData = () => {
    const clusterData: ChartData[] = [
        { name: 'Password Resets', value: 400 },
        { name: 'MFA Token Issues', value: 300 },
        { name: 'Account Lockouts', value: 200 },
        { name: 'New User Access', value: 100 },
    ];

    const sentimentData: TimeSeriesData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [0.3, 0.25, 0.4, 0.35, 0.5, 0.45].map(v => v * 100),
    };

    return mockDelay({ clusterData, sentimentData, status: 'success' }, 1200);
};

export const getInsufficientAnalyticsData = () => {
    return mockDelay({ status: 'insufficient_data' }, 1200);
}
