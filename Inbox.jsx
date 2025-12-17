import React, { useEffect, useState } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import { db } from '../services/store';
import DateTimeScroll from '../components/DateTimeScroll';

const Inbox = () => {
    const [inbox, setInbox] = useState({ received: [], sent: [] });
    const [activeTab, setActiveTab] = useState('received');
    const [negotiatingId, setNegotiatingId] = useState(null);
    const [negotiationData, setNegotiationData] = useState({ date: '', location: '', message: '' });

    const loadInbox = async () => setInbox(await db.getInbox());
    useEffect(() => { loadInbox(); }, []);

    const handleAction = async (id, status) => {
        await db.updateChallengeStatus(id, status);
        loadInbox();
    };

    const startNegotiation = (c) => {
        setNegotiatingId(c.id);
        const isoDate = c.date ? c.date.split('Z')[0].slice(0, 16) : ''; // format for datetime-local safety
        setNegotiationData({ date: isoDate, location: c.location, message: '' });
    };

    const submitNegotiation = async () => {
        if (negotiatingId && negotiationData.date && negotiationData.location) {
            await db.counterProposeChallenge(negotiatingId, negotiationData.date, negotiationData.location, negotiationData.message);
            setNegotiatingId(null);
            loadInbox();
        }
    };

    return (
        <div className="container animate-fade" style={{ paddingTop: '1rem' }}>
            <h1 className="font-bold text-3xl mb-10">Boîte de Réception 📬</h1>

            <div className="flex w-full gap-8 mb-12">
                <button
                    className={`btn flex-1 py-4 text-base rounded-2xl transition-all ${activeTab === 'received' ? 'btn-primary shadow-xl transform -translate-y-1' : 'btn-secondary opacity-60 hover:opacity-100 hover:bg-input'}`}
                    onClick={() => setActiveTab('received')}
                >
                    Reçus
                </button>
                <button
                    className={`btn flex-1 py-4 text-base rounded-2xl transition-all ${activeTab === 'sent' ? 'btn-primary shadow-xl transform -translate-y-1' : 'btn-secondary opacity-60 hover:opacity-100 hover:bg-input'}`}
                    onClick={() => setActiveTab('sent')}
                >
                    Envoyés
                </button>
            </div>

            <div className="flex flex-col gap-6">
                {(activeTab === 'received' ? inbox.received : inbox.sent).map(c => (
                    <div key={c.id} className="card relative overflow-hidden p-6 transition-hover hover:scale-[1.01] duration-300">
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: c.status === 'PENDING' ? 'var(--warning)' : (c.status === 'ACCEPTED' ? 'var(--success)' : 'var(--accent)') }}></div>

                        {negotiatingId === c.id ? (
                            <div className="animate-fade">
                                <h3 className="font-bold text-lg mb-4 text-primary">Contre-proposition</h3>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className="text-xs text-muted mb-2 block">Nouvelle Date</label>
                                        <DateTimeScroll
                                            value={negotiationData.date}
                                            onChange={val => setNegotiationData({ ...negotiationData, date: val })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted">Nouveau Lieu</label>
                                        <input
                                            type="text"
                                            className="input w-full"
                                            value={negotiationData.location}
                                            onChange={e => setNegotiationData({ ...negotiationData, location: e.target.value })}
                                            placeholder="Stade, Adresse..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted">Petit mot pour l'adversaire</label>
                                        <textarea
                                            className="input w-full"
                                            rows="2"
                                            value={negotiationData.message}
                                            onChange={e => setNegotiationData({ ...negotiationData, message: e.target.value })}
                                            placeholder="Ex: Dispo 1h plus tard ?"
                                        />
                                    </div>
                                    <div className="flex gap-4 mt-2">
                                        <button onClick={submitNegotiation} className="btn btn-primary flex-1">Envoyer Proposition</button>
                                        <button onClick={() => setNegotiatingId(null)} className="btn btn-secondary flex-1">Annuler</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-4 pl-4">
                                    <div>
                                        <h3 className="font-bold text-xl flex items-center gap-3">
                                            <span className="text-2xl">Vs {activeTab === 'received' ? (c.fromTeamName || 'Adversaire') : (c.toTeamName || 'Adversaire')}</span>
                                        </h3>
                                        <p className="text-sm text-muted uppercase tracking-wider mt-2 flex items-center gap-2">
                                            <MapPin size={14} /> {new Date(c.date).toLocaleDateString()} • {c.location}
                                        </p>
                                    </div>
                                    <span className={`badge badge-${c.status.toLowerCase()} px-3 py-1 text-xs tracking-wider`}>{c.status === 'PENDING' ? 'EN ATTENTE' : c.status}</span>
                                </div>

                                {c.message && (
                                    <div className="bg-input rounded-xl p-4 text-base italic text-muted mb-6 ml-4 border border-color">
                                        "{c.message}"
                                    </div>
                                )}

                                {activeTab === 'received' && c.status === 'PENDING' && (
                                    <div className="flex flex-col gap-3 ml-4 mt-6">
                                        <div className="flex gap-4">
                                            <button onClick={() => handleAction(c.id, 'ACCEPTED')} className="btn btn-primary flex-1 py-3 text-sm shadow-md">Accepter</button>
                                            <button onClick={() => handleAction(c.id, 'DECLINED')} className="btn btn-secondary flex-1 py-3 text-sm border border-accent/30 text-accent hover:bg-accent/10">Refuser</button>
                                        </div>
                                        <button onClick={() => startNegotiation(c)} className="btn btn-secondary w-full py-3 mt-3 text-sm font-bold text-warning border border-warning/20 hover:bg-warning/10 hover:border-warning/50 transition-all flex items-center justify-center gap-2">
                                            <RefreshCw size={16} /> Faire une contre-proposition
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ))}
                {(activeTab === 'received' ? inbox.received : inbox.sent).length === 0 && (
                    <div className="text-center py-12 text-muted">
                        <div className="bg-input w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                            <MapPin size={24} />
                        </div>
                        <p>Aucun défi dans cette boîte.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inbox;
