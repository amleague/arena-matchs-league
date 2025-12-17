import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import DatePickerWheel from '../components/DatePickerWheel';
import { db } from '../services/store';

const SearchPage = () => {
    const [teams, setTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [challengeForm, setChallengeForm] = useState({ date: '', location: '', message: '' });

    // FILTERS
    const [filterCategory, setFilterCategory] = useState('');
    const [filterSport, setFilterSport] = useState('');

    useEffect(() => {
        const load = async () => setTeams(await db.getAllTeams());
        load();
    }, []);

    const handleChallenge = async (e) => {
        e.preventDefault();
        const myTeams = await db.getMyTeams();
        if (myTeams.length === 0) return alert("Créez d'abord une équipe !");

        // 1. Filter teams that match the target sport
        const compatibleTeams = myTeams.filter(t => t.sport === selectedTeam.sport);

        if (compatibleTeams.length === 0) {
            return alert(`Impossible ! Vous devez avoir une équipe de ${selectedTeam.sport} pour défier cette équipe.`);
        }

        // 2. Select the best fit (prioritize same category)
        let myTeam = compatibleTeams.find(t => t.category === selectedTeam.category) || compatibleTeams[0];

        await db.createChallenge({
            fromTeamId: myTeam.id,
            toTeamId: selectedTeam.id,
            date: challengeForm.date,
            location: challengeForm.location,
            message: challengeForm.message
        });
        setSelectedTeam(null);
        alert(`Défi envoyé avec votre équipe "${myTeam.name}" !`);
    };

    const filtered = teams.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.city.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory ? t.category === filterCategory : true;
        const matchesSport = filterSport ? t.sport === filterSport : true;

        return matchesSearch && matchesCategory && matchesSport;
    });

    return (
        <div className="container animate-fade" style={{ paddingTop: '1rem' }}>
            <h1 className="font-bold text-xl mb-4">Trouver un Match ⚽️</h1>

            {/* NEW CLEAN SEARCH BAR */}
            <div className="search-bar-container">
                <div className="search-input-wrapper">
                    <SearchIcon size={20} className="text-muted" />
                    <input
                        placeholder="Rechercher une équipe, une ville..."
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

            <div className="grid gap-4 mt-4">
                {filtered.map(t => (
                    <div key={t.id} className="card">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="font-bold text-lg">{t.name}</h3>
                                <p className="text-sm text-muted">{t.city} • {t.sport} {t.category}</p>
                            </div>
                            <div className="text-right">
                                <span className="badge badge-neutral mb-1 block">{t.level}</span>
                            </div>
                        </div>
                        <div className="mt-4 border-t border-color pt-3 flex justify-between items-center">
                            <div className="text-sm">
                                <span className="text-success font-bold">{t.stats.wins}V</span> - <span className="text-accent font-bold">{t.stats.loss}D</span>
                            </div>
                            <button onClick={() => setSelectedTeam(t)} className="btn btn-primary text-sm py-2">Défier</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedTeam && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="card w-full max-w-md animate-fade">
                        <h2 className="font-bold text-xl mb-4">Défier {selectedTeam.name}</h2>
                        <form onSubmit={handleChallenge}>
                            <label>Date et Heure</label>
                            <DatePickerWheel
                                value={challengeForm.date}
                                onChange={(dateStr) => setChallengeForm({ ...challengeForm, date: dateStr })}
                            />

                            <label>Lieu</label>
                            <input required className="input" placeholder="Stade, Adresse..." onChange={e => setChallengeForm({ ...challengeForm, location: e.target.value })} />

                            <label>Message</label>
                            <textarea className="textarea" placeholder="Format de jeu, couleur maillot..." onChange={e => setChallengeForm({ ...challengeForm, message: e.target.value })}></textarea>

                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={() => setSelectedTeam(null)} className="btn btn-secondary w-full">Annuler</button>
                                <button type="submit" className="btn btn-primary w-full">Envoyer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
