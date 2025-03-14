// Base Topic interface chung cho tất cả các loại topic
export interface BaseTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Topic cho Reading
export interface ReadingTopic extends BaseTopic {
  questionsCount: number;
}

// Topic cho Translation
export interface TranslateTopic extends BaseTopic {
  sourceLanguage: string;
  targetLanguage: string;
  category: string;
}

// Topic cho Listening
export interface ListeningTopic extends BaseTopic {
  audioUrl?: string;
  duration?: number;
  transcriptAvailable: boolean;
}

// Topic cho Writing
export interface WritingTopic extends BaseTopic {
  wordLimit?: number;
  timeLimit?: number;
  category: string;
}

// Union type cho tất cả các loại topic
export type TopicUnion = ReadingTopic | TranslateTopic | ListeningTopic | WritingTopic; 