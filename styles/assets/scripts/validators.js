const NAME = String.raw`\p{L}[\p{L}.'’-]*(?: \p{L}[\p{L}.'’-]*)*`;
export const RE ={
    trim: /^\S(?:[\s\S]*\S)?$/,
    double: /[^\s]{2,}/,
    dupWord: /\b(\w+)\s+\1\b/,
    author: new RegExp(`^${NAME}(?:(?:, | & )${NAME})*$`, 'u'),
    dupAuthor: /(?:^|, | & )([^,&]+)(?:, | & )(?:[^,&]+(?:, | & ))*\1(?=$|, | & )/,
    number: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    whole: /^[1-9]\d*$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    isbn: /^(?:(?=(?:\D*\d){13}$)97[89](?:-?\d){10}|(?=(?:[^\dX]*[\dX]){10}$)(?:\d-?){9}[\dX])$/,


};

const RULES ={

    title: [[RE.trim, 1, 'Remove spac at the start or end.'], [RE.double, 0, 'Remove double spaces.'], [RE.dupWord, 0, 'A word is repeated.']],
    author: [[RE.trim, 1, 'remove space at the start or end.'], [RE.author, 1, 'Letters only, separate authors with","or "&".'], [RE.dupAuthor, 0, 'An authoris listed twice.']],
    pages: [[RE.number, 1, 'Use a number like 320,'], [RE.whole, 1, 'Pages must be a whole number above o.']],
    dateAdded: [[RE.date, 1, 'Use the foemat YYYYY-MM-DD.']],
    tag: [[RE.date, 1, 'Letters only, with single spaces or hyphens.']],
    isbn: [[RE.isbn, 1, 'Use a 10- or 13-digit ISBN.']],
    notes: [[RE.trim, 1, 'Remove spaces at the start or end.']],
};
export const FIELDS = Object.keys(RULES);

const isRealDate = (s) => { const d = new Date(s + 'T00:00:00Z'); return !isNaN(d) && d.toISOString().startsWith(s);};

function isbnOK(raw) {
    const s = raw.replace(/-/g, ''), long = s.length === 13;
    const sum = [...s].reduce((a,c,i) => a + (c === 'X' ? 10 : +c) * (long ? 1 + 2 * (i % 2) : 10 - i), 0);
    return sum % 10 === 0;

}

export function validateField(key, v = '') {
    if (!v) return key === 'isbn' || key === 'notes' ? '' : 'This field is required.';
    const broken = RULES[key].find(([re,must]) => re.test(v) !== !!must);
    if (broken) return broken[2];
    if (key === 'dateAdded' && !isRealDate(v)) return 'That date does not exist.';
    if (key === 'isbn' && !isbnOK(v)) return 'ISBN check digit is wrong.';
    return key === 'pages' && v >20000 ? 'Max 20,000 pages.' : '';
}

export function validateRecord(data) {
    const errors ={};
    FIELDS.forEach((k) => { const msg = validateField(k, data[k]); if (msg) errors[k] =msg; });
    return { valid: !Object.keys(errors).length, errors };

}