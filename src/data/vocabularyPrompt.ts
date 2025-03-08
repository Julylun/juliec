export interface VocabularyInfo {
  word: string;
  ipa: string;
  meaning: string;
  example: string;
}

export const generateVocabularyPrompt = (word: string) => `
Generate detailed information about the English word "${word}".
The response must be in the following JSON format:

{
  "word": "${word}",
  "ipa": "IPA phonetic transcription",
  "meaning": "Vietnamese meaning of the word",
  "example": "An example sentence using the word"
}

Requirements:
1. The IPA should be accurate phonetic transcription
2. The meaning should be in Vietnamese
3. The example should be a simple, clear sentence using the word correctly
4. Ensure the JSON is valid and properly formatted

Please generate the vocabulary information now.`; 