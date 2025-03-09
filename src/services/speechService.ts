/**
 * Service xử lý việc đọc văn bản bằng Web Speech API
 */
export class SpeechService {
  private static instance: SpeechService;
  private speechSynthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isVoicesLoaded: boolean = false;

  private constructor() {
    this.speechSynthesis = window.speechSynthesis;
    
    // Lấy danh sách giọng nói khi khởi tạo
    if (this.speechSynthesis) {
      // Chrome cần một chút thời gian để tải voices
      this.loadVoices();
      
      // Đăng ký sự kiện khi voices thay đổi
      this.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  /**
   * Lấy instance của SpeechService (Singleton pattern)
   */
  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  /**
   * Tải danh sách giọng nói
   */
  private loadVoices(): void {
    this.voices = this.speechSynthesis.getVoices();
    this.isVoicesLoaded = true;
    console.log(`Đã tải ${this.voices.length} giọng nói`);
  }

  /**
   * Kiểm tra xem trình duyệt có hỗ trợ Web Speech API không
   */
  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  /**
   * Lấy giọng nói phù hợp với ngôn ngữ
   * @param lang Mã ngôn ngữ (ví dụ: 'en-US', 'vi-VN')
   */
  private getVoice(lang: string): SpeechSynthesisVoice | null {
    if (!this.isVoicesLoaded) {
      this.loadVoices();
    }

    // Tìm giọng nói phù hợp với ngôn ngữ
    const voice = this.voices.find(v => v.lang.includes(lang));
    
    // Nếu không tìm thấy, trả về giọng nói mặc định
    return voice || this.voices[0] || null;
  }

  /**
   * Đọc văn bản với ngôn ngữ chỉ định
   * @param text Văn bản cần đọc
   * @param lang Mã ngôn ngữ (mặc định: 'en-US')
   * @param rate Tốc độ đọc (0.1 - 10, mặc định: 1)
   * @param pitch Cao độ (0 - 2, mặc định: 1)
   */
  public speak(text: string, lang: string = 'en-US', rate: number = 1, pitch: number = 1): void {
    if (!this.isSupported()) {
      console.error('Trình duyệt không hỗ trợ Web Speech API');
      return;
    }

    // Dừng tất cả các phát âm đang chạy
    this.stop();

    // Tạo đối tượng SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Thiết lập các thuộc tính
    utterance.lang = lang;
    utterance.rate = Math.max(0.1, Math.min(10, rate));
    utterance.pitch = Math.max(0, Math.min(2, pitch));
    
    // Thiết lập giọng nói
    const voice = this.getVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    // Thêm các sự kiện
    utterance.onstart = () => console.log('Bắt đầu đọc');
    utterance.onend = () => console.log('Kết thúc đọc');
    utterance.onerror = (event) => console.error('Lỗi khi đọc:', event);

    // Phát âm
    this.speechSynthesis.speak(utterance);
  }

  /**
   * Dừng tất cả các phát âm đang chạy
   */
  public stop(): void {
    if (this.isSupported()) {
      this.speechSynthesis.cancel();
    }
  }

  /**
   * Tạm dừng phát âm
   */
  public pause(): void {
    if (this.isSupported()) {
      this.speechSynthesis.pause();
    }
  }

  /**
   * Tiếp tục phát âm
   */
  public resume(): void {
    if (this.isSupported()) {
      this.speechSynthesis.resume();
    }
  }
} 