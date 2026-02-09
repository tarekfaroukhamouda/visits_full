import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { taskApi, Task } from '../services/api';

interface CloseTaskModalProps {
    task: Task;
    onClose: () => void;
    onTaskClosed: () => void;
}

export function CloseTaskModal({ task, onClose, onTaskClosed }: CloseTaskModalProps) {
    const { t, language, dir } = useLanguage();
    const [report, setReport] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!report.trim()) {
            toast.error(t('report_required') || 'Please provide a report');
            return;
        }

        setIsSubmitting(true);
        try {
            await taskApi.update(task.id, {
                ...task,
                status: 'completed',
                report: report
            });
            toast.success(t('task_completed_successfully') || 'Task completed successfully');
            onTaskClosed();
            onClose();
        } catch (error) {
            console.error('Error closing task:', error);
            toast.error(t('error_closing_task') || 'Failed to close task');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-right" dir={dir}>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-gray-900">{t('close_task') || 'Close Task'}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-blue-900">{task.title}</h3>
                            <p className="text-sm text-blue-700 mt-1">{task.description}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('task_report') || 'Task Report'} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder={t('report_placeholder') || 'Enter your report here...'}
                            dir={dir}
                        />
                        <p className="text-xs text-gray-500">{t('report_hint') || 'Briefly describe what was done to complete this task.'}</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                            disabled={isSubmitting}
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{t('complete_task') || 'Complete Task'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
