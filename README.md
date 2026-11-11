# 📋 Trello Clone - Full-Stack Real-Time Task & Project Management Platform

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Material UI](https://img.shields.io/badge/MUI-v5-007FFF?logo=mui&logoColor=white)](https://mui.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.0-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-4.x-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20Storage-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Brevo](https://img.shields.io/badge/Brevo-Transactional%20Email-0092FF?logo=sendinblue&logoColor=white)](https://www.brevo.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel&logoColor=white)](https://trello-web-tawny.vercel.app)

> A modern, full-stack **Kanban-style** project and task management application inspired by Trello. Built on the **MERN** stack, featuring a polished user interface, deep URL linking, and instant **Real-Time Collaboration**.

---

## 🌐 Live Demo

- 🚀 **Web Application**: [https://trello-web-tawny.vercel.app](https://trello-web-tawny.vercel.app)
- ⚡ **Try as Guest**: hit the **"Try as Guest"** button on the login page to explore a pre-seeded demo workspace instantly (no sign-up needed — normal registration requires Brevo email activation).
- 🐢 Backend runs on Render free tier: **the first request may take ~30s to wake up**, then everything is snappy.
- 📦 Prefer your own account? Register normally or sign in with your **Google Account** in one click!

---

## ✨ Key Features

- ⚡ **Intuitive Drag-and-Drop Kanban Board (`@dnd-kit`)**: Smooth drag-and-drop interactions for Cards and Columns with instant positional calculation and persistent database updates.
- 🔄 **Real-Time Collaboration (Socket.IO)**: Synchronizes board updates (card movements, edits, member assignments, column changes) across all connected users in real time without refreshing.
- 🔗 **Smart URL Slugs & Deep-Linking**:
  - SEO-friendly board URLs with auto-updating slugs (`/boards/:boardId/:slug`).
  - Direct card modal deep-linking via query parameters (`?cardId=...`), supporting browser Back/Forward navigation, bookmarking, and link sharing.
- ⏰ **Smart Due Dates & Reminders**: Configurable deadlines with flexible reminder intervals (10 minutes, 1 hour, 1 day, etc.). Automatic status tags for **"DUE SOON"** and **"OVERDUE"**.
- 🔔 **Notification Center**: Real-time alerts for board invitations and approaching/overdue task deadlines. Supports *Mark all as read*, *Clear all*, or dismiss individual notifications.
- 📝 **Comprehensive Card Workspace**:
  - Rich **Markdown Editor** for detailed task descriptions.
  - Multi-item **Checklists** with real-time progress indicators, file/link attachments, and quick actions.
  - Media & file attachments with Cloudinary storage and card cover customization.
  - Color-coded **Labels** (Urgent, Bug, Feature, Enhancement, Documentation, etc.).
  - Advanced operations: Move, Copy, Archive, and Permanently Delete cards.
  - Interactive discussion comments with live updates.
- 🎨 **Visual Customization & Theming**:
  - Customizable board backgrounds with high-resolution Unsplash photos, gradients, solid colors, or custom file uploads.
  - Seamless **Dark / Light Mode** switching.
  - Centered pagination for personal and shared boards dashboard.
- 🛡️ **Enterprise-Grade Dual-Auth Security**:
  - Resilient dual authentication supporting both **HttpOnly Cookies** and **Authorization Bearer Tokens** to prevent cookie-blocking issues on mobile browsers and Safari (ITP).
  - Secure single-tap sign-in via **Google OAuth 2.0**.
  - Industry-standard HTTP security headers and token rotation mechanisms.

---

## 📸 Feature Showcase & User Guide

### 1. Landing Page
Modern, intuitive landing page introducing core platform features with quick navigation to Sign Up and Sign In.

![Landing Page](./screenshots/01-landing-page.png)

---

### 2. Sign Up & Google Authentication
User registration interface with email activation verified via **Brevo**, alongside 1-click **Google OAuth 2.0** login.

![Sign Up](./screenshots/02-auth-signup.png)

---

### 3. Boards Dashboard
Unified dashboard displaying personal and collaborative team boards with distinct background covers, search filtering, and pagination.

![Boards Dashboard](./screenshots/03-boards-dashboard.png)

---

### 4. Closed Boards Lifecycle
When a project is finished, boards can be archived to keep workspaces organized. The Closed Boards view allows safely **Reopening** or **Permanently Deleting** boards.

![Closed Boards](./screenshots/04-closed-boards.png)

---

### 5. Account Settings
User profile management area to update avatars, inspect email addresses, and edit display names.

![Account Settings](./screenshots/05-account-settings.png)

---

### 6. Security Dashboard
Secure password change interface requiring verification of current credentials before updating.

![Security Dashboard](./screenshots/06-security-dashboard.png)

---

### 7. User Profile Menu
Quick-access dropdown menu from the top AppBar providing shortcuts to Profile, Product Tour, Keyboard Shortcuts, Settings, and Sign Out.

![User Menu](./screenshots/07-user-menu.png)

---

### 8. Kanban Board
Main interactive workspace showing status columns and task cards. Features smooth drag-and-drop powered by `@dnd-kit` and real-time active user indicators (**live presence**).

![Kanban Board](./screenshots/08-kanban-board.png)

---

### 9. Card Overview & Overdue Alert
Clicking any card opens the detailed modal: displays prominent cover images, category labels (**Urgent**), deadlines with red **OVERDUE** badges when expired, and the Markdown description editor.

![Card Modal Overview](./screenshots/09-card-modal-overview.png)

---

### 10. Attachments, Checklists & Activities
Comprehensive workspace inside each card:
- **Attachments**: Preview images/documents, download files, or set as card cover.
- **Checklist**: Track sub-tasks with real-time percentage completion bars and attachment chips.
- **Activity & Comments**: Real-time communication and audit trail with teammates.
- **Actions**: Move, Copy, Archive, or Delete cards.

![Card Modal Activities](./screenshots/10-card-modal-activities.png)

---

### 11. Smart Card Filtering
Search cards by keywords, filter tasks assigned directly to you (**Cards assigned to me**), or filter by label colors.

![Filter Cards](./screenshots/11-filter-cards.png)

---

### 12. Customizable Board Backgrounds
Personalize your workspace with high-resolution photography from **Unsplash**, color gradients, flat palettes, or custom image uploads from your device.

![Change Background](./screenshots/12-change-background.png)

---

### 13. Archived Items Drawer
Manage archived columns and cards. Allows restoring items back to the active board (**Send to board**) or deleting them permanently.

![Archived Items](./screenshots/13-archived-items.png)

---

### 14. Invite Members to Board
Easily collaborate by adding teammates via email. Real-time notifications and invitations are delivered instantaneously through WebSockets.

![Invite User](./screenshots/14-invite-user.png)

---

### 15. Notification Center

Manage board invitations and deadline alerts with an intuitive *"You're all caught up!"* state.

![Notifications](./screenshots/15-notifications.png)

---

## ⚡ Real-Time Proof

Two independent browser sessions watching the same board. Dragging a card between columns in one window propagates **instantly** to the other through the Socket.IO `board:<id>` room — no refresh, no polling.

![Real-time demo — two windows, one board](./screenshots/16-realtime-demo.gif)

---

## 🛠 Tech Stack

### Frontend (`trello-web`)
- **Core**: React 18, Vite
- **UI Framework & Icons**: Material UI (MUI v5), `@emotion/react`, `@emotion/styled`, `@mui/icons-material`
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **State Management**: Redux Toolkit, Redux Persist
- **Real-Time Client**: `socket.io-client`
- **HTTP Client**: Axios (configured with Request & Response Interceptors for Dual-Auth and Token Refresh)
- **Editor & Formatting**: `@uiw/react-md-editor`, Day.js, Lodash
- **Authentication**: `@react-oauth/google`

### Backend (`trello-api`)
- **Runtime & Framework**: Node.js (>=18.x), Express.js
- **Database**: MongoDB (Native MongoDB Node.js Driver)
- **Real-Time Engine**: Socket.IO
- **Validation**: Joi
- **Security & Tokens**: JSON Web Token (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `google-auth-library`
- **Email Service**: Brevo RESTful Transactional Email API (`@getbrevo/brevo`)
- **Media Storage**: Cloudinary SDK (with Multer memory storage)
- **Protection**: `cors`, `express-rate-limit`

---

## 🚀 Local Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) version **>= 18.x**
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)

---

### 1. Running the Frontend (`trello-web`)

```bash
# Navigate to trello-web directory
cd trello-web

# Install dependencies
npm install

# Create environment configuration file from template
cp .env.example .env
```

Configuration in `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Launch the development server:
```bash
npm run dev
```
The application will be accessible at: `http://localhost:5173`

---

### 2. Running the Backend API (`trello-api`)

```bash
# Navigate to trello-api directory
cd ../trello-api

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

Sample configuration in `trello-api/.env`:
```env
LOCAL_DEV_APP_HOST=localhost
LOCAL_DEV_APP_PORT=8017

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=trello-db

AUTHOR=Duy Cuong

BUILD_MODE=dev

WEBSITE_DOMAIN_DEVELOPMENT=http://localhost:5173
WEBSITE_DOMAIN_PRODUCTION=https://trello-web-tawny.vercel.app

BREVO_API_KEY=your_brevo_api_key
ADMIN_EMAIL_ADDRESS=your_email@example.com
ADMIN_EMAIL_NAME=Trello Admin

ACCESS_TOKEN_SECRET_SIGNATURE=your_access_token_secret
ACCESS_TOKEN_LIFE=1h
REFRESH_TOKEN_SECRET_SIGNATURE=your_refresh_token_secret
REFRESH_TOKEN_LIFE=14d

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Launch the API server:
```bash
npm run dev
```
The backend API will run at: `http://localhost:8017`

---

## 📁 Project Directory Structure

```text
trello/
├── trello-web/                   # Frontend Application (React + Vite)
│   ├── public/                   # Static assets (Favicon, Robots.txt, Sitemap)
│   ├── screenshots/              # 15 feature showcase screenshot images
│   └── src/
│       ├── apis/                 # API client calls (Axios endpoints)
│       ├── assets/               # Images, icons, vector assets
│       ├── components/           # Reusable UI components (AppBar, Modals, Dialogs...)
│       ├── customHooks/          # React Custom Hooks
│       ├── customLibraries/      # Third-party configurations (DnD sensors...)
│       ├── pages/                # Main application views
│       │   ├── Auth/             # Sign Up, Sign In, Account Verification
│       │   └── Boards/           # Kanban Board, BoardBar, Columns, Cards
│       ├── redux/                # Redux Toolkit Slices & Store configuration
│       ├── theme.js              # Material UI custom theme & color tokens
│       └── utils/                # Utilities, formatters, validators, token helpers
│
└── trello-api/                   # Backend Application (Node.js + Express)
    └── src/
        ├── config/               # Environment, CORS, Cloudinary, MongoDB configs
        ├── controllers/          # HTTP request handlers
        ├── middlewares/          # Auth middleware (Dual-auth), multer upload, error handler
        ├── models/               # MongoDB Data Access Layer & Joi Schemas
        ├── providers/            # Third-party providers (Brevo Email, Cloudinary)
        ├── routes/v1/            # RESTful API v1 router definitions
        ├── services/             # Core business logic services
        ├── sockets/              # Socket.IO event emitters & listeners
        ├── utils/                # Formatters, algorithms, JWT helpers
        ├── validations/          # Joi schema validations
        └── server.js             # Express & Socket.IO server entrypoint
```

---

## 🚢 Deployment Guide

### Frontend Deployment (Vercel)
1. Import your GitHub repository `Trello_Web` into **Vercel**.
2. Set the **Root Directory** to `trello-web` (if using a monorepo setup) or branch `master`.
3. Configure Environment Variables:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
4. Deploy. Vercel automatically provides continuous deployments and free SSL certificates.

### Backend Deployment (Render)
1. Create a new **Web Service** on **Render** connected to repository `Trello_Api`.
2. Configure build commands:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
3. Add all variables from your `.env` into the **Environment** settings on Render.

---

## 👨‍💻 Author

- **Nguyen Duy Cuong** (*duycuongdev*)
- **GitHub**: [@duycuongdev](https://github.com/duycuongdev)
- **Repositories**:
  - [Trello_Web Repository](https://github.com/duycuongdev/Trello_Web)
  - [Trello_Api Repository](https://github.com/duycuongdev/Trello_Api)

---

## 📄 License

This project is developed for educational and professional portfolio purposes. All rights reserved by Nguyen Duy Cuong.
