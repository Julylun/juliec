export interface ReadingTest {
  passage: string;
  questions: {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

export const generateReadingPrompt = (topic: string, difficulty: string) => `
Generate a TOEIC reading test about "${topic}" with difficulty level: ${difficulty}.

Requirements for the passage:
1. Length: 200-300 words
2. Content must be STRICTLY related to the topic "${topic}"
3. Use vocabulary and concepts specific to the topic
4. Include real-world examples or scenarios related to the topic
5. Maintain professional and formal language suitable for TOEIC
6. Difficulty should match the specified level (${difficulty})

Requirements for questions:
1. Include 4 questions
2. Each question must directly test understanding of the passage content
3. Questions should focus on:
   - Main ideas and key details
   - Specific information from the passage
   - Vocabulary in context
   - Implications or conclusions
4. Each question must have exactly 4 options
5. Options should be plausible but with only one clearly correct answer
6. Include detailed explanation for the correct answer

The response must be in the following JSON format:
{
  "passage": "The reading passage text here...",
  "questions": [
    {
      "id": 1,
      "text": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0, // Index of correct answer (0-3)
      "explanation": "Detailed explanation of why this answer is correct and why others are incorrect"
    }
  ]
}

Important:
- Ensure the passage and questions are at appropriate ${difficulty} level
- All content must be directly relevant to "${topic}"
- The JSON must be valid and properly formatted
- The correctAnswer must be a number (0-3)

Please generate the test now.`; 