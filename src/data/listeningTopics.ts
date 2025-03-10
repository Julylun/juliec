export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  audioUrl?: string;
}

export const listeningTopics: Topic[] = [
  {
    id: 'conversations',
    title: 'Conversations',
    description: 'Luyện nghe các đoạn hội thoại ngắn trong công việc',
    difficulty: 'easy',
  },
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Luyện nghe các thông báo và chỉ dẫn',
    difficulty: 'medium',
  },
  {
    id: 'talks',
    title: 'Short Talks',
    description: 'Luyện nghe các bài nói chuyện và thuyết trình',
    difficulty: 'hard',
  },
  {
    id: 'news',
    title: 'News Reports',
    description: 'Luyện nghe tin tức và báo cáo',
    difficulty: 'hard',
  },
  {
    id: 'meetings',
    title: 'Business Meetings',
    description: 'Luyện nghe các cuộc họp trong môi trường doanh nghiệp',
    difficulty: 'medium',
  }
]; 