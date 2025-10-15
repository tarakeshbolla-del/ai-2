
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Card, Button } from '../components/ui/CommonUI';
import { RootCauseChart, WordCloud, BusinessImpactHeatmap, ClusterAnalysisChart, SentimentTrendChart } from '../components/charts/Charts';
import { Kpi, EdaReport, TrainingStatus, ChartData, HeatmapData, TimeSeriesData } from '../types';
import { getInitialDashboardData, uploadKnowledgeBase, startTraining, getTrainingStatus, getAnalyticsData, getInsufficientAnalyticsData } from '../services/mockApiService';
import { UploadIcon } from '../components/Icons';


type AdminView = 'dashboard' | 'analytics' | 'kb' | 'settings';

const DashboardView: React.FC = () => {
  const [kpis, setKpis] = useState<Kpi[]>([]);
  const [rootCauses, setRootCauses] = useState<ChartData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    getInitialDashboardData().then(data => {
      setKpis(data.kpis);
      setRootCauses(data.rootCauses);
      setHeatmapData(data.heatmap);
      setSelectedCategory(data.rootCauses[0]?.name);
    });
    
    const interval = setInterval(() => {
        // Simulate WebSocket push
        setKpis(prev => prev.map(kpi => {
            const change = (Math.random() * 0.2 - 0.1).toFixed(1);
            const newValue = (parseFloat(kpi.value) + parseFloat(change)).toFixed(1);
            return { ...kpi, value: `${newValue}%`, change: `${change[0] !== '-' ? '+' : ''}${change}%`};
        }));
        setHeatmapData(prev => prev.map(cell => ({...cell, value: Math.max(0, Math.min(100, cell.value + Math.floor(Math.random() * 6 - 3)))})));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const wordCloudData = selectedCategory ? [
      { text: 'password', value: 60 }, { text: 'reset', value: 55 }, { text: 'login', value: 50 },
      { text: 'account', value: 45 }, { text: 'locked', value: 40 }, { text: 'MFA', value: 30 },
      { text: 'VPN', value: selectedCategory === 'VPN Access' ? 70 : 25 },
    ] : [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map(kpi => (
            <Card key={kpi.name}>
                <p className="text-slate-500 dark:text-slate-400">{kpi.name}</p>
                <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">{kpi.value}</p>
                <p className={`text-sm font-semibold ${kpi.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{kpi.change} vs last period</p>
            </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1">
            <h3 className="text-xl font-bold mb-4">Root Cause Funnel</h3>
            <RootCauseChart data={rootCauses} onBarClick={(cat) => setSelectedCategory(cat)} />
        </Card>
        <Card className="col-span-1">
            <h3 className="text-xl font-bold mb-4">Word Cloud: {selectedCategory}</h3>
            <WordCloud words={wordCloudData} />
        </Card>
      </div>
      <Card>
          <h3 className="text-xl font-bold mb-4">Business Impact Heatmap</h3>
          <BusinessImpactHeatmap data={heatmapData} />
      </Card>
    </div>
  );
};


const AnalyticsView: React.FC = () => {
    const [clusterData, setClusterData] = useState<ChartData[]>([]);
    const [sentimentData, setSentimentData] = useState<TimeSeriesData>({labels: [], data: []});
    const [clusterStatus, setClusterStatus] = useState<'loading' | 'success' | 'insufficient_data' | 'no_clusters_found'>('loading');

    useEffect(() => {
        getAnalyticsData().then(data => {
            if (data.status === 'success') {
                setClusterData(data.clusterData);
                setSentimentData(data.sentimentData);
                setClusterStatus('success');
            } else {
                setClusterStatus(data.status as 'insufficient_data' | 'no_clusters_found');
            }
        });
    }, []);

    const renderClusterContent = () => {
        switch(clusterStatus) {
            case 'loading': return <p className="text-center p-8">Loading analysis...</p>;
            case 'insufficient_data': return <p className="text-center p-8 text-orange-500">Insufficient data for cluster analysis. At least 200 tickets are required.</p>;
            case 'no_clusters_found': return <p className="text-center p-8 text-slate-500">No distinct problem clusters could be identified from the data.</p>;
            case 'success': return <ClusterAnalysisChart data={clusterData} />;
        }
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Analytics & Reporting</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-bold mb-4">AI-Powered Problem Cluster Analysis</h3>
                    {renderClusterContent()}
                </Card>
                <Card>
                    <h3 className="text-xl font-bold mb-4">User Frustration Index (Sentiment Trend)</h3>
                    <SentimentTrendChart data={sentimentData} />
                </Card>
            </div>
        </div>
    );
};

const KnowledgeBaseView: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [edaReport, setEdaReport] = useState<EdaReport | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>('idle');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setIsUploading(true);
            setEdaReport(null);
            const report = await uploadKnowledgeBase(selectedFile);
            setEdaReport(report);
            setIsUploading(false);
        }
    };
    
    const handleStartTraining = useCallback(() => {
        startTraining().then(() => setTrainingStatus('in_progress'));
    }, []);

    useEffect(() => {
        if (trainingStatus === 'in_progress') {
            const interval = setInterval(async () => {
                const { status } = await getTrainingStatus();
                if (status === 'complete' || status === 'failed') {
                    setTrainingStatus(status);
                    clearInterval(interval);
                }
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [trainingStatus]);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Knowledge Base Management</h2>
            <Card>
                <h3 className="text-xl font-bold mb-4">Upload New Knowledge Base (CSV)</h3>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                        <UploadIcon className="w-12 h-12 text-slate-400" />
                        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">CSV file with required columns</p>
                        <input id="csv-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                    </label>
                </div>
                {isUploading && <p className="text-center mt-4">Uploading and analyzing...</p>}
            </Card>

            {edaReport && (
                <Card className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-4">Exploratory Data Analysis Report</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        <div><p className="text-sm text-slate-500">File Name</p><p className="font-semibold">{edaReport.fileName}</p></div>
                        <div><p className="text-sm text-slate-500">File Size</p><p className="font-semibold">{(edaReport.fileSize / 1024 / 1024).toFixed(2)} MB</p></div>
                        <div><p className="text-sm text-slate-500">Row Count</p><p className="font-semibold">{edaReport.rowCount.toLocaleString()}</p></div>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800"><tr><th className="p-2">Column</th><th>Type</th><th>Missing Values</th></tr></thead>
                        <tbody>
                            {edaReport.columns.map(col => <tr key={col.name} className="border-b dark:border-slate-700">
                                <td className="p-2 font-mono">{col.name}</td><td>{col.type}</td><td>{col.missing} ({ (col.missing/edaReport.rowCount * 100).toFixed(2) }%)</td></tr>)}
                        </tbody>
                    </table>
                     <div className="text-center mt-6">
                        <Button onClick={handleStartTraining} disabled={trainingStatus === 'in_progress'}>
                            {trainingStatus === 'idle' && 'Start Model Training'}
                            {trainingStatus === 'in_progress' && 'Training in Progress...'}
                            {trainingStatus === 'complete' && '✅ Training Complete - Start New'}
                            {trainingStatus === 'failed' && 'Training Failed - Retry'}
                        </Button>
                        {trainingStatus === 'in_progress' && <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-4"><div className="bg-cyan-500 h-2.5 rounded-full animate-pulse"></div></div>}
                     </div>
                </Card>
            )}
        </div>
    );
};

const SettingsView: React.FC = () => (
    <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="mt-4 text-slate-500">Settings page is under construction.</p>
    </div>
);

const AdminExperience: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'analytics': return <AnalyticsView />;
      case 'kb': return <KnowledgeBaseView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <AdminLayout activeView={activeView} setActiveView={setActiveView}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminExperience;
