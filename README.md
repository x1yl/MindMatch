<div align="center" id="top"> 
  <img src="https://hc-cdn.hel1.your-objectstorage.com/s/v3/78d550141e4ac2c1ac1f2fff3edbfc9f074e714b_new_project_6_.png" alt="MindMatch" width="200"/>

</div>

<h1 align="center">MindMatch</h1>

<p align="center">
  <img alt="Github top language" src="https://img.shields.io/github/languages/top/ericafk0001/mindmatch?color=56BEB8">

  <img alt="Github language count" src="https://img.shields.io/github/languages/count/ericafk0001/mindmatch?color=56BEB8">

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/ericafk0001/mindmatch?color=56BEB8">

  <img alt="License" src="https://img.shields.io/github/license/ericafk0001/mindmatch?color=56BEB8">

  <img alt="Github issues" src="https://img.shields.io/github/issues/ericafk0001/mindmatch?color=56BEB8" />

  <img alt="Github forks" src="https://img.shields.io/github/forks/ericafk0001/mindmatch?color=56BEB8" />

  <img alt="Github stars" src="https://img.shields.io/github/stars/ericafk0001/mindmatch?color=56BEB8" /> 
</p>

<p align="center">
  <a href="#dart-about">About</a> &#xa0; | &#xa0; 
  <a href="#sparkles-features">Features</a> &#xa0; | &#xa0;
  <a href="#rocket-technologies">Technologies</a> &#xa0; | &#xa0;
  <a href="#white_check_mark-requirements">Requirements</a> &#xa0; | &#xa0;
  <a href="#checkered_flag-starting">Starting</a> &#xa0; | &#xa0;
  <a href="#memo-license">License</a>
</p>

<br>

## :dart: About

MindMatch is a simple mental health app that helps you track your mood, write in a journal, chat with an AI companion, and access helpful coping tools. It's designed to support your daily mental wellness routine.

## :sparkles: Features

:heavy_check_mark: Secure Auth (Auth0, JWT)

:heavy_check_mark: Mood tracking with charts and trends data

:heavy_check_mark: Journal entries synced to a secure databases

:heavy_check_mark: AI Therapist (guided, safety-first experience, with a soft filter to prevent other uses)

:heavy_check_mark: Coping tools library

:heavy_check_mark: Settings page (username update, avatar presets, image upload, delete account)

:heavy_check_mark: Dark/Light/System theme with persistence

:heavy_check_mark: Responsive sidebar

## :rocket: Technologies

The following tools were used in this project:

- Node.js + Express (backend API)
- MySQL (data storage)
- Auth0 (authentication)
- Tailwind CSS
- FontAwesome (icons)
- Vanilla JavaScript
- Chart.js (mood trends/visualizations)

## :white_check_mark: Requirements

Before starting :checkered_flag:, you need:

- Git and Node.js with npm
- A MySQL instance
- An Auth0 tenant
- [Free Image Host](https://freeimage.host/)
- Optional: VS Code Live Server (or any static file server) to serve the front end

## :checkered_flag: Starting

```bash
# Clone this project
git clone https://github.com/ericafk0001/mindmatch
cd mindmatch

# Backend setup
cd backend
npm install

# Create a .env with your config (example keys)
# PORT=8081
# AUTH0_DOMAIN=your-auth0-domain.auth0.com
# AUTH0_AUDIENCE=your-api-audience

# Auth0 Management API
# AUTH0_MANAGEMENT_CLIENT_ID=your-auth0-management-client-id
# AUTH0_MANAGEMENT_CLIENT_SECRET=your-auth0-management-client-secret

# Database Configuration
# DB_HOST=your-database-host
# DB_PORT=4000
# DB_USER=your-database-user
# DB_PASSWORD=your-database-password
# DB_NAME=your-database-name
# DB_SSL_REJECT_UNAUTHORIZED=true
# DB_CONNECTION_LIMIT=10
# DB_TIMEZONE=+00:00

# Free Image Host API Key
# FREE_IMAGE_HOST_API_KEY=your-free-image-host-api-key

# Start the API server
npm start
# The API will run at http://localhost:8081

# Frontend (serve static files)
cd ..
# Open index.html with a static server (e.g., VS Code Live Server)
# or use a simple server:
npx serve -l 5500 .

# App pages are available at:
# http://localhost:5500/index.html (root)
# http://localhost:5500/dashboard.html
# http://localhost:5500/mood-tracker.html
# http://localhost:5500/journal.html
# http://localhost:5500/ai-therapist.html
# http://localhost:5500/coping-tools.html
# http://localhost:5500/settings.html
```

## :memo: License

This project is under license from MIT. For more details, see the [LICENSE](LICENSE) file.

Made with :heart: by <a href="https://github.com/ericafk0001" target="_blank">Eric Lin</a> and <a href="https://github.com/x1yl" target="_blank">Kevin Zheng</a>

README template generated with <a href="https://marketplace.visualstudio.com/items?itemName=maurodesouza.vscode-simple-readme">Simple Readme</a>.


<a href="#top">Back to top
