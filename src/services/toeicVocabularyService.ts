import { GeminiService } from './geminiService';
import { GeminiModelVersion } from '../types/settings';

// Định nghĩa các chủ đề TOEIC cơ bản
export const TOEIC_TOPICS = [
  { id: 'business', name: 'Kinh doanh & Văn phòng', icon: '💼' },
  { id: 'technology', name: 'Công nghệ & Internet', icon: '💻' },
  { id: 'travel', name: 'Du lịch & Giao thông', icon: '✈️' },
  { id: 'health', name: 'Sức khỏe & Y tế', icon: '🏥' },
  { id: 'education', name: 'Giáo dục & Đào tạo', icon: '📚' },
  { id: 'entertainment', name: 'Giải trí & Thể thao', icon: '🎮' },
  { id: 'environment', name: 'Môi trường & Thiên nhiên', icon: '🌿' },
  { id: 'finance', name: 'Tài chính & Ngân hàng', icon: '💰' },
  { id: 'food', name: 'Ẩm thực & Nhà hàng', icon: '🍽️' },
  { id: 'shopping', name: 'Mua sắm & Dịch vụ', icon: '🛍️' }
];

export interface TopicVocabularyResponse {
  success: boolean;
  vocabularyList?: Array<{
    word: string;
    meaning: string;
    ipa: string;
    example: string;
    topic: string;
  }>;
  error?: string;
}

export class ToeicVocabularyService {
  private geminiService: GeminiService;

  constructor(apiKey: string, modelVersion: GeminiModelVersion) {
    this.geminiService = new GeminiService(apiKey, modelVersion);
  }

  private generateTopicPrompt(topic: string): string {
    return `Generate 10 essential TOEIC vocabulary words for the topic "${topic}" in the following JSON format:
{
  "vocabularyList": [
    {
      "word": "example",
      "meaning": "Vietnamese meaning",
      "ipa": "IPA pronunciation",
      "example": "Example sentence using the word"
    }
  ]
}
Please ensure:
1. Words are commonly used in TOEIC tests
2. Examples are business/professional context
3. Vietnamese meanings are clear and accurate
4. IPA is correct
5. All words are relevant to the topic
6. Response must be valid JSON format, starting with { and ending with }`;
  }

  private extractJsonFromText(text: string): string | null {
    console.log("=== Raw Response ===");
    console.log(text);
    console.log("==================");

    // Tìm chuỗi JSON hợp lệ bắt đầu bằng { và kết thúc bằng }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("Không tìm thấy chuỗi JSON hợp lệ trong response");
      return null;
    }

    const jsonStr = jsonMatch[0];
    console.log("=== Extracted JSON ===");
    console.log(jsonStr);
    console.log("=====================");

    // Kiểm tra xem chuỗi JSON có hợp lệ không
    try {
      JSON.parse(jsonStr);
      return jsonStr;
    } catch (error) {
      console.log("Chuỗi JSON không hợp lệ:", error);
      return null;
    }
  }

  public async generateVocabularyForTopic(topic: string): Promise<TopicVocabularyResponse> {
    try {
      console.log(`Bắt đầu tạo từ vựng cho chủ đề: ${topic}`);
      const prompt = this.generateTopicPrompt(topic);
      console.log("=== Prompt ===");
      console.log(prompt);
      console.log("=============");

      const response = await this.geminiService.generateContent(prompt);
      
      if (!response) {
        console.log("Không nhận được phản hồi từ Gemini API");
        throw new Error('Không nhận được phản hồi từ AI');
      }

      const jsonStr = this.extractJsonFromText(response);
      if (!jsonStr) {
        throw new Error('Không thể trích xuất JSON từ phản hồi');
      }

      // Parse and validate response
      const parsedResponse = JSON.parse(jsonStr);
      console.log("=== Parsed Response ===");
      console.log(parsedResponse);
      console.log("=====================");

      if (!parsedResponse.vocabularyList || !Array.isArray(parsedResponse.vocabularyList)) {
        console.log("Response thiếu trường vocabularyList hoặc không phải array");
        throw new Error('Định dạng phản hồi không hợp lệ');
      }

      // Add topic to each vocabulary item
      const vocabularyWithTopic = parsedResponse.vocabularyList.map((vocab: any) => ({
        ...vocab,
        topic
      }));

      console.log(`Đã tạo thành công ${vocabularyWithTopic.length} từ vựng`);
      return {
        success: true,
        vocabularyList: vocabularyWithTopic
      };
    } catch (error) {
      console.error("Lỗi khi tạo từ vựng:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định'
      };
    }
  }
} 