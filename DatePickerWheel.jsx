import React, { useState, useEffect } from 'react';
import Picker from 'react-mobile-picker';

const DatePickerWheel = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Parse initial value or default to now
    // Expected format: "YYYY-MM-DDTHH:mm" (datetime-local standard)
    const initialDate = value ? new Date(value) : new Date();

    const [pickerValue, setPickerValue] = useState({
        day: initialDate.getDate(),
        month: initialDate.getMonth() + 1,
        year: initialDate.getFullYear(),
        hour: initialDate.getHours(),
        minute: Math.ceil(initialDate.getMinutes() / 15) * 15 // Round to nearest 15m step for cleaner UI
    });

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i); // Current year + 5
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 15, 30, 45];

    // Format for display
    const formatDisplay = () => {
        if (!value) return 'Choisir une date';
        const d = new Date(value);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleConfirm = () => {
        // Construct ISO string for the inputs
        const d = new Date(pickerValue.year, pickerValue.month - 1, pickerValue.day, pickerValue.hour, pickerValue.minute);
        // Helper to format as YYYY-MM-DDTHH:mm
        const pad = (n) => n < 10 ? '0' + n : n;
        const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

        onChange(localIso);
        setIsOpen(false);
    };

    return (
        <div className="w-full">
            {label && <label className="block mb-2">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="input text-left w-full flex justify-between items-center"
                style={{ minHeight: '44px' }}
            >
                <span>{formatDisplay()}</span>
                <span className="text-muted">📅</span>
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'end', justifyContent: 'center'
                }}>
                    <div className="w-full bg-card animate-slide-up rounded-t-2xl overflow-hidden" style={{ borderTop: '1px solid var(--border-color)' }}>

                        {/* Header Actions */}
                        <div className="flex justify-between p-4 border-b border-color bg-secondary">
                            <button type="button" onClick={() => setIsOpen(false)} className="text-muted">Annuler</button>
                            <span className="font-bold">Choisir la date</span>
                            <button type="button" onClick={handleConfirm} className="text-primary font-bold">Valider</button>
                        </div>

                        {/* Picker Wheel */}
                        <div className="bg-card text-foreground" style={{ height: '200px' }}>
                            <Picker
                                value={pickerValue}
                                onChange={setPickerValue}
                                wheelMode="normal"
                                height={200}
                                itemHeight={40}
                            >
                                <Picker.Column name="day">
                                    {days.map(d => (
                                        <Picker.Item key={d} value={d}>{d}</Picker.Item>
                                    ))}
                                </Picker.Column>
                                <Picker.Column name="month">
                                    {months.map(m => (
                                        <Picker.Item key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('fr-FR', { month: 'short' })}</Picker.Item>
                                    ))}
                                </Picker.Column>
                                <Picker.Column name="year">
                                    {years.map(y => (
                                        <Picker.Item key={y} value={y}>{y}</Picker.Item>
                                    ))}
                                </Picker.Column>
                                <div style={{ width: 20 }}></div> {/* Spacer */}
                                <Picker.Column name="hour">
                                    {hours.map(h => (
                                        <Picker.Item key={h} value={h}>{h}h</Picker.Item>
                                    ))}
                                </Picker.Column>
                                <Picker.Column name="minute">
                                    {minutes.map(m => (
                                        <Picker.Item key={m} value={m}>{m.toString().padStart(2, '0')}</Picker.Item>
                                    ))}
                                </Picker.Column>
                            </Picker>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePickerWheel;
