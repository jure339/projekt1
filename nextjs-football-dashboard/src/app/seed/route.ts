import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';

import {
  pozicije,
  igralci,
  trenerji,
  nasprotneEkipe,
  treningi,
  tekme,
  igralecTrening,
  igralecTekma,
} from '../../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// ============================
// POZICIJE
// ============================
async function seedPozicije() {
  await sql`
    CREATE TABLE IF NOT EXISTS pozicije (
      id UUID PRIMARY KEY,
      naziv VARCHAR(255) NOT NULL,
      kratica VARCHAR(10)
    );
  `;

  return Promise.all(
    pozicije.map((p) =>
      sql`
        INSERT INTO pozicije (id, naziv, kratica)
        VALUES (${p.id}, ${p.naziv}, ${p.kratica})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );
}

// ============================
// IGRALCI
// ============================
async function seedIgralci() {
  await sql`
    CREATE TABLE IF NOT EXISTS igralci (
      id UUID PRIMARY KEY,
      ime VARCHAR(255) NOT NULL,
      priimek VARCHAR(255) NOT NULL,
      starost INT NOT NULL,
      visina INT,
      pozicija_id UUID REFERENCES pozicije(id),
      stevilka_dresa INT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  return Promise.all(
    igralci.map(async (igralec) => {
      const hashedPassword = await bcrypt.hash(igralec.geslo, 10);
      return sql`
        INSERT INTO igralci (id, ime, priimek, starost, visina, pozicija_id, stevilka_dresa, email, password)
        VALUES (${igralec.id}, ${igralec.ime}, ${igralec.priimek}, ${igralec.starost}, ${igralec.visina}, ${igralec.pozicija_id}, ${igralec.stevilka_dresa}, ${igralec.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );
}

// ============================
// TRENERJI
// ============================
async function seedTrenerji() {
  await sql`
    CREATE TABLE IF NOT EXISTS trenerji (
      id UUID PRIMARY KEY,
      ime VARCHAR(255) NOT NULL,
      priimek VARCHAR(255) NOT NULL,
      starost INT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  return Promise.all(
    trenerji.map(async (trener) => {
      const hashedPassword = await bcrypt.hash(trener.geslo, 10);
      return sql`
        INSERT INTO trenerji (id, ime, priimek, starost, email, password)
        VALUES (${trener.id}, ${trener.ime}, ${trener.priimek}, ${trener.starost}, ${trener.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );
}

// ============================
// NASPROTNE EKIPE
// ============================
async function seedNasprotneEkipe() {
  await sql`
    CREATE TABLE IF NOT EXISTS nasprotne_ekipe (
      id UUID PRIMARY KEY,
      ime VARCHAR(255) NOT NULL
    );
  `;

  return Promise.all(
    nasprotneEkipe.map((team) =>
      sql`
        INSERT INTO nasprotne_ekipe (id, ime)
        VALUES (${team.id}, ${team.ime_ekipe})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );
}

// ============================
// TRENINGI
// ============================
async function seedTreningi() {
  await sql`
    CREATE TABLE IF NOT EXISTS treningi (
      id UUID PRIMARY KEY,
      cas_treninga TIMESTAMP NOT NULL,
      povrsina VARCHAR(50) NOT NULL,
      opis TEXT
    );
  `;

  return Promise.all(
    treningi.map((t) =>
      sql`
        INSERT INTO treningi (id, cas_treninga, povrsina, opis)
        VALUES (${t.id}, ${t.cas_treninga}, ${t.povrsina}, ${t.opis})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );
}

// ============================
// TEKME
// ============================
async function seedTekme() {
  await sql`
    CREATE TABLE IF NOT EXISTS tekme (
      id UUID PRIMARY KEY,
      cas_tekme TIMESTAMP NOT NULL,
      kraj VARCHAR(255),
      nasprotnik_id UUID REFERENCES nasprotne_ekipe(id)
    );
  `;

  return Promise.all(
    tekme.map((m) =>
      sql`
        INSERT INTO tekme (id, cas_tekme, kraj, nasprotnik_id)
        VALUES (${m.id}, ${m.cas_tekme}, ${m.kraj_tekme}, ${m.nasprotna_ekipa_id})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );
}

// ============================
// IGRALCI ↔ TRENINGI
// ============================
async function seedIgralecTrening() {
  await sql`
    CREATE TABLE IF NOT EXISTS igralec_trening (
      id UUID PRIMARY KEY,
      igralec_id UUID REFERENCES igralci(id),
      trening_id UUID REFERENCES treningi(id),
      prisoten BOOLEAN DEFAULT TRUE
    );
  `;

  return Promise.all(
    igralecTrening.map((row) =>
      sql`
        INSERT INTO igralec_trening (id, igralec_id, trening_id, prisoten)
        VALUES (${uuidv4()}, ${row.igralec_id}, ${row.trening_id}, ${row.prisoten})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );
}

// ============================
// IGRALCI ↔ TEKME
// ============================
async function seedIgralecTekma() {
  await sql`
    CREATE TABLE IF NOT EXISTS igralec_tekma (
      id UUID PRIMARY KEY,
      igralec_id UUID REFERENCES igralci(id),
      tekma_id UUID REFERENCES tekme(id),
      minute INT DEFAULT 0,
      pozicija_id UUID REFERENCES pozicije(id)
    );
  `;

  return Promise.all(
    igralecTekma.map((row) =>
      sql`
        INSERT INTO igralec_tekma (id, igralec_id, tekma_id, minute, pozicija_id)
        VALUES (${uuidv4()}, ${row.igralec_id}, ${row.tekma_id}, ${row.minute}, ${row.pozicija_id})
        ON CONFLICT (id) DO NOTHING;
      `
    )
  );
}

// ============================
// MAIN GET SEED
// ============================
export async function GET() {
  try {
    await sql.begin(async (sql) => {
      await seedPozicije();
      await seedIgralci();
      await seedTrenerji();
      await seedNasprotneEkipe();
      await seedTreningi();
      await seedTekme();
      await seedIgralecTrening();
      await seedIgralecTekma();
    });

    return Response.json({ message: 'Football database seeded successfully' });
  } catch (error: any) {
    console.error('Seeding Error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
