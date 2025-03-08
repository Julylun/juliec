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
Generate a TOEIC reading test about ${topic} with difficulty level: ${difficulty}.
The response must be in the following JSON format:

{
  "passage": "The reading passage text here...",
  "questions": [
    {
      "id": 1,
      "text": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0, // Index of correct answer (0-3)
      "explanation": "Explanation of the correct answer"
    }
  ]
}

Requirements:
1. The passage should be 200-300 words
2. Include 4 questions
3. Each question must have exactly 4 options
4. The content should be appropriate for TOEIC test
5. The difficulty should match the specified level
6. The passage and questions should be relevant to the topic
7. Ensure the JSON is valid and properly formatted
8. The correctAnswer must be a number (0-3) representing the index of the correct option

Please generate the test now.`; 