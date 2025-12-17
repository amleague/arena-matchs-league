import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Award, MapPin } from 'lucide-react';
import { db } from '../services/store';

const Home = () => {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setMatches(await db.getMyMatches());
            setTeams(await db.getMyTeams());
            setUser(await db.getCurrentUser());
        };
        loadData();
    }, []);

    const [editingMatch, setEditingMatch] = useState(null);
    const [scoreInput, setScoreInput] = useState({ a: '', b: '' });

    const handleSaveScore = async (matchId) => {
        if (scoreInput.a !== '' && scoreInput.b !== '') {
            await db.updateMatchScore(matchId, scoreInput.a, scoreInput.b);
            setMatches(await db.getMyMatches());
            setEditingMatch(null);
        }
    };

    if (!user) return null;

    return (
        <div className="container animate-fade" style={{ paddingTop: '1rem' }}>
            <h1 className="font-bold text-xl mb-4">Bonjour, {user.name}! 👋</h1>

            {/* Quick Actions */}
            <div className="flex gap-4 overflow-x-auto" style={{ paddingBottom: '1rem' }}>
                <Link to="/search" className="card flex-col items-center justify-center gap-2" style={{ minWidth: '100px', flex: 1, backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}>
                    <Search />
                    <span className="text-sm font-bold">Trouver</span>
                </Link>
                <Link to="/tournaments" className="card flex-col items-center justify-center gap-2" style={{ minWidth: '100px', flex: 1 }}>
                    <Award className="text-accent" />
                    <span className="text-sm">Tournois</span>
                </Link>
            </div>

            <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg">Mes Équipes</h2>
                <Link to="/create-team" className="text-primary text-sm font-bold">+ Créer une équipe</Link>
            </div>
            {teams.length === 0 ? (
                <div className="card text-center">
                    <p className="text-muted mb-4">Aucune équipe.</p>
                    <Link to="/create-team" className="btn btn-primary">Créer une équipe</Link>
                </div>
            ) : (
                teams.map(team => (
                    <div key={team.id} className="card flex justify-between items-center">
                        <Link to={`/team/${team.id}`} className="flex-1">
                            <div>
                                <h3 className="font-bold">{team.name}</h3>
                                <p className="text-sm text-muted">{team.sport} • {team.category}</p>
                            </div>
                        </Link>
                        <Link to={`/team/${team.id}`} className="btn btn-secondary text-xs py-2 px-3">Gérer (Effectif)</Link>
                    </div>
                ))
            )}

            <h2 className="font-bold text-lg mb-2 mt-4">Prochains Matchs</h2>
            {matches.length === 0 ? (
                <div className="text-center p-4 text-muted">Aucun match prévu.</div>
            ) : (
                matches.map(match => (
                    <div key={match.id} className="card">
                        <div className="flex justify-between mb-2">
                            <span className={`badge ${match.status === 'FINISHED' ? 'badge-neutral' : 'badge-accepted'}`}>{match.status === 'FINISHED' ? 'TERMINÉ' : 'À VENIR'}</span>
                            <span className="text-xs text-muted">{new Date(match.date).toLocaleDateString()}</span>
                        </div>

                        {/* Match Content */}
                        <div className="flex justify-between items-center text-lg font-bold mb-4">
                            {/* Team A */}
                            <span className="text-sm w-1/3 text-left leading-tight break-words">{match.teamAName}</span>

                            {/* Center: VS or Inputs */}
                            <div className="w-1/3 flex justify-center">
                                {editingMatch === match.id ? (
                                    <div className="flex items-center gap-1 animate-fade">
                                        <input
                                            autoFocus
                                            type="number"
                                            className="input text-center p-1 font-bold text-lg border-primary"
                                            style={{ width: '45px', height: '45px', padding: 0, background: 'rgba(99, 102, 241, 0.1)' }}
                                            value={scoreInput.a}
                                            onChange={e => setScoreInput({ ...scoreInput, a: e.target.value })}
                                            placeholder="0"
                                        />
                                        <span className="text-muted font-bold">-</span>
                                        <input
                                            type="number"
                                            className="input text-center p-1 font-bold text-lg border-primary"
                                            style={{ width: '45px', height: '45px', padding: 0, background: 'rgba(99, 102, 241, 0.1)' }}
                                            value={scoreInput.b}
                                            onChange={e => setScoreInput({ ...scoreInput, b: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-accent text-xl text-center">
                                        {match.status === 'FINISHED' ? match.score : 'VS'}
                                    </span>
                                )}
                            </div>

                            {/* Team B */}
                            <span className="text-sm w-1/3 text-right leading-tight break-words">{match.teamBName}</span>
                        </div>

                        {/* Footer / Actions */}
                        <div className="mt-2 flex items-center justify-between gap-2 text-sm text-muted border-t border-color pt-3">
                            <div className="flex items-center gap-1"><MapPin size={14} /> {match.location}</div>

                            {match.status === 'SCHEDULED' && (
                                <>
                                    {editingMatch === match.id ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSaveScore(match.id)}
                                                className="btn btn-primary text-xs py-1 px-3 shadow-lg"
                                            >
                                                Valider
                                            </button>
                                            <button
                                                onClick={() => setEditingMatch(null)}
                                                className="btn btn-secondary text-xs py-1 px-3"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingMatch(match.id);
                                                setScoreInput({ a: '', b: '' });
                                            }}
                                            className="btn btn-primary text-xs py-2 px-4 shadow-md"
                                        >
                                            Saisir Score
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Home;
