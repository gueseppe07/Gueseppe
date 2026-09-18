# Boss Kill Tracker

A simple static web app for tracking boss kills on a map.

## Features
- Click on the map to place a completion marker
- Enter a boss or event name before marking
- Clear a selected marker or reset all markers
- Upload your own map image
- Markers persist in the browser using localStorage

## Run locally
Open the project folder and start a local static server:

```bash
cd boss-map-tracker
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deploy to GitHub Pages
1. Push this project to a GitHub repository.
2. In GitHub, go to Settings > Pages.
3. Set Source to "Deploy from a branch".
4. Choose the main branch and root folder.
5. Save.

Your app will be available at:

```text
https://<your-username>.github.io/<your-repository-name>/
```
