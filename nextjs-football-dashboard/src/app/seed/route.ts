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

function toIsoUtc(value: any) {
  // spreključi: Date | string | number
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function GET() {
  try {
    await sql.begin(async (tx) => {
      await tx`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

      await tx`DROP TABLE IF EXISTS igralec_tekma`;
      await tx`DROP TABLE IF EXISTS igralec_trening`;
      await tx`DROP TABLE IF EXISTS tekme`;
      await tx`DROP TABLE IF EXISTS treningi`;
      await tx`DROP TABLE IF EXISTS nasprotne_ekipe`;
      await tx`DROP TABLE IF EXISTS igralci`;
      await tx`DROP TABLE IF EXISTS trenerji`;
      await tx`DROP TABLE IF EXISTS pozicije`;
      await tx`DROP TABLE IF EXISTS ekipe`;

      await tx`
        CREATE TABLE ekipe (
          id UUID PRIMARY KEY,
          ime TEXT NOT NULL
        );
      `;

      await tx`
        CREATE TABLE pozicije (
          id UUID PRIMARY KEY,
          naziv TEXT NOT NULL,
          kratica TEXT
        );
      `;

      await tx`
        CREATE TABLE trenerji (
          id UUID PRIMARY KEY,
          ime TEXT NOT NULL,
          priimek TEXT NOT NULL,
          starost INT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          ekipa_id UUID REFERENCES ekipe(id)
        );
      `;

      await tx`
        CREATE TABLE igralci (
          id UUID PRIMARY KEY,
          ime TEXT NOT NULL,
          priimek TEXT NOT NULL,
          starost INT NOT NULL,
          visina INT,
          pozicija_id UUID REFERENCES pozicije(id),
          stevilka_dresa INT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          ekipa_id UUID REFERENCES ekipe(id)
        );
      `;

      await tx`
        CREATE TABLE nasprotne_ekipe (
          id UUID PRIMARY KEY,
          ime TEXT NOT NULL
        );
      `;

      // ✅ TIMEZONE SAFE
      await tx`
        CREATE TABLE treningi (
          id UUID PRIMARY KEY,
          ekipa_id UUID REFERENCES ekipe(id),
          trener_id UUID REFERENCES trenerji(id),
          zacetek TIMESTAMPTZ NOT NULL,
          konec TIMESTAMPTZ NOT NULL,
          povrsina TEXT NOT NULL,
          opis TEXT
        );
      `;

      // ✅ TIMEZONE SAFE + ekipa_id
      await tx`
        CREATE TABLE tekme (
          id UUID PRIMARY KEY,
          ekipa_id UUID REFERENCES ekipe(id) ON DELETE CASCADE,
          cas_tekme TIMESTAMPTZ NOT NULL,
          kraj TEXT,
          nasprotnik_id UUID REFERENCES nasprotne_ekipe(id)
        );
      `;

      await tx`
        CREATE TABLE igralec_trening (
          id UUID PRIMARY KEY,
          igralec_id UUID REFERENCES igralci(id),
          trening_id UUID REFERENCES treningi(id),
          prisoten BOOLEAN
        );
      `;

      await tx`
        CREATE TABLE igralec_tekma (
          id UUID PRIMARY KEY,
          igralec_id UUID REFERENCES igralci(id),
          tekma_id UUID REFERENCES tekme(id),
          minute INT,
          pozicija_id UUID REFERENCES pozicije(id)
        );
      `;

      // ---------------- INSERT DATA ----------------

      for (const e of ekipe) {
        await tx`INSERT INTO ekipe VALUES (${e.id}, ${e.ime})`;
      }

      for (const p of pozicije) {
        await tx`INSERT INTO pozicije VALUES (${p.id}, ${p.naziv}, ${p.kratica})`;
      }

      for (const t of trenerji) {
        const hash = await bcrypt.hash(t.geslo, 10);
        await tx`
          INSERT INTO trenerji
          VALUES (${t.id}, ${t.ime}, ${t.priimek}, ${t.starost}, ${t.email}, ${hash}, ${t.ekipa_id})
        `;
      }

      for (const i of igralci) {
        const hash = await bcrypt.hash(i.geslo, 10);
        await tx`
          INSERT INTO igralci
          VALUES (
            ${i.id}, ${i.ime}, ${i.priimek}, ${i.starost}, ${i.visina},
            ${i.pozicija_id}, ${i.stevilka_dresa},
            ${i.email}, ${hash}, ${i.ekipa_id}
          )
        `;
      }

      for (const n of nasprotneEkipe) {
        await tx`INSERT INTO nasprotne_ekipe VALUES (${n.id}, ${n.ime_ekipe})`;
      }

      // ✅ treningi: normaliziraj v ISO UTC
      for (const tr of treningi) {
        const zacetekIso = toIsoUtc(tr.zacetek);
        const konecIso = toIsoUtc(tr.konec);

        if (!zacetekIso || !konecIso) {
          throw new Error(`Invalid treningi date for trening id=${tr.id}`);
        }

        await tx`
          INSERT INTO treningi (id, ekipa_id, trener_id, zacetek, konec, povrsina, opis)
          VALUES (${tr.id}, ${tr.ekipa_id}, ${tr.trener_id}, ${zacetekIso}, ${konecIso}, ${tr.povrsina}, ${tr.opis})
        `;
      }

      // ✅ tekme: dodeli ekipa_id + normaliziraj v ISO UTC
      for (let idx = 0; idx < tekme.length; idx++) {
        const g = tekme[idx];
        const teamId = ekipe[idx % ekipe.length]?.id ?? ekipe[0].id;

        const casIso = toIsoUtc(g.cas_tekme);
        if (!casIso) {
          throw new Error(`Invalid tekme date for tekma id=${g.id}`);
        }

        await tx`
          INSERT INTO tekme (id, ekipa_id, cas_tekme, kraj, nasprotnik_id)
          VALUES (${g.id}, ${teamId}, ${casIso}, ${g.kraj_tekme}, ${g.nasprotna_ekipa_id})
        `;
      }

      for (const it of igralecTrening) {
        await tx`
          INSERT INTO igralec_trening (id, igralec_id, trening_id, prisoten)
          VALUES (${uuidv4()}, ${it.igralec_id}, ${it.trening_id}, ${it.prisoten})
        `;
      }

      for (const ig of igralecTekma) {
        await tx`
          INSERT INTO igralec_tekma (id, igralec_id, tekma_id, minute, pozicija_id)
          VALUES (${uuidv4()}, ${ig.igralec_id}, ${ig.tekma_id}, ${ig.minute}, ${ig.pozicija_id})
        `;
      }
    });

    return Response.json({ message: "Database seeded successfully" });
  } catch (e: any) {
    console.error("SEED ERROR:", e);
    return Response.json({ error: e.message ?? "Seed failed" }, { status: 500 });
  }
}
