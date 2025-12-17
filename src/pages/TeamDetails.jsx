import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Shield, Users } from 'lucide-react';
import { db } from '../services/store';

const TeamDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [newPlayer, setNewPlayer] = useState({ name: '', number: '', position: '' });
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        const load = async () => {
            const t = await db.getTeamById(id);
            if (t) {
                setTeam(t);
            } else {
                navigate('/');
            }
        };
        load();
    }, [id, navigate]);

    const handleAddPlayer = async (e) => {
        e.preventDefault();
        const res = await db.addPlayer(id, newPlayer);
        if (res.success) {
            setTeam(await db.getTeamById(id)); // Refresh
            setNewPlayer({ name: '', number: '', position: '' });
            setShowAddForm(false);
        } else {
            alert(res.message);
        }
    };

    const handleDeletePlayer = async (playerId) => {
        if (window.confirm('Supprimer ce joueur ?')) {
            const res = await db.removePlayer(id, playerId);
            if (res.success) {
                setTeam(await db.getTeamById(id));
            }
        }
    };

    if (!team) return <div>Chargement...</div>;

    const players = team.players || [];

    return (
        <div className="container animate-fade" style={{ paddingTop: '1rem' }}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-icon bg-input">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-bold text-xl uppercase tracking-wide">{team.sport} • {team.category}</h1>
            </div>

            {/* Team Info Card */}
            <div className="card mb-6" style={{ background: 'linear-gradient(135deg, var(--bg-card), rgba(30, 41, 59, 0.8))' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">{team.name}</h2>
                        <p className="text-muted flex items-center gap-2">
                            <Shield size={16} className="text-primary" />
                            {team.level} • {team.city}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted mb-1">Stats</div>
                        <div className="font-mono text-lg">
                            <span className="text-success">{team.stats.wins}V</span> - <span className="text-accent">{team.stats.loss}D</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roster Section */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Users size={20} className="text-accent" />
                    Effectif ({players.length})
                </h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn btn-primary text-sm py-2 px-3"
                >
                    <UserPlus size={16} className="mr-1" /> Ajouter
                </button>
            </div>

            {/* Add Player Form */}
            {showAddForm && (
                <div className="card animate-fade mb-6 border-primary">
                    <form onSubmit={handleAddPlayer} className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="text-xs text-muted mb-1">Nom</label>
                            <input
                                required
                                className="input py-2 text-sm mb-0"
                                placeholder="Ex: Kylian"
                                value={newPlayer.name}
                                onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
                            />
                        </div>
                        <div className="w-20">
                            <label className="text-xs text-muted mb-1">N°</label>
                            <input
                                className="input py-2 text-sm mb-0 text-center"
                                placeholder="10"
                                value={newPlayer.number}
                                onChange={e => setNewPlayer({ ...newPlayer, number: e.target.value })}
                            />
                        </div>
                        <div className="w-32">
                            <label className="text-xs text-muted mb-1">Poste</label>
                            <select
                                className="select py-2 text-sm mb-0"
                                value={newPlayer.position}
                                onChange={e => setNewPlayer({ ...newPlayer, position: e.target.value })}
                            >
                                <option value="">-</option>
                                <option value="Gardon">Gardien</option>
                                <option value="Défenseur">Défenseur</option>
                                <option value="Milieu">Milieu</option>
                                <option value="Attaquant">Attaquant</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary py-2">OK</button>
                    </form>
                </div>
            )}

            {/* Players List */}
            <div className="grid gap-3">
                {players.length === 0 ? (
                    <div className="text-center py-8 text-muted bg-input rounded-xl border border-dashed border-gray-700">
                        Ajoutez des joueurs pour compléter votre équipe.
                    </div>
                ) : (
                    players.map(p => (
                        <div key={p.id} className="card py-3 px-4 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <span className="font-mono font-bold text-xl text-muted w-8">{p.number || '-'}</span>
                                <div>
                                    <div className="font-bold">{p.name}</div>
                                    <div className="text-xs text-muted">{p.position}</div>
                                </div>
                            </div>
                            <button onClick={() => handleDeletePlayer(p.id)} className="text-muted hover:text-accent transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeamDetails;
