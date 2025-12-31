# 💀 Spotify Roaster AI

> **"Your music taste is bad, and you should feel bad."** - This App

![Project Preview](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmZ4eGZqbHgzd3B5bnZ4eGZqbHgzd3B5bnZ4eGZqbHgzd3B5biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjeiVyM/giphy.gif)

## 🎵 What is this?
**Spotify Roaster** is a web app that brutally roasts your music taste using **Google Gemini AI**.
It connects to your Spotify account, fetches your Top 5 most played tracks, and feeds them into an LLM (Large Language Model) instructed to roast you like a "Gen Z Mean Girl".

## ✨ Features
- **Spotify Login (PKCE Flow)**: Securely connects to Spotify without storing passwords.
- **AI-Powered Roasts**: Uses **Gemini 1.5 Flash / Pro** to generate unique, savage insults every time.
- **Hacker UI**:
    - **Matrix/Decryption Effect**: Text reveals itself in a "hacker" style animation.
    - **Shiny Headers**: Premium gradient shimmer effects.
    - **Liquid Background**: Smooth, grainy animated background.
- **Modern Stack**: Built with the latest web tech.

## 🛠️ Tech Stack
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS v4 (The new engine!)
- **Animations**: Framer Motion + React Bits
- **AI**: Google Gemini API
- **Auth**: Spotify Web API

## 🚀 How to Run Locally

1.  **Clone the repo**
    ```col
    git clone https://github.com/yourusername/spotify-roaster.git
    cd spotify-roaster
    ```

2.  **Install Dependencies**
    ```col
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env` file in the root:
    ```env
    VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
    ```

4.  **Run it!**
    ```col
    npm run dev
    ```
    Open `http://localhost:5173`

## 🔑 Getting Keys
1.  **Spotify Client ID**: Create an app at [Spotify for Developers](https://developer.spotify.com/dashboard). Set Redirect URI to `http://127.0.0.1:5173/callback`.
2.  **Gemini API Key**: Get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey). You enter this directly in the app UI.

---
*Made with ❤️ (and 🧂 salt) by [Your Name]*
