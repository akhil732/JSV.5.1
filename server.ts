import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createRequestContext, logStructured } from './src/lib/observability/requestContext';
import { RateLimiter } from './src/lib/resilience/RateLimiter';
import { CircuitBreaker } from './src/lib/resilience/CircuitBreaker';
import { ModelRoutingService } from './src/lib/services/ModelRoutingService';
import { generateSystemPrompt } from './src/lib/i18n/systemPromptGenerator';

dotenv.config();

const app = express();
const PORT = 3000;

let sampleHoroscopeCache: any = null;
try {
  const samplePath = path.join(process.cwd(), 'sample_horoscope.json');
  if (fs.existsSync(samplePath)) {
    sampleHoroscopeCache = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not load sample_horoscope.json:', e);
}

const apiRateLimiter = new RateLimiter(120, 10);
const geminiCircuitBreaker = new CircuitBreaker(5, 2, 45000);
const modelRouter = new ModelRoutingService();

app.use(express.json({ limit: '10mb' }));

// Request tracing middleware
app.use((req, res, next) => {
  const traceId = createRequestContext(req.path, (req as any).user?.id);
  res.setHeader('X-Trace-ID', traceId);
  (res as any).traceId = traceId;

  const clientId = req.ip || 'anonymous';
  if (req.path.startsWith('/api/') && !apiRateLimiter.isAllowed(clientId)) {
    logStructured(traceId, 'warn', 'Rate limit exceeded', { clientId });
    return res.status(429).json({
      error: 'Too many requests. Please slow down.',
      traceId,
      retryAfter: 5
    });
  }

  next();
});

// Location autocomplete proxy/fallback endpoint
app.all('/api/jhora-proxy/location/autocomplete', (req, res) => {
  const q = ((req.query.q as string) || (req.body?.q as string) || '').toLowerCase();
  const cities = [
    { name: 'Hyderabad, Telangana, India', latitude: 17.3850, longitude: 78.4867, timezone: 5.5 },
    { name: 'Kakinada, Andhra Pradesh, India', latitude: 16.9604, longitude: 82.2381, timezone: 5.5 },
    { name: 'Visakhapatnam, Andhra Pradesh, India', latitude: 17.6868, longitude: 83.2185, timezone: 5.5 },
    { name: 'Vijayawada, Andhra Pradesh, India', latitude: 16.5062, longitude: 80.6480, timezone: 5.5 },
    { name: 'Bangalore, Karnataka, India', latitude: 12.9716, longitude: 77.5946, timezone: 5.5 },
    { name: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707, timezone: 5.5 },
    { name: 'Mumbai, Maharashtra, India', latitude: 19.0760, longitude: 72.8777, timezone: 5.5 },
    { name: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.2090, timezone: 5.5 },
    { name: 'Tirupati, Andhra Pradesh, India', latitude: 13.6288, longitude: 79.4192, timezone: 5.5 }
  ];

  const filtered = q ? cities.filter(c => c.name.toLowerCase().includes(q)) : cities;
  return res.json({ results: filtered.length > 0 ? filtered : cities });
});

// API endpoint for JHora Proxy with robust fallback
app.all('/api/jhora-proxy/:endpoint', async (req, res) => {
  const { endpoint } = req.params;
  try {
    const response = await fetch(`https://jagannatha-hora-359167915530.europe-west1.run.app/${endpoint}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`JHora backend warning on ${endpoint}: ${errorText}, serving local fallback sample.`);
      if (sampleHoroscopeCache) {
        return res.json(sampleHoroscopeCache);
      }
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.warn(`Error in /api/jhora-proxy/${endpoint} (using sample fallback):`, error?.message || error);
    if (sampleHoroscopeCache) {
      return res.json(sampleHoroscopeCache);
    }
    return res.status(500).json({ error: error?.message || 'Server error proxying to JHora' });
  }
});

app.post('/api/advanced-ai', async (req, res) => {
  try {
    const { prompt, systemInstructionOverride, language = 'en', userQuery, chartSummary } = req.body;

    if (!userQuery && !prompt) {
      return res.status(400).json({ error: 'User query or prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('/api/advanced-ai: GEMINI_API_KEY environment variable is missing.');
      return res.json({
        answer: null,
        sources: [],
        searchQueries: [],
        fallback: true,
        message: 'GEMINI_API_KEY missing'
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const langName = language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English';

    const baseAiSys = generateSystemPrompt(language as any);
    const systemInstruction = systemInstructionOverride || `${baseAiSys}

CRITICAL FORMATTING & STRUCTURE REQUIREMENTS:
1. Always start with a clear, direct executive summary statement answering the core question in bold.
2. Structure your analysis with clean Markdown headings (### and ####), bulleted/numbered lists with bold lead-ins, and horizontal dividers (---) between major sections.
3. STRICT PROHIBITION: DO NOT include a "Summary of Chart Layout" section or a "Comparative Analysis Table" section under any circumstances. Focus directly on addressing the query using the native's chart parameters.
4. Use numbered inline citations [1], [2], [3] in the body text wherever referencing grounded findings, classical rules, or web research.
5. Conclude with 2-3 specific follow-up questions or planetary timing (Dasha) verification checks for the user.
6. Write the entire response in ${langName}.`;

    const fullPrompt = prompt || `
ASTROLOGICAL CHART DATA:
${chartSummary || 'N/A'}

USER QUERY / LIFE CLUES:
"${userQuery}"

Provide a detailed, search-grounded astrological analysis addressing the user query thoroughly in ${langName}. Follow all formatting guidelines (clean headings, bullet points with bold lead-ins, numbered citations [1], [2], and follow-up verification questions). DO NOT include any "Summary of Chart Layout" section or "Comparative Analysis Table" section.
`;

    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
    let response: any = null;

    for (const modelName of modelsToTry) {
      // 1. First attempt with Search Grounding
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction,
            temperature: 0.2
          }
        });
        if (response?.text) break;
      } catch (mErr: any) {
        // Fall back cleanly if search grounding quota or tool is unavailable
      }

      // 2. Second attempt WITHOUT Search Grounding if search failed
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: fullPrompt,
          config: {
            systemInstruction,
            temperature: 0.2
          }
        });
        if (response?.text) break;
      } catch (mErr: any) {
        console.warn(`Model ${modelName} without search grounding failed:`, mErr?.message || mErr);
      }
    }

    const answer = response?.text || null;
    const groundingMetadata = response?.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    const webSearchQueries = groundingMetadata?.webSearchQueries || [];

    const sources: Array<{ title: string; url: string; snippet?: string }> = [];
    if (Array.isArray(groundingChunks)) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk?.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            url: chunk.web.uri
          });
        }
      });
    }

    if (answer) {
      return res.json({
        answer,
        sources,
        searchQueries: webSearchQueries,
        fallback: false
      });
    } else {
      return res.json({
        answer: null,
        sources: [],
        searchQueries: [],
        fallback: true,
        message: 'No response generated from Gemini API.'
      });
    }
  } catch (error: any) {
    console.error('Error in /api/advanced-ai:', error?.message || error);
    return res.json({
      answer: null,
      sources: [],
      searchQueries: [],
      fallback: true,
      error: error?.message || 'Server error during advanced AI query'
    });
  }
});

// Streaming SSE API endpoint for Search-Grounded / Multi-turn Advanced AI consultation
app.post('/api/advanced-ai/stream', async (req, res) => {
  try {
    const { prompt, systemInstructionOverride, language = 'en', userQuery, conversationHistory = [], persona = 'kp_stellar' } = req.body;

    if (!userQuery && !prompt) {
      return res.status(400).json({ error: 'User query or prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY environment variable is missing.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const langName = language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English';

    const defaultSysInstruction = systemInstructionOverride || `You are an elite master Vedic astrologer providing multi-turn streaming consultation in ${langName}. Always adhere strictly to Vedic Parashari principles, D1 Rasi, D9 Navamsha, divisional charts, Vimshottari Dasha-Antardasha, and current transits (Gochara) w.r.t Moon. Do not use KP terminology or modern psychological framing.`;

    const streamModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
    let streamSuccess = false;

    for (const modelName of streamModels) {
      try {
        let stream: any = null;
        if (Array.isArray(conversationHistory) && conversationHistory.length > 1) {
          // Multi-turn chat session using ai.chats.create
          const formattedHistory = conversationHistory.slice(0, -1).map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));

          const chat = ai.chats.create({
            model: modelName,
            config: {
              systemInstruction: defaultSysInstruction,
              temperature: persona === 'kp_stellar' ? 0.15 : persona === 'classical_jyotish' ? 0.3 : 0.4
            },
            history: formattedHistory
          });

          const lastMsg = prompt || userQuery || conversationHistory[conversationHistory.length - 1]?.content;
          stream = await chat.sendMessageStream({ message: lastMsg });
        } else {
          // Single turn stream
          const fullContent = prompt || userQuery;
          stream = await ai.models.generateContentStream({
            model: modelName,
            contents: fullContent,
            config: {
              systemInstruction: defaultSysInstruction,
              temperature: persona === 'kp_stellar' ? 0.15 : persona === 'classical_jyotish' ? 0.3 : 0.4
            }
          });
        }

        for await (const chunk of stream) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
        }
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        streamSuccess = true;
        break;
      } catch (streamErr: any) {
        console.warn(`Streaming failed with model ${modelName}:`, streamErr?.message || streamErr);
      }
    }

    if (!streamSuccess) {
      console.warn('All Gemini models exhausted for streaming, outputting fallback notice');
      res.write(`data: ${JSON.stringify({ text: "\n\n*(Note: Gemini API quota temporarily reached. Showing pre-computed deterministic KP consultation analysis)*\n\n" })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, fallback: true })}\n\n`);
      res.end();
    }
  } catch (error: any) {
    console.error('Error in /api/advanced-ai/stream:', error?.message || error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error?.message || 'Server error during streaming' });
    } else {
      res.write(`data: ${JSON.stringify({ done: true, fallback: true })}\n\n`);
      res.end();
    }
  }
});

// API endpoint for Gemini AI consultation
app.post('/api/consultation', async (req, res) => {
  try {
    const { prompt, language = 'en' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('/api/consultation: GEMINI_API_KEY environment variable is missing.');
      return res.json({ text: null, fallback: true, message: 'GEMINI_API_KEY missing' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' }
      }
    });

    const systemInstruction = `You are a master Vedic Astrologer providing authoritative, wise, and highly customized consultations in the requested language: ${language}. Always maintain a compassionate, helpful, and respectful tone.`;

    let responseText: string | null = null;

    // Try gemini-3.6-flash first
    const consultationModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
    for (const modelName of consultationModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            systemInstruction
          }
        });
        if (response?.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Consultation attempt with ${modelName} failed:`, err?.message || err);
      }
    }

    if (responseText) {
      return res.json({ text: responseText });
    } else {
      // Graceful fallback to deterministic engine
      return res.json({ text: null, fallback: true, message: 'Gemini API unavailable or quota limit reached.' });
    }
  } catch (error: any) {
    console.error('Error in /api/consultation:', error?.message || error);
    // Return fallback json so client falls back smoothly to local calculation
    return res.json({ text: null, fallback: true, error: error?.message || 'Server error during consultation' });
  }
});

