# TareeqK: Professional Car Recovery & Towing Ecosystem

TareeqK is a comprehensive, multi-platform solution for car recovery and towing services. The platform connects customers in need of roadside assistance with professional towing drivers through a centralized administration system.

## 🏗️ System Architecture

The ecosystem consists of three main components working in synergy:

1.  **[Backend API](./backend)**: The core engine built with Laravel. It manages data, authentication, and the business logic for coordinating towing requests.
2.  **[Web Portals](./web-customer)**: A modern React application that hosts both the **Customer Portal** (for booking and tracking) and the **Admin Dashboard** (for system-wide management).
3.  **[Mobile Driver App](./mobile-driver)**: A cross-platform React Native application used by towing operators to receive, manage, and complete jobs.

---

## 📂 Project Structure

-   `/backend`: PHP 8.2+ / Laravel 12 API.
-   `/web-customer`: React 19 / Vite 7 / Tailwind v4 (Customer & Admin portals).
-   `/mobile-driver`: React Native 0.84 (Android & iOS).

---

## 🚀 Getting Started (Integrated Setup)

To run the entire ecosystem locally, follow these steps in order.

### Step 1: Backend Setup
The backend must be running first as it serves the API for all other components.

```bash
cd backend
composer install
cp .env.example .env
# Configure your MySQL database in .env
php artisan key:generate
php artisan migrate
php artisan db:seed # Optional but highly recommended for testing
php artisan serve
```
*The API will be live at `http://localhost:8000`.*

### Step 2: Web Frontend Setup
```bash
cd web-customer
npm install
cp .env.example .env # Set VITE_API_URL and VITE_GOOGLE_MAPS_API_KEY
npm run dev
```
*The web portals will be live at `http://localhost:5173`.*

### Step 3: Mobile Driver Setup
Ensure you have an Android Emulator or iOS Simulator running.

```bash
cd mobile-driver
npm install
# For Android:
npm run android
# For iOS (Mac only):
cd ios && pod install && cd ..
npm run ios
```
*Note: Ensure `API_URL` in `mobile-driver/src/services/api.ts` points to your machine's IP if testing on physical devices.*

---

## 🔗 Integrated Workflow

1.  **Backend** handles all requests via Sanctum token authentication.
2.  **Web Customer** creates a request (Guest or Auth).
3.  **Backend** triggers a notification (polled or real-time) to the **Mobile Driver**.
4.  **Driver** accepts the job and updates status.
5.  **Web Tracking** (Customer) reflects real-time status updates from the Driver.

---

## 📄 Individual Documentation

For more detailed information on each component, please refer to their respective folder READMEs:
- [Backend Documentation](./backend/README.md)
- [Web Frontend Documentation](./web-customer/README.md)
- [Mobile Driver Documentation](./mobile-driver/README.md)

---

## License

This project is proprietary and confidential.
