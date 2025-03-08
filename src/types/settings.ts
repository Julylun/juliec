export type ThemeType = 
  | 'light' 
  | 'dark' 
  | 'mint' 
  | 'lavender' 
  | 'peach' 
  | 'sky';

export type GeminiModelVersion = 'gemini-2.0-flash' | 'gemini-2.0-flash-lite' | 'gemini-2.0-pro-exp-02-05';

export interface Settings {
  theme: ThemeType;
  geminiKey: string;
  geminiModel: GeminiModelVersion;
  profile?: {
    name: string;
    email: string;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  geminiKey: '',
  geminiModel: 'gemini-2.0-flash'
}; 