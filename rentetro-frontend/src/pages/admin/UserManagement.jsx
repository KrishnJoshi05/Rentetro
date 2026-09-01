import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/users').then(({ data }) => setUsers(data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const suspend = async (id) => {
    if (!window.confirm('Suspend this user? They will be unable to log in.')) return;
    await api.put(`/admin/users/${id}/suspend`);
    load();
  };

  const unsuspend = async (id) => {
    if (!window.confirm('Unsuspend this user? They will be able to log in.')) return;
    await api.put(`/admin/users/${id}/unsuspend`);
    load();
  };

  if (loading) return <div className="app-shell" style={{ paddingTop: 32 }}>Loading…</div>;

  return (
    <div className="app-shell" style={{ paddingTop: 32 }}>
      <h1>Users</h1>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--ink-100)', textAlign: 'left' }}>
              <th style={{ padding: '10px 16px' }}>Name</th>
              <th style={{ padding: '10px 16px' }}>Email</th>
              <th style={{ padding: '10px 16px' }}>Role</th>
              <th style={{ padding: '10px 16px' }}>Status</th>
              <th style={{ padding: '10px 16px' }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderTop: '1px solid var(--ink-100)' }}>
                <td style={{ padding: '10px 16px' }}>{u.name}</td>
                <td style={{ padding: '10px 16px' }}>{u.email}</td>
                <td style={{ padding: '10px 16px', textTransform: 'capitalize' }}>{u.role}</td>
                <td style={{ padding: '10px 16px', color: u.isSuspended ? 'var(--rust-600)' : 'var(--teal-600)' }}>
                  {u.isSuspended ? 'Suspended' : 'Active'}
                </td>
                <td style={{ padding: '10px 16px' }}>
                  {!u.isSuspended && u.role !== 'admin' && (
                    <button className="btn btn-ghost" onClick={() => suspend(u._id)}>Suspend</button>
                  )}
                  {u.isSuspended && u.role !== 'admin' && (
                    <button className="btn btn-ghost" onClick={() => unsuspend(u._id)}>Unsuspend</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
