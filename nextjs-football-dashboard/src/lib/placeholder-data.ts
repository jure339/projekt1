import { v4 as uuidv4 } from "uuid";

/* ============================================================
   POZICIJE
   ============================================================ */
export const pozicije = [
  { id: uuidv4(), naziv: "Vratar", kratica: "GK" },
  { id: uuidv4(), naziv: "Branilec", kratica: "DF" },
  { id: uuidv4(), naziv: "Vezist", kratica: "MF" },
  { id: uuidv4(), naziv: "Napadalec", kratica: "FW" },
];

/* ============================================================
   EKIPE
   ============================================================ */
export const ekipe = [
  { id: uuidv4(), ime: "U15 Rudar" },
  { id: uuidv4(), ime: "U17 Rudar" },
  { id: uuidv4(), ime: "U19 Rudar" },
];

/* ============================================================
   TRENERJI
   ============================================================ */
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

/* ============================================================
   IGRALCI
   ============================================================ */
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
];

/* ============================================================
   NASPROTNE EKIPE
   ============================================================ */
export const nasprotneEkipe = [
  { id: uuidv4(), ime_ekipe: "NK Celje" },
  { id: uuidv4(), ime_ekipe: "NK Maribor" },
  { id: uuidv4(), ime_ekipe: "NK Olimpija" },
];

/* ============================================================
   TRENINGI  ✅ POPRAVLJENO
   ============================================================ */
export const treningi = [
  {
    id: uuidv4(),
    ekipa_id: ekipe[0].id,
    trener_id: trenerji[0].id,
    zacetek: "2025-02-01T17:00:00",
    konec: "2025-02-01T18:30:00",
    povrsina: "Trava",
    opis: "Taktični trening",
  },
  {
    id: uuidv4(),
    ekipa_id: ekipe[0].id,
    trener_id: trenerji[1].id,
    zacetek: "2025-02-03T18:00:00",
    konec: "2025-02-03T19:30:00",
    povrsina: "Dvorana",
    opis: "Kondicijski trening",
  },
];

/* ============================================================
   TEKME
   ============================================================ */
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

/* ============================================================
   IGRALCI ↔ TRENINGI
   ============================================================ */
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

/* ============================================================
   IGRALCI ↔ TEKME
   ============================================================ */
export const igralecTekma = [
  {
    igralec_id: igralci[2].id,
    tekma_id: tekme[0].id,
    minute: 70,
    pozicija_id: pozicije[3].id,
  },
];
