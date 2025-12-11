import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Project } from '../../lib/supabase';
import { Plus, Edit2, Trash2, X, FolderKanban } from 'lucide-react';

interface ProjectManagementProps {
  projects: Project[];
  onUpdate: () => void;
}

export default function ProjectManagement({ projects, onUpdate }: ProjectManagementProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting project: ' + error.message);
    } else {
      onUpdate();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update({
          name: formData.name,
          description: formData.description,
          status: formData.status,
        })
        .eq('id', editingProject.id);

      if (error) {
        setError(error.message);
      } else {
        onUpdate();
        handleClose();
      }
    } else {
      const { error } = await supabase
        .from('projects')
        .insert([{
          name: formData.name,
          description: formData.description,
          status: formData.status,
          created_by: user!.id,
        }]);

      if (error) {
        setError(error.message);
      } else {
        onUpdate();
        handleClose();
      }
    }

    setLoading(false);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'active',
    });
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Projects ({projects.length})</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="bg-slate-200 p-3 rounded-full">
                <FolderKanban className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-slate-900">{project.name}</h4>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{project.description || 'No description'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(project)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  rows={3}
                  placeholder="Project description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                  {loading ? 'Saving...' : editingProject ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-white text-slate-700 py-2 rounded-lg font-medium border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
