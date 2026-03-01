import { NavLink, useLocation } from 'react-router-dom';
import { clearAuth, getRole, getUsername } from '../lib/api';

interface LayoutProps {
    children: React.ReactNode;
    pageTitle: string;
    pageSubtitle?: string;
    onLogout: () => void;
}

const roleLabel: Record<string, string> = {
    ADMIN: 'Administrator',
    OFFICER: 'Admission Officer',
    MANAGEMENT: 'Management',
};

const roleColor: Record<string, string> = {
    ADMIN: '#6366f1',
    OFFICER: '#10b981',
    MANAGEMENT: '#f59e0b',
};

export default function Layout({ children, pageTitle, pageSubtitle, onLogout }: LayoutProps) {
    const role = getRole() || '';
    const username = getUsername() || 'User';
    const location = useLocation();

    function handleLogout() {
        clearAuth();
        onLogout();
    }

    const isAdmin = role === 'ADMIN';
    const isOfficer = role === 'OFFICER';
    const canManage = isAdmin || isOfficer;

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">🎓</div>
                    <h2>AdmissionPro</h2>
                    <p>Management System</p>
                </div>

                <nav className="sidebar-nav">
                    <span className="sidebar-section-label">Overview</span>
                    <NavLink
                        to="/"
                        id="nav-dashboard"
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    >
                        <span className="nav-icon">📊</span> Dashboard
                    </NavLink>

                    {isAdmin && (
                        <>
                            <span className="sidebar-section-label">Setup</span>
                            <NavLink
                                to="/masters"
                                id="nav-masters"
                                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                            >
                                <span className="nav-icon">⚙️</span> Master Setup
                            </NavLink>

                            <span className="sidebar-section-label">Admin</span>
                            <NavLink
                                to="/users"
                                id="nav-users"
                                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                            >
                                <span className="nav-icon">🛡️</span> Users Management
                            </NavLink>
                        </>
                    )}

                    {canManage && (
                        <>
                            <span className="sidebar-section-label">Admissions</span>
                            <NavLink
                                to="/applicants"
                                id="nav-applicants"
                                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                            >
                                <span className="nav-icon">👥</span> Applicants
                            </NavLink>
                            <NavLink
                                to="/applicant/new"
                                id="nav-new-applicant"
                                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                            >
                                <span className="nav-icon">➕</span> New Applicant
                            </NavLink>
                            <NavLink
                                to="/allocation"
                                id="nav-allocation"
                                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                            >
                                <span className="nav-icon">🪑</span> Seat Allocation
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${roleColor[role] || '#6366f1'}, #1e1e52)` }}>
                            {username[0]?.toUpperCase()}
                        </div>
                        <div>
                            <div className="user-name">{username}</div>
                            <div className="user-role">{roleLabel[role] || role}</div>
                        </div>
                    </div>
                    <button id="btn-logout" className="btn btn-ghost w-full btn-sm" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </aside>

            <div className="main-area">
                <header className="topbar">
                    <div className="topbar-left">
                        <h1>{pageTitle}</h1>
                        {pageSubtitle && <p>{pageSubtitle}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                            className="badge"
                            style={{
                                background: `${roleColor[role]}20`,
                                color: roleColor[role] || '#6366f1',
                                border: `1px solid ${roleColor[role]}40`,
                            }}
                        >
                            {roleLabel[role] || role}
                        </span>
                    </div>
                </header>
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
