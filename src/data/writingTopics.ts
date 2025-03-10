export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const writingTopics: Topic[] = [
  {
    id: 'business-email',
    title: 'Business Email',
    description: 'Học cách viết email trong môi trường doanh nghiệp',
    difficulty: 'medium'
  },
  {
    id: 'report-writing',
    title: 'Report Writing',
    description: 'Luyện tập viết báo cáo và tài liệu chuyên nghiệp',
    difficulty: 'hard'
  },
  {
    id: 'memo-writing',
    title: 'Memo Writing',
    description: 'Thực hành viết ghi nhớ nội bộ trong công ty',
    difficulty: 'easy'
  },
  {
    id: 'proposal-writing',
    title: 'Proposal Writing',
    description: 'Học cách viết đề xuất và kế hoạch kinh doanh',
    difficulty: 'hard'
  },
  {
    id: 'letter-writing',
    title: 'Letter Writing',
    description: 'Luyện tập viết thư chính thức và không chính thức',
    difficulty: 'medium'
  }
]; 