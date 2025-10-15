
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, LoadingOverlay, MarkdownRenderer } from '../components/ui/CommonUI';
import { fetchSimilarIssues, analyzeIssue, postFeedback } from '../services/mockApiService';
import { SolvedTicket, AnalysisResult } from '../types';
import { TICKET_MODULES, TICKET_PRIORITIES } from '../constants';
import { UploadIcon } from '../components/Icons';
import { ThemeToggle } from '../components/Theme';

type UserFlowState = 'submission' | 'analyzing' | 'solution' | 'confirmed';

const UserExperience: React.FC = () => {
  const [flowState, setFlowState] = useState<UserFlowState>('submission');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [module, setModule] = useState('');
  const [priority, setPriority] = useState('');
  const [similarIssues, setSimilarIssues] = useState<SolvedTicket[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (description.length > 10) {
      const handler = setTimeout(() => {
        fetchSimilarIssues(description).then(setSimilarIssues);
      }, 500);
      return () => clearTimeout(handler);
    } else {
      setSimilarIssues([]);
    }
  }, [description]);

  const resetForm = useCallback(() => {
    setDescription('');
    setScreenshot(null);
    setModule('');
    setPriority('');
    setSimilarIssues([]);
    setAnalysisResult(null);
    setFlowState('submission');
  }, []);

  const handleAnalyze = async () => {
    if (!description && !screenshot) {
      alert('Please provide a description or a screenshot.');
      return;
    }
    setFlowState('analyzing');
    const result = await analyzeIssue(description, screenshot || undefined, module, priority);
    setAnalysisResult(result);
    setFlowState('solution');
  };
  
  const handleFeedback = async (solved: boolean) => {
    await postFeedback(solved);
    setConfirmationMessage(solved ? 'Great! We are glad we could help.' : 'Thank you. A support ticket has been created.');
    setFlowState('confirmed');
    setTimeout(() => {
        resetForm();
    }, 4000);
  };

  const renderSubmissionForm = () => (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Describe Your Issue</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the problem you are facing in detail..."
              className="w-full h-48 p-3 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
            <div className="flex gap-4">
              <select value={module} onChange={e => setModule(e.target.value)} className="w-full p-3 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                <option value="">Optional: Select Module</option>
                {TICKET_MODULES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-3 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600">
                <option value="">Optional: Select Priority</option>
                {TICKET_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-4">
             <label htmlFor="screenshot-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
                <UploadIcon className="w-8 h-8 text-slate-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Upload Screenshot</span> or drag and drop</p>
                <input id="screenshot-upload" type="file" className="hidden" accept="image/*" onChange={(e) => setScreenshot(e.target.files ? e.target.files[0] : null)} />
             </label>
             {screenshot && <p className="text-sm text-center text-slate-600 dark:text-slate-300">File: {screenshot.name}</p>}
             <div className="flex-grow bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 space-y-2 overflow-y-auto">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Similar Solved Issues</h3>
                {similarIssues.length > 0 ? (
                    <ul className="list-disc list-inside text-sm">
                        {similarIssues.map(t => <li key={t.ticket_no} className="truncate text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer">{t.problem_description}</li>)}
                    </ul>
                ) : <p className="text-sm text-slate-500">{description.length > 10 ? 'Searching...' : 'Type more to see similar issues.'}</p>}
             </div>
          </div>
        </div>
        <div className="mt-6 text-center">
            <Button onClick={handleAnalyze} disabled={!description && !screenshot}>Analyze Issue</Button>
        </div>
      </Card>
    </div>
  );

  const renderSolution = () => (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <Card>
            <h2 className="text-3xl font-bold mb-6 text-center text-slate-800 dark:text-slate-100">Analysis & Suggested Solution</h2>
            <div className="mb-6 flex justify-center gap-8 text-center">
                <div>
                    <p className="text-sm text-slate-500">PREDICTED MODULE</p>
                    <p className="font-bold text-lg text-cyan-600 dark:text-cyan-400">{analysisResult?.predictedModule}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-500">PREDICTED PRIORITY</p>
                    <p className="font-bold text-lg text-cyan-600 dark:text-cyan-400">{analysisResult?.predictedPriority}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold border-b border-slate-300 dark:border-slate-600 pb-2">✅ Previously Solved Similar Issues</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {analysisResult?.similarIssues.map(ticket => (
                            <details key={ticket.ticket_no} className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg">
                                <summary className="font-semibold cursor-pointer text-slate-700 dark:text-slate-200">{ticket.problem_description}</summary>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ticket.solution_text}</p>
                            </details>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                     <h3 className="text-xl font-semibold border-b border-slate-300 dark:border-slate-600 pb-2">🤖 AI-Generated Suggestion</h3>
                     <MarkdownRenderer content={analysisResult?.aiSuggestion || ''} />
                </div>
            </div>
             <div className="mt-8 border-t border-slate-300 dark:border-slate-600 pt-6 text-center">
                <p className="font-semibold mb-4">Did this solve your problem?</p>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => handleFeedback(true)}>👍 Yes, this solved my problem!</Button>
                    <Button onClick={() => handleFeedback(false)} variant="secondary">👎 This didn't help, create a support ticket</Button>
                </div>
            </div>
        </Card>
    </div>
  );
  
   const renderConfirmation = () => (
      <div className="w-full max-w-md mx-auto text-center animate-fade-in">
          <Card>
              <p className="text-2xl font-semibold">{confirmationMessage}</p>
              <p className="text-slate-500 mt-2">You will be redirected shortly.</p>
          </Card>
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="absolute top-4 right-4 flex gap-4">
            <Button onClick={() => navigate('/admin')}>Admin</Button>
            <ThemeToggle />
        </div>
        {flowState === 'analyzing' && <LoadingOverlay message="Analyzing your issue..." />}
        {flowState === 'submission' && renderSubmissionForm()}
        {flowState === 'solution' && renderSolution()}
        {flowState === 'confirmed' && renderConfirmation()}
    </div>
  );
};

export default UserExperience;
