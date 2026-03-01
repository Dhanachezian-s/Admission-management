import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface User {
    id: number;
    username: string;
    role: string;
    isActive: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('OFFICER');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        try {
            const data = await api<User[]>('/users');
            setUsers(data);
        } catch (e: any) {
            console.error(e);
        }
    }

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api('/users', {
                method: 'POST',
                data: { username, password, role },
            });
            setUsername('');
            setPassword('');
            fetchUsers();
        } catch (e: any) {
            setError(e.toString());
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="users-page space-y-md">
            <div className="card">
                <div className="card-header">
                    <h2>Create User</h2>
                </div>
                <div className="card-body">
                    {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
                    <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Username</label>
                            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Role</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} required>
                                <option value="ADMIN">Admin</option>
                                <option value="OFFICER">Admission Officer</option>
                                <option value="MANAGEMENT">Management</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? '...' : 'Create'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>System Users</h2>
                </div>
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.username}</td>
                                    <td>{u.role}</td>
                                    <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
