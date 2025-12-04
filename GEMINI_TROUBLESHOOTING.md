# Gemini API Troubleshooting Guide

## Common Error: "Model not found (404)"

If you see a 404 error when uploading PDFs, it means the Gemini model isn't available with your current API key setup.

### Solution 1: Enable Generative Language API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Navigate to **APIs & Services** > **Library**
4. Search for **"Generative Language API"**
5. Click **Enable**
6. Wait a few minutes for the API to activate
7. Try uploading your PDF again

### Solution 2: Verify API Key Permissions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your API key
4. Click **Edit** (pencil icon)
5. Under **API restrictions**, ensure:
   - **Generative Language API** is selected
   - Or set to **Don't restrict key** (for testing)
6. Click **Save**
7. Try uploading your PDF again

### Solution 3: Use Google AI Studio API Key

If you're using a Google AI Studio API key (from makersuite.google.com):

1. The key should work automatically
2. If you get 404 errors, try:
   - Creating a new API key
   - Ensuring you're using the latest key
   - Checking that the key hasn't been revoked

### Solution 4: Check Available Models

The code now tries these models in order:
1. `gemini-1.5-flash` (fastest, most commonly available)
2. `gemini-1.5-pro` (more powerful, may require specific access)
3. `gemini-pro` (original model, may not support PDFs)

If all models fail, you'll see a helpful error message.

### Solution 5: Verify API Key in .env File

1. Check your `.env` file contains:
   ```
   VITE_GEMINI_API_KEY=your_key_here
   ```
2. Make sure there are no extra spaces or quotes
3. Restart your development server after changing `.env`

### Still Not Working?

1. **Check Browser Console**: Look for detailed error messages
2. **Check Network Tab**: See if the API request is being made
3. **Verify API Key**: Test your key at [Google AI Studio](https://makersuite.google.com/)
4. **Check Quota**: Ensure you haven't exceeded API usage limits
5. **Try Different PDF**: Test with a simple, small PDF first

### Alternative: Use Files API

For very large PDFs or production use, consider using the Gemini Files API instead of inline data. This requires additional setup but is more efficient for large files.

## Quick Test

To verify your setup works:

1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Try the chat interface with a PDF
3. If that works, your API key is valid
4. The issue might be with model availability or API restrictions

## Need More Help?

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)



