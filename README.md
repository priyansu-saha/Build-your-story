# Priyansu Saha · Interactive AI Portfolio 🚀

A modern, fluid interactive portfolio powered by **React**, **Vite**, **WebGL Fluid Simulation**, and **Google Gemini AI**.

---

## ✨ Features

- **Fluid WebGL Background**: Interactive, physics-based liquid splat simulation following user cursor and touch gestures.
- **Priyansu AI Assistant**: Embedded conversational agent powered by Google's latest Gemini models via Vercel Serverless Functions (`/api/chat`).
- **Interactive Persona Cards**: Deep-dive cards for Projects, Skills, Background, and Creative Passions.
- **Responsive & High Performance**: Crafted with modern vanilla CSS, responsive typography, and glassmorphic micro-interactions.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Vanilla CSS, Design System Tokens, CSS Grid & Flexbox
- **AI & Backend**: Google Gemini API (`@google/genai`), Vercel Serverless Functions
- **Effects**: WebGL2 Fluid Dynamics

---

## 🚀 Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd portfolio-react-fluid
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   GEMINI_MODEL="gemini-3.8-flash"
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or the port Vite outputs) in your browser.

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New...** -> **Project** and import your GitHub repository.
3. In the project settings, add the following **Environment Variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `GEMINI_MODEL`: `gemini-3.8-flash`
4. Click **Deploy**. Vercel will automatically build the React app and deploy the serverless chat API at `/api/chat`.
