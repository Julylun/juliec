import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReadingTest } from "../data/readingPrompt";
import { VocabularyInfo } from "../data/vocabularyPrompt";
import { GeminiModelVersion } from "../types/settings";

// Mock data để sử dụng khi API bị lỗi quota
const MOCK_READING_TESTS: { [key: string]: ReadingTest } = {
  "Business": {
    passage: `Dear Mr. Johnson,
I am writing to inform you about the upcoming changes to our company's health insurance plan. Effective January 1st, 2023, we will be transitioning to a new healthcare provider, Blue Cross Shield. This change is part of our ongoing efforts to provide better benefits to our employees while managing costs effectively.

The new plan offers several improvements over our current coverage:
- Lower monthly premiums for both individual and family plans
- Expanded network of healthcare providers
- Reduced co-pays for primary care visits
- Enhanced mental health coverage
- New telehealth services with no co-pay

During the transition period, all employees will need to complete new enrollment forms, even if you wish to maintain the same level of coverage. The HR department will be hosting information sessions throughout November to answer any questions and assist with the enrollment process.

Please review the enclosed brochure for detailed information about the new plans and coverage options. If you have any specific questions about how these changes might affect your current medical treatments or prescriptions, please contact HR directly.

We believe these changes will ultimately provide better healthcare options for you and your families while helping the company maintain competitive benefits in our industry.`,
    questions: [
      {
        id: 1,
        text: "What is the purpose of this letter?",
        options: [
          "To announce changes in health insurance",
          "To request a meeting",
          "To discuss company policy",
          "To schedule an appointment"
        ],
        correctAnswer: 0,
        explanation: "The letter clearly states in the first paragraph that its purpose is to inform about 'upcoming changes to our company's health insurance plan.'"
      },
      {
        id: 2,
        text: "When will the new health insurance plan take effect?",
        options: [
          "Immediately",
          "Next month",
          "January 1st, 2023",
          "During November"
        ],
        correctAnswer: 2,
        explanation: "The letter states 'Effective January 1st, 2023, we will be transitioning to a new healthcare provider.'"
      },
      {
        id: 3,
        text: "What is NOT mentioned as an improvement in the new plan?",
        options: [
          "Lower monthly premiums",
          "Dental coverage",
          "Reduced co-pays",
          "Telehealth services"
        ],
        correctAnswer: 1,
        explanation: "The letter mentions lower premiums, reduced co-pays, and telehealth services, but does not mention dental coverage."
      },
      {
        id: 4,
        text: "What will employees need to do during the transition?",
        options: [
          "Pay higher premiums",
          "Change their doctors",
          "Complete new enrollment forms",
          "Attend mandatory meetings"
        ],
        correctAnswer: 2,
        explanation: "The letter states 'all employees will need to complete new enrollment forms, even if you wish to maintain the same level of coverage.'"
      }
    ]
  },
  "Technology": {
    passage: `The Evolution of Artificial Intelligence in Business

Artificial intelligence (AI) has transformed from a theoretical concept to a critical business tool over the past decade. Companies across industries are increasingly integrating AI solutions to streamline operations, enhance customer experiences, and gain competitive advantages in the marketplace.

The most significant impact of AI in business has been in data analysis and decision-making processes. Traditional methods of analyzing large datasets were time-consuming and often produced limited insights. Modern AI systems can process massive amounts of information in seconds, identifying patterns and trends that human analysts might miss. This capability enables businesses to make more informed decisions based on comprehensive data analysis.

Customer service is another area where AI has made substantial inroads. Chatbots and virtual assistants now handle routine customer inquiries, providing immediate responses at any time of day. These AI-powered solutions not only reduce operational costs but also improve customer satisfaction by offering prompt service for common questions.

In manufacturing and supply chain management, AI systems optimize production schedules, predict maintenance needs, and forecast demand with unprecedented accuracy. These applications help companies reduce waste, minimize downtime, and ensure products reach customers efficiently.

Despite these advantages, the implementation of AI in business settings faces challenges. Many organizations struggle with integrating AI systems into their existing infrastructure. Additionally, there are ongoing concerns about data privacy, security, and the ethical implications of automated decision-making.

As AI technology continues to evolve, businesses must develop strategies that balance innovation with responsible implementation. Companies that successfully navigate these challenges will be well-positioned to leverage AI as a driver of growth and efficiency in the coming years.`,
    questions: [
      {
        id: 1,
        text: "According to the passage, what has been the most significant impact of AI in business?",
        options: [
          "Reducing operational costs",
          "Improving customer service",
          "Data analysis and decision-making",
          "Supply chain management"
        ],
        correctAnswer: 2,
        explanation: "The passage states 'The most significant impact of AI in business has been in data analysis and decision-making processes.'"
      },
      {
        id: 2,
        text: "How do AI-powered customer service solutions improve customer satisfaction?",
        options: [
          "By replacing human customer service representatives",
          "By providing immediate responses at any time",
          "By reducing the number of customer inquiries",
          "By collecting more customer data"
        ],
        correctAnswer: 1,
        explanation: "The passage mentions that chatbots and virtual assistants 'improve customer satisfaction by offering prompt service for common questions.'"
      },
      {
        id: 3,
        text: "What challenge do businesses face when implementing AI systems?",
        options: [
          "High employee turnover",
          "Decreasing customer demand",
          "Integration with existing infrastructure",
          "Increasing competition"
        ],
        correctAnswer: 2,
        explanation: "The passage states 'Many organizations struggle with integrating AI systems into their existing infrastructure.'"
      },
      {
        id: 4,
        text: "What is the main purpose of this passage?",
        options: [
          "To criticize businesses for slow AI adoption",
          "To explain how AI has evolved in business settings",
          "To compare different AI technologies",
          "To predict future AI developments"
        ],
        correctAnswer: 1,
        explanation: "The passage provides an overview of how AI has evolved from a theoretical concept to a practical business tool, discussing its applications and challenges."
      }
    ]
  }
};

