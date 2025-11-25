import { v4 as uuidv4 } from "uuid";

// =====================================
// POZICIJE
// =====================================
export const pozicije = [
  { id: uuidv4(), naziv: "Vratar", kratica: "GK" },
  { id: uuidv4(), naziv: "Branilec", kratica: "DF" },
  { id: uuidv4(), naziv: "Vezist", kratica: "MF" },
  { id: uuidv4(), naziv: "Napadalec", kratica: "FW" },
];

// =====================================
// EKIPE
// =====================================
export const ekipe = [
  { id: uuidv4(), ime: "U15 Rudar" },
  { id: uuidv4(), ime: "U17 Rudar" },
  { id: uuidv4(), ime: "U19 Rudar" },
];

// =====================================
// TRENERJI
// =====================================
export const trenerji = [
  {
    id: uuidv4(),
    ime: "Marko",
    priimek: "Kovač",
    starost: 40,
    email: "marko.kov@gmail.com",
    geslo: "trener123",
    ekipa_id: ekipe[0].id,
  },
  {
    id: uuidv4(),
    ime: "Boštjan",
    priimek: "Kralj",
    starost: 38,
    email: "bostjan.kralj@gmail.com",
    geslo: "trener123",
    ekipa_id: ekipe[0].id,
  },
  {
    id: uuidv4(),
    ime: "Luka",
    priimek: "Vidmar",
    starost: 35,
    email: "luka.vidmar@gmail.com",
    geslo: "trener123",
    ekipa_id: ekipe[1].id,
  },
  {
    id: uuidv4(),
    ime: "Tomaž",
    priimek: "Mlakar",
    starost: 41,
    email: "tomaz.mla@gmail.com",
    geslo: "trener123",
    ekipa_id: ekipe[1].id,
  },
  {
    id: uuidv4(),
    ime: "Gregor",
    priimek: "Hočevar",
    starost: 44,
    email: "gregor.hoc@gmail.com",
    geslo: "trener123",
    ekipa_id: ekipe[2].id,
  },
  {
    id: uuidv4(),
    ime: "Oskar",
    priimek: "Berič",
    starost: 39,
    email: "oskar.beric@gmail.com",
    geslo: "trener123",
    ekipa_id: ekipe[2].id,
  },
];

