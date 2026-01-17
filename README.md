
# AutoReply Pro AI - WhatsApp Assistant

A professional AI-powered WhatsApp auto-reply tool developed by **Tonmoy (Bumba)**. This application uses Google's Gemini 3.0 Flash model to generate context-aware, human-like responses for business environments.

## Deployment Guide

This app is built as a modern static site using React and ESM modules. It can be deployed to any static hosting provider in seconds.

### Method 1: Vercel (Recommended)
1. Push this code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import your repository.
3. Add your `API_KEY` (Gemini API Key) as an Environment Variable in the Vercel dashboard.
4. Click **Deploy**.

### Method 2: Netlify
1. Push to GitHub/GitLab.
2. Link the repository to [Netlify](https://netlify.com).
3. Set your `API_KEY` in the Site Settings under Environment Variables.
4. Deploy.

### Method 3: GitHub Pages
1. Ensure the `index.html` and other assets are in the root directory.
2. Go to Repository Settings > Pages.
3. Select the `main` branch as the source.
4. Note: You will need to handle environment variables differently for GH Pages (e.g., using a `.env` build step or a simple proxy).

## Features
- **AI Knowledge Setup**: Train your bot on your business hours and context.
- **Connectivity Suite**: Link devices with custom naming and active session management.
- **Live Engine**: Real-time traffic monitor showing AI reasoning and replies.
- **PWA Support**: Installable on Android and iOS devices.

---
Developed with ❤️ by **Tonmoy (Bumba)**.
