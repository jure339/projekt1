import bcrypt from "bcryptjs";
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";

import {
  pozicije,
  igralci,
  trenerji,
  ekipe,
  nasprotneEkipe,
  treningi,
  tekme,
  igralecTrening,
  igralecTekma,
} from "@/lib/placeholder-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

async function resetTables() {
  await sql`DROP TABLE IF EXISTS igralec_tekma`;
  await sql`DROP TABLE IF EXISTS igralec_trening`;
  await sql`DROP TABLE IF EXISTS tekme`;
  await sql`DROP TABLE IF EXISTS treningi`;
  await sql`DROP TABLE IF EXISTS nasprotne_ekipe`;
  await sql`DROP TABLE IF EXISTS igralci`;
  await sql`DROP TABLE IF EXISTS trenerji`;
  await sql`DROP TABLE IF EXISTS pozicije`;
  await sql`DROP TABLE IF EXISTS ekipe`;
}

async function ensureExtensions() {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;
}

async function seedEkipe() {
  await sql`
    CREATE TABLE IF NOT EXISTS ekipe (
      id UUID PRIMARY KEY,
      ime VARCHAR(255) NOT NULL
    );
  `;

  return Promise.all(
    ekipe.map((e) => sql`
      INSERT INTO ekipe (id, ime)
      VALUES (${e.id}, ${e.ime})
      ON CONFLICT (id) DO NOTHING;
    `)
  );
}

async function seedPozicije() {
  await sql`
    CREATE TABLE IF NOT EXISTS pozicije (
      id UUID PRIMARY KEY,
      naziv VARCHAR(255) NOT NULL,
      kratica VARCHAR(10)
    );
  `;

  return Promise.all(
    pozicije.map((p) => sql`
      INSERT INTO pozicije (id, naziv, kratica)
      VALUES (${p.id}, ${p.naziv}, ${p.kratica})
      ON CONFLICT (id) DO NOTHING;
    `)
  );
}

