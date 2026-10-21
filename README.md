# ISDS Full-Stack Restaurant Web App

Restaurant ordering capstone starter: React, TypeScript, and Vite, with space
for a future backend and MySQL database work.

## Quick start

Use Node.js 24 LTS and npm. From this repository folder:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173).
No credentials, API, or database are needed for the sample menu.

```text
ISDS Capstone/
└── ISDS-FullStack-Restaurant-WebApp/   # Git repository
    ├── frontend/                     # React UI and sample menu
    │   └── src/
    │       ├── components/           # Reusable UI
    │       ├── pages/                # Screens
    │       ├── data/                 # Sample data
    │       └── services/             # Future API clients
    ├── backend/                      # Future API
    ├── database/                     # Schema, migrations, seed data
    ├── docs/                         # Setup and design references
    └── package.json                  # Commands run from the repo root
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install all workspace dependencies |
| `npm ci` | Install exactly the committed lockfile (CI/fresh checkout) |
| `npm run dev` / `npm start` | Start the frontend development server |
| `npm run lint` | Check frontend code with Oxlint |
| `npm run build` | Type-check and build into `frontend/dist/` |
| `npm run preview` | Preview the production build after building |

The development server listens on all interfaces so embedded/cloud previews
can reach it. For a localhost-only session, run `npm run dev --workspace frontend`.
GitHub Actions runs lint and build on pushes and pull requests.

## Figma workflow

See [Figma setup](docs/figma-setup.md) for connecting this existing repository,
design references, startup commands, and a suggested initial prompt.

Keep generated UI code in `frontend/`. The root scripts let Figma install,
run, and build the project without moving the app out of that folder.

## Team workflow

Use feature branches and pull requests for UI experiments:

```sh
git pull --ff-only
git switch -c feature/figma-ui
# Make and review changes
git add .
git commit -m "Build restaurant UI prototype"
git push -u origin feature/figma-ui
```

The backend and database are placeholders. Ordering, payments, authentication,
and AWS deployment are not implemented. Keep credentials in ignored local
environment files and keep server secrets out of frontend code.

### Windows certificate troubleshooting

This checkout uses Git's Windows certificate backend (`http.sslBackend=schannel`).
If npm reports `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, Node 24 can use the same
system trust store for the current PowerShell session:

```powershell
$env:NODE_USE_SYSTEM_CA = '1'
npm install
```

Certificate verification stays enabled.
