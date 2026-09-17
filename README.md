# MovieExplorer

A responsive React movie and TV show discovery app powered by the free [TVMaze API](https://www.tvmaze.com/api).

## Features

- Home page with branded navbar, hero banner, CTA, discovery section, and footer
- Movie listing page powered by `GET /shows`
- Title search powered by `GET /search/shows?q=:query`
- Responsive poster grid with title, release year, genre, and rating
- Details modal with poster, summary, rating, release year, runtime, genres, and TVMaze link
- Loading, empty, API error, keyboard Escape, and backdrop-close states
- Mobile-first responsive layout

## Technology

- JavaScript
- React 19
- CSS
- Vite
- TVMaze API

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

## Production build

```bash
npm run build
npm run preview
```

## Deployment

This is a static Vite app and can be deployed to Vercel, Netlify, or GitHub Pages. Use `npm run build` as the build command and `dist` as the output directory.
