import React, { useState } from 'react';
import { db } from '../services/store';
import { useNavigate } from 'react-router-dom';

const CreateTeam = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', sport: 'Football', category: 'U11/U12/U13', level: 'Intermédiaire', city: '' });

    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await db.createTeam(formData);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="container animate-fade" style={{ paddingTop: '1rem' }}>
            <h1 className="font-bold text-xl mb-4">Créer une Équipe</h1>

            {error && <div className="badge badge-declined w-full mb-4 text-center p-2" style={{ textTransform: 'none', fontSize: '0.9rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="card">
                <label>Nom de l'équipe</label>
                <input required className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Les Aigles" />

                <label>Sport</label>
                <select className="select" value={formData.sport} onChange={e => setFormData({ ...formData, sport: e.target.value })}>
                    <option>Football</option>
                    <option>Futsal</option>
                    <option>Basketball</option>
                    <option>Handball</option>
                    <option>Volleyball</option>
                </select>

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

                <label>Niveau</label>
                <select className="select" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Avancé</option>
                    <option>Elite</option>
                </select>

                <label>Ville</label>
                <input required className="input" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Ex: Paris" />

                <button type="submit" className="btn btn-primary w-full">Créer l'équipe</button>
            </form>
        </div>
    );
};

export default CreateTeam;
