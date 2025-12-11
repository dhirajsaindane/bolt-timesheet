import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Project, Timesheet } from '../../lib/supabase';

interface TimesheetFormProps {
  projects: Project[];
  timesheet?: Timesheet | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TimesheetForm({ projects, timesheet, onSuccess, onCancel }: TimesheetFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: timesheet?.date || new Date().toISOString().split('T')[0],
    project_id: timesheet?.project_id || '',
    task_description: timesheet?.task_description || '',
    hours_worked: timesheet?.hours_worked?.toString() || '',
    notes: timesheet?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const hours = parseFloat(formData.hours_worked);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      setError('Hours worked must be between 0 and 24');
      setLoading(false);
      return;
    }

    const data = {
      employee_id: user!.id,
      project_id: formData.project_id,
      date: formData.date,
      task_description: formData.task_description,
      hours_worked: hours,
      notes: formData.notes,
      status: 'draft' as const,
    };

    let result;
    if (timesheet) {
      result = await supabase
        .from('timesheets')
        .update(data)
        .eq('id', timesheet.id);
    } else {
      result = await supabase
        .from('timesheets')
        .insert([data]);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Date *
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Project *
        </label>
        <select
          value={formData.project_id}
          onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          required
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Task Description *
        </label>
        <textarea
          value={formData.task_description}
          onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          rows={3}
          placeholder="Describe the task you worked on..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Hours Worked *
        </label>
        <input
          type="number"
          step="0.5"
          min="0.5"
          max="24"
          value={formData.hours_worked}
          onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          placeholder="8.0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          rows={2}
          placeholder="Additional notes (optional)..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : timesheet ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white text-slate-700 py-2 rounded-lg font-medium border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