async function seedTrenerji() {
  await sql`
    CREATE TABLE IF NOT EXISTS trenerji (
      id UUID PRIMARY KEY,
      ime VARCHAR(255) NOT NULL,
      priimek VARCHAR(255) NOT NULL,
      starost INT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      ekipa_id UUID REFERENCES ekipe(id) ON DELETE SET NULL
    );
  `;

  return Promise.all(
    trenerji.map(async (t) => {
      const hashed = await bcrypt.hash(t.geslo, 10);

      return sql`
        INSERT INTO trenerji (id, ime, priimek, starost, email, password, ekipa_id)
        VALUES (${t.id}, ${t.ime}, ${t.priimek}, ${t.starost}, ${t.email}, ${hashed}, ${t.ekipa_id})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );
}

async function seedIgralci() {
  await sql`
    CREATE TABLE IF NOT EXISTS igralci (
      id UUID PRIMARY KEY,
      ime VARCHAR(255) NOT NULL,
      priimek VARCHAR(255) NOT NULL,
      starost INT NOT NULL,
      visina INT,
      pozicija_id UUID REFERENCES pozicije(id) ON DELETE SET NULL,
      stevilka_dresa INT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      ekipa_id UUID REFERENCES ekipe(id) ON DELETE SET NULL
    );
  `;

  return Promise.all(
    igralci.map(async (i) => {
      const hashed = await bcrypt.hash(i.geslo, 10);

      return sql`
        INSERT INTO igralci
          (id, ime, priimek, starost, visina, pozicija_id, stevilka_dresa, email, password, ekipa_id)
        VALUES
          (${i.id}, ${i.ime}, ${i.priimek}, ${i.starost}, ${i.visina},
           ${i.pozicija_id}, ${i.stevilka_dresa},
           ${i.email}, ${hashed}, ${i.ekipa_id})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );
}

async function seedNasprotneEkipe() {
  await sql`
    CREATE TABLE IF NOT EXISTS nasprotne_ekipe (
      id UUID PRIMARY KEY,
      ime VARCHAR(255) NOT NULL
    );
  `;

  return Promise.all(
    nasprotneEkipe.map((team) => sql`
      INSERT INTO nasprotne_ekipe (id, ime)
      VALUES (${team.id}, ${team.ime_ekipe})
      ON CONFLICT (id) DO NOTHING;
    `)
  );
}

async function seedTreningi() {
  await sql`
    CREATE TABLE IF NOT EXISTS treningi (
      id UUID PRIMARY KEY,
      ekipa_id UUID NOT NULL REFERENCES ekipe(id) ON DELETE CASCADE,
      trener_id UUID REFERENCES trenerji(id) ON DELETE SET NULL,
      zacetek TIMESTAMP NOT NULL,
      konec TIMESTAMP NOT NULL,
      povrsina VARCHAR(50) NOT NULL,
      opis TEXT
    );
  `;

  return Promise.all(
    treningi.map((t) => sql`
      INSERT INTO treningi (id, ekipa_id, trener_id, zacetek, konec, povrsina, opis)
      VALUES (${t.id}, ${t.ekipa_id}, ${t.trener_id}, ${t.zacetek}, ${t.konec}, ${t.povrsina}, ${t.opis})
      ON CONFLICT (id) DO NOTHING;
    `)
  );
}

async function seedTekme() {
  await sql`
    CREATE TABLE IF NOT EXISTS tekme (
      id UUID PRIMARY KEY,
      cas_tekme TIMESTAMP NOT NULL,
      kraj VARCHAR(255),
      nasprotnik_id UUID REFERENCES nasprotne_ekipe(id) ON DELETE SET NULL
    );
  `;

  return Promise.all(
    tekme.map((m) => sql`
      INSERT INTO tekme (id, cas_tekme, kraj, nasprotnik_id)
      VALUES (${m.id}, ${m.cas_tekme}, ${m.kraj_tekme}, ${m.nasprotna_ekipa_id})
      ON CONFLICT (id) DO NOTHING;
    `)
  );
}

async function seedIgralecTrening() {
  await sql`
    CREATE TABLE IF NOT EXISTS igralec_trening (
      id UUID PRIMARY KEY,
      igralec_id UUID REFERENCES igralci(id) ON DELETE CASCADE,
      trening_id UUID REFERENCES treningi(id) ON DELETE CASCADE,
      prisoten BOOLEAN DEFAULT TRUE
    );
  `;

  return Promise.all(
    igralecTrening.map((row) => sql`
      INSERT INTO igralec_trening (id, igralec_id, trening_id, prisoten)
      VALUES (${uuidv4()}, ${row.igralec_id}, ${row.trening_id}, ${row.prisoten})
      ON CONFLICT (id) DO NOTHING;
    `)
  );
}

async function seedIgralecTekma() {
  await sql`
    CREATE TABLE IF NOT EXISTS igralec_tekma (
      id UUID PRIMARY KEY,
      igralec_id UUID REFERENCES igralci(id) ON DELETE CASCADE,
      tekma_id UUID REFERENCES tekme(id) ON DELETE CASCADE,
      minute INT DEFAULT 0,
      pozicija_id UUID REFERENCES pozicije(id) ON DELETE SET NULL
    );
  `;

  return Promise.all(
    igralecTekma.map((row) => sql`
      INSERT INTO igralec_tekma (id, igralec_id, tekma_id, minute, pozicija_id)
      VALUES (${uuidv4()}, ${row.igralec_id}, ${row.tekma_id}, ${row.minute}, ${row.pozicija_id})
      ON CONFLICT (id) DO NOTHING;
    `)
  );
}

export async function GET() {
  try {
    await sql.begin(async () => {
      await ensureExtensions();
      await resetTables();

      await seedEkipe();
      await seedPozicije();
      await seedTrenerji();
      await seedIgralci();
      await seedNasprotneEkipe();

      await seedTreningi();
      await seedTekme();

      await seedIgralecTrening();
      await seedIgralecTekma();
    });

    return Response.json({ message: "Database seeded successfully" });
  } catch (error: any) {
    console.error("SEED ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