// =====================================
// IGRALCI (6 na ekipo)
// =====================================
export const igralci = [
  // ---------------- U15 ----------------
  {
    id: uuidv4(),
    ime: "Jan",
    priimek: "Kotar",
    starost: 15,
    visina: 170,
    pozicija_id: pozicije[2].id,
    stevilka_dresa: 8,
    email: "jan.kotar@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[0].id,
  },
  {
    id: uuidv4(),
    ime: "Rok",
    priimek: "Sedej",
    starost: 15,
    visina: 168,
    pozicija_id: pozicije[1].id,
    stevilka_dresa: 5,
    email: "rok.sedej@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[0].id,
  },
  {
    id: uuidv4(),
    ime: "Lan",
    priimek: "Bajc",
    starost: 14,
    visina: 160,
    pozicija_id: pozicije[3].id,
    stevilka_dresa: 11,
    email: "lan.bajc@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[0].id,
  },
  {
    id: uuidv4(),
    ime: "Miha",
    priimek: "Jovan",
    starost: 15,
    visina: 175,
    pozicija_id: pozicije[1].id,
    stevilka_dresa: 4,
    email: "miha.jovan@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[0].id,
  },
  {
    id: uuidv4(),
    ime: "Urban",
    priimek: "Sešek",
    starost: 14,
    visina: 165,
    pozicija_id: pozicije[0].id,
    stevilka_dresa: 1,
    email: "urban.sesek@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[0].id,
  },
  {
    id: uuidv4(),
    ime: "Tian",
    priimek: "Pečnik",
    starost: 15,
    visina: 166,
    pozicija_id: pozicije[2].id,
    stevilka_dresa: 6,
    email: "tian.pecnik@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[0].id,
  },

  // ---------------- U17 ----------------
  {
    id: uuidv4(),
    ime: "Žiga",
    priimek: "Rupnik",
    starost: 16,
    visina: 178,
    pozicija_id: pozicije[3].id,
    stevilka_dresa: 9,
    email: "ziga.rupnik@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[1].id,
  },
  {
    id: uuidv4(),
    ime: "Niko",
    priimek: "Lesjak",
    starost: 17,
    visina: 181,
    pozicija_id: pozicije[2].id,
    stevilka_dresa: 10,
    email: "niko.lesjak@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[1].id,
  },
  {
    id: uuidv4(),
    ime: "Kris",
    priimek: "Tratar",
    starost: 16,
    visina: 174,
    pozicija_id: pozicije[1].id,
    stevilka_dresa: 3,
    email: "kris.tratar@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[1].id,
  },
  {
    id: uuidv4(),
    ime: "Tilen",
    priimek: "Krpič",
    starost: 16,
    visina: 176,
    pozicija_id: pozicije[0].id,
    stevilka_dresa: 1,
    email: "tilen.krpic@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[1].id,
  },
  {
    id: uuidv4(),
    ime: "Gaber",
    priimek: "Zajc",
    starost: 17,
    visina: 179,
    pozicija_id: pozicije[2].id,
    stevilka_dresa: 14,
    email: "gaber.zajc@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[1].id,
  },
  {
    id: uuidv4(),
    ime: "Omi",
    priimek: "Lenarčič",
    starost: 17,
    visina: 182,
    pozicija_id: pozicije[3].id,
    stevilka_dresa: 7,
    email: "omi.lenarcic@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[1].id,
  },

  // ---------------- U19 ----------------
  {
    id: uuidv4(),
    ime: "Tim",
    priimek: "Kralj",
    starost: 18,
    visina: 185,
    pozicija_id: pozicije[2].id,
    stevilka_dresa: 8,
    email: "tim.kralj@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[2].id,
  },
  {
    id: uuidv4(),
    ime: "Denis",
    priimek: "Štibernik",
    starost: 19,
    visina: 188,
    pozicija_id: pozicije[3].id,
    stevilka_dresa: 9,
    email: "denis.stibernik@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[2].id,
  },
  {
    id: uuidv4(),
    ime: "Lian",
    priimek: "Kapun",
    starost: 18,
    visina: 179,
    pozicija_id: pozicije[1].id,
    stevilka_dresa: 4,
    email: "lian.kapun@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[2].id,
  },
  {
    id: uuidv4(),
    ime: "Anže",
    priimek: "Šubic",
    starost: 18,
    visina: 180,
    pozicija_id: pozicije[0].id,
    stevilka_dresa: 1,
    email: "anze.subic@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[2].id,
  },
  {
    id: uuidv4(),
    ime: "Maj",
    priimek: "Ludvik",
    starost: 19,
    visina: 183,
    pozicija_id: pozicije[2].id,
    stevilka_dresa: 6,
    email: "maj.ludvik@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[2].id,
  },
  {
    id: uuidv4(),
    ime: "Erik",
    priimek: "Kosec",
    starost: 19,
    visina: 187,
    pozicija_id: pozicije[3].id,
    stevilka_dresa: 11,
    email: "erik.kosec@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[2].id,
  },
];

// =====================================
// NASPROTNE EKIPE
// =====================================
export const nasprotneEkipe = [
  { id: uuidv4(), ime_ekipe: "NK Celje" },
  { id: uuidv4(), ime_ekipe: "NK Maribor" },
  { id: uuidv4(), ime_ekipe: "NK Olimpija" },
];

// =====================================
// TRENINGI
// =====================================
export const treningi = [
  {
    id: uuidv4(),
    cas_treninga: "2025-02-01T17:00:00",
    povrsina: "Trava",
    opis: "Taktični trening",
  },
  {
    id: uuidv4(),
    cas_treninga: "2025-02-03T18:00:00",
    povrsina: "Dvorana",
    opis: "Kondicijski trening",
  },
];

// =====================================
// TEKME
// =====================================
export const tekme = [
  {
    id: uuidv4(),
    cas_tekme: "2025-03-12T15:00:00",
    kraj_tekme: "Velenje",
    nasprotna_ekipa_id: nasprotneEkipe[0].id,
  },
  {
    id: uuidv4(),
    cas_tekme: "2025-03-20T16:00:00",
    kraj_tekme: "Ljubljana",
    nasprotna_ekipa_id: nasprotneEkipe[2].id,
  },
];

// =====================================
// IGRALCI ↔ TRENINGI
// =====================================
export const igralecTrening = [
  {
    igralec_id: igralci[0].id,
    trening_id: treningi[0].id,
    prisoten: true,
  },
  {
    igralec_id: igralci[5].id,
    trening_id: treningi[1].id,
    prisoten: false,
  },
];

// =====================================
// IGRALCI ↔ TEKME
// =====================================
export const igralecTekma = [
  {
    igralec_id: igralci[2].id,
    tekma_id: tekme[0].id,
    minute: 70,
    pozicija_id: pozicije[3].id,
  },
  {
    igralec_id: igralci[10].id,
    tekma_id: tekme[1].id,
    minute: 90,
    pozicija_id: pozicije[2].id,
  },
];
