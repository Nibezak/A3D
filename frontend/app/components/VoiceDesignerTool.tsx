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
    const handleTranscription = (data: { text: string }) => {
      setStatusMessage(`Processing: "${data.text}"`);
    };

    voiceAIService.events.on('transcriptionReceived', handleTranscription);

    return () => {
      voiceAIService.events.off('transcriptionReceived', handleTranscription);
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


