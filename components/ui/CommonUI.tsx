
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-[#112E4A] border border-slate-200 dark:border-[#334155] rounded-lg shadow-md p-6 ${className}`}>
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseClasses = 'px-6 py-2.5 rounded-md font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#0A2540] disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = {
        primary: 'bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-400 dark:hover:bg-cyan-500 dark:text-slate-900 focus:ring-cyan-500',
        secondary: 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 focus:ring-slate-500',
        danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
    };
    return (
        <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex flex-col items-center justify-center z-50">
    <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    <p className="text-white text-xl mt-4 font-semibold">{message}</p>
  </div>
);

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => (
    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
        {content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('### ')) {
                return <h3 key={i} className="text-xl font-bold mt-4 mb-2 text-slate-800 dark:text-slate-100">{paragraph.replace('### ', '')}</h3>;
            }
            if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ') || paragraph.startsWith('4. ')) {
                return (
                    <ol key={i} className="list-decimal list-inside space-y-2 my-4">
                        {paragraph.split('\n').map((item, j) => <li key={j}>{item.replace(/^\d+\.\s*/, '')}</li>)}
                    </ol>
                );
            }
            return <p key={i} className="mb-4">{paragraph}</p>;
        })}
    </div>
);
