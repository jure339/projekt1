// ------------------------------------------
// POZICIJE (nova tabela)
// ------------------------------------------
const pozicije = [
  {
    id: '99999999-1111-2222-3333-000000000001',
    naziv: 'Centralni vezist',
    kratica: 'CM',
  },
  {
    id: '99999999-1111-2222-3333-000000000002',
    naziv: 'Napadalec',
    kratica: 'ST',
  },
  {
    id: '99999999-1111-2222-3333-000000000003',
    naziv: 'Vezist',
    kratica: 'MID',
  }
];

// ------------------------------------------
// IGRALCI
// ------------------------------------------
const igralci = [
  {
    id: '11111111-aaaa-bbbb-cccc-000000000001',
    ime: 'Luka',
    priimek: 'Kovač',
    starost: 17,
    visina: 180,
    pozicija_id: pozicije[0].id,      // CM
    stevilka_dresa: 8,
    email: 'luka@klub.com',
    geslo: '123456',
  },
  {
    id: '11111111-aaaa-bbbb-cccc-000000000002',
    ime: 'Žan',
    priimek: 'Horvat',
    starost: 18,
    visina: 176,
    pozicija_id: pozicije[1].id,      // ST
    stevilka_dresa: 9,
    email: 'zan@klub.com',
    geslo: '123456',
  },
];

// ------------------------------------------
// TRENERJI
// ------------------------------------------
const trenerji = [
  {
    id: '22222222-bbbb-cccc-dddd-000000000001',
    ime: 'Marko',
    priimek: 'Novak',
    starost: 38,
    email: 'trener@klub.com',
    geslo: '123456',
  },
];

// ------------------------------------------
// NASPROTNE EKIPE
// ------------------------------------------
const nasprotneEkipe = [
  {
    id: '33333333-cccc-dddd-eeee-000000000001',
    ime_ekipe: 'NK Maribor',
  },
  {
    id: '33333333-cccc-dddd-eeee-000000000002',
    ime_ekipe: 'NK Celje',
  },
];

// ------------------------------------------
// TEKME
// ------------------------------------------
const tekme = [
  {
    id: '44444444-dddd-eeee-ffff-000000000001',
    cas_tekme: '2025-03-20 17:00',
    kraj_tekme: 'Velenje',
    nasprotna_ekipa_id: nasprotneEkipe[0].id,
  },
  {
    id: '44444444-dddd-eeee-ffff-000000000002',
    cas_tekme: '2025-03-28 18:00',
    kraj_tekme: 'Celje',
    nasprotna_ekipa_id: nasprotneEkipe[1].id,
  },
];

// ------------------------------------------
// TRENINGI
// ------------------------------------------
const treningi = [
  {
    id: '55555555-eeee-ffff-1111-000000000001',
    cas_treninga: '2025-03-15 17:30',
    povrsina: 'naravna',
    opis: 'Taktični trening + kroženje žoge',
  },
  {
    id: '55555555-eeee-ffff-1111-000000000002',
    cas_treninga: '2025-03-17 18:00',
    povrsina: 'umetna',
    opis: 'Kondicija + intenzivni sprinti',
  },
];

// ------------------------------------------
// MANY-TO-MANY: IGRALEC – TRENING
// ------------------------------------------
const igralecTrening = [
  {
    igralec_id: igralci[0].id,
    trening_id: treningi[0].id,
    prisoten: true,
  },
  {
    igralec_id: igralci[1].id,
    trening_id: treningi[1].id,
    prisoten: false,
  },
];

// ------------------------------------------
// MANY-TO-MANY: IGRALEC – TEKMA
// ------------------------------------------
const igralecTekma = [
  {
    igralec_id: igralci[0].id,
    tekma_id: tekme[0].id,
    minute: 90,
    pozicija_id: pozicije[2].id,  // vezist
  },
  {
    igralec_id: igralci[1].id,
    tekma_id: tekme[1].id,
    minute: 70,
    pozicija_id: pozicije[1].id,  // ST
  },
];

// EXPORT -----------------------------------------------------
export {
  pozicije,
  igralci,
  trenerji,
  tekme,
  nasprotneEkipe,
  treningi,
  igralecTrening,
  igralecTekma,
};
