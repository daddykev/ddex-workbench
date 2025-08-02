# DDEX Workbench Setup Guide

This guide will help you set up DDEX Workbench for local development.

## Prerequisites

- **Node.js** 18.0 or higher
- **npm** 8.0 or higher (comes with Node.js)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git**
- A **Google account** (for Firebase)
- A code editor (we recommend VS Code)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/ddex-workbench/ddex-workbench.git
cd ddex-workbench
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 3. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it (e.g., "ddex-workbench-dev")
4. Disable Google Analytics (optional for development)

#### Initialize Firebase

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
```

Select the following options:
- **Functions**: Yes
- **Firestore**: Yes
- **Hosting**: Yes
- **Storage**: Yes
- **Emulators**: Yes

When prompted:
- Use an existing project and select your created project
- Use JavaScript for Functions
- Use default ports for emulators

### 4. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Get your Firebase configuration:
1. Go to Firebase Console → Project Settings
2. Under "Your apps", click "Web" icon to create a web app
3. Copy the configuration values
4. Update `.env` with your values:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://localhost:5001/your-project-id/us-central1
```

### 5. Database Setup

Deploy Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

Create indexes:

```bash
firebase deploy --only firestore:indexes
```

### 6. Running the Development Environment

#### Start Firebase Emulators

In one terminal:

```bash
firebase emulators:start
```

This starts:
- Firestore emulator on `localhost:8080`
- Functions emulator on `localhost:5001`
- Auth emulator on `localhost:9099`
- Storage emulator on `localhost:9199`

#### Start the Vue Development Server

In another terminal:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Development Workflow

### Code Structure

```
src/
├── components/        # Reusable Vue components
├── views/            # Page components
├── services/         # API and Firebase services
├── utils/            # Helper functions
├── assets/           # CSS and static assets
└── router/           # Vue Router configuration
```

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the coding standards

3. Test your changes:
   ```bash
   npm run test        # Run tests
   npm run lint        # Check code style
   ```

4. Commit using conventional commits:
   ```bash
   git commit -m "feat: add new validation rule"
   ```

### CSS Development

Our CSS architecture uses:
- **Custom Properties**: Edit `assets/themes.css` for design tokens
- **Utility Classes**: Use existing classes from `assets/components.css`
- **Component Styles**: Scoped styles in Vue components

Theme testing:
```javascript
// Toggle theme in browser console
document.documentElement.setAttribute('data-theme', 'dark')
```

## Common Tasks

### Adding a New API Endpoint

1. Create function in `functions/src/api/`:
   ```javascript
   // functions/src/api/myEndpoint.js
   exports.myEndpoint = async (req, res) => {
     // Your logic here
   };
   ```

2. Export from `functions/index.js`:
   ```javascript
   exports.myEndpoint = functions.https.onRequest(api.myEndpoint);
   ```

3. Add to frontend API service:
   ```javascript
   // src/services/api.js
   export const myApiCall = async (data) => {
     const response = await apiClient.post('/myEndpoint', data);
     return response.data;
   };
   ```

### Adding a New Vue Component

1. Create component file:
   ```vue
   <!-- src/components/MyComponent.vue -->
   <template>
     <div class="my-component">
       <!-- Your template -->
     </div>
   </template>

   <script setup>
   // Your logic
   </script>

   <style scoped>
   /* Your styles */
   </style>
   ```

2. Import and use in parent component:
   ```vue
   <script setup>
   import MyComponent from '@/components/MyComponent.vue'
   </script>
   ```

## Troubleshooting

### Firebase Emulators Won't Start

- Check if ports are already in use
- Kill any existing processes:
  ```bash
  lsof -ti:8080,5001,9099,9199 | xargs kill -9
  ```

### CSS Not Updating

- Clear browser cache
- Check that Vite HMR is working
- Restart dev server if needed

### Authentication Issues

- Ensure Auth emulator is running
- Check `.env` configuration
- Clear browser localStorage

### Build Errors

- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Deployment

### Building for Production

```bash
npm run build
```

### Deploy to Firebase

```bash
firebase deploy
```

To deploy specific services:
```bash
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
```

## Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [DDEX Knowledge Base](https://kb.ddex.net/)
- [Project Blueprint](../blueprint.md)

## Need Help?

- Check existing [GitHub Issues](https://github.com/ddex-workbench/ddex-workbench/issues)
- Join our [Discord community](https://discord.gg/ddex-workbench)
- Email us at support@ddex-workbench.org