<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Ebook publishing uses a server-side HTTPS adapter to a separately configured MongoDB-backed creator API; the API verifies the authenticated user's creator/admin permission and stores files before returning published metadata, because no MongoDB/storage service is bundled into this Worker app.
- Public ebook reads use the published-ebooks query without authentication; session demo blob URLs live only in the root session context so they cannot masquerade as persistent public publications.
