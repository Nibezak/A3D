import { EditorEngine } from '../EditorEngine';
import { ObjectManager } from '../managers/ObjectManager';
import { fal } from '@fal-ai/client';
import { Observer } from '../utils/Observer';

export interface VoiceAIServiceEvents {
  transcriptionReceived: { text: string };
}

export class VoiceAIService {
  private engine: EditorEngine;
  private objectManager: ObjectManager;
  private isListening: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  public events: Observer<VoiceAIServiceEvents>;

  constructor(engine: EditorEngine) {
    this.engine = engine;
    this.objectManager = engine.getObjectManager();
    this.events = new Observer();

    if (typeof window !== 'undefined' && window.electron) {
      window.electron.onTranscriptionReceived((text: string) => {
        this.events.emit('transcriptionReceived', { text });
        this.processPrompt(text);
      });
    }
  }

  public startListening(): void {
    if (this.isListening) {
      console.warn('Already listening.');
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = event => {
        this.audioChunks.push(event.data);
      };
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          window.electron.transcribeAudio(base64Audio);
        };
        this.audioChunks = [];
      };
      this.mediaRecorder.start();
      this.isListening = true;
      console.log('Started listening...');
    });
  }

  public stopListening(): void {
    if (!this.isListening) {
      console.warn('Not currently listening.');
      return;
    }
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.isListening = false;
      console.log('Stopped listening.');
    }
  }

  public async processPrompt(text: string): Promise<void> {
    console.log('Processing prompt:', text);

    const prompt = this.constructAIPrompt(text);

    try {
      const result: { output: any } = await fal.subscribe('fal-ai/llamacpp', {
        input: {
          prompt: prompt,
          max_tokens: 2048,
          temperature: 0.7,
        },
        logs: true,
      });

      if (result.output) {
        this.applySceneChanges(result.output);
      }
    } catch (error) {
      console.error('Error processing prompt with AI:', error);
    }
  }

  public applySceneChanges(sceneData: any): void {
    console.log('Applying scene changes:', sceneData);
    // This is where you would parse the sceneData and use the ObjectManager
    // to modify the scene. For example:
    if (sceneData.actions) {
      for (const action of sceneData.actions) {
        if (action.actionType === 'add') {
          // Example of adding a cube. You would need to extend this based on your schema.
          this.objectManager.addEntity(
            'shape',
            {
              shapeType: 'cube',
              position: action.properties.position || { x: 0, y: 0, z: 0 },
              scale: action.properties.scale || { x: 1, y: 1, z: 1 },
              rotation: action.properties.rotation || { x: 0, y: 0, z: 0 },
              color: action.properties.color || '#ffffff',
            },
            true,
          );
        }
      }
    }
  }

  private constructAIPrompt(userInput: string): string {
    return `
      You are a 3D scene design assistant. The user will give you a command, and you must respond with a JSON object that describes the scene modifications.

      The JSON schema for your response is as follows:
      {
        "actions": [
          {
            "actionType": "add" | "remove" | "modify",
            "entityType": "cube" | "sphere" | "light",
            "properties": {
              "position": { "x": number, "y": number, "z": number },
              "scale": { "x": number, "y": number, "z": number },
              "rotation": { "x": number, "y": number, "z": number },
              "color": "string (hex code)"
            }
          }
        ]
      }

      User command: "${userInput}"

      JSON response:
    `;
  }
}




