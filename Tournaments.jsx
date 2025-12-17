import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import { db } from '../services/store';

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [myTeams, setMyTeams] = useState([]);

    // FILTERS STATE
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterSport, setFilterSport] = useState('Football'); // Default match reference

    useEffect(() => {
        const load = async () => {
            setTournaments(await db.getTournaments());
            setMyTeams(await db.getMyTeams());
        };
        load();
    }, []);

    const handleRegister = async (tourId) => {
        if (myTeams.length === 0) return alert('Créez une équipe d\'abord !');

        const tournament = tournaments.find(t => t.id === tourId);
        if (!tournament) return;

        // 1. Filter valid teams (MUST match sport)
        const validTeams = myTeams.filter(t => t.sport === tournament.sport);

        if (validTeams.length === 0) {
            return alert(`Impossible ! Vous devez avoir une équipe de ${tournament.sport} pour vous inscrire à ce tournoi.`);
        }

        // 2. Select best fit (try to match category exact, otherwise take first valid)
        // Note: For tournaments, categories are usually strict, but we'll let the user try if they have the sport.
        const teamToRegister = validTeams.find(t => t.category === tournament.category) || validTeams[0];

        // Optional warning if category mismatch? 
        if (teamToRegister.category !== tournament.category) {
            if (!window.confirm(`Votre équipe est en ${teamToRegister.category} mais le tournoi est en ${tournament.category}. Voulez-vous continuer ?`)) return;
        }

        const result = await db.registerTeamToTournament(tourId, teamToRegister.id);
        if (result.success) {
            alert(`Inscription réussie avec l'équipe "${teamToRegister.name}" !`);
            setTournaments(await db.getTournaments());
        } else {
            alert('Erreur: ' + result.message);
        }
    };

    // SEARCH LOGIC
    const filteredTournaments = tournaments.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory ? t.category === filterCategory : true;
        const matchesSport = filterSport ? t.sport === filterSport : true;

        return matchesSearch && matchesCategory && matchesSport;
    });

    return (
        <div className="container animate-fade" style={{ paddingTop: '2rem' }}>
            <div className="flex justify-between items-center mb-8">
                <h1 className="font-bold text-2xl">Tournois Saison 🏆</h1>
                <button
                    onClick={() => window.location.href = '/create-tournament'}
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)' }}
                >
                    + Organiser
                </button>
            </div>

            {/* NEW CLEAN SEARCH BAR */}
            <div className="search-bar-container">
                <div className="search-input-wrapper">
                    <Search size={20} className="text-muted" />
                    <input
                        placeholder="Rechercher (Ville, Nom...)"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-row">
                    <select className="filter-select" value={filterSport} onChange={e => setFilterSport(e.target.value)}>
                        <option value="">Tous les sports</option>
                        <option value="Football">Football</option>
                        <option value="Futsal">Futsal</option>
                        <option value="Basketball">Basketball</option>
                        <option value="Handball">Handball</option>
                        <option value="Volleyball">Volleyball</option>
                    </select>
                    <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                        <option value="">Toutes catégories</option>
                        <option>U7/U8/U9</option>
                        <option>U9/U10/U11</option>
                        <option>U11/U12/U13</option>
                        <option>U13/U14/U15</option>
                        <option>U15/U16/U17</option>
                        <option>U17/U18/U19</option>
                        <option>Adultes</option>
                    </select>
                </div>
            </div>

            {/* LISTING */}
            <div className="grid gap-4">
                {filteredTournaments.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                        <p>Aucun tournoi trouvé pour ces critères.</p>
                    </div>
                ) : (
                    filteredTournaments.map(t => (
                        <div key={t.id} className="card relative overflow-hidden">
                            {/* DECORATIVE HEADER STRIP */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }}></div>

                            <div className="flex justify-between items-start mb-2 pt-2">
                                <div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">{t.sport} • {t.category}</span>
                                    <h3 className="font-bold text-lg leading-tight">{t.name}</h3>
                                </div>
                                <span className={`badge ${t.status === 'OPEN' ? 'badge-accepted' : 'badge-neutral'}`}>{t.status === 'OPEN' ? 'OUVERT' : t.status}</span>
                            </div>

                            <div className="text-sm text-muted mb-4 space-y-2 mt-3">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-accent" />
                                    <span style={{ color: 'var(--text-main)' }}>{new Date(t.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-primary" />
                                    <span>{t.location}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-color" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <Users size={16} />
                                    <span>Inscrits: <b className="text-white">{t.teamsRegistered.length}</b> / {t.maxTeams}</span>
                                    <div style={{ flex: 1, height: '6px', background: 'var(--bg-input)', borderRadius: '3px', marginLeft: '0.5rem', overflow: 'hidden' }}>
                                        <div style={{ width: `${(t.teamsRegistered.length / t.maxTeams) * 100}%`, background: 'var(--success)', height: '100%' }}></div>
                                    </div>
                                </div>
                            </div>

                            {t.status === 'OPEN' && (
                                <button onClick={() => handleRegister(t.id)} className="btn btn-primary w-full py-2 text-sm">
                                    Réserver ma place
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Tournaments;
