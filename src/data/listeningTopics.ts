import { ListeningTopic } from '../types/topics';

export const listeningTopics: ListeningTopic[] = [
  {
    id: 'conversations',
    title: 'Conversations',
    description: 'Luyện nghe các đoạn hội thoại ngắn trong công việc',
    difficulty: 'easy',
    transcriptAvailable: true,
  },
  {
    id: 'announcements',
    title: 'Announcements',
    description: 'Luyện nghe các thông báo và chỉ dẫn',
    difficulty: 'medium',
    transcriptAvailable: true,
  },
  {
    id: 'talks',
    title: 'Short Talks',
    description: 'Luyện nghe các bài nói chuyện và thuyết trình',
    difficulty: 'hard',
    transcriptAvailable: true,
  },
  {
    id: 'news',
    title: 'News Reports',
    description: 'Luyện nghe tin tức và báo cáo',
    difficulty: 'hard',
    transcriptAvailable: true,
  },
  {
    id: 'meetings',
    title: 'Business Meetings',
    description: 'Luyện nghe các cuộc họp trong môi trường doanh nghiệp',
    difficulty: 'medium',
    transcriptAvailable: true,
  }
]; 