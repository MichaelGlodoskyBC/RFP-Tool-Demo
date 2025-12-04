# Google Maps Setup Guide

This guide will help you set up Google Maps API for the MapView component in your RFP Tool.

## Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing project
3. Enable the following APIs:
   - **Maps JavaScript API** (required for displaying maps)
   - **Geocoding API** (optional, for better city coordinate lookup)
   - **Directions API** (optional, for route calculations)

### Enable APIs:
1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Maps JavaScript API" and click **Enable**
3. (Optional) Search for "Geocoding API" and click **Enable**
4. (Optional) Search for "Directions API" and click **Enable**

## Step 2: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy your API key
4. (Recommended) Click **Restrict Key** to secure it:
   - Under **Application restrictions**, select **HTTP referrers (web sites)**
   - Add your domain(s):
     - `http://localhost:*` (for development)
     - `https://rfp-tool-b659c.web.app/*` (for Firebase hosting)
     - `https://rfp-tool-b659c.firebaseapp.com/*` (for Firebase hosting)
   - Under **API restrictions**, select **Restrict key** and choose:
     - Maps JavaScript API
     - Geocoding API (if enabled)
     - Directions API (if enabled)

## Step 3: Add API Key to Your Project

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add the following line:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key from Step 2.

## Step 4: Restart Development Server

After adding the API key:
1. Stop your development server (Ctrl+C)
2. Restart it: `npm run dev`
3. The MapView component should now display the map

## Step 5: For Production Deployment

When deploying to Firebase Hosting, you have two options:

### Option A: Build with Environment Variables (Recommended)
1. Make sure your `.env` file has the API key
2. Build: `npm run build`
3. Deploy: `firebase deploy --only hosting`

The API key will be embedded in the build.

### Option B: Use Firebase Hosting Environment Config
1. In Firebase Console, go to **Hosting** > **Your site** > **Environment config**
2. Add environment variables there
3. Note: This requires additional Firebase Functions setup

## Troubleshooting

### Map Not Showing
- Check browser console for errors
- Verify API key is correct in `.env` file
- Make sure Maps JavaScript API is enabled
- Check API key restrictions (should allow your domain)

### "This page can't load Google Maps correctly" Error
- Check that your API key is valid
- Verify API restrictions allow Maps JavaScript API
- Check that HTTP referrer restrictions include your domain

### API Key Billing
- Google Maps API has a free tier ($200/month credit)
- Monitor usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges

## Current Implementation

The MapView component:
- Displays lanes as routes (polylines) on the map
- Shows city markers for origin and destination
- Colors routes based on lane status (Valid=green, Warning=amber, Error=red)
- Fits map bounds to show all routes
- Shows info windows when clicking on routes

## Support

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)



