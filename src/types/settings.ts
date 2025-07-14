export type ThemeType = 
  | 'light' 
  | 'dark' 
  | 'mint' 
  | 'lavender' 
  | 'peach' 
  | 'sky'
  | 'custom';

export type GeminiModelVersion =
  | 'gemini-2.0-flash'
  | 'gemini-2.0-flash-lite'
  | 'gemini-2.0-pro-exp-02-05'
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'custom';

export type EnglishStandardType = 'toeic' | 'ielts' | 'cefr';

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface Settings {
  theme: ThemeType;
  customColors?: CustomColors;
  geminiKey: string;
  geminiModel: GeminiModelVersion;
  customGeminiModel?: string; // Model tuỳ chọn do user nhập
  englishStandard: EnglishStandardType;
  profile?: {
    name: string;
    email: string;
  };
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  geminiKey: '',
  geminiModel: 'gemini-2.0-flash',
  englishStandard: 'toeic'
}; 