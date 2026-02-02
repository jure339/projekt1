import { NextResponse } from "next/server";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

type Role = "igralec" | "trener";

type SqlTag = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;

type RegisterDeps = {
  sql: SqlTag;
  hashPassword: (password: string) => Promise<string>;
  uuid: () => string;
  json: (body: unknown, init?: { status?: number }) => Response;
};

const createSql = (): SqlTag => {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error("POSTGRES_URL is not set");
  }

  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  return postgres(connectionString, {
    ssl: isLocal ? false : { rejectUnauthorized: false },
  }) as SqlTag;
};

function createRegisterHandler(deps: Partial<RegisterDeps> = {}) {
  const hashPassword = deps.hashPassword ?? ((password: string) => bcrypt.hash(password, 10));
  const uuid = deps.uuid ?? uuidv4;
  const json = deps.json ?? NextResponse.json;

  return async function POST(req: Request) {
    const sqlTag = deps.sql ?? createSql();

    try {
      const body = await req.json();

      const {
        role,
        ime,
        priimek,
        starost,
        email,
        password,
        ekipa_id,
      } = body as {
        role: Role;
        ime: string;
        priimek: string;
        starost: number;
        email: string;
        password: string;
        ekipa_id?: string | null;
      };

      if (
        !role ||
        !ime ||
        !priimek ||
        starost == null ||
        Number.isNaN(Number(starost)) ||
        !email ||
        !password
      ) {
        return json(
          { error: "Manjkajo podatki." },
          { status: 400 }
        );
      }

      const hashedPassword = await hashPassword(password);
      const id = uuid();

      if (role === "trener") {
        try {
          await sqlTag`
          INSERT INTO trenerji
            (id, ime, priimek, starost, email, password, ekipa_id)
          VALUES
            (${id}, ${ime}, ${priimek}, ${starost}, ${email}, ${hashedPassword}, ${ekipa_id ?? null})
        `;
        } catch (err: any) {
          if (
            String(err?.message || "")
              .toLowerCase()
              .includes("duplicate")
          ) {
            return json(
              { error: "Email je že v uporabi." },
              { status: 409 }
            );
          }
          throw err;
        }

        return json({
          message: "Registracija uspešna",
          user: { id, role, email },
        });
      }

      const {
        visina,
        pozicija_id,
        stevilka_dresa,
      } = body as {
        visina?: number | null;
        pozicija_id?: string | null;
        stevilka_dresa?: number | null;
      };

      try {
        await sqlTag`
        INSERT INTO igralci
          (
            id,
            ime,
            priimek,
            starost,
            visina,
            pozicija_id,
            stevilka_dresa,
            email,
            password,
            ekipa_id
          )
        VALUES
          (
            ${id},
            ${ime},
            ${priimek},
            ${starost},
            ${visina ?? null},
            ${pozicija_id ?? null},
            ${stevilka_dresa ?? null},
            ${email},
            ${hashedPassword},
            ${ekipa_id ?? null}
          )
      `;
      } catch (err: any) {
        if (
          String(err?.message || "")
            .toLowerCase()
            .includes("duplicate")
        ) {
          return json(
            { error: "Email je že v uporabi." },
            { status: 409 }
          );
        }
        throw err;
      }

      return json({
        message: "Registracija uspešna",
        user: { id, role, email },
      });
    } catch (e: any) {
      console.error("REGISTER ERROR:", e);
      return json(
        { error: "Napaka pri registraciji." },
        { status: 500 }
      );
    }
  };
}

export const POST = createRegisterHandler();
