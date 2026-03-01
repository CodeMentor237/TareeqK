# TareeqK Driver Mobile App

The official mobile application for TareeqK drivers. Built with React Native, this app provides real-time job notifications, request management, and tracking capabilities for professional towing operators.

## Core Features

- **Availability Management**: Simple toggle to switch between Online (ready for jobs) and Offline modes.
- **Job Notifications**: Real-time push-like updates for nearby towing requests.
- **Request Lifecycle**: View job details, accept or decline requests, and update status (Arrived, In Progress, Completed).
- **Navigation Integration**: Seamless transition to mapping services for pickup and destination coordinates.
- **Earnings & History**: Track completed jobs and performance.

## Tech Stack

- **Framework**: React Native 0.84
- **Language**: TypeScript
- **Navigation**: React Navigation 7 (Bottom Tabs & Native Stacks)
- **State Management**: Zustand
- **Networking**: Axios (with automated token refresh)
- **Persistence**: AsyncStorage
- **UI Components**: React Native Safe Area Context, Vector Icons (Lucide-based patterns)

## Getting Started

### Prerequisites

- **Node.js**: v22.11.0 or higher
- **Android Studio**: Configured with SDK, NDK, and an Emulator (or physical device).
- **Xcode**: (macOS only) For iOS development and simulator.

### Installation

1. **Clone the repository** and navigate to the mobile-driver directory:
   ```bash
   cd mobile-driver
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **iOS Specific (macOS Only)**:
   ```bash
   cd ios && pod install && cd ..
   ```

## Running the Application

### 1. Start the Metro Bundler
```bash
npm start
```

### 2. Launch on Android
Ensure an emulator is running or a device is connected via ADB:
```bash
npm run android
```

### 3. Launch on iOS (macOS Only)
```bash
npm run ios
```

## Environment Configuration

The app communicates with the TareeqK Backend. Update the `API_URL` in `src/services/api.ts` if needed:
- **Android Emulator**: Use `http://10.0.2.2:8000/api/v1`
- **Physical Device**: Use your local machine's IP address or `adb reverse tcp:8000 tcp:8000`.

## Project Structure

```text
src/
├── components/ # Shared UI components (Custom buttons, indicators)
├── modules/    # Functional modules (Auth, Home, Request, History, Profile)
├── navigation/ # Navigation configuration (Root, App, Auth navigators)
├── services/   # API abstraction and authentication logic
├── store/      # Zustand stores for global state
└── theme/      # Style constants, colors, and global styles
```

## Contributing

Follow the established TypeScript patterns. Ensure all new modules are registered in the relevant container or navigator.

## License

This project is proprietary and confidential.
