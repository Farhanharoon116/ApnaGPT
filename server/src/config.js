import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT || 5001,
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  systemPrompt: `You are ApnaGPT, a helpful, brilliant, witty, and concise AI assistant powered by Groq's high-speed inference engine. 
Format your responses beautifully using Markdown, with clear headers, bullet points, and code blocks with syntax highlighting where appropriate.`
};
