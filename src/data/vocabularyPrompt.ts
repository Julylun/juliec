export interface VocabularyInfo {
  word: string;
  ipa: string;
  meaning: string;
  example: string;
}

export const generateVocabularyPrompt = (word: string, englishStandard: string = 'toeic') => {
  let standardSpecificInstructions = '';
  let contextType = '';
  
  switch (englishStandard) {
    case 'toeic':
      standardSpecificInstructions = 'Focus on business and professional usage of the word';
      contextType = 'business or professional';
      break;
    case 'ielts':
      standardSpecificInstructions = 'Focus on academic and formal usage of the word';
      contextType = 'academic or formal';
      break;
    case 'cefr':
      standardSpecificInstructions = 'Focus on everyday communication usage according to CEFR standards';
      contextType = 'everyday communication';
      break;
    default:
      standardSpecificInstructions = 'Focus on general usage of the word';
      contextType = 'general';
  }

  return `
Generate detailed information about the English word "${word}" for ${englishStandard.toUpperCase()} learning.
${standardSpecificInstructions}.

The response must be in the following JSON format:

{
  "word": "${word}",
  "ipa": "IPA phonetic transcription",
  "meaning": "Vietnamese meaning of the word",
  "example": "An example sentence using the word in a ${contextType} context"
}

Requirements:
1. The IPA should be accurate phonetic transcription
2. The meaning should be in Vietnamese and appropriate for ${englishStandard.toUpperCase()} context
3. The example should be a simple, clear sentence using the word correctly in a ${contextType} context
4. Ensure the JSON is valid and properly formatted

Please generate the vocabulary information now.`;
}; 