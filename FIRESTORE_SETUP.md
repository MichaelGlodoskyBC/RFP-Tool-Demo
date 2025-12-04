# Firestore Setup Guide

This guide will help you complete the Firebase/Firestore setup for your RFP Tool.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Firestore Database

1. In Firebase Console, navigate to **Firestore Database** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (you can secure it later)
4. Select a location closest to your users
5. Click **"Enable"**

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the web icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "RFP Tool Web")
6. Copy the `firebaseConfig` object values

## Step 4: Create .env File

1. In the root of your project, create a file named `.env`
2. Copy the following template and fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

3. Replace all the placeholder values with your actual Firebase config values

## Step 5: Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** > **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // RFPs collection
    match /rfps/{rfpId} {
      // For development/testing - allows all reads and writes
      allow read, write: if true;
      
      // For production, use authentication:
      // allow read, write: if request.auth != null;
      
      // Lanes subcollection
      match /lanes/{laneId} {
        allow read, write: if true;
        // For production:
        // allow read, write: if request.auth != null;
      }
    }
  }
}
```

3. Click **"Publish"** to save the rules

**⚠️ Important:** The rules above allow anyone to read/write. For production, you should implement proper authentication and security rules.

## Step 6: (Optional) Migrate Demo Data

If you want to populate Firestore with the demo data:

1. Start your development server: `npm run dev`
2. Open your browser's developer console (F12)
3. Run: `window.migrateDemoData()`
4. Wait for the migration to complete

Alternatively, you can import the migration function in your code and call it programmatically.

## Step 7: Test the Setup

1. Make sure your `.env` file is created with correct values
2. Restart your development server: `npm run dev`
3. The app should now load RFPs from Firestore instead of demo data
4. Try creating a new RFP to verify writes are working

## Troubleshooting

### "Failed to load RFPs" Error
- Check that your `.env` file exists and has all required variables
- Verify that your Firebase config values are correct
- Make sure Firestore is enabled in your Firebase project
- Check browser console for detailed error messages

### "Permission denied" Error
- Check your Firestore security rules
- Make sure rules are published
- For development, ensure rules allow read/write access

### Data Not Appearing
- Check Firestore Console to see if data exists
- Verify the collection name is `rfps` and subcollection is `lanes`
- Check browser console for any errors

## Next Steps

- [ ] Set up Firebase Authentication for user management
- [ ] Implement proper security rules based on user roles
- [ ] Add offline persistence for better UX
- [ ] Set up Firebase Hosting for deployment
- [ ] Configure Firebase Storage for file uploads

## Data Structure

The Firestore database uses the following structure:

```
rfps (collection)
  └── {rfpId} (document)
      ├── id, shipper, dueDate, mode, status, etc.
      └── lanes (subcollection)
          └── {laneId} (document)
              ├── id, origin, destination, equipment, etc.
```

## Support

If you encounter issues, check:
- Firebase Console for error logs
- Browser console for client-side errors
- Network tab for failed requests