// API endpoint for Vedic Parashari Verdict interpretation
app.post('/api/vedic/verdict', async (req, res) => {
  try {
    const { query, chart, baseVerdict } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({ verdict: baseVerdict });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const prompt = `
You are a master Vedic Parashari Astrologer. Enhance the following verdict with analytical depth based on classical Parashari principles (D1 Rasi, D9 Navamsha, House Lords, Vimshottari Dasha, and Gochara transits):

QUERY: "${query?.question || 'General Life Query'}"
RELEVANT HOUSE: House ${query?.relevantHouse || 7} (${query?.topic || 'GENERAL'})
NATIVE: ${chart?.birthData?.name || 'Native'}, ${chart?.birthData?.gender || 'Male'}, ${chart?.birthData?.date || '1996-11-11'}, ${chart?.birthData?.place || 'Place'}
CURRENT DASHA: ${chart?.currentDasha?.mahadasha || 'Mercury'} Mahadasha - ${chart?.currentDasha?.antardasha || 'Venus'} Bhukti

PARASHARI BASE VERDICT:
- Promise: ${baseVerdict?.promise || 'YES'}
- Timing: ${baseVerdict?.timing || 'Favorable'}
- Quality: ${baseVerdict?.quality || 'Strong'}
- Confidence: ${baseVerdict?.confidence || 88}
- House Lord: ${baseVerdict?.reasoning?.houseLord || 'Venus'}

Provide a JSON object with:
"explanation": "A concise, 2-3 sentence astrological explanation grounded in Classical Vedic Parashari rules",
"timing": "${baseVerdict?.timing || 'Favorable'}"
`;

    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
    let responseText: string | null = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
        if (response?.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`[Vedic Verdict API] Model ${modelName} failed:`, err?.message || err);
      }
    }

    if (responseText) {
      const parsed = JSON.parse(responseText);
      return res.json({
        verdict: {
          ...baseVerdict,
          explanation: parsed.explanation || baseVerdict.explanation,
          timing: parsed.timing || baseVerdict.timing
        }
      });
    }

    return res.json({ verdict: baseVerdict });
  } catch (err: any) {
    console.warn('Vedic Verdict API error:', err?.message || err);
    return res.json({ verdict: req.body.baseVerdict });
  }
});

