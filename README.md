# ⚽ Football Team Management 

Spletna aplikacija za upravljanje nogometne ekipe, namenjena trenerjem in igralcem.  
Aplikacija omogoča pregled in upravljanje treningov, tekem, igralcev ter uporabniških profilov z varno avtentikacijo.

Projekt je zgrajen z **Next.js (App Router)**, **PostgreSQL** in gostovan na **Vercel**.

---

## 🚀 Funkcionalnosti

### 👤 Avtentikacija
- Prijava in registracija uporabnikov
- Vloge uporabnikov:
  - **trener**
  - **igralec**
- Zaščitene strani (dostop samo za prijavljene uporabnike)
- JWT avtentikacija s piškotki

---

### 🧑‍🏫 Trener
- Pregled svoje ekipe
- Dodajanje in urejanje:
  - treningov
  - tekem
- Pregled igralcev v ekipi
- Urejanje lastnega profila
- Samo trener lahko dodaja / briše treninge in tekme

---

### 🧑‍🦱 Igralec
- Pregled:
  - prihajajočih treningov
  - prihajajočih tekem
- Urejanje lastnega profila
- Spreminjanje gesla
- Pregled ekipe in pozicije

---

### 📅 Treningi in tekme
- Datumi shranjeni kot **TIMESTAMPTZ (UTC)** → brez težav s časovnimi pasovi
- Prikaz lokalnega časa (Slovenija)
- Tekme in treningi so vezani na ekipo

---

### 🔐 Varnost
- Gesla so **hashirana (bcrypt)**
- Dostop do API-jev zaščiten z JWT
- Role-based dostop (igralec / trener)
- Middleware in layout guards

---

### 🛠️ Tehnologije

- **Frontend**
  - Next.js 15 (App Router)
  - React
  - TypeScript
  - Tailwind CSS

- **Backend**
  - Next.js API Routes
  - PostgreSQL
  - postgres.js

- **Avtentikacija**
  - JWT
  - Cookies (HttpOnly)

- **Baza**
  - PostgreSQL
  - UUID ključi
  - Relacije (FK)

- **Deployment**
  - Vercel
  - Custom domena
  - Samodejni SSL (Let’s Encrypt)

---

## 🗄️ Struktura baze (poenostavljeno)

- `ekipe`
- `trenerji`
- `igralci`
- `pozicije`
- `treningi`
- `tekme`
- `igralec_trening`
- `igralec_tekma`
- `nasprotne_ekipe`

Datumi:
- `treningi.zacetek`, `treningi.konec`
- `tekme.cas_tekme`
  
---

### 🔧 Environment variables

- Ustvari datoteko `.env.local` v rootu projekta.

- inimalno (primer):

### env

### Database (PostgreSQL)
- POSTGRES_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require"

### Auth / JWT (primer – prilagodi po projektu)
JWT_SECRET="change-me-to-a-long-random-string"

## NextAuth (če uporabljaš next-auth)
NEXTAUTH_URL="http://localhost:3000"
- NEXTAUTH_SECRET="change-me-to-a-long-random-string"

### 📜 Scripts

| Ukaz | Opis |
|------|------|
| `pnpm dev` | Zagon aplikacije v development načinu |
| `pnpm build` | Production build |
| `pnpm start` | Zagon production builda |
| `pnpm lint` | ESLint preverjanje |
| `pnpm test` | Unit / component testi (Vitest – watch mode) |
| `pnpm test:ci` | Unit / component testi + coverage (CI) |
| `pnpm test:e2e` | End-to-End testi (Playwright) |



### 1️⃣ Kloniranje repozitorija

''' bash
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME

### 🔁 CI/CD & Branch strategy

### Branching model

- `feature/<ime>` – razvoj novih funkcionalnosti
- `fix/<ime>` – popravki napak
- `development` – integracijski branch
- `main` – produkcija

### Potek dela

1. Razvoj poteka na `feature/*` ali `fix/*` branchu
2. Feature branch → Pull Request → `development`
3. Po pregledu kode: `development` → Pull Request → `main`
4. `main` se avtomatsko deploya na **Vercel**

---

### CI (GitHub Actions)

CI se samodejno zažene ob:
- `push` na `development` ali `main`
- `pull_request` na `development` ali `main`

CI preverja:
- ESLint
- unit/component teste (Vitest)
- e2e teste (Playwright)

Če testi ne uspejo, merge ni dovoljen.
