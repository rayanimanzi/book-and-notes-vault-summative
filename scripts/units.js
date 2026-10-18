export const toMinutes = (pages, speed) => (pages / speed) * 60;

export function formatTime(min, unit = 'hours') {
    min =Math.round(min);
    if (unit === 'minutes') return `${min} min`;
    const h = Math.round(min/60), m = min % 60;
    return [h && `${h} h`, (m || !h) && `${m} min`].filter(boolean).join(' ');

}

export function convert (value, from, to, speed) {
    const minutesPer = {minutes: 1, hours: 60, pages: 60 / speed };
    return (vallue * minutesPer[from]) /minutesPer[to];

    }
