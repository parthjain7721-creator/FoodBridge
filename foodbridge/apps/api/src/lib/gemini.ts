// FoodBridge — Gemini AI Client Singleton
// Uses @google/generative-ai SDK for Gemini Vision quality assessment
// and Gemini Flash surplus prediction.

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('[Gemini] GEMINI_API_KEY is not set — AI endpoints will return mock responses.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Safety settings — we're analyzing food images, so relax the safety thresholds
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Get a Gemini Pro Vision model instance for food image analysis.
 * Uses gemini-1.5-pro for multimodal (image + text) input.
 */
export function getVisionModel() {
  if (!genAI) return null;
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    safetySettings,
    generationConfig: {
      temperature: 0.2, // Low temperature for consistent, factual responses
      topP: 0.8,
      maxOutputTokens: 1024,
    },
  });
}

/**
 * Get a Gemini Flash model instance for text-based surplus prediction.
 * Uses gemini-1.5-flash for fast, cost-effective text reasoning.
 */
export function getFlashModel() {
  if (!genAI) return null;
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    safetySettings,
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 512,
    },
  });
}

export { genAI };
