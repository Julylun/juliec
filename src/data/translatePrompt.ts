export interface TranslateText {
  passage: string;
}

export interface TranslationFeedback {
  score: number;
  feedback: string;
  errors: {
    original: string;        // Phần dịch tiếng Việt có vấn đề
    suggestion: string;      // Đề xuất dịch tốt hơn
    explanation: string;     // Giải thích lỗi
    startIndex: number;      // Vị trí bắt đầu trong bản dịch tiếng Việt
    endIndex: number;        // Vị trí kết thúc trong bản dịch tiếng Việt
    errorType?: 'error' | 'suggestion'; // 'error' cho lỗi sai, 'suggestion' cho đề xuất cải thiện
    englishText?: string;    // Đoạn văn tiếng Anh tương ứng
  }[];
}

// Hàm tạo prompt dựa trên tiêu chuẩn tiếng Anh
export const generateTranslatePrompt = (topic: string, difficulty: string, englishStandard: string = 'toeic') => {
  let standardSpecificInstructions = '';
  
  // Thêm hướng dẫn cụ thể cho từng tiêu chuẩn
  switch (englishStandard) {
    case 'toeic':
      standardSpecificInstructions = `
8. Include vocabulary and expressions commonly found in TOEIC tests
9. Focus on business and workplace communication scenarios
10. Use practical, everyday English with some specialized business terminology`;
      break;
    case 'ielts':
      standardSpecificInstructions = `
8. Include academic vocabulary suitable for IELTS preparation
9. Incorporate complex sentence structures and advanced grammar
10. Cover topics that might appear in IELTS reading or writing tests`;
      break;
    case 'cefr':
      standardSpecificInstructions = `
8. Align with ${difficulty} level in the CEFR framework (A1-C2)
9. Include vocabulary and grammar structures appropriate for the specified CEFR level
10. Focus on practical communication scenarios relevant to European contexts`;
      break;
    default:
      standardSpecificInstructions = `
8. Include vocabulary and expressions commonly found in general English usage
9. Focus on practical, everyday communication
10. Use natural language patterns`;
  }

  return `
Generate an English passage about "${topic}" with difficulty level: ${difficulty} for a Vietnamese learner to translate into Vietnamese. The content should follow the ${englishStandard.toUpperCase()} standard.

Requirements for the passage:
1. Length: 300-500 words
2. Content must be STRICTLY related to the topic "${topic}"
3. Use vocabulary and concepts specific to the topic
4. Include real-world examples or scenarios related to the topic
5. Maintain professional and formal language
6. Difficulty should match the specified level (${difficulty})
7. The passage should be coherent, informative, and engaging${standardSpecificInstructions}

The response must be in the following JSON format:
{
  "passage": "The English passage text here..."
}

Important:
- Ensure the passage is at appropriate ${difficulty} level for ${englishStandard.toUpperCase()} standard
- All content must be directly relevant to "${topic}"
- The JSON must be valid and properly formatted
- The passage should be suitable for translation practice

Please generate the passage now.`;
};

// Prompt để đánh giá bản dịch của người dùng
export const generateFeedbackPrompt = (originalText: string, userTranslation: string, englishStandard: string = 'toeic') => {
  let standardSpecificInstructions = '';
  
  // Thêm hướng dẫn cụ thể cho từng tiêu chuẩn
  switch (englishStandard) {
    case 'toeic':
      standardSpecificInstructions = `
- Pay special attention to business and workplace terminology
- Evaluate accuracy in translating professional communication contexts
- Consider if the translation maintains the formal tone appropriate for business settings`;
      break;
    case 'ielts':
      standardSpecificInstructions = `
- Evaluate academic vocabulary usage and complex sentence structures
- Pay attention to nuance and precision in academic context
- Consider if the translation maintains the academic tone and complexity`;
      break;
    case 'cefr':
      standardSpecificInstructions = `
- Evaluate according to CEFR standards and level-appropriate language
- Consider cultural context and European communication norms
- Pay attention to functional language appropriate for real-life situations`;
      break;
    default:
      standardSpecificInstructions = `
- Evaluate general accuracy and natural expression
- Consider if the translation sounds natural to Vietnamese speakers
- Pay attention to cultural context and appropriate expressions`;
  }

  return `
You are a professional English-Vietnamese translator and language teacher specializing in ${englishStandard.toUpperCase()} standards. Please evaluate the following Vietnamese translation of an English text.

Original English text:
"""
${originalText}
"""

User's Vietnamese translation:
"""
${userTranslation}
"""

Please provide a detailed evaluation of the translation with the following:

1. Score the translation on a scale of 0-100 based on accuracy, fluency, and naturalness
2. Provide general feedback about the translation quality, strengths, and areas for improvement
3. Identify specific errors or awkward translations, and suggest better alternatives${standardSpecificInstructions}

Format your response as a JSON object with the following structure:
{
  "score": number,
  "feedback": "General feedback about the translation",
  "errors": [
    {
      "original": "The problematic translated text in Vietnamese",
      "suggestion": "Better translation suggestion in Vietnamese",
      "explanation": "Why this is an error or how it could be improved",
      "startIndex": number, // The starting character index of the error in the user's translation
      "endIndex": number, // The ending character index of the error in the user's translation
      "errorType": "error" or "suggestion", // Use "error" for actual errors, "suggestion" for stylistic improvements
      "englishText": "The corresponding English text from the original passage"
    }
  ]
}

Important notes:
- Be thorough but fair in your assessment
- Classify each issue as either:
  * "error" for actual translation errors, grammar mistakes, or incorrect meaning
  * "suggestion" for stylistic improvements, better word choices, or more natural phrasing
- For each error or suggestion, include the corresponding English text from the original passage
- Provide constructive feedback that helps the learner improve
- Ensure the JSON is valid and properly formatted
- The startIndex and endIndex should accurately identify the location of each error in the user's translation

Please provide your evaluation now.`; 
}; 