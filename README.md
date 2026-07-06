# SanghSetu

Member directory for **RSS Kundapura Mandala** with hierarchical browsing.

## Structure

```
Mandal
 └── Upamandal
      └── Grama
           └── Shakha
                └── Members
```

Data is stored in `data/mandal.json` — no external database.

## Run locally

```bash
npm install
copy .env.local.example .env.local   # set ADMIN_PASSWORD
npm run dev
```

- **Directory:** http://localhost:3000 — browse by folder levels or view all members
- **Admin:** http://localhost:3000/admin — add/remove members (pick shakha when adding)

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel, set `ADMIN_PASSWORD`
3. Viewing works on live site; add/remove locally then push `data/mandal.json`
