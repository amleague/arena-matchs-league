import React, { useEffect, useRef, useState } from 'react';

const range = (start, end, step = 1) => {
    const res = [];
    for (let i = start; i <= end; i += step) res.push(i);
    return res;
};

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

const WheelColumn = ({ items, value, onChange, label }) => {
    const rootRef = useRef(null);
    const itemHeight = 40; // Must match CSS

    // Scroll to position on init or value change
    useEffect(() => {
        if (rootRef.current) {
            const index = items.findIndex(i => i.value === value);
            if (index !== -1) {
                rootRef.current.scrollTop = index * itemHeight;
            }
        }
    }, [value, items]);

    const handleScroll = (e) => {
        // Debounce or wait for snap? 
        // We rely on scrollEnd or simple calculation
        // For simplicity in this constrained env, we assume snap happens and we read the value on click or scroll end.
        // Actually, reading on scroll is tricky without "scrollend" event support in all browsers.
        // Let's us standard onClick for selection to be safe, or sophisticated scroll listener.
        // To keep it "simple" but "roulette-like", we just render the list and use click to center/select.
    };

    // Better interaction: Click to select.
    // Real wheel scroll detection requires complex logic (intersection observer or scroll debounce).
    // We will simulate the visual: A scrollable list. The User enters the value by clicking.
    // OR we infer from scroll position.

    // Low-tech reliable version: 
    // The user SCROLLS. We detect the center item after a timeout.

    const [isScrolling, setIsScrolling] = useState(false);
    const timeoutRef = useRef(null);

    const onScroll = (e) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsScrolling(true);

        timeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
            const scrollTop = e.target.scrollTop;
            const index = Math.round(scrollTop / itemHeight);
            if (items[index]) {
                onChange(items[index].value);
            }
        }, 150); // Snap delay
    };

    return (
        <div className="flex flex-col items-center">
            {label && <div className="text-xs text-muted mb-1 font-bold uppercase">{label}</div>}
            <div
                ref={rootRef}
                className="wheel-scroll no-scrollbar"
                style={{
                    height: `${itemHeight * 3}px`, // Show 3 items: Previous, Current, Next
                    overflowY: 'auto',
                    scrollSnapType: 'y mandatory',
                    width: '60px',
                    position: 'relative',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}
                onScroll={onScroll}
            >
                {/* Spacer top */}
                <div style={{ height: `${itemHeight}px`, flexShrink: 0 }}></div>

                {items.map(item => (
                    <div
                        key={item.value}
                        onClick={() => {
                            onChange(item.value);
                            // rootRef.current.scrollTop = index * itemHeight; // Handled by useEffect
                        }}
                        style={{
                            height: `${itemHeight}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            scrollSnapAlign: 'center',
                            cursor: 'pointer',
                            opacity: value === item.value ? 1 : 0.4,
                            transform: value === item.value ? 'scale(1.1)' : 'scale(1)',
                            fontWeight: value === item.value ? 'bold' : 'normal',
                            color: value === item.value ? 'var(--primary)' : 'inherit',
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }}
                    >
                        {item.label}
                    </div>
                ))}

                {/* Spacer bottom */}
                <div style={{ height: `${itemHeight}px`, flexShrink: 0 }}></div>
            </div>
        </div>
    );
};

const DateTimeScroll = ({ value, onChange }) => {
    const date = value ? new Date(value) : new Date();

    // Parse current
    const curYear = date.getFullYear();
    const curMonth = date.getMonth();
    const curDay = date.getDate();
    const curHour = date.getHours();
    const curMinute = date.getMinutes();

    // Generators
    const currentYear = new Date().getFullYear();
    const years = range(currentYear, currentYear + 5).map(y => ({ value: y, label: y }));
    const monthItems = months.map((m, i) => ({ value: i, label: m }));

    // Days in month
    const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const dayItems = range(1, daysInMonth).map(d => ({ value: d, label: d }));

    const hours = range(0, 23).map(h => ({ value: h, label: h.toString().padStart(2, '0') }));
    // 5 min steps for minutes
    const minuteItems = range(0, 55, 5).map(m => ({ value: m, label: m.toString().padStart(2, '0') }));

    // If current minute is not in steps, snap it
    const snappedMinute = Math.round(curMinute / 5) * 5 % 60;

    const updateDate = (type, val) => {
        const newDate = new Date(date);
        switch (type) {
            case 'year': newDate.setFullYear(val); break;
            case 'month': newDate.setMonth(val); break;
            case 'day': newDate.setDate(val); break;
            case 'hour': newDate.setHours(val); break;
            case 'minute': newDate.setMinutes(val); break;
        }
        // Fix overflow (e.g. going from Jan 31 to Feb -> Feb 28/29) automatically handled by Date object but might skip month.
        // If we want strict "don't jump month":
        if (type === 'month' || type === 'year') {
            // Handle day clamping
            const dim = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
            if (curDay > dim) newDate.setDate(dim);
        }

        // Adjust for timezone offset to keep strict local time string if needed, 
        // but for app logic we usually want ISO.
        // However, datetime-local expects "YYYY-MM-DDTHH:mm".
        // Let's create that string manually to avoid timezone shifts.
        const y = newDate.getFullYear();
        const m = String(newDate.getMonth() + 1).padStart(2, '0');
        const d = String(newDate.getDate()).padStart(2, '0');
        const h = String(newDate.getHours()).padStart(2, '0');
        const min = String(newDate.getMinutes()).padStart(2, '0');

        onChange(`${y}-${m}-${d}T${h}:${min}`);
    };

    return (
        <div className="card p-4 bg-base-200 flex justify-center gap-2 select-none" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
            <WheelColumn
                label="Jour"
                items={dayItems}
                value={curDay}
                onChange={v => updateDate('day', v)}
            />
            <WheelColumn
                label="Mois"
                items={monthItems}
                value={curMonth}
                onChange={v => updateDate('month', v)}
            />
            <WheelColumn
                label="Année"
                items={years}
                value={curYear}
                onChange={v => updateDate('year', v)}
            />
            <div className="w-[1px] bg-gray-600 mx-2 h-20 self-center opacity-20"></div>
            <WheelColumn
                label="H"
                items={hours}
                value={curHour}
                onChange={v => updateDate('hour', v)}
            />
            <span className="self-center font-bold text-xl mb-4">:</span>
            <WheelColumn
                label="Min"
                items={minuteItems}
                value={snappedMinute}
                onChange={v => updateDate('minute', v)}
            />
        </div>
    );
};

export default DateTimeScroll;
