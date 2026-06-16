<!-- This is the project README. The teacher's original brief lives in assignment.md. -->

# Style My Photo

Upload a photo, pick a style (Anime, Pixar, Movie Poster, Watercolour), and get it
re-imagined by an AI image API. A group project for three people.

## How it works

```
[ GitHub Pages site ]  --photo + style-->  [ Cloudflare Worker proxy (holds the key) ]
        ^                                                  |
        |                                                  v
        +------------- re-styled image ----------  [ OpenAI image API ]
```

The website is just static files (no secrets). The secret OpenAI key lives only inside the
Cloudflare Worker, so it's never exposed in the public site code.

- **API used:** OpenAI image API (`gpt-image-1`), via a Cloudflare Worker proxy.

## The contract (frozen names — don't rename without telling the team)

These are the shared "plugs" that let three people build separately.

**HTML hooks (in `index.html`):**

| Name | What it is |
|---|---|
| `#image-input` | the file picker |
| `.style-btn` (each has `data-style="anime"` etc.) | the 4 style buttons |
| `#convert-btn` | the go button |
| `#result-img` | where the result image shows |
| `#status` | text messages ("Loading...", errors) |

**Proxy request/response:**

- Browser sends `POST` with `FormData`: `image` (the file) + `style` (a word).
- Worker returns JSON: `{ "image": "data:image/png;base64,..." }` (success) or `{ "error": "..." }`.

## Project layout

```
index.html        the page              (Person B)
css/style.css     styling, responsive   (Person B)
js/ui.js          page wiring           (Person B)
js/api.js         calls the proxy       (Person A)
js/validate.js    input checks          (Person C)
worker/           the proxy             (Person A)
TEAM-GUIDE.md     how we work together  (everyone)
```

## Run it locally

Just open `index.html` in a browser. It runs against a **mock** (fake) API that returns a
placeholder image — so the whole page works before the real proxy is built.

## Deploy

- **Front-end:** GitHub Pages (Settings → Pages → deploy from `main`).
- **Proxy:** see `worker/wrangler.toml` for the Cloudflare deploy steps.

## Wireframe

TODO (Person C): add a sketch of the layout here (a phone photo of a paper drawing is fine).
