import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Plus, CheckSquare, Clock, Calendar as CalendarIcon, User, Search, Filter, Trash2, Edit2, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { taskApi, Task } from '../services/api';
import { AddTaskModal } from './AddTaskModal';
import { CloseTaskModal } from './CloseTaskModal';

interface TasksManagementProps {
    user: {
        id: number;
        name: string;
        role: number;
    };
}

export function TasksManagement({ user }: TasksManagementProps) {
    const { t, language, dir } = useLanguage();
    const { employees } = useData();
    const [activeTab, setActiveTab] = useState<'my-tasks' | 'created-by-me' | 'all-tasks'>('my-tasks');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
    const [taskToClose, setTaskToClose] = useState<Task | null>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'normal' | 'high'>('all');

    useEffect(() => {
        fetchTasks();
    }, [activeTab, user.id]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            let type: 'assigned' | 'created' | 'all' = 'assigned';
            if (activeTab === 'created-by-me') type = 'created';
            if (activeTab === 'all-tasks') type = 'all';

            const data = await taskApi.getAll(type);
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error(t('error_fetching_tasks') || 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (task: Task, newStatus: 'pending' | 'completed') => {
        if (newStatus === 'completed') {
            setTaskToClose(task);
            setIsCloseModalOpen(true);
            return;
        }

        try {
            await taskApi.update(task.id, { ...task, status: newStatus });
            setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus, completed_at: undefined, report: undefined } : t));
            toast.success(t('task_updated'));
        } catch (error) {
            toast.error(t('error_updating_task') || 'Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm(t('delete_task_confirm'))) return;

        try {
            await taskApi.delete(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
            toast.success(t('task_deleted'));
        } catch (error) {
            toast.error(t('error_deleting_task') || 'Failed to delete task');
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'completed'
            ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
            : 'text-amber-600 bg-amber-50 border-amber-200';
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getEmployeeName = (id?: number) => {
        if (!id) return '-';
        const emp = employees.find(e => e.id.toString() === id.toString());
        return emp ? emp.name : id;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('tasks')}</h1>
                    <p className="text-gray-500 mt-1">{t('tasks_description')}</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedTask(undefined);
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>{t('add_task')}</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-1">
                <button
                    onClick={() => setActiveTab('my-tasks')}
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors relative ${activeTab === 'my-tasks' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('my_tasks')}
                    {activeTab === 'my-tasks' && (
                        <div className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('created-by-me')}
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors relative ${activeTab === 'created-by-me' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {t('created_by_me')}
                    {activeTab === 'created-by-me' && (
                        <div className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                    )}
                </button>
                {(user.role === 0 || user.role === 2) && (
                    <button
                        onClick={() => setActiveTab('all-tasks')}
                        className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors relative ${activeTab === 'all-tasks' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t('all_tasks')}
                        {activeTab === 'all-tasks' && (
                            <div className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                        )}
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('search_placeholder') || 'Search...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e: any) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                        <option value="all">{t('all_statuses')}</option>
                        <option value="pending">{t('mark_pending')}</option>
                        <option value="completed">{t('status_completed')}</option>
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e: any) => setPriorityFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                    >
                        <option value="all">{t('priority')}</option>
                        <option value="low">{t('low')}</option>
                        <option value="normal">{t('normal')}</option>
                        <option value="high">{t('high')}</option>
                    </select>
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">{t('loading')}</div>
                ) : filteredTasks.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-12 text-center text-gray-500">
                            <CheckSquare className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_tasks_found')}</h3>
                            <p className="max-w-md mx-auto">{t('tasks_description')}</p>
                        </div>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className={`bg-white rounded-xl p-5 shadow-sm border transition-all hover:shadow-md ${task.status === 'completed' ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <button
                                    onClick={() => handleStatusChange(task, task.status === 'completed' ? 'pending' : 'completed')}
                                    className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'completed'
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-gray-300 hover:border-blue-500 text-transparent'
                                        }`}
                                >
                                    <CheckSquare className="w-4 h-4" />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                        <h3 className={`text-lg font-semibold truncate ${task.status === 'completed' ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-900'
                                            }`}>
                                            {task.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                                {t(task.priority || 'normal')}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                                                {task.status === 'completed' ? t('status_completed') : t('mark_pending')}
                                            </span>
                                        </div>
                                    </div>

                                    {task.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                        {task.due_date && (
                                            <div className={`flex items-center gap-1.5 ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-500 font-medium' : ''
                                                }`}>
                                                <CalendarIcon className="w-4 h-4" />
                                                <span>{new Date(task.due_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                            </div>
                                        )}

                                        {activeTab !== 'my-tasks' && task.assigned_to_id && (
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-4 h-4" />
                                                <span>{t('assigned_to')}: {getEmployeeName(task.assigned_to_id)}</span>
                                            </div>
                                        )}

                                        {activeTab !== 'created-by-me' && task.created_by_id && (
                                            <div className="flex items-center gap-1.5">
                                                <Edit2 className="w-4 h-4" />
                                                <span>{t('created_by')}: {getEmployeeName(task.created_by_id)}</span>
                                            </div>
                                        )}

                                        {task.status === 'completed' && task.completed_at && (
                                            <div className="flex items-center gap-1.5 text-emerald-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>{t('task_completion_date')}: {new Date(task.completed_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {task.report && (
                                        <div className="mt-4 p-3 bg-white border border-gray-100 rounded-lg">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t('task_report')}</h4>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{task.report}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    {/* Actions */}
                                    {(task.created_by_id === user.id || user.role === 0 || user.role === 2) && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setIsAddModalOpen(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title={t('edit_task')}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title={t('delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Task Modal */}
            {isAddModalOpen && (
                <AddTaskModal
                    task={selectedTask}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setSelectedTask(undefined);
                    }}
                    onTaskAdded={() => {
                        fetchTasks();
                        setIsAddModalOpen(false);
                        setSelectedTask(undefined);
                    }}
                />
            )}

            {/* Close Task Modal */}
            {isCloseModalOpen && taskToClose && (
                <CloseTaskModal
                    task={taskToClose}
                    onClose={() => {
                        setIsCloseModalOpen(false);
                        setTaskToClose(null);
                    }}
                    onTaskClosed={() => {
                        fetchTasks();
                    }}
                />
            )}
        </div>
    );
}
