# 🚀 AntiSocial — Full Stack Social Media App

A modern, AI-powered social media platform built with the MERN stack.

## ✨ Features
- 🔐 JWT Authentication (Register/Login)
- 📝 Posts with image & video upload
- ❤️ Like, comment, share posts
- 👥 Follow/unfollow users
- 📖 Stories (24-hour ephemeral content)
- 🏘️ Niche communities/groups
- 💬 Real-time direct messaging (Socket.io)
- 🔔 Real-time notifications
- 🤖 AI smart feed, captions & moderation (Claude API)
- 💰 Creator tipping (Razorpay)
- 🎥 Short-form video support
- 🌙 Premium dark UI

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | JWT + bcryptjs |
| Real-time | Socket.io |
| AI | Anthropic Claude API |
| Media | Cloudinary |
| Payments | Razorpay |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Neon PostgreSQL account
- Cloudinary account
- Anthropic API key

### Installation

1. Clone the repo:
git clone https://github.com/ankittiwari-04/-AntiSocial-.git
cd AntiSocial

2. Install backend dependencies:
cd back-end
npm install

3. Install frontend dependencies:
cd ../front-end
npm install

4. Set up environment variables:
Create back-end/.env with:
DATABASE_URL=your_neon_uri
JWT_SECRET=your_jwt_secret
PORT=5000
CLOUDINARY_CLOUD_NAME=your_value
CLOUDINARY_API_KEY=your_value
CLOUDINARY_API_SECRET=your_value
ANTHROPIC_API_KEY=your_value
RAZORPAY_KEY_ID=your_value
RAZORPAY_KEY_SECRET=your_value
CLIENT_URL=http://localhost:5173

5. Push database schema:
cd back-end
npx drizzle-kit push

6. Start development servers:

Backend:
cd back-end && npm run dev

Frontend:
cd front-end && npm run dev

7. Open http://localhost:5173

## 📁 Project Structure
AntiSocial/
├── back-end/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   └── index.js
└── front-end/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        └── App.jsx

## 🌐 Deployment
- Backend: Render.com
- Frontend: Vercel
- Database: Neon PostgreSQL

## 👤 Author
**Ankit Tiwari**
GitHub: [@ankittiwari-04](https://github.com/ankittiwari-04)

---
⭐ Star this repo if you found it helpful!
