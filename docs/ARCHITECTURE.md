# StudentSociety: Prototype Architecture Guide

This document provides a detailed overview of the StudentSociety full-stack prototype. It explains how the **Mobile App (Frontend)** and the **Express API (Backend)** are structured and how they communicate.

---

## 🏗️ Folder Structure

### 1. Backend (`/backend`)
The backend follows a modular MVC (Model-View-Controller) inspired pattern.

| Directory | Purpose |
| :--- | :--- |
| `config/` | Database and environment configurations (e.g., `db.js`). |
| `controllers/` | The logic of your app. Handles requests and sends responses (e.g., `authController.js`). |
| `middleware/` | Functions that run before controllers (e.g., `authMiddleware.js` for JWT checks). |
| `models/` | Mongoose schemas for MongoDB (e.g., `User.js`, `Profile.js`). |
| `routes/` | Defines the API endpoints and maps them to controllers (e.g., `authRoutes.js`). |
| `server.js` | The entry point that initializes Express and connects everything. |

### 2. Mobile (`/mobile`)
The mobile app is built with Expo and uses file-based routing.

| Directory | Purpose |
| :--- | :--- |
| `api/` | Axios client configuration (`client.js`) for communicating with the backend. |
| `app/` | **Expo Router** screens. `(auth)` for login/signup, `(tabs)` for main navigation. |
| `components/` | Reusable UI elements (Buttons, Inputs, Cards). |
| `store/` | **Zustand** state management (e.g., `authStore.js`, `profileStore.js`). |
| `constants/` | Global app constants like Colors and Spacing. |

---

## 🔄 API Communication Flow

The "Heart" of the system is the interaction between the Mobile app and the API.

### Example: User Login Flow

1.  **Mobile Component**: User enters email/password in `login.tsx` and clicks "Login".
2.  **Zustand Store**: The component calls `login()` in `authStore.js`.
3.  **API Client**: `authStore.js` uses `api/client.js` (Axios) to send a `POST` request to `/auth/login`.
4.  **Backend Route**: `server.js` receives the request and forwards it to `authRoutes.js`.
5.  **Backend Controller**: `authController.js` validates the input and checks the `User` model.
6.  **Database**: Mongoose queries MongoDB to find the user and verify the hashed password.
7.  **Response**:
    -   If successful, the backend returns a **JWT Token** and User Data.
    -   If failed, it returns a 401 or 400 error with a message.
8.  **Zustand Store (Success)**: Receives the token, saves it securely using `expo-secure-store`, and updates the app state to `isAuthenticated: true`.
9.  **Mobile UI**: The `_layout.tsx` detects the state change and automatically redirects the user to the `(tabs)` dashboard.

---

## 🔒 Security & Authentication

-   **JWT (JSON Web Tokens)**: Used to identify logged-in users.
-   **Secure Storage**: Tokens are kept in `SecureStore` on the mobile device, not in plain local storage.
-   **Password Hashing**: Passwords are never stored in plain text. They are hashed using **bcryptjs** via Mongoose hooks.
-   **CORS & Helmet**: Security headers and policies are enforced on the backend.

---

## 🛠️ Technology Stack

-   **Backend**: Node.js, Express, MongoDB (Atlas/Local), Mongoose, JWT, Joi (Validation).
-   **Mobile**: Expo (React Native), Expo Router, Zustand (State), Axios, NativeWind (Tailwind CSS).

---

## 🚀 Troubleshooting the Prototype

-   **500 Errors**: Usually mean a server-side crash. Check the `npm run dev` terminal in the `backend` folder.
-   **401 Errors**: Authentication failure. Check if the token is being sent in the `Authorization` header (`Bearer <token>`).
-   **Network Error**: Ensure the `DEV_IP` in `mobile/api/client.js` matches your computer's local IP address.
