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

      await tx`
        CREATE TABLE treningi (
          id UUID PRIMARY KEY,
          ekipa_id UUID REFERENCES ekipe(id),
          trener_id UUID REFERENCES trenerji(id),
          zacetek TIMESTAMP NOT NULL,
          konec TIMESTAMP NOT NULL,
          povrsina TEXT NOT NULL,
          opis TEXT
        );
      `;

      // ✅ KLJUČNO: dodan ekipa_id v tekme
      await tx`
        CREATE TABLE tekme (
          id UUID PRIMARY KEY,
          ekipa_id UUID REFERENCES ekipe(id) ON DELETE CASCADE,
          cas_tekme TIMESTAMP NOT NULL,
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

      for (const tr of treningi) {
        await tx`
          INSERT INTO treningi
          VALUES (${tr.id}, ${tr.ekipa_id}, ${tr.trener_id}, ${tr.zacetek}, ${tr.konec}, ${tr.povrsina}, ${tr.opis})
        `;
      }

      // ✅ Tekmam dodelimo ekipa_id (da ne rabiš spreminjat placeholder-data)
      // primer: prva tekma -> ekipe[0], druga -> ekipe[1], tretja -> ekipe[2] ... (krožno)
      for (let idx = 0; idx < tekme.length; idx++) {
        const g = tekme[idx];
        const teamId = ekipe[idx % ekipe.length]?.id ?? ekipe[0].id;

        await tx`
          INSERT INTO tekme (id, ekipa_id, cas_tekme, kraj, nasprotnik_id)
          VALUES (${g.id}, ${teamId}, ${g.cas_tekme}, ${g.kraj_tekme}, ${g.nasprotna_ekipa_id})
        `;
      }

      for (const it of igralecTrening) {
        await tx`
          INSERT INTO igralec_trening
          VALUES (${uuidv4()}, ${it.igralec_id}, ${it.trening_id}, ${it.prisoten})
        `;
      }

      for (const ig of igralecTekma) {
        await tx`
          INSERT INTO igralec_tekma
          VALUES (${uuidv4()}, ${ig.igralec_id}, ${ig.tekma_id}, ${ig.minute}, ${ig.pozicija_id})
        `;
      }
    });

    return Response.json({ message: "Database seeded successfully" });
  } catch (e: any) {
    console.error("SEED ERROR:", e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
