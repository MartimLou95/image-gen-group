# Team Guide — how the three of us work without stepping on each other

## Who owns what

| Lane | Person | Files | Job |
|---|---|---|---|
| Engine | A | `worker/`, `js/api.js` | The proxy + the API call |
| Face | B | `index.html`, `css/style.css`, `js/ui.js` | The page, styling, mobile |
| Glue | C | `js/validate.js`, `PROJECT-README.md`, deploy | Input checks, errors, docs, GitHub Pages |

## Step 0 — prove it works before we build (Person A, ~30 min)

Make ONE real call to the OpenAI image API with a real photo of a person, in one style,
from the account that will hold the shared key. Two things can block us:

1. **Access:** `gpt-image-1` may need *organisation verification* (an ID check), separate
   from just turning billing on.
2. **Faces:** restyling a real person can be refused by content moderation. Confirm a
   person photo works, not just a landscape.

Green light → everyone starts their lane. Blocked → tell the team before building.

## Git: the loop you repeat every work session

```bash
git checkout main          # 1. go to the shared version
git pull origin main       #    get everyone's latest

git checkout -b lane-a-engine   # 2. your branch (drop -b after the first time)

# ...do your work in your files...

git add .                                       # 3. save it
git commit -m "Add anime prompt to proxy"       #    clear message of what you did
git push origin lane-a-engine                   # 4. send it to GitHub
```

Then on GitHub: click **"Compare & pull request"** → describe it → **a teammate merges it**.
After a merge, everyone runs `git checkout main && git pull origin main`.

**Golden rule:** never push to `main` directly. `main` is the live site; keep it working.

## How we work in parallel without waiting

The page runs against a **mock** (a fake API in `js/api.js` that returns a placeholder image).
So B and C build the whole thing today while A builds the real proxy. When A's proxy is live,
A swaps the mock for the real call — nothing else changes.

## The order we combine our work

1. A's proxy returns a real re-styled image (tested on its own).
2. B's page works end-to-end against the mock.
3. Swap mock → real proxy URL. Upload a photo, get a real result on the page.
4. C's validation + error/loading messages + responsive polish. Deploy. Done.

## Don't forget

- The OpenAI key goes in a Cloudflare **secret**, never in any file we commit.
- Each person should have visible commits (the marker checks commit history).
- Set a low spending limit in the OpenAI dashboard — this costs a few cents per image.
