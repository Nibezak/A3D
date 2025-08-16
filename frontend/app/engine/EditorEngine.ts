import { ImportService } from './services/ImportService';
import { VoiceAIService } from './services/VoiceAIService';

export class EditorEngine {
  private fileImportService: ImportService;
  private voiceAIService: VoiceAIService;
  
  constructor() {
    // Initialize services
    this.fileImportService = new ImportService(this);
    this.voiceAIService = new VoiceAIService(this);
  }
  
  /**
   * Get file import service
   * @returns FileImportService instance
   */
  public getFileImportService(): ImportService {
    return this.fileImportService;
  }

  /**
   * Get voice AI service
   * @returns VoiceAIService instance
   */
  public getVoiceAIService(): VoiceAIService {
    return this.voiceAIService;
  }
} 
