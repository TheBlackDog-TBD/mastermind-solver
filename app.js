(() => {
'use strict';

/* =========================
   CONFIGURATION
========================= */

const $ = id => document.getElementById(id);

const STORAGE_KEY = 'mastermind-simple-v1';

const MAX_HISTORY = 12;
const MAX_STORAGE_SIZE = 100000;

const PALETTE = Object.freeze([
    { id: 'red', name: 'Red', hex: '#ef4444' },
    { id: 'blue', name: 'Blue', hex: '#3b82f6' },
    { id: 'green', name: 'Green', hex: '#22a06b' },
    { id: 'white', name: 'White', hex: '#ffffff' },
    { id: 'black', name: 'Black', hex: '#171717' },
    { id: 'yellow', name: 'Yellow', hex: '#facc15' }
]);

const VALID_IDS = new Set(PALETTE.map(c => c.id));

const DEFAULT = {
    positions: 4,
    repeats: true,
    colors: PALETTE.map(c => c.id)
};

let config = structuredClone(DEFAULT);

let universe = [];
let candidates = [];
let guess = null;

let black = 0;
let white = 0;

let history = [];
let theme = 'dark';

/* =========================
   VALIDATION
========================= */

function isInteger(value, min, max) {
    return Number.isInteger(value) &&
           value >= min &&
           value <= max;
}

function validateConfig(data) {

    if (!data || typeof data !== 'object') {
        return null;
    }

    if (!isInteger(data.positions, 3, 6)) {
        return null;
    }

    if (typeof data.repeats !== 'boolean') {
        return null;
    }

    if (!Array.isArray(data.colors)) {
        return null;
    }

    if (data.colors.length < 2 || data.colors.length > 6) {
        return null;
    }

    if (!data.colors.every(id => VALID_IDS.has(id))) {
        return null;
    }

    if (new Set(data.colors).size !== data.colors.length) {
        return null;
    }

    if (!data.repeats && data.positions > data.colors.length) {
        return null;
    }

    return {
        positions: data.positions,
        repeats: data.repeats,
        colors: data.colors.slice()
    };
}

function validateCode(code) {

    return Array.isArray(code) &&
        code.length === config.positions &&
        code.every(id => config.colors.includes(id));
}

function validateFeedback(feedback) {

    return feedback &&
        isInteger(feedback.black, 0, config.positions) &&
        isInteger(feedback.white, 0, config.positions) &&
        feedback.black + feedback.white <= config.positions;
}

/* =========================
   SOLVER
========================= */

function makeUniverse() {

    const out = [];
    const current = [];

    function visit() {

        if (current.length === config.positions) {
            out.push(current.slice());
            return;
        }

        for (const id of config.colors) {

            if (!config.repeats && current.includes(id)) {
                continue;
            }

            current.push(id);
            visit();
            current.pop();
        }
    }

    visit();

    return out;
}

function score(a, b) {

    let exact = 0;

    const ca = Object.create(null);
    const cb = Object.create(null);

    for (let i = 0; i < a.length; i++) {

        if (a[i] === b[i]) {
            exact++;
        } else {

            ca[a[i]] = (ca[a[i]] || 0) + 1;
            cb[b[i]] = (cb[b[i]] || 0) + 1;
        }
    }

    let misplaced = 0;

    for (const id of Object.keys(ca)) {

        misplaced += Math.min(
            ca[id],
            cb[id] || 0
        );
    }

    return {
        black: exact,
        white: misplaced
    };
}

function compatible(list, g, feedback) {

    return list.filter(code => {

        const result = score(g, code);

        return result.black === feedback.black &&
               result.white === feedback.white;
    });
}

/* =========================
   GUESS SELECTION
========================= */

function chooseGuess() {

    if (candidates.length <= 1) {
        return candidates[0] || null;
    }

    let best = candidates[0];

    let bestWorst = Infinity;
    let bestAvg = Infinity;

    const step = Math.max(
        1,
        Math.ceil(candidates.length / 240)
    );

    const pool = candidates.filter(
        (_, i) => i % step === 0
    );

    for (const trial of pool) {

        const buckets = new Map();

        for (const secret of candidates) {

            const result = score(trial, secret);

            const key =
                result.black * 10 + result.white;

            buckets.set(
                key,
                (buckets.get(key) || 0) + 1
            );
        }

        let worst = 0;
        let sum = 0;

        for (const n of buckets.values()) {

            worst = Math.max(worst, n);
            sum += n * n;
        }

        const avg = sum / candidates.length;

        if (
            worst < bestWorst ||
            (worst === bestWorst && avg < bestAvg)
        ) {

            best = trial;

            bestWorst = worst;
            bestAvg = avg;
        }
    }

    return best;
}

/* =========================
   SAFE DOM MANIPULATION
========================= */

function createPeg(id, small = false) {

    if (!VALID_IDS.has(id)) {
        throw new Error('Invalid color');
    }

    const peg = document.createElement('span');

    peg.classList.add('peg', `peg-${id}`);

    if (small) {
        peg.classList.add('small');
    }

    peg.title = color(id).name;

    peg.setAttribute(
        'aria-label',
        color(id).name
    );

    return peg;
}

function createCode(code, small = false) {

    const container = document.createElement('div');

    container.className = 'code';

    for (const id of code) {
        container.appendChild(createPeg(id, small));
    }

    return container;
}

function color(id) {

    return PALETTE.find(c => c.id === id) || PALETTE[0];
}

function say(message, error = false) {

    $('status').textContent = message;

    $('status').className =
        error ? 'status error' : 'status';
}

/* =========================
   SECURE STORAGE
========================= */

function save() {

    try {

        const data = JSON.stringify({
            config,
            history,
            theme
        });

        if (data.length > MAX_STORAGE_SIZE) {
            return;
        }

        localStorage.setItem(STORAGE_KEY, data);

    } catch {
        // Storage unavailable: the solver continues working.
    }
}

function load() {

    try {

        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw || raw.length > MAX_STORAGE_SIZE) {
            return;
        }

        const data = JSON.parse(raw);

        if (!data || typeof data !== 'object') {
            return;
        }

        const validatedConfig = validateConfig(data.config);

        if (!validatedConfig) {
            return;
        }

        config = validatedConfig;

        theme = data.theme === 'light' ? 'light' : 'dark';

        if (!Array.isArray(data.history)) {
            return;
        }

        if (data.history.length > MAX_HISTORY) {
            return;
        }

        history = [];

        rebuild();

        for (const item of data.history) {

            if (
                !item ||
                !validateCode(item.guess) ||
                !validateFeedback(item.feedback)
            ) {
                break;
            }

            const next = compatible(
                candidates,
                item.guess,
                item.feedback
            );

            if (!next.length) {
                break;
            }

            history.push({
                guess: item.guess.slice(),
                feedback: {
                    black: item.feedback.black,
                    white: item.feedback.white
                }
            });

            candidates = next;
        }

    } catch {

        config = structuredClone(DEFAULT);
        history = [];
        theme = 'dark';
    }
}

/* =========================
   REBUILD SOLUTIONS
========================= */

function rebuild() {

    universe = makeUniverse();

    candidates = universe.slice();

    for (const h of history) {

        candidates = compatible(
            candidates,
            h.guess,
            h.feedback
        );
    }
}

/* =========================
   DISPLAY
========================= */

function update() {

    const suggestion = $('suggestion');

    suggestion.replaceChildren();

    if (guess) {

        suggestion.appendChild(
            createCode(guess)
        );

    } else {

        const text = document.createElement('span');

        text.className = 'muted';
        text.textContent = 'Game over';

        suggestion.appendChild(text);
    }

    $('black').textContent = String(black);
    $('white').textContent = String(white);

    $('progress').textContent =
        `${history.length} guess${history.length !== 1 ? 'es' : ''} · ${fmt(candidates.length)} possibilities`;

    const historyContainer = $('history');

    historyContainer.replaceChildren();

    if (history.length) {

        history.forEach((h, i) => {

            const row = document.createElement('div');

            row.className = 'hist';

            const left = document.createElement('span');

            left.textContent = `#${i + 1} `;

            left.appendChild(
                createCode(h.guess, true)
            );

            const right = document.createElement('span');

            right.textContent =
                `⚫ ${h.feedback.black}  ⚪ ${h.feedback.white}`;

            row.append(left, right);

            historyContainer.appendChild(row);
        });

    } else {

        const empty = document.createElement('p');

        empty.className = 'hint';
        empty.textContent = 'No guesses yet.';

        historyContainer.appendChild(empty);
    }

    $('undo').disabled = !history.length;

    $('validate').disabled =
        !guess ||
        black + white > config.positions;

    $('bPlus').disabled =
        black + white >= config.positions;

    $('wPlus').disabled =
        black + white >= config.positions;

    $('bMinus').disabled = black === 0;
    $('wMinus').disabled = white === 0;

    $('theme').textContent =
        theme === 'dark' ? '☀️' : '🌙';

    document.body.classList.toggle(
        'light',
        theme === 'light'
    );

    document.documentElement.style.colorScheme = theme;
}

function fmt(n) {

    return new Intl.NumberFormat('en-US').format(n);
}

/* =========================
   GAME MANAGEMENT
========================= */

function calculate() {

    if (!candidates.length) {

        guess = null;

        update();

        say(
            'No combination matches the provided feedback.',
            true
        );

        return;
    }

    guess = chooseGuess();

    update();

    $('suggestHint').textContent =
        candidates.length === 1
            ? 'Only one possible combination remains!'
            : `Play this combination. ${fmt(candidates.length)} possibilities remain.`;
}

function reset() {

    history = [];

    black = 0;
    white = 0;

    rebuild();

    say('New game! Play the suggested combination.');

    calculate();

    save();
}

function changeFeedback(which, delta) {

    if (which === 'black') {

        black = Math.max(
            0,
            Math.min(config.positions - white, black + delta)
        );

    } else {

        white = Math.max(
            0,
            Math.min(config.positions - black, white + delta)
        );
    }

    update();
}

function validate() {

    if (!guess) return;

    if (!validateFeedback({ black, white })) {
        say('Invalid feedback.', true);
        return;
    }

    const next = compatible(
        candidates,
        guess,
        { black, white }
    );

    if (!next.length) {

        say(
            'This feedback does not match any possible solution.',
            true
        );

        return;
    }

    history.push({
        guess: guess.slice(),
        feedback: {
            black,
            white
        }
    });

    candidates = next;

    if (black === config.positions) {

        guess = null;

        say(
            'Congratulations! You found the code. Press New Game to play again.'
        );

    } else if (history.length >= MAX_HISTORY) {

        guess = null;

        say(
            '12 guesses recorded. You can start a new game.'
        );

    } else {

        black = 0;
        white = 0;

        say('Feedback recorded.');

        calculate();
    }

    update();
    save();
}

function undo() {

    if (!history.length) return;

    history.pop();

    black = 0;
    white = 0;

    rebuild();

    say('Last response undone.');

    calculate();

    save();
}

/* =========================
   SETTINGS
========================= */

function renderSettings() {

    $('positions').value = String(config.positions);

    $('repeats').value =
        config.repeats ? 'yes' : 'no';

    const container = $('colors');

    container.replaceChildren();

    for (const c of PALETTE) {

        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'colorbtn';

        button.classList.toggle(
            'active',
            config.colors.includes(c.id)
        );

        button.dataset.color = c.id;

        const swatch = document.createElement('span');

        swatch.className = `swatch peg-${c.id}`;

        button.append(
            swatch,
            document.createTextNode(c.name)
        );

        container.appendChild(button);
    }
}

$('colors').addEventListener('click', event => {

    const button = event.target.closest('button[data-color]');

    if (!button || !$('colors').contains(button)) {
        return;
    }

    const id = button.dataset.color;

    if (!VALID_IDS.has(id)) return;

    if (config.colors.includes(id)) {

        if (config.colors.length <= 2) {

            say('Keep at least two colors.', true);

            return;
        }

        config.colors = config.colors.filter(x => x !== id);

    } else {

        if (config.colors.length >= 6) return;

        config.colors.push(id);
    }

    renderSettings();
});

$('apply').addEventListener('click', () => {

    const positions = Number($('positions').value);

    const repeats = $('repeats').value === 'yes';

    const nextConfig = validateConfig({
        positions,
        repeats,
        colors: PALETTE
            .map(c => c.id)
            .filter(id => config.colors.includes(id))
    });

    if (!nextConfig) {

        say(
            'Invalid configuration. Check the colors and number of positions.',
            true
        );

        return;
    }

    config = nextConfig;

    renderSettings();

    reset();
});

/* =========================
   EVENT LISTENERS
========================= */

$('newGame').addEventListener('click', reset);

$('validate').addEventListener('click', validate);

$('undo').addEventListener('click', undo);

$('bPlus').addEventListener('click', () => {
    changeFeedback('black', 1);
});

$('bMinus').addEventListener('click', () => {
    changeFeedback('black', -1);
});

$('wPlus').addEventListener('click', () => {
    changeFeedback('white', 1);
});

$('wMinus').addEventListener('click', () => {
    changeFeedback('white', -1);
});

$('theme').addEventListener('click', () => {

    theme = theme === 'dark' ? 'light' : 'dark';

    update();

    save();
});

/* =========================
   INITIALIZATION
========================= */

load();

rebuild();

renderSettings();

calculate();

update();

})();