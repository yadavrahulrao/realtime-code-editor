# Realtime Collaborative Code Editor

A real-time collaborative code editor that allows multiple users to join the same coding "room" and edit code together live — similar to Google Docs, but for code. Built with **React**, **Node.js**, **Express**, and **Socket.IO** for real-time synchronization, with **CodeMirror** powering the in-browser editor.

## Features

- Create or join a coding room using a unique Room ID
- Real-time code synchronization across all connected clients
- Live list of connected users in the room, each shown with an avatar
- Syntax-highlighted code editor (CodeMirror, Dracula theme)
- Copy Room ID to clipboard for easy sharing
- Download the current code as a file
- Language selector (JavaScript / Python)
- Toast notifications for join/leave events and connection errors
- Leave room and return to the home page

## Tech Stack

**Frontend**
- React (Create React App)
- React Router DOM (routing)
- Socket.IO Client (real-time communication)
- CodeMirror (code editor component)
- react-hot-toast (notifications)
- react-avatar (user avatars)
- uuid (room ID generation)
- axios (HTTP requests)

**Backend**
- Node.js
- Express
- Socket.IO (WebSocket server)

## Project Structure

```
.
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Client.js
│   │   └── Editor.js
│   ├── pages/
│   │   ├── Home.js
│   │   └── EditorPage.js
│   ├── Actions.js
│   ├── App.js
│   ├── App.css
│   ├── App.test.js
│   ├── index.js
│   ├── index.css
│   ├── reportWebVitals.js
│   ├── setupTests.js
│   └── socket.js
├── server.js
└── README.md
```

> Note: Adjust the folder structure above if your local file layout differs — `Client.js` and `Editor.js` are imported from `../components/`, and `Home.js` / `EditorPage.js` are imported from `../pages/` in `App.js`.

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (comes bundled with Node.js)
- Git

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yadavrahulrao/realtime-code-editor.git
   cd realtime-code-editor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This installs both frontend (React) and backend (Express/Socket.IO) dependencies, assuming they're listed in a single `package.json` at the       project root, which is typical for this kind of setup.

   If your project uses separate `client` and `server` folders with their own `package.json` files, install both:

   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root (same level as `src/`) with:

   ```
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```

   This tells the React app where to find the Socket.IO server (see `socket.js`).

## How to Run

### Step 1 — Build the React app

The backend (`server.js`) serves static files from a `build` folder:

```javascript
app.use(express.static('build'));
```

So before running the server, create a production build:

```bash
npm run build
```

### Step 2 — Start the server

```bash
node server.js
```

By default the server listens on **port 5000** (or the port set in the `PORT` environment variable):

```javascript
const PORT = process.env.PORT || 5000;
```

### Step 3 — Open the app

Visit:

```
http://localhost:5000
```

### Development Mode

For active development with reloading on the frontend, you can run the React dev server and backend separately:

**Terminal 1 — Start backend:**
```bash
node server.js
```

**Terminal 2 — Start React dev server:**
```bash
npm start
```

This runs the frontend on `http://localhost:3000` and proxies socket connections to the backend on port 5000 (make sure `REACT_APP_BACKEND_URL` is set correctly in `.env`).

## How to Use

1. Open the app in your browser.
2. On the home page, either:
   - Enter an existing **Room ID** and a **Username** to join a room, or
   - Click **"new room"** to generate a new Room ID, then enter a username and join.
3. Share the Room ID with collaborators so they can join the same room.
4. Start typing in the editor — changes sync live to everyone in the room.
5. Use the sidebar to:
   - Copy the Room ID
   - Select a language (JavaScript / Python)
   - Download the current code as a file
   - Leave the room

## Known Issues / Notes

A few things worth being aware of in the current codebase before deploying or sharing this publicly:

- **Exposed API key**: `EditorPage.js` contains a hardcoded RapidAPI key for the Judge0 code execution API. This should be removed from the source and the key rotated immediately, since committing it to a public repo exposes it to anyone. Store it instead in a `.env` file (e.g. `REACT_APP_RAPIDAPI_KEY`) and reference it via `process.env`. Note that exposing API keys in frontend code (even via `.env`) means they are visible in the built JS bundle — for production use, code execution requests should be proxied through your backend server instead.
  
- **Duplicate `runCode` function**: `EditorPage.js` defines `runCode` twice. JavaScript silently uses the second definition, so the Judge0-based remote execution code is currently unreachable — the active "Run" behavior uses local `eval()` instead, which only works for plain JavaScript and not Python.
  
- **Room navigation bug**: In `Home.js`, `joinRoom` navigates using a plain string `'/editor/${roomId}'` instead of a template literal. This needs to be changed to use backticks so the Room ID is correctly substituted into the URL:
  ```js
  navigate(`/editor/${roomId}`, { state: { username } });
  ```
  
- **`eval()` security risk**: Running arbitrary user-submitted code with `eval()` in the browser is unsafe in any multi-user/shared environment. If real code execution is needed, route it through a sandboxed backend service (or a vetted execution API) rather than `eval()`.

## Scripts Reference

| Command          | Description                                                  |
| `npm start`      | Runs the React app in development mode                       |
| `npm run build`  | Builds the React app for production into the `build/` folder |
| `npm test`       | Runs the test suite                                          |
| `node server.js` | Starts the Express + Socket.IO backend server                |

## Future Improvements

- Fix the room navigation template literal bug
- Move the Judge0 API key to a secure backend proxy and remove it from frontend code
- Replace `eval()` with a safe sandboxed execution flow for "Run Code"
- Add support for more languages (C++, Java, etc.)
- Add persistent storage for rooms/code (currently in-memory only — code is lost when all users leave)
- Add authentication for private rooms

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Rahul Yadav - Github - https://github.com/yadavrahulrao,
Email - rahul507538@gmail.com
