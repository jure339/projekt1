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

## 🛠️ Tehnologije

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

➡️ **TIMESTAMPTZ (UTC)**

---

## ▶️ Zagon projekta lokalno

### 1️⃣ Kloniranje repozitorija
```bash
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME
