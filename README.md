# Welcome to your Lovable project

## Ebook publishing

The library and reader are public and free. The upload form validates title (80 characters), genre, synopsis (400 characters), PDF/EPUB/CBZ/CBR/ZIP extension, nonempty file, and 50 MiB maximum. Preview is required before publishing. PDFs display in a browser frame with open/download fallback; other formats offer download with a compatible-reader notice. Uploaded listings use the archive artwork as a clearly generic cover fallback (no fabricated ebook cover).

**Current configuration:** no MongoDB publishing API or file storage is connected. The prominently labelled session demo button adds an actual local file to the current tab's library and reader. It does not send the file, persist it, or make it public. Refresh removes it. A configured backend failure never falls back silently to demo success.

### Connect a real MongoDB-backed creator service

Set `EBOOK_BACKEND_URL` (HTTPS service origin) and `EBOOK_BACKEND_API_KEY` in Project Settings → Secrets. The service itself needs MongoDB credentials and object storage configured on its own host; this project does **not** provision MongoDB or include a standalone MongoDB server. Never place a database URI in browser code. The app forwards the signed-in user's bearer token and a server-only `X-API-Key`. Implement this contract on your service:

- `GET /v1/ebooks?status=published`: return `{ ebooks: [...] }`, only published public-safe records.
- `GET /v1/creator/access`: verify the bearer with the configured auth issuer and look up creator/admin privileges in protected server-owned roles; return `{ allowed: true }` only for authorised users. Do not trust client metadata or just the API key.
- `POST /v1/creator/ebooks`: verify bearer and role again. Accept multipart `title`, `genre`, `synopsis`, `file`, `status=published`. Repeat all validation, inspect file content, scan uploads, store the file durably, then persist MongoDB metadata with the authenticated owner ID and published status. Clean up orphaned files on metadata failure. Use idempotency/duplicate protection on the service. Return 201 `{ ebook: ... }` only after persistence succeeds; return a non-2xx response for auth, database or storage failure.

Each ebook response needs `id` (1–100 alphanumeric/underscore/hyphen), `title`, `genre` (Psychological Horror / Thriller / Mystery), `synopsis`, `status: "published"`, public HTTPS `fileUrl`, `storageKey`, `fileName`, `fileSize` and optional public HTTPS `coverUrl`. File URLs must be durable and anonymously viewable, with correct Content-Type (application/pdf for PDF), safe Content-Disposition and browser framing/download allowed. Never return private storage credentials. The read endpoint must immediately return a successfully saved ebook for anonymous visitors. Without this external service, authenticated real publishing and persistence cannot be verified.

No website deployment is performed by this feature.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
