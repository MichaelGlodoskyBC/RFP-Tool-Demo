# Gemini AI Setup Guide

This guide will help you set up Google's Gemini AI for PDF processing in your RFP Tool.

## Overview

The RFP Tool uses Google's Gemini AI to extract structured lane data from PDF documents. Gemini can read and understand PDF content, then extract relevant information like origin, destination, distance, rates, and more.

## Step 1: Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey) or [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing project
4. Navigate to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **API Key**
6. Copy your API key

### Alternative: Using Google AI Studio

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Get API Key**
3. Create a new Google Cloud project or select an existing one
4. Copy the generated API key

## Step 2: Enable Gemini API

If you're using Google Cloud Console:

1. Go to **APIs & Services** > **Library**
2. Search for "Generative Language API" or "Gemini API"
3. Click **Enable**
4. Wait for the API to be enabled (usually instant)

## Step 3: Add API Key to Your Project

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add the following line:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key from Step 1.

**Important**: 
- The `.env` file should already be in `.gitignore` to keep your API key secure
- Never commit your API key to version control
- For production, use environment variables provided by your hosting platform

## Step 4: Restart Development Server

After adding the API key:

1. Stop your development server (Ctrl+C or Cmd+C)
2. Restart it: `npm run dev`
3. The PDF upload feature should now work with Gemini

## Step 5: Test PDF Upload

1. Open the RFP Tool in your browser
2. Click **Add RFP** or use the file upload feature
3. Upload a PDF file containing RFP/lane data
4. The system will:
   - Show progress updates (Initializing, Converting, Processing, etc.)
   - Extract lane data using Gemini
   - Display extracted lanes in the interface

## How It Works

1. **PDF Upload**: User uploads a PDF file
2. **Base64 Conversion**: PDF is converted to base64 format for API transmission
3. **Gemini Processing**: PDF is sent to Gemini AI with a prompt to extract lane data
4. **Data Extraction**: Gemini analyzes the PDF and extracts structured data (headers and rows)
5. **Lane Creation**: Extracted data is converted into lane objects with all required fields

## Supported PDF Formats

Gemini can process PDFs containing:
- Tables with lane information
- Text-based lane listings
- Mixed format documents
- Scanned documents (with OCR capabilities)

## API Costs and Limits

### Free Tier
- Google AI Studio provides a free tier with generous limits
- Check current limits at [Google AI Studio](https://makersuite.google.com/)

### Pricing
- After free tier, pay-as-you-go pricing applies
- See [Google AI Pricing](https://ai.google.dev/pricing) for current rates
- PDF processing typically costs based on input tokens

### Rate Limits
- Free tier has rate limits (requests per minute)
- Production use may require higher quotas
- Contact Google Cloud support for quota increases

## Troubleshooting

### Error: "Gemini API key is not configured"
- Make sure you've created a `.env` file in the project root
- Verify the variable name is exactly `VITE_GEMINI_API_KEY`
- Ensure the API key value doesn't have quotes around it
- Restart your development server after adding the key

### Error: "API quota exceeded"
- You've hit the rate limit or usage quota
- Wait a few minutes and try again
- Check your usage in Google Cloud Console
- Consider upgrading your quota if needed

### Error: "Failed to parse PDF"
- The PDF might be corrupted or unreadable
- Try a different PDF file
- Ensure the PDF contains extractable text (not just images)
- Check the browser console for detailed error messages

### PDF Processing is Slow
- Large PDFs take longer to process
- Complex layouts may require more processing time
- Network latency can affect response times
- Progress indicators show the current status

### No Data Extracted
- The PDF might not contain lane data in an expected format
- Try using the template configuration feature to map columns
- Check if the PDF has tables or structured data
- Some PDFs may require manual data entry

## Security Best Practices

1. **Never commit API keys**: Always use `.env` files and ensure they're in `.gitignore`
2. **Restrict API keys**: In Google Cloud Console, restrict your API key to:
   - Specific APIs (Generative Language API only)
   - Specific referrers (your domain)
   - IP addresses (if applicable)
3. **Rotate keys regularly**: Change API keys periodically
4. **Monitor usage**: Check API usage in Google Cloud Console regularly
5. **Use environment variables**: For production, use secure environment variable management

## Production Deployment

For production deployments (Firebase Hosting, Vercel, etc.):

1. Add `VITE_GEMINI_API_KEY` as an environment variable in your hosting platform
2. Do NOT include it in your build files
3. Restart/redeploy your application
4. Verify the environment variable is accessible at runtime

### Firebase Hosting Example
```bash
firebase functions:config:set gemini.api_key="your_key_here"
```

### Vercel Example
- Go to Project Settings > Environment Variables
- Add `VITE_GEMINI_API_KEY` with your key value
- Redeploy

## Advanced Configuration

### Using Different Gemini Models

Edit `src/services/geminiService.js` to change the model:

```javascript
// Current: gemini-1.5-pro (best for complex documents)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// Alternative: gemini-1.5-flash (faster, lower cost)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
```

### Customizing the Extraction Prompt

Edit the `prompt` variable in `src/services/geminiService.js` to customize how Gemini extracts data from PDFs.

## Support

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

## Next Steps

After setting up Gemini:
1. Test with a sample PDF containing RFP data
2. Verify extracted lanes are correct
3. Use template configuration if column mapping is needed
4. Monitor API usage and costs



