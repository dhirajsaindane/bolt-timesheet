import { useState } from 'react';
import { supabase, Profile } from '../../lib/supabase';
import { Plus, Edit2, Trash2, X, User } from 'lucide-react';

interface UserManagementProps {
  users: Profile[];
  onUpdate: () => void;
}

export default function UserManagement({ users, onUpdate }: UserManagementProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'employee' as 'employee' | 'manager' | 'admin',
    manager_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role,
      manager_id: user.manager_id || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      alert('Error deleting user: ' + error.message);
    } else {
      onUpdate();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!editingUser) {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role,
            manager_id: formData.manager_id || null,
          }]);

        if (profileError) {
          setError(profileError.message);
        } else {
          onUpdate();
          handleClose();
        }
      }
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role,
          manager_id: formData.manager_id || null,
        })
        .eq('id', editingUser.id);

      if (updateError) {
        setError(updateError.message);
      } else {
        onUpdate();
        handleClose();
      }
    }

    setLoading(false);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'employee',
      manager_id: '',
    });
    setError('');
  };

  const managers = users.filter(u => u.role === 'manager');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Users ({users.length})</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-slate-200 p-3 rounded-full">
                <User className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">{user.full_name}</h4>
                <p className="text-sm text-slate-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                  {user.manager_id && (
                    <span className="text-xs text-slate-500">
                      Manager: {users.find(u => u.id === user.manager_id)?.full_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(user)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(user.id)}
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
                {editingUser ? 'Edit User' : 'Add New User'}
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
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                  disabled={!!editingUser}
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formData.role === 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Manager
                  </label>
                  <select
                    value={formData.manager_id}
                    onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  >
                    <option value="">No Manager</option>
                    {managers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  {loading ? 'Saving...' : editingUser ? 'Update' : 'Create'}
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