app.post('/api/kp/verdict', async (req, res) => {
  try {
    const { query, chart, baseVerdict, language } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('[KP Verdict API] GEMINI_API_KEY is missing, skipping Gemini enrichment.');
      return res.json({ verdict: baseVerdict });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const langName = language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English';

    const systemInstruction = `You are an expert master Krishnamurti Paddhati (KP) astrologer who is highly skilled in interpreting the 8-Step KP Textbook Analysis Chain, 4-Level planet significators, cusp sub-lords, dasha timelines, and transits. You write deep, compassionate, and precise analysis entirely in ${langName}.`;

    const prompt = `
You are a master KP Astrologer. Review the user's question, chart context, and the deterministic rule-based KP verdict below, and enrich it with beautiful, detailed analysis and guidance in ${langName}.

USER QUERY: "${query?.question || 'General Life Query'}"
TOPIC: ${query?.topic || 'GENERAL'}
RELEVANT HOUSE: House ${query?.relevantHouse || 1}
NATIVE: ${chart?.birthData?.name || 'Native'}, ${chart?.birthData?.gender || 'Male'}
CURRENT DASHA: ${chart?.currentDasha?.mahadasha || 'Mercury'} Mahadasha - ${chart?.currentDasha?.antardasha || 'Venus'} Bhukti

DETERMINISTIC KP BASE VERDICT:
- Promise: ${baseVerdict?.promise || 'YES'}
- Timing: ${baseVerdict?.timing || 'Favorable'}
- Quality: ${baseVerdict?.quality || 'FAVORABLE'}
- Confidence Score: ${baseVerdict?.confidenceScore || 85}% (${baseVerdict?.confidence || 'HIGH'})
- Cusp Sub Lord: ${baseVerdict?.reasoning?.cuspSubLord || 'Mercury'}
- Cusp Sub Lord Signified Houses: [${baseVerdict?.reasoning?.cuspSubLordHouses?.join(', ') || ''}]
- Primary House Significators: [${baseVerdict?.reasoning?.significators?.join(', ') || ''}]
- Dasha Status: ${baseVerdict?.reasoning?.dashaStatus || ''}
- Transit Support: ${baseVerdict?.reasoning?.transitSupport || ''}
- Vedic Support: ${baseVerdict?.reasoning?.vedicSupport || ''}
- Obstacles: [${baseVerdict?.obstacles?.join('; ') || 'None'}]

You MUST output your response as a valid JSON object.
All text values inside the JSON response MUST be written entirely in ${langName}.

Format your response exactly matching this schema:
{
  "explanation": "A deep, professional, and detailed astrological commentary in ${langName} justifying why the KP rules generated this verdict. Explain the cusp sub-lord's connection to favorable/unfavorable houses, how the active Mahadasha and Bhukti lords act as timing triggers, and provide deep astrological insights.",
  "timing": "A specific timeline prediction and description in ${langName} explaining when this event is likely to occur, based on active Vimshottari dasha cycles and transit influences.",
  "contextualization": {
    "acknowledgment": "A compassionate and highly precise acknowledgment of the user's specific query and concerns in ${langName}.",
    "recommendations": [
      "Actionable recommendation 1 in ${langName} derived from the planetary/house significances.",
      "Actionable recommendation 2 in ${langName}.",
      "Actionable recommendation 3 in ${langName}."
    ],
    "reassurance": "A warm, comforting, and reassuring concluding statement in ${langName}.",
    "actionPlan": "A clear, actionable, step-by-step guidance plan in ${langName} advising the user on what mental, physical, or remedy actions to take next."
  }
}

Ensure the response is a clean, parseable JSON object. Populate all fields completely in ${langName}.
`;

    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
    let responseText: string | null = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            systemInstruction,
            temperature: 0.25
          }
        });

        if (response?.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`[KP Verdict API] Model ${modelName} failed:`, err?.message || err);
      }
    }

    if (responseText) {
      const parsed = JSON.parse(responseText.trim());
      return res.json({
        verdict: {
          ...baseVerdict,
          explanation: parsed.explanation || baseVerdict.explanation,
          timing: parsed.timing || baseVerdict.timing,
          contextualization: parsed.contextualization || {
            acknowledgment: "",
            recommendations: [],
            reassurance: "",
            actionPlan: ""
          }
        }
      });
    }

    return res.json({ verdict: baseVerdict });
  } catch (err: any) {
    console.warn('KP Verdict API error:', err?.message || err);
    return res.json({ verdict: req.body.baseVerdict });
  }
});

