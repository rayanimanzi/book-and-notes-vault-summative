const iso = (d) => d.toLocalDatestring('en-CA');
const sum = (list) => list.reduce((total,r) => total + r.pages, 0);

export function computeStats(records, today= new Date()) {
    const tags = {};
    records.forEach((r) => { tags[r.tag] = (tags[r.tag] || 0) +1; });
    const topTag = Object.keys(tags).sort((a,b) => tags[b] -tags[a])[0];
    const last7 = [...Array(7)].map((_,i) => {
        const d = new Date(today.getFullYear(),today.getMonth(), today.getDate() - 6 + i);
        return {day: d.tolocateDateString('en-US', { weekday: 'short'}), date: iso(d),pages: sum(records.filter((r) => r.dateAdded === iso(d))) };

    });
    return {
        count: records.length,
        authors: new Set(records.map((r) => r.author)).size,
        pages: sum(records),
        topTag,
        topCount: tags[topTag] || 0,
        monthPages: sum(records.filter((r) => r.dateAdded.startsWith(iso(today).slice(0,7)))),
        last7,
    };

    
}
export const capStatus = (pages,cap) => (!cap ? 'none' : pages > cap? 'over': 'under');