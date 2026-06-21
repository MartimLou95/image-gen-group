# Style My Photo

A web app that restyles a photo with AI. You upload a photo, pick an art style (or describe your own), and get back a transformed version you can compare and download.

Live site: https://martimlou95.github.io/image-gen-group/

Group project for three people, built with HTML, CSS, and JavaScript, using the OpenAI image API.

## Features

- Upload a photo (up to 26 MB) with a live preview.
- Six preset styles: Studio Ghibli, Anime, Disney, Cyberpunk, Oil Painting, Pixel Art.
- Or type your own custom style.
- Before/after slider to compare the original and the result.
- Download the styled image.
- Friendly messages for bad input and failed requests.

## How it works

The website is made of plain static files. A browser cannot call the OpenAI API directly (it is blocked by CORS, and the secret key must not be exposed). So the website sends the photo to a small backend instead: a Cloudflare Worker. The Worker holds the secret key and makes the OpenAI call on the page's behalf, then returns the styled image.

```
[ Website (GitHub Pages) ]  --photo + style-->  [ Cloudflare Worker ]  -->  [ OpenAI image API ]
                                                  (holds the secret key)
```

The OpenAI key is stored as a Cloudflare secret. It is never written into any file in this repo.

## Project files

```
index.html            the web page
style.css             the styling (dark two-column layout)
js/script.js          the frontend code (reads the photo, calls the backend, shows the result)
worker/src/index.js   the backend code (calls OpenAI, keeps the key hidden)
worker/wrangler.toml  config for deploying the Worker
```

## How to run it locally

1. Open the project in VS Code.
2. Right click `index.html` and choose "Open with Live Server".
3. Pick a photo, choose a style, and click Generate.

The page calls the deployed Worker, so nothing else needs to be running.

## How to deploy

Frontend (the website):

- Push to GitHub. Pages serves it from the `main` branch (Settings, then Pages).

Backend (the Worker):

- From the `worker` folder, run `npx wrangler deploy`.
- Set the key once with `npx wrangler secret put OPENAI_API_KEY`.

## Team workflow

Each person works on their own branch and opens a pull request to merge into `main`.
