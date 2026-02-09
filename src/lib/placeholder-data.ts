import { v4 as uuidv4 } from "uuid";

/* ============================================================
   POZICIJE  (v ANG)
   ============================================================ */
export const pozicije = [
  { id: uuidv4(), naziv: "Goalkeeper", kratica: "GK" },
  { id: uuidv4(), naziv: "Defender", kratica: "DF" },
  { id: uuidv4(), naziv: "Midfielder", kratica: "MF" },
  { id: uuidv4(), naziv: "Forward", kratica: "FW" },
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
    priimek: "Kovac",
    starost: 40,
    email: "marko.kovac@gmail.com",
    geslo: "coach123",
    ekipa_id: ekipe[0].id,
  },
  {
    id: uuidv4(),
    ime: "Bostjan",
    priimek: "Kralj",
    starost: 38,
    email: "bostjan.kralj@gmail.com",
    geslo: "coach123",
    ekipa_id: ekipe[1].id,
  },
];

/* ============================================================
   IGRALCI
   ============================================================ */
export const igralci = [
  {
    id: uuidv4(),
    ime: "Jan",
    priimek: "Kotar",
    starost: 15,
    visina: 170,
    pozicija_id: pozicije[2].id, // Midfielder
    stevilka_dresa: 8,
    email: "jan.kotar@gmail.com",
    geslo: "player123",
    ekipa_id: ekipe[0].id,
  },
  {
    id: uuidv4(),
    ime: "Urban",
    priimek: "Sesek",
    starost: 14,
    visina: 165,
    pozicija_id: pozicije[0].id, // Goalkeeper
    stevilka_dresa: 1,
    email: "urban.sesek@gmail.com",
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
   TRENINGI  (povrsina v ANG)
   ============================================================ */
export const treningi = [
  {
    id: uuidv4(),
    ekipa_id: ekipe[0].id,
    trener_id: trenerji[0].id,
    zacetek: "2025-02-01T17:00:00",
    konec: "2025-02-01T18:30:00",
    povrsina: "Grass",
    opis: "Tactical training",
  },
  {
    id: uuidv4(),
    ekipa_id: ekipe[0].id,
    trener_id: trenerji[0].id,
    zacetek: "2025-02-03T18:00:00",
    konec: "2025-02-03T19:30:00",
    povrsina: "Indoor",
    opis: "Conditioning training",
  },
  {
    id: uuidv4(),
    ekipa_id: ekipe[0].id,
    trener_id: trenerji[0].id,
    zacetek: "2025-02-06T17:30:00",
    konec: "2025-02-06T19:00:00",
    povrsina: "Artificial grass",
    opis: "Technical training",
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
    ekipa_id: ekipe[0].id,
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
];

/* ============================================================
   IGRALCI ↔ TEKME
   ============================================================ */
export const igralecTekma = [
  {
    igralec_id: igralci[0].id,
    tekma_id: tekme[0].id,
    minute: 75,
    pozicija_id: pozicije[2].id, // Midfielder
  },
];
