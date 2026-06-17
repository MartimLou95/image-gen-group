# AI Art Converter

A small web app that turns a photo into AI art. You upload a photo, pick a style, and the app gives you back a restyled version of your image.

Group project for three people, built with HTML, CSS, and JavaScript, using the OpenAI image API.

## What it does

1. You choose a photo and pick a style from the dropdown.
2. You click "Generate AI Art".
3. The app sends your photo and the chosen style to our backend.
4. The backend asks the OpenAI image model to restyle the photo.
5. The new image appears on the page.

## Styles

Studio Ghibli, Anime, Disney, Cyberpunk, Oil Painting, Pixel Art.

## How it works

The website is made of plain static files. It cannot call the OpenAI API directly, for two reasons. Browsers block a web page from calling OpenAI (a rule called CORS), and the API key has to stay secret. So the website talks to a small backend instead (a Cloudflare Worker). The Worker holds the secret key and makes the OpenAI call on the page's behalf.

```javascript
[ Website (GitHub Pages) ]  --photo + style-->  [ Cloudflare Worker ]  -->  [ OpenAI image API ]
                                                  (holds the secret key)
```

The OpenAI key is stored as a Cloudflare secret. It is never written into any file in this repo.

## Project files

```javascript
index.html            the web page
style.css             the styling
js/script.js          the frontend code (reads the photo, calls the backend, shows the result)
worker/src/index.js   the backend code (calls OpenAI, keeps the key hidden)
worker/wrangler.toml  config for deploying the Worker (its name and which file to run)
```

## How to run it locally

1. Open the project in VS Code.
2. Right click `index.html` and choose "Open with Live Server".
3. Pick a photo, choose a style, and click Generate.

The page calls the deployed Worker, so nothing else needs to be running.

## How to deploy

Frontend (the website):

- Push to GitHub and turn on GitHub Pages (Settings, then Pages, deploy from the main branch).

Backend (the Worker):

- From the `worker` folder, run `npx wrangler deploy`.
- Set the key once with `npx wrangler secret put OPENAI_API_KEY`.

## Team workflow

Each person works on their own branch and opens a pull request to merge into `main`. See `TEAM-GUIDE.md` for the day to day Git steps.
