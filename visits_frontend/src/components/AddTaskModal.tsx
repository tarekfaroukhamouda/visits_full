import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { taskApi } from '../services/api';

import { Task } from '../services/api';

interface AddTaskModalProps {
    onClose: () => void;
    onTaskAdded: () => void;
    task?: Task;
}

export function AddTaskModal({ onClose, onTaskAdded, task }: AddTaskModalProps) {
    const { t, language, dir } = useLanguage();
    const { employees } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'normal',
        due_date: task?.due_date || '',
        assigned_to_id: task?.assigned_to_id?.toString() || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title) {
            toast.error(t('required_fields'));
            return;
        }

        setIsSubmitting(true);
        try {
            const taskData = {
                ...formData,
                assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id) : undefined
            };

            if (task) {
                await taskApi.update(task.id, taskData);
                toast.success(t('task_updated'));
            } else {
                await taskApi.create(taskData);
                toast.success(t('task_added'));
            }
            onTaskAdded();
            onClose();
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error(t('error_creating_task') || 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">{task ? t('edit_task') : t('add_task')}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('task_title')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder={t('task_placeholder')}
                            dir={dir}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('task_description')}
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            dir={dir}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {t('priority')}
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                dir={dir}
                            >
                                <option value="low">{t('low')}</option>
                                <option value="normal">{t('normal')}</option>
                                <option value="high">{t('high')}</option>
                            </select>
                        </div>

                        {/* Due Date */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {t('due_date')}
                            </label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Assigned To */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('assigned_to')}
                        </label>
                        <select
                            value={formData.assigned_to_id}
                            onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            dir={dir}
                        >
                            <option value="">{t('select_employee') || 'Select Employee'}</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
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
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>{t('save')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
