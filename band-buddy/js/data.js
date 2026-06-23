// ─── Data Store (localStorage) ───────────────────────────────────────────────

const BB = (() => {
  const KEYS = {
    songs: 'bb_songs',
    setlists: 'bb_setlists',
    rehearsals: 'bb_rehearsals',
    events: 'bb_events',
    tasks: 'bb_tasks',
    members: 'bb_members',
    rider: 'bb_rider',
    uploads: 'bb_uploads',
  };

  const load = k => {
    try { return JSON.parse(localStorage.getItem(KEYS[k])) || null; } catch { return null; }
  };
  const save = (k, v) => localStorage.setItem(KEYS[k], JSON.stringify(v));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // ── Seed data ──────────────────────────────────────────────────────────────
  const seed = () => {
    if (load('members')) return; // already seeded

    save('members', [
      { id: 'mb1', name: 'Alex', role: 'Gitarre / Gesang', color: '#e63946' },
      { id: 'mb2', name: 'Mira', role: 'Lead Vocals', color: '#f4a261' },
      { id: 'mb3', name: 'Jonas', role: 'Bass', color: '#2a9d8f' },
      { id: 'mb4', name: 'Lea', role: 'Drums', color: '#9b5de5' },
      { id: 'mb5', name: 'Tom', role: 'Keys / Gesang', color: '#06d6a0' },
    ]);

    save('songs', [
      { id: 'sg1', title: 'Thunderstruck', artist: 'AC/DC', key: 'E', bpm: 132, singer: 'mb1', tags: ['rock','opener'], notes: '' },
      { id: 'sg2', title: 'Highway to Hell', artist: 'AC/DC', key: 'A', bpm: 116, singer: 'mb1', tags: ['rock'], notes: '' },
      { id: 'sg3', title: 'Livin\' on a Prayer', artist: 'Bon Jovi', key: 'Em', bpm: 122, singer: 'mb2', tags: ['rock','crowd'], notes: '' },
      { id: 'sg4', title: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd', key: 'G', bpm: 98, singer: 'mb1', tags: ['rock','groove'], notes: '' },
      { id: 'sg5', title: 'Don\'t Stop Believin\'', artist: 'Journey', key: 'E', bpm: 118, singer: 'mb2', tags: ['classic','closer'], notes: '' },
      { id: 'sg6', title: 'Mr. Brightside', artist: 'The Killers', key: 'Ab', bpm: 148, singer: 'mb2', tags: ['indie'], notes: '' },
      { id: 'sg7', title: 'Seven Nation Army', artist: 'The White Stripes', key: 'E', bpm: 124, singer: 'mb1', tags: ['rock','riff'], notes: '' },
      { id: 'sg8', title: 'Bohemian Rhapsody', artist: 'Queen', key: 'Bb', bpm: 72, singer: 'mb2', tags: ['classic','epic'], notes: 'Aufwändige Harmonien' },
    ]);

    save('setlists', [
      {
        id: 'sl1', name: 'Stadtfest Set 1', event_id: null, created: new Date().toISOString(),
        songs: [
          { song_id: 'sg1', order: 1, notes: '' },
          { song_id: 'sg7', order: 2, notes: '' },
          { song_id: 'sg3', order: 3, notes: '' },
          { song_id: 'sg4', order: 4, notes: '' },
          { song_id: 'sg5', order: 5, notes: '' },
        ]
      }
    ]);

    const today = new Date();
    const fmt = d => d.toISOString().split('T')[0];
    const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };

    save('events', [
      {
        id: 'ev1', type: 'probe', title: 'Probe Donnerstag', date: fmt(addDays(today,4)),
        time: '20:00', location: 'Proberaum Keller', meeting_point: '', dresscode: '',
        wishlist_songs: ['sg6','sg8'], comment: 'Fokus auf neue Songs',
        votes: { mb1: 'yes', mb2: 'yes', mb3: 'maybe', mb4: 'yes', mb5: 'no' }
      },
      {
        id: 'ev2', type: 'gig', title: 'Stadtfest Auftritt', date: fmt(addDays(today,18)),
        time: '21:00', location: 'Marktplatz Hauptbühne', meeting_point: 'Backstage Eingang 19:30',
        dresscode: 'Schwarz / Band-Shirts', wishlist_songs: ['sg1','sg5'],
        comment: 'Soundcheck 17:00 Uhr',
        votes: { mb1: 'yes', mb2: 'yes', mb3: 'yes', mb4: 'yes', mb5: 'yes' }
      },
      {
        id: 'ev3', type: 'sonstig', title: 'Bandbesprechung', date: fmt(addDays(today,7)),
        time: '19:00', location: 'Kneipe Zum Adler', meeting_point: '', dresscode: '',
        wishlist_songs: [], comment: 'Jahresplanung & Budget',
        votes: { mb1: 'yes', mb2: 'maybe', mb3: 'yes', mb4: 'no', mb5: 'yes' }
      },
    ]);

    save('rehearsals', [
      { id: 'rh1', song_id: 'sg6', status: 'yellow', comment: 'Intro klappt, Bridge fehlt noch', assignee: 'mb1', priority: 1 },
      { id: 'rh2', song_id: 'sg8', status: 'red', comment: 'Harmonien müssen noch eingeübt werden', assignee: 'mb2', priority: 2 },
      { id: 'rh3', song_id: 'sg3', status: 'green', comment: 'Sitzt gut, bereit für Auftritt', assignee: '', priority: 3 },
      { id: 'rh4', song_id: 'sg4', status: 'yellow', comment: 'Solo-Teil üben', assignee: 'mb1', priority: 4 },
      { id: 'rh5', song_id: 'sg7', status: 'green', comment: 'Perfekt', assignee: '', priority: 5 },
    ]);

    save('tasks', [
      { id: 'tk1', title: 'PA Anlage buchen', desc: 'Für Stadtfest PA mieten', assignee: 'mb3', due: fmt(addDays(today,10)), status: 'open', event_id: 'ev2', song_id: '' },
      { id: 'tk2', title: 'Setlist drucken', desc: '5x für Bühne', assignee: 'mb2', due: fmt(addDays(today,15)), status: 'open', event_id: 'ev2', song_id: '' },
      { id: 'tk3', title: 'Bohemian Rhapsody Noten', desc: 'Noten für alle Mitglieder', assignee: 'mb5', due: fmt(addDays(today,3)), status: 'in_progress', event_id: '', song_id: 'sg8' },
      { id: 'tk4', title: 'Proberaum-Schlüssel', desc: 'Zweiten Schlüssel nachmachen', assignee: 'mb4', due: fmt(addDays(today,2)), status: 'done', event_id: '', song_id: '' },
    ]);

    save('rider', {
      technical: [
        { id: 'rd1', category: 'PA', item: '2x Tops, 2x Subs (min. 2kW)', checked: false },
        { id: 'rd2', category: 'PA', item: 'Mischpult 16-Kanal', checked: false },
        { id: 'rd3', category: 'Monitor', item: '4x Bühnenmonitore', checked: false },
        { id: 'rd4', category: 'Mikrofon', item: '3x SM58 Gesang', checked: false },
        { id: 'rd5', category: 'Mikrofon', item: '1x Kick Drum Mikrofon', checked: false },
        { id: 'rd6', category: 'Licht', item: '4x PAR LED', checked: false },
      ],
      hospitality: [
        { id: 'rd7', category: 'Catering', item: '6x Wasser still (0,5L)', checked: false },
        { id: 'rd8', category: 'Catering', item: '4x Club Mate', checked: false },
        { id: 'rd9', category: 'Catering', item: 'Snacks / Obstplatte', checked: false },
        { id: 'rd10', category: 'Garderobe', item: 'Abgeschlossene Garderobe', checked: false },
        { id: 'rd11', category: 'Parken', item: '2 Parkplätze für Equipment-Van', checked: false },
      ],
      notes: 'Bitte 2h vor Auftritt Einlass für Aufbau. Soundcheck mindestens 1h vor Show.'
    });

    save('uploads', []);
  };

  // ── Generic CRUD ───────────────────────────────────────────────────────────
  const getAll = k => load(k) || [];
  const getOne = (k, id) => getAll(k).find(x => x.id === id) || null;
  const add = (k, obj) => { const arr = getAll(k); arr.push({ id: uid(), ...obj }); save(k, arr); return arr[arr.length-1]; };
  const update = (k, id, patch) => {
    const arr = getAll(k).map(x => x.id === id ? { ...x, ...patch } : x);
    save(k, arr); return arr.find(x => x.id === id);
  };
  const remove = (k, id) => { save(k, getAll(k).filter(x => x.id !== id)); };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getSong = id => getOne('songs', id);
  const getMember = id => getOne('members', id);
  const getMemberName = id => { const m = getMember(id); return m ? m.name : '—'; };

  return { seed, uid, getAll, getOne, add, update, remove, getSong, getMember, getMemberName, save, load, KEYS };
})();
