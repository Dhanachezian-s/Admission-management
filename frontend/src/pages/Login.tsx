import { useState } from 'react';
import { api, setAuth } from '../lib/api';

interface Props {
    onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await api<{ token: string; role: string; username: string }>('/auth/login', {
                method: 'POST',
                data: { username, password },
            });
            setAuth(data.token, data.role, data.username);
            onLogin();
        } catch (e: any) {
            setError(e.toString() || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-left">
                <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, var(--accent-light), var(--accent))', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24, zIndex: 1 }}>
                    🎓
                </div>
                <h1>AdmissionPro Configuration</h1>
                <p>Welcome to the CRM Administrator Portal</p>
            </div>

            <div className="login-right">
                <div className="login-card">
                    <div className="login-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Email Address / Username</label>
                            <input
                                id="login-username"
                                autoComplete="username"
                                placeholder="name@example.com"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            id="login-submit"
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                            style={{ marginTop: 8, padding: '12px 18px', fontSize: 15 }}
                        >
                            {loading ? '⏳ Signing in…' : '🔐 Sign In'}
                        </button>
                    </form>

                    <div className="login-demo">
                        <strong>Default Credentials:</strong><br />
                        👤 admin123@gmail.com / admin123 → <em>Admin</em>
                    </div>
                </div>
            </div>
        </div>
    );
}

