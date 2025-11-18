// Placeholder data for seeding the football management database.

// =========================
// IGRALCI
// =========================
const igralci = [
  {
    id: 'p1',
    ime: 'Marko',
    priimek: 'Novak',
    starost: 18,
    visina: 178,
    pozicija: 'vezist',
    stevilka_dresa: 8,
    email: 'marko.novak@example.com',
    geslo: 'marko123', // hashaj v produkciji
  },
  {
    id: 'p2',
    ime: 'Luka',
    priimek: 'Kranjc',
    starost: 17,
    visina: 182,
    pozicija: 'branilec',
    stevilka_dresa: 4,
    email: 'luka.kranjc@example.com',
    geslo: 'luka123',
  },
  {
    id: 'p3',
    ime: 'Tian',
    priimek: 'Mlakar',
    starost: 18,
    visina: 175,
    pozicija: 'napadalec',
    stevilka_dresa: 9,
    email: 'tian.mlakar@example.com',
    geslo: 'tian123',
  },
];

// =========================
// TRENERJI
// =========================
const trenerji = [
  {
    id: 'tr1',
    ime: 'Andrej',
    priimek: 'Kovač',
    starost: 42,
    email: 'andrej.kovac@example.com',
    geslo: 'trener123',
  },
  {
    id: 'tr2',
    ime: 'Milan',
    priimek: 'Horvat',
    starost: 47,
    email: 'milan.horvat@example.com',
    geslo: 'milan123',
  },
];

// =========================
// NASPROTNE EKIPE
// =========================
const nasprotneEkipe = [
  { id: 'op1', ime_ekipe: 'NK Celje' },
  { id: 'op2', ime_ekipe: 'NK Maribor' },
  { id: 'op3', ime_ekipe: 'NK Olimpija' },
];

// =========================
// TRENINGI
// =========================
const treningi = [
  {
    id: 't1',
    cas_treninga: '2024-10-01 17:00',
    povrsina: 'umetna',
    opis: 'Taktična vaja + zaključki na gol.',
  },
  {
    id: 't2',
    cas_treninga: '2024-10-03 17:00',
    povrsina: 'naravna',
    opis: 'Krožni trening moči in eksplozivnosti.',
  },
];

// =========================
// TEKME
// =========================
const tekme = [
  {
    id: 'm1',
    cas_tekme: '2024-10-10 16:00',
    kraj_tekme: 'Velenje',
    nasprotna_ekipa_id: nasprotneEkipe[0].id,
  },
  {
    id: 'm2',
    cas_tekme: '2024-10-20 15:30',
    kraj_tekme: 'Maribor',
    nasprotna_ekipa_id: nasprotneEkipe[1].id,
  },
];

// =========================
// IGRALCI ↔ TRENINGI
// =========================
const igralecTrening = [
  { igralec_id: igralci[0].id, trening_id: treningi[0].id, prisoten: true },
  { igralec_id: igralci[1].id, trening_id: treningi[0].id, prisoten: false },
  { igralec_id: igralci[2].id, trening_id: treningi[1].id, prisoten: true },
];

// =========================
// IGRALCI ↔ TEKME
// =========================
const igralecTekma = [
  {
    igralec_id: igralci[0].id,
    tekma_id: tekme[0].id,
    minute: 90,
    pozicija_na_tekmi: 'vezist',
  },
  {
    igralec_id: igralci[2].id,
    tekma_id: tekme[1].id,
    minute: 70,
    pozicija_na_tekmi: 'napadalec',
  },
];

export {
  igralci,
  trenerji,
  nasprotneEkipe,
  treningi,
  tekme,
  igralecTrening,
  igralecTekma,
};
