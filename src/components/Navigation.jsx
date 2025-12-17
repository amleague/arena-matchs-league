import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Search as SearchIcon, MessageSquare, Plus, Trophy, ArrowLeft } from 'lucide-react';

const Navigation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    const showBack = location.pathname !== '/';

    return (
        <>
            {/* Desktop Header */}
            <nav className="card" style={{ borderRadius: 0, margin: 0, borderTop: 0, borderLeft: 0, borderRight: 0, borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)' }}>
                <div className="container flex justify-between items-center" style={{ padding: '0.5rem 1rem', paddingBottom: '0.5rem' }}>
                    <div className="flex items-center gap-2">
                        {showBack && (
                            <button onClick={() => navigate(-1)} className="btn-icon" style={{ marginRight: '0.5rem', cursor: 'pointer' }}>
                                <ArrowLeft size={24} />
                            </button>
                        )}
                        <Trophy size={24} className="text-primary" />
                        <span className="font-bold text-xl">MatchKid</span>
                    </div>
                    {/* Desktop Links - Visible on Desktop */}
                    <div className="desktop-links flex gap-6 items-center">
                        <Link to="/" className={`flex items-center gap-2 text-sm font-bold ${isActive('/') ? 'text-primary' : 'text-muted'}`}>
                            <Home size={18} /> Accueil
                        </Link>
                        <Link to="/search" className={`flex items-center gap-2 text-sm font-bold ${isActive('/search') ? 'text-primary' : 'text-muted'}`}>
                            <SearchIcon size={18} /> Matchs
                        </Link>
                        <Link to="/inbox" className={`flex items-center gap-2 text-sm font-bold ${isActive('/inbox') ? 'text-primary' : 'text-muted'}`}>
                            <MessageSquare size={18} /> Défis
                        </Link>
                        <Link to="/tournaments" className={`flex items-center gap-2 text-sm font-bold ${isActive('/tournaments') ? 'text-primary' : 'text-muted'}`}>
                            <Trophy size={18} /> Tournois
                        </Link>
                        <Link to="/profile" className={`flex items-center gap-2 text-sm font-bold ${isActive('/profile') ? 'text-primary' : 'text-muted'}`}>
                            <Users size={18} /> Profil
                        </Link>
                        <Link to="/create-team" className="btn btn-primary text-sm py-2 px-4">
                            + Equipe
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Tab Bar */}
            <div className="mobile-nav">
                <Link to="/" className={`nav-item ${isActive('/')}`}>
                    <Home size={20} />
                    <span>Accueil</span>
                </Link>
                <Link to="/search" className={`nav-item ${isActive('/search')}`}>
                    <SearchIcon size={20} />
                    <span>Matchs</span>
                </Link>
                <div style={{ position: 'relative', top: '-25px' }}>
                    <Link to="/create-team" className="btn btn-primary" style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0, boxShadow: '0 4px 10px rgba(99, 102, 241, 0.5)' }}>
                        <Plus size={24} color="white" />
                    </Link>
                </div>
                <Link to="/inbox" className={`nav-item ${isActive('/inbox')}`}>
                    <MessageSquare size={20} />
                    <span>Défis</span>
                </Link>
                <Link to="/profile" className={`nav-item ${isActive('/profile')}`}>
                    <Users size={20} />
                    <span>Profil</span>
                </Link>
            </div>
        </>
    );
};

export default Navigation;