// Mock data cho từ vựng
const MOCK_VOCABULARY: { [key: string]: VocabularyInfo } = {
  "company": {
    word: "company",
    ipa: "/ˈkʌm.pə.ni/",
    meaning: "công ty, doanh nghiệp",
    example: "He works for a large technology company."
  },
  "travel": {
    word: "travel",
    ipa: "/ˈtræv.əl/",
    meaning: "du lịch, đi lại",
    example: "I love to travel to new countries every year."
  },
  "business": {
    word: "business",
    ipa: "/ˈbɪz.nɪs/",
    meaning: "kinh doanh, việc làm ăn",
    example: "She started her own business last year."
  },
  "insurance": {
    word: "insurance",
    ipa: "/ɪnˈʃʊə.rəns/",
    meaning: "bảo hiểm",
    example: "Health insurance is important for everyone."
  },
  "effective": {
    word: "effective",
    ipa: "/ɪˈfek.tɪv/",
    meaning: "hiệu quả, có hiệu lực",
    example: "This is a very effective method of learning English."
  }
};

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private flashModel: any;
  private useMockData: boolean = false;
  private useFlashModel: boolean = false;

  constructor(apiKey: string, modelVersion: GeminiModelVersion = 'gemini-2.0-flash') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelVersion });
    this.flashModel = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log(`GeminiService khởi tạo thành công với model: ${modelVersion}`);
  }

  async generateReadingTest(prompt: string, topicTitle: string): Promise<ReadingTest | null> {
    // Nếu đã biết API bị lỗi quota, sử dụng mock data
    if (this.useMockData) {
      console.log("Đang sử dụng mock data do lỗi API trước đó");
      return this.getMockData(topicTitle);
    }

    try {
      // Chọn model phù hợp
      const activeModel = this.useFlashModel ? this.flashModel : this.model;
      console.log(`Đang gửi request đến model: ${this.useFlashModel ? 'gemini-2.0-flash' : 'gemini-2.0-pro-exp-02-05'}`);
      console.log("Prompt:", prompt);
      
      console.time("API Response Time");
      const result = await activeModel.generateContent(prompt);
      console.timeEnd("API Response Time");
      
      const response = await result.response;
      const text = response.text();
      
      console.log("=== RESPONSE FROM GOOGLE API ===");
      console.log(text);
      console.log("===============================");
      
      // Tìm và trích xuất phần JSON từ response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Không tìm thấy JSON trong response");
        return this.fallbackToMockData(topicTitle);
      }

      const jsonStr = jsonMatch[0];
      console.log("=== EXTRACTED JSON ===");
      console.log(jsonStr);
      console.log("=====================");
      
      try {
        const readingTest = JSON.parse(jsonStr) as ReadingTest;
        
        // Validate response format
        if (!this.validateReadingTest(readingTest)) {
          console.error("Response không đúng format, chi tiết:");
          console.error(this.getValidationErrors(readingTest));
          return this.fallbackToMockData(topicTitle);
        }
        
        console.log("Parsing JSON thành công, đã validate format");
        console.log(`Bài đọc có ${readingTest.passage.length} ký tự và ${readingTest.questions.length} câu hỏi`);
        
        return readingTest;
      } catch (parseError) {
        console.error("Lỗi khi parse JSON:", parseError);
        return this.fallbackToMockData(topicTitle);
      }
    } catch (error) {
      console.error("Lỗi khi gọi Gemini API:", error);
      
      const errorMessage = (error as Error).message || '';
      console.log("Chi tiết lỗi:", errorMessage);
      
      // Kiểm tra nếu lỗi là quota exceeded
      if (errorMessage.includes('429') || 
          errorMessage.includes('quota') || 
          errorMessage.includes('Resource has been exhausted')) {
        console.log("Phát hiện lỗi quota, chuyển sang sử dụng mock data");
        this.useMockData = true;
        return this.fallbackToMockData(topicTitle);
      }
      
      // Kiểm tra nếu lỗi là network error
      if (errorMessage.includes('NetworkError') || 
          errorMessage.includes('network') ||
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('timeout')) {
        
        // Nếu đang dùng model chính và gặp lỗi mạng, thử dùng flash model
        if (!this.useFlashModel) {
          console.log("Phát hiện lỗi mạng, chuyển sang sử dụng gemini-2.0-flash");
          this.useFlashModel = true;
          
          // Thử lại với flash model
          try {
            return await this.generateReadingTest(prompt, topicTitle);
          } catch (flashError) {
            console.error("Lỗi khi gọi Flash model:", flashError);
            // Nếu vẫn lỗi, dùng mock data
            this.useMockData = true;
          }
        } else {
          // Nếu đã dùng flash model mà vẫn lỗi, chuyển sang mock data
          console.log("Flash model cũng bị lỗi, chuyển sang sử dụng mock data");
          this.useMockData = true;
        }
      }
      
      return this.fallbackToMockData(topicTitle);
    }
  }

  async generateVocabularyInfo(prompt: string, word: string): Promise<VocabularyInfo | null> {
    // Nếu đã biết API bị lỗi quota, sử dụng mock data
    if (this.useMockData) {
      console.log("Đang sử dụng mock data cho từ vựng");
      return this.getMockVocabulary(word);
    }

    try {
      // Chọn model phù hợp
      const activeModel = this.useFlashModel ? this.flashModel : this.model;
      console.log(`Đang gửi request từ vựng đến model: ${this.useFlashModel ? 'gemini-2.0-flash' : 'gemini-2.0-pro-exp-02-05'}`);
      
      console.time("Vocabulary API Response Time");
      const result = await activeModel.generateContent(prompt);
      console.timeEnd("Vocabulary API Response Time");
      
      const response = await result.response;
      const text = response.text();
      
      // Tìm và trích xuất phần JSON từ response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Không tìm thấy JSON trong response từ vựng");
        return this.fallbackToMockVocabulary(word);
      }

      const jsonStr = jsonMatch[0];
      
      try {
        const vocabInfo = JSON.parse(jsonStr) as VocabularyInfo;
        
        // Validate response format
        if (!this.validateVocabularyInfo(vocabInfo)) {
          console.error("Response từ vựng không đúng format");
          return this.fallbackToMockVocabulary(word);
        }
        
        return vocabInfo;
      } catch (parseError) {
        console.error("Lỗi khi parse JSON từ vựng:", parseError);
        return this.fallbackToMockVocabulary(word);
      }
    } catch (error) {
      console.error("Lỗi khi gọi Gemini API cho từ vựng:", error);
      
      const errorMessage = (error as Error).message || '';
      
      // Kiểm tra nếu lỗi là quota exceeded hoặc network error
      if (errorMessage.includes('429') || 
          errorMessage.includes('quota') || 
          errorMessage.includes('Resource has been exhausted') ||
          errorMessage.includes('NetworkError') || 
          errorMessage.includes('network')) {
        
        this.useMockData = true;
      }
      
      return this.fallbackToMockVocabulary(word);
    }
  }

  private fallbackToMockVocabulary(word: string): VocabularyInfo | null {
    console.log("Sử dụng mock data cho từ vựng:", word);
    return this.getMockVocabulary(word);
  }

  private getMockVocabulary(word: string): VocabularyInfo | null {
    // Chuẩn hóa từ vựng
    const normalizedWord = word.toLowerCase().trim();
    
    // Tìm từ vựng trong mock data
    if (MOCK_VOCABULARY[normalizedWord]) {
      return MOCK_VOCABULARY[normalizedWord];
    }
    
    // Nếu không tìm thấy, trả về mock data mặc định
    return {
      word: normalizedWord,
      ipa: "/ˈsæm.pəl/",
      meaning: "Không tìm thấy nghĩa của từ này",
      example: "This is a sample sentence."
    };
  }

  private validateVocabularyInfo(info: any): info is VocabularyInfo {
    return (
      info.word && 
      typeof info.word === "string" &&
      info.ipa && 
      typeof info.ipa === "string" &&
      info.meaning && 
      typeof info.meaning === "string" &&
      info.example && 
      typeof info.example === "string"
    );
  }

  private fallbackToMockData(topicTitle: string): ReadingTest | null {
    console.log("Sử dụng mock data cho topic:", topicTitle);
    return this.getMockData(topicTitle);
  }

  private getMockData(topicTitle: string): ReadingTest | null {
    // Tìm mock data phù hợp với topic
    const normalizedTitle = topicTitle.toLowerCase();
    
    if (normalizedTitle.includes('business')) {
      console.log("Sử dụng mock data Business");
      return MOCK_READING_TESTS["Business"];
    } else if (normalizedTitle.includes('tech')) {
      console.log("Sử dụng mock data Technology");
      return MOCK_READING_TESTS["Technology"];
    } else {
      // Nếu không tìm thấy, trả về mock data mặc định
      console.log("Không tìm thấy mock data phù hợp, sử dụng mock data Business");
      return MOCK_READING_TESTS["Business"];
    }
  }

  private validateReadingTest(test: any): test is ReadingTest {
    if (!test.passage || typeof test.passage !== "string") return false;
    if (!Array.isArray(test.questions)) return false;

    for (const question of test.questions) {
      if (
        !question.id ||
        !question.text ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        typeof question.correctAnswer !== "number" ||
        !question.explanation
      ) {
        return false;
      }
    }

    return true;
  }
  
  private getValidationErrors(test: any): string {
    const errors = [];
    
    if (!test.passage) errors.push("Missing passage");
    else if (typeof test.passage !== "string") errors.push("Passage is not a string");
    
    if (!Array.isArray(test.questions)) errors.push("Questions is not an array");
    else {
      test.questions.forEach((q: any, index: number) => {
        if (!q.id) errors.push(`Question ${index}: Missing id`);
        if (!q.text) errors.push(`Question ${index}: Missing text`);
        if (!Array.isArray(q.options)) errors.push(`Question ${index}: Options is not an array`);
        else if (q.options.length !== 4) errors.push(`Question ${index}: Does not have exactly 4 options`);
        if (typeof q.correctAnswer !== "number") errors.push(`Question ${index}: correctAnswer is not a number`);
        if (!q.explanation) errors.push(`Question ${index}: Missing explanation`);
      });
    }
    
    return errors.join(", ");
  }

  public async generateContent(prompt: string): Promise<string | null> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content:', error);
      return null;
    }
  }
} 