import { WritingTopic } from '../types/topics';

export const writingTopics: WritingTopic[] = [
  {
    id: 'business-email',
    title: 'Business Email',
    description: 'Học cách viết email trong môi trường doanh nghiệp',
    difficulty: 'medium',
    wordLimit: 200,
    timeLimit: 30,
    category: 'business'
  },
  {
    id: 'report-writing',
    title: 'Report Writing',
    description: 'Luyện tập viết báo cáo và tài liệu chuyên nghiệp',
    difficulty: 'hard',
    wordLimit: 500,
    timeLimit: 60,
    category: 'business'
  },
  {
    id: 'memo-writing',
    title: 'Memo Writing',
    description: 'Thực hành viết ghi nhớ nội bộ trong công ty',
    difficulty: 'easy',
    wordLimit: 150,
    timeLimit: 20,
    category: 'business'
  },
  {
    id: 'proposal-writing',
    title: 'Proposal Writing',
    description: 'Học cách viết đề xuất và kế hoạch kinh doanh',
    difficulty: 'hard',
    wordLimit: 800,
    timeLimit: 90,
    category: 'business'
  },
  {
    id: 'letter-writing',
    title: 'Letter Writing',
    description: 'Luyện tập viết thư chính thức và không chính thức',
    difficulty: 'medium',
    wordLimit: 300,
    timeLimit: 45,
    category: 'general'
  }
]; 