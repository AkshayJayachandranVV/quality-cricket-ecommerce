# QualityCricket – Professional E-Commerce Portal

QualityCricket is a full-stack e-commerce marketplace specializing in cricket gear. This project features a robust React frontend and a TypeScript-powered Node.js backend with MySQL integration.

## 📁 Project Structure
- **/client**: React.js frontend (UI/UX)
- **/server**: Node.js & Express backend (API/Database)

---

## 🛠️ Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher)
- [MySQL](https://www.mysql.com/) (Running locally or on a server)
- [Git](https://git-scm.com/)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Cricket-app
```

### 2. Backend Setup (`/server`)
1. **Navigate to server folder**:
   ```bash
   cd server
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `server` directory and add your credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=cricket_db
   JWT_SECRET=your_jwt_secret
   
   # Google Auth
   GOOGLE_CLIENT_ID=your_google_id.apps.googleusercontent.com
   
   # Email Services
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # SMS Services (Twilio)
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   
   # Payments (Razorpay)
   RAZORPAY_API_KEY=your_key
   RAZORPAY_KEY_SECRET=your_secret
   ```
4. **Run the Server**:
   ```bash
   npm run dev
   ```

---

### 3. Frontend Setup (`/client`)
1. **Navigate to client folder**:
   ```bash
   cd ../client
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the `client` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_IMAGE_BASE_URL=http://localhost:5000
   REACT_APP_GOOGLE_CLIENT_ID=your_google_id.apps.googleusercontent.com
   ```
4. **Run the App**:
   ```bash
   npm run start
   ```

---

## 🏗️ Key Commands

### 🖥️ Backend
- `npm run dev`: Starts the server with Nodemon (auto-restarts on changes).
- `npm run build`: Compiles TypeScript to JavaScript.
- `npm run test`: Runs the automated unit tests.

### 🎨 Frontend
- `npm run start`: Runs the app in development mode at `http://localhost:3000`.
- `npm run build`: Builds the app for production in the `build` folder.

---

## 🛡️ Security Note
All sensitive files (`.env`) and dependency folders (`node_modules`) are strictly excluded from the repository via the root `.gitignore`. Ensure you never share your `.env` files publicly.
