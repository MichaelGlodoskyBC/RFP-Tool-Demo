import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initialize Gemini AI client
 */
function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
  }
  
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Convert PDF file to base64 for Gemini API
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:application/pdf;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Process PDF with Gemini to extract structured data
 * @param {File} pdfFile - The PDF file to process
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Parsed data with headers and rows
 */
export async function processPDFWithGemini(pdfFile, onProgress = null) {
  try {
    if (onProgress) onProgress(10, 'Initializing Gemini...');
    
    const genAI = getGeminiClient();
    
    if (onProgress) onProgress(20, 'Converting PDF to base64...');
    
    // Convert PDF to base64
    const base64Data = await fileToBase64(pdfFile);
    
    if (onProgress) onProgress(40, 'Sending PDF to Gemini for analysis...');
    
    // Prepare the prompt for extracting RFP/lane data
    const prompt = `You are analyzing a freight/logistics RFP (Request for Proposal) PDF document. 

Extract all lane information from this PDF. A lane typically contains:
- Origin city/state
- Destination city/state
- Distance (in miles)
- Rate or price
- Volume/quantity
- Equipment type (Dry Van, Refrigerated, Flatbed, etc.)

Please analyze the PDF and extract all lane data. Return the data in a structured JSON format with this exact structure:

{
  "headers": ["Origin", "Destination", "Distance", "Rate", "Volume", "Equipment"],
  "rows": [
    ["Chicago, IL", "Miami, FL", "487", "2.15", "24", "Dry Van"],
    ...
  ]
}

If the PDF contains headers or column names, use those. Otherwise, infer the structure from the data.

If you cannot find lane data, return:
{
  "headers": [],
  "rows": [],
  "note": "Could not extract lane data from PDF"
}

Only return valid JSON, no additional text or markdown formatting.`;

    if (onProgress) onProgress(60, 'Processing PDF content...');
    
    // Try different models in order of preference
    // gemini-1.5-flash supports PDFs and is faster (most commonly available)
    // gemini-pro is the fallback (may not support PDFs directly)
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let lastError = null;
    let result = null;
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Send PDF to Gemini
        result = await model.generateContent([
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
          { text: prompt },
        ]);
        
        // Success - break out of loop
        break;
      } catch (modelError) {
        lastError = modelError;
        // If it's a 404, try next model
        if (modelError.message && (modelError.message.includes('404') || modelError.message.includes('not found'))) {
          continue;
        }
        // For other errors, throw immediately
        throw modelError;
      }
    }
    
    // If we tried all models and none worked, throw a helpful error
    if (!result) {
      const errorMsg = lastError?.message || 'No available Gemini models found';
      if (errorMsg.includes('404') || errorMsg.includes('not found')) {
        throw new Error(
          'Gemini model not available. Please ensure:\n' +
          '1. The Generative Language API is enabled in Google Cloud Console\n' +
          '2. Your API key has access to Gemini models\n' +
          '3. You are using a valid API key from Google AI Studio or Google Cloud Console\n' +
          `Original error: ${errorMsg}`
        );
      }
      throw lastError || new Error('No available Gemini models found');
    }
    
    if (onProgress) onProgress(80, 'Parsing response...');
    
    const response = await result.response;
    const text = response.text();
    
    // Try to extract JSON from the response
    // Gemini might wrap JSON in markdown code blocks
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON object from text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from Gemini response');
      }
    }
    
    if (onProgress) onProgress(100, 'Complete');
    
    // Ensure the response has the expected structure
    if (!parsedData.headers || !parsedData.rows) {
      return {
        headers: [],
        rows: [],
        note: parsedData.note || 'Unexpected response format from Gemini',
        rawResponse: text
      };
    }
    
    return {
      headers: parsedData.headers || [],
      rows: parsedData.rows || [],
      note: parsedData.note,
      rawResponse: text
    };
    
  } catch (error) {
    console.error('Error processing PDF with Gemini:', error);
    
    // Provide helpful error messages
    if (error.message.includes('API key') || error.message.includes('401')) {
      throw new Error('Gemini API key is missing or invalid. Please check your .env file.');
    } else if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('429')) {
      throw new Error('Gemini API quota exceeded. Please check your usage limits.');
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      throw new Error('Gemini model not found. The API may have changed. Please check the Gemini API documentation for available models.');
    } else if (error.message.includes('parse')) {
      throw new Error('Failed to parse response from Gemini. The PDF may be too complex or contain no extractable data.');
    } else {
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }
}

/**
 * Extract text from PDF using Gemini (simpler version)
 * @param {File} pdfFile - The PDF file
 * @returns {Promise<string>} Extracted text
 */
export async function extractTextFromPDF(pdfFile) {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const base64Data = await fileToBase64(pdfFile);
    
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data,
        },
      },
      { text: 'Extract all text from this PDF document. Return only the text content, no formatting or explanations.' },
    ]);
    
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

