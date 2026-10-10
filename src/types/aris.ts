export type ArisProvider =
  | 'groq'
  | 'openai'
  | 'openrouter'
  | 'gemini'
  | 'cerebras'
  | 'ollama'
  | 'custom';

export interface ProviderPreset {
  id: ArisProvider;
  name: string;
  baseUrl: string;
  defaultModel: string;
  keyUrl?: string;
  hint: string;
  keyRequired: boolean;
  freeTierNote?: string;
}

export const PROVIDER_PRESETS: Record<ArisProvider, ProviderPreset> = {
  groq: {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    keyUrl: 'https://console.groq.com/keys',
    hint: 'Ultra-fast inference. Example: llama-3.3-70b-versatile, llama-3.1-8b-instant',
    keyRequired: true,
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    keyUrl: 'https://platform.openai.com/api-keys',
    hint: 'Standard OpenAI models. Example: gpt-4o-mini, gpt-4o',
    keyRequired: true,
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    keyUrl: 'https://openrouter.ai/keys',
    hint: 'Models ending in ":free" are free (e.g. meta-llama/llama-3.3-70b-instruct:free)',
    keyRequired: true,
    freeTierNote: 'Tip: models ending in ":free" have no usage costs',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    defaultModel: 'gemini-2.5-flash',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    hint: 'Generous free tier. Example: gemini-2.5-flash, gemini-1.5-flash',
    keyRequired: true,
  },
  cerebras: {
    id: 'cerebras',
    name: 'Cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    defaultModel: 'llama-3.3-70b',
    keyUrl: 'https://cloud.cerebras.ai/',
    hint: 'Fast Llama inference. Example: llama-3.3-70b, llama3.1-8b',
    keyRequired: true,
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (local)',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3.2',
    hint: 'Runs offline on your machine. Example: llama3.2, mistral, deepseek-r1',
    keyRequired: false,
    freeTierNote: 'Local & private. If you get a CORS error, start with: OLLAMA_ORIGINS="*" ollama serve',
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    baseUrl: '',
    defaultModel: '',
    hint: 'Any OpenAI-compatible /chat/completions endpoint',
    keyRequired: false,
  },
};

export interface ArisSettings {
  provider: ArisProvider;
  model: string;
  apiKey: string;
  baseUrl: string;
}

export const DEFAULT_ARIS_SETTINGS: ArisSettings = {
  provider: 'groq',
  model: PROVIDER_PRESETS.groq.defaultModel,
  apiKey: '',
  baseUrl: PROVIDER_PRESETS.groq.baseUrl,
};

export interface ArisMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isError?: boolean;
}
