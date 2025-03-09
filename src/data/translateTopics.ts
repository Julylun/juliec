export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const translateTopics: Topic[] = [
  {
    id: 'random',
    title: 'Random Topics',
    description: 'Luyện dịch với các chủ đề ngẫu nhiên',
    difficulty: 'medium'
  },
  {
    id: 'business',
    title: 'Business Communication',
    description: 'Emails, memos, và thư tín doanh nghiệp',
    difficulty: 'medium'
  },
  {
    id: 'marketing',
    title: 'Marketing & Advertising',
    description: 'Chiến lược marketing, quảng cáo và khuyến mãi',
    difficulty: 'hard'
  },
  {
    id: 'technology',
    title: 'Technology & Innovation',
    description: 'Tin tức công nghệ, tài liệu sản phẩm và hướng dẫn',
    difficulty: 'hard'
  },
  {
    id: 'office',
    title: 'Office Management',
    description: 'Quy trình văn phòng, chính sách và quản lý',
    difficulty: 'easy'
  },
  {
    id: 'travel',
    title: 'Travel & Tourism',
    description: 'Hướng dẫn du lịch, lịch trình và thông tin du lịch',
    difficulty: 'easy'
  },
  {
    id: 'finance',
    title: 'Finance & Banking',
    description: 'Báo cáo tài chính, tài liệu ngân hàng và đầu tư',
    difficulty: 'hard'
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Medicine',
    description: 'Báo cáo y tế, cảnh báo sức khỏe và thông tin bệnh nhân',
    difficulty: 'hard'
  },
  {
    id: 'education',
    title: 'Education & Training',
    description: 'Tài liệu học thuật, mô tả khóa học và chính sách giáo dục',
    difficulty: 'medium'
  },
  {
    id: 'environment',
    title: 'Environment & Sustainability',
    description: 'Báo cáo môi trường, sáng kiến bảo tồn và thực hành bền vững',
    difficulty: 'medium'
  },
  {
    id: 'retail',
    title: 'Retail & E-commerce',
    description: 'Mô tả sản phẩm, đánh giá khách hàng và thông tin mua sắm',
    difficulty: 'easy'
  },
  {
    id: 'hospitality',
    title: 'Hospitality & Events',
    description: 'Thông tin khách sạn, lập kế hoạch sự kiện và dịch vụ khách hàng',
    difficulty: 'easy'
  },
  {
    id: 'legal',
    title: 'Legal & Compliance',
    description: 'Thông báo pháp lý, hợp đồng và tài liệu quy định',
    difficulty: 'hard'
  },
  {
    id: 'science',
    title: 'Science & Research',
    description: 'Bài báo khoa học, kết quả nghiên cứu và báo cáo thí nghiệm',
    difficulty: 'hard'
  },
  {
    id: 'transportation',
    title: 'Transportation & Logistics',
    description: 'Thông tin vận chuyển, lịch trình di chuyển và báo cáo hậu cần',
    difficulty: 'medium'
  },
  {
    id: 'food',
    title: 'Food & Nutrition',
    description: 'Công thức nấu ăn, thông tin dinh dưỡng và báo cáo ngành thực phẩm',
    difficulty: 'easy'
  }
]; 