// API endpoint for Vedic Query Intent Recognition
app.post('/api/vedic/recognize-intent', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('/api/vedic/recognize-intent: GEMINI_API_KEY is missing, skipping semantic classification.');
      return res.json({ intent: null, fallback: true, message: 'Gemini API Key missing' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const systemInstruction = "You are an expert natural language classification engine specializing in Classical Vedic Parashari Astrology. Your task is to analyze user queries and map them to the correct astrological domain and houses.";

    const prompt = `
Analyze this user astrological query and classify its intent using Vedic Parashari house principles.
QUERY: "${query}"

AVAILABLE DOMAINS:
- CAREER: Career progression, profession, job, business suitability, status. Primary House: 10, Secondary: [6, 11]
- FINANCE: Wealth accumulation, money, gains, profit, savings, investments. Primary House: 2, Secondary: [11, 8]
- MARRIAGE: Marriage promise, wedding, alliance, spouse, husband, wife. Primary House: 7, Secondary: [1, 5, 11]
- HEALTH: Diseases, illness, sickness, cure, surgery, recovery. Primary House: 6, Secondary: [1, 8, 12]
- EDUCATION: Studies, exams, college, university, academic success. Primary House: 5, Secondary: [4, 9, 11]
- CHILDREN: Children, child birth, progeny, pregnancy, fertility, conception, family expansion, kids. Primary House: 5, Secondary: [1, 2, 7, 9, 11]
- PROPERTY: Land, house, flat, real estate, vehicle, car. Primary House: 4, Secondary: [2, 9, 11]
- LEGAL: Court cases, lawsuit, litigation, disputes. Primary House: 6, Secondary: [8, 12]
- TRAVEL: Foreign travel, immigration, visas, relocation, settling abroad. Primary House: 12, Secondary: [9, 3]
- SPIRITUAL: Spiritual path, guru, meditation, mantra, pilgrimage. Primary House: 9, Secondary: [12, 5]
- RELATIONSHIPS: Love affairs, romantic partners, dating, friendships, breakup. Primary House: 7, Secondary: [11, 5]

Provide a JSON response matching this schema:
{
  "intent": {
    "domain": "one of the above domain names in ALL CAPS",
    "primaryHouse": number (1 to 12),
    "secondaryHouses": [array of numbers],
    "confidence": number (0 to 100),
    "requiresClarification": boolean,
    "alternativeDomains": ["optional array of other matching domains in ALL CAPS if ambiguous"]
  }
}
`;

    const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview'];
    let responseText: string | null = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            systemInstruction,
            temperature: 0.1
          }
        });

        if (response?.text) {
          responseText = response.text;
          break;
        }
      } catch (mErr: any) {
        console.warn(`[Vedic recognize-intent] Model ${modelName} failed:`, mErr?.message || mErr);
      }
    }

    if (responseText) {
      const parsed = JSON.parse(responseText.trim());
      if (parsed && parsed.intent) {
        return res.json(parsed);
      }
    }

    return res.json({ intent: null, fallback: true, message: 'Classification model unavailable' });
  } catch (err: any) {
    console.warn('Vedic recognize-intent API warning:', err?.message || err);
    return res.json({ intent: null, fallback: true, error: err?.message || 'Server error during intent recognition' });
  }
});

app.post('/api/kp/recognize-intent', (req, res) => {
  return res.redirect(307, '/api/vedic/recognize-intent');
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

app.post('/api/gochara', (req, res) => {
  res.json({ data: { planets: [] } });
});

startServer();
