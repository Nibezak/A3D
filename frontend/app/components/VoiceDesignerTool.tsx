'use client'

import { useState, useEffect } from 'react';
import { useEditorEngine } from '../context/EditorEngineContext';
import { Button } from './ui/button';

export const VoiceDesignerTool = () => {
  const { engine } = useEditorEngine();
  const voiceAIService = engine.getVoiceAIService();

  const [isRecording, setIsRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Click the button to start designing with your voice.');

  useEffect(() => {
    const handleTranscription = (text: string) => {
      setStatusMessage(`Processing: "${text}"`);
      voiceAIService.processPrompt(text);
    };

    // Assuming the VoiceAIService will have a way to subscribe to transcription events
    // For now, we'll use the window.electron API directly as a temporary measure
    // This will be refactored in a later step to go through the VoiceAIService
    if (window.electron) {
      window.electron.onTranscriptionReceived(handleTranscription);
    }

    return () => {
      // Cleanup if necessary
    };
  }, [voiceAIService]);

  const toggleRecording = () => {
    if (isRecording) {
      voiceAIService.stopListening();
      setIsRecording(false);
      setStatusMessage('Recording stopped. Waiting for transcription...');
    } else {
      voiceAIService.startListening();
      setIsRecording(true);
      setStatusMessage('Listening...');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button onClick={toggleRecording} variant={isRecording ? 'destructive' : 'default'}>
        {isRecording ? 'Stop Designing' : 'Start Voice Design'}
      </Button>
      <p className="text-sm text-gray-500">{statusMessage}</p>
    </div>
  );
};


