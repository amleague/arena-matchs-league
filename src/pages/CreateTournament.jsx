import React, { useState } from 'react';
import { db } from '../services/store';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Trophy, Users } from 'lucide-react';
import DatePickerWheel from '../components/DatePickerWheel';

const CreateTournament = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        sport: 'Football',
        category: 'U11/U12/U13',
        date: '',
        location: '',
        maxTeams: 8
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await db.createTournament(formData);
        if (result.success) {
            navigate('/tournaments');
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="container animate-fade" style={{ paddingTop: '1rem' }}>
            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => navigate(-1)} className="btn btn-icon bg-input">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-bold text-xl">Organiser un Tournoi 🏆</h1>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card), rgba(30, 41, 59, 0.8))' }}>
                <div className="mb-4">
                    <label className="flex items-center gap-2 mb-2">
                        <Trophy size={16} className="text-primary" /> Nom du Tournoi
                    </label>
                    <input
                        required
                        className="input"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Coupe de Printemps 2025"
                    />
                </div>

                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label>Sport</label>
                        <select className="select" value={formData.sport} onChange={e => setFormData({ ...formData, sport: e.target.value })}>
                            <option>Football</option>
                            <option>Futsal</option>
                            <option>Basketball</option>
                            <option>Handball</option>
                            <option>Volleyball</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label>Catégorie</label>
                        <select className="select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
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

                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label className="flex items-center gap-2 mb-2">
                            <Calendar size={16} className="text-accent" /> Date & Heure
                        </label>
                        {/* Using datetime-local for modern feel and precision */}
                        {/* Using iOS-style Picker Wheel */}
                        <DatePickerWheel
                            value={formData.date}
                            onChange={(dateStr) => setFormData({ ...formData, date: dateStr })}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="flex items-center gap-2 mb-2">
                            <Users size={16} /> Max Équipes
                        </label>
                        <select className="select" value={formData.maxTeams} onChange={e => setFormData({ ...formData, maxTeams: parseInt(e.target.value) })}>
                            <option value={4}>4 Équipes</option>
                            <option value={8}>8 Équipes</option>
                            <option value={16}>16 Équipes</option>
                            <option value={32}>32 Équipes</option>
                        </select>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-primary" /> Lieu
                    </label>
                    <input
                        required
                        className="input"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Stade municipal, Adresse..."
                    />
                </div>

                <button type="submit" className="btn btn-primary w-full py-3 text-lg shadow-lg">
                    Publier le Tournoi
                </button>
            </form>
        </div>
    );
};

export default CreateTournament;
