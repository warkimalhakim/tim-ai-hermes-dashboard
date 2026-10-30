# Tim AI Dashboard — Mission Control (`Hermy HQ` Design)

Dashboard responsif & modern untuk pipeline konten tim AI (`tim-copywritter` → `tim-qa` → `tim-poster-wp`). Dibangun dengan desain premium (`glass`, hairline borders, dark mode) dari repository referensi [`hermes-agent-mission-control`](https://github.com/sharbelxyz/hermes-agent-mission-control).

---

## Fitur

- **Overview**: statistik (`Agents`, `Gateways`, `Done Tasks`, `Active Tasks`), distribusi status, aktivitas terbaru.
- **Agents** (`/agents`): profil (`manager`, `tim-copywritter`, `tim-qa`, `tim-poster-wp`) dengan status tugas.
- **Kanban** (`/kanban`): board `ready` / `running` / `done` — pipeline tugas artikel (`t_fc4d84ca`, `t_3bc52072`, `t_5deeca5e`).
- **Content** (`/content`): vault (`Drafts` / `Published`) + wiki (`SCHEMA.md`, `prompt-template.md`).
- **Settings** (`/settings`): info profile (`manager` port `9119` / `API server` port `8643`) + sistem.

---

## Stack

- **Framework**: Next.js 16 (`App Router`) + React 19
- **Styling**: Tailwind CSS v4 (`@theme inline`), `.glass`, `.glass-card`
- **Data**: SQLite CLI (`sqlite3 -json`) — `kanban.db` (`.hermes/kanban.db`)
- **Profiles**: `.env` per profile (`.hermes/profiles/` — `manager`, `tim-copywritter`, `tim-qa`, `tim-poster-wp`)
- **Vault**: Obsidian vault (`_agent/vault/` — `Content/`, `Knowledge/secrets/`)
- **Runtime**: `pm2` (`tim-dashboard`, `fork`, `start-server.js`)
- **WP Integration**: REST API (`WP_APP_PASSWORD`) — `POST` / `PUT` `posts`

---

## Instalasi & Konfigurasi

```bash
# Clone repo
cd workspace/

# Install dependencies
npm install

# Build
npm run build
```

Buat `.env` (salin dari `.env.example`):

```bash
cp .env.example .env
```

Isi `.env` profile (`manager` atau `default`) dengan:

```env
API_SERVER_ENABLED=true
API_SERVER_PORT=8643
GITHUB_TOKEN=***  # mask saat tampilkan — tidak push ke repo (.gitignore)
WP_APP_PASSWORD=***
WP_USER=warkim
WP_URL=https://wp.warkim.my.id
WP_CLIENT_01_APP_PASSWORD=***
```

Referensi aturan kredensial (`Prosedur Kredensial Baru`): `SCHEMA.md` (`_agent/vault/`).

---

## Menjalankan

```bash
# Dev mode
npm run dev

# Build + start (pm2)
npm run build
pm2 start ecosystem.config.js --name tim-dashboard
# atau
npm start
```

Dashboard aktif: `http://localhost:3001` (atau `https://tim.warkim.my.id` via Cloudflare Tunnel).

---

## Pipeline Artikel (`Kanban` → QA → WP Publish)

1. **Draft** (`kanban` `ready`): `Content/Drafts/<topik>.md`
2. **QA** (`kanban` `done`): review (`tim-qa`)
3. **Poster** (`kanban` `done`): pindahkan `Published/` → `POST` WP REST API

Perintah agent (`Cimi`):

```text
Buat 1 artikel tentang <TOPIK>. Pipeline kanban (tim-copywritter → QA → Poster). Draft: Content/Drafts/<topik>.md. Publish ke WP client baru (gunakan .env WP_CLIENT_XX_*). Tanpa link/info tim; footer 'Sedang menyiapkan konten ...'. Konfirmasi .env edit jika client baru.
```

Referensi lengkap: `Content/Drafts/prompt-template.md`.

---

## Aturan Konten (`SCHEMA.md` — Pipeline Tahap 5)

- **Artikel publish** (`Content/Published/`, WP) **tidak menyertakan** link dashboard (`tim.warkim.my.id`) atau info tim AI (`Cimi`, `manager`, dll).
- Bagian referensi / sumber diganti teks netral: `> *Sedang menyiapkan konten ...*`.
- Ini berlaku untuk semua konten yang dihasilkan pipeline (`kanban` → `QA` → `Poster`).

---

## Struktur Data

- `sqlite3` CLI (`sqlite3 -json`) — DB: `/home/mywarkim/.hermes/kanban.db`
- Vault root: `/home/mywarkim/_agent/vault/` (`Content/Drafts/`, `Content/Published/`, `Knowledge/secrets/`)
- Profiles: `/home/mywarkim/.hermes/profiles/` (`manager/`, `tim-*/`)
- Log kanban: otomatis tersimpan di DB (`t_253da72c`, `t_c9d00766`, `t_4c17bf0f`).

---

## Keamanan & Privasi

- `.env` (profile) disimpan **tidak di repo** (`.gitignore` exclude `.env`, `.env.local`).
- `.env.example` (repo ini) menggunakan mask (`***`) untuk semua rahasia.
- Vault `Knowledge/secrets/wp-client-XX.md`: mask password (`WP_APP_PASSWORD=***`); full value hanya di `.env` profile.
- `SCHEMA.md`: `Sedang menyiapkan konten ...` — tanpa link/dashboard info.

---

## Kontribusi / Rebuild

Jika desain perlu rebuild dari `Hermy HQ` (`github.com/sharbelxyz/hermes-agent-mission-control`):

```bash
# Clone referensi
cd /tmp/
git clone https://github.com/sharbelxyz/hermes-agent-mission-control.git hermy-hq
# Copy desain (CSS, layout, sidebar, components) → dashboard/src/
```

Data (`sqlite3`, `.env`, vault) tetap menggunakan layer lokal — tidak migrasi ke Postgres (referensi menggunakan `Prisma` + `PostgreSQL`).

---

*Mission Control Dashboard — v1.0 — Persistent Data + Modern Responsive Design (`Hermy HQ`).*
