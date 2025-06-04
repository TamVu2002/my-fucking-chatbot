'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square,
  Download,
  Upload,
  Settings,
  AudioWaveform,
  Languages
} from 'lucide-react';
import { AnimatedDiv, AnimatedButton } from '@/components/ui/animations';

// Extend the Window interface to include speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  }
  
  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  };
}

// Add type for SpeechRecognition events
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface VoiceSettings {
  tts: {
    enabled: boolean;
    voice: string;
    rate: number;
    pitch: number;
    volume: number;
    autoPlay: boolean;
  };
  stt: {
    enabled: boolean;
    language: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
  };
}

interface AudioRecording {
  id: string;
  timestamp: number;
  duration: number;
  transcript: string;
  confidence: number;
  blob?: Blob;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  tts: {
    enabled: true,
    voice: '',
    rate: 1,
    pitch: 1,
    volume: 0.8,
    autoPlay: false
  },
  stt: {
    enabled: true,
    language: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 1
  }
};

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish (Spain)' },
  { code: 'es-MX', name: 'Spanish (Mexico)' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' }
];

interface VoiceIntegrationProps {
  onTranscript?: (text: string) => void;
  onSpeech?: (text: string) => void;
  className?: string;
}

export default function VoiceIntegration({ onTranscript, onSpeech, className = '' }: VoiceIntegrationProps) {
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setAvailableVoices(voices);
        
        if (!settings.tts.voice && voices.length > 0) {
          const defaultVoice = voices.find(voice => voice.default) || voices[0];
          setSettings(prev => ({
            ...prev,
            tts: { ...prev.tts, voice: defaultVoice.name }
          }));
        }
      };

      loadVoices();
      synthRef.current.addEventListener('voiceschanged', loadVoices);

      return () => {
        synthRef.current?.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [settings.tts.voice]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();      const recognition = recognitionRef.current;
      if (!recognition) return;
      
      recognition.continuous = settings.stt.continuous;
      recognition.interimResults = settings.stt.interimResults;
      recognition.lang = settings.stt.language;
      recognition.maxAlternatives = settings.stt.maxAlternatives;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
          if (onTranscript) {
            onTranscript(finalTranscript);
          }
          
          // Save recording
          const recording: AudioRecording = {
            id: `recording-${Date.now()}`,
            timestamp: Date.now(),
            duration: 0, // Would need to track actual duration
            transcript: finalTranscript,
            confidence: event.results[event.results.length - 1][0].confidence || 0
          };
          setRecordings(prev => [recording, ...prev.slice(0, 9)]); // Keep last 10
        }

        setInterimTranscript(interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, [settings.stt, onTranscript]);

  // Audio level monitoring
  const startAudioLevelMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 255);
        }
        if (isListening) {
          requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, [isListening]);

  const stopAudioLevelMonitoring = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && settings.stt.enabled) {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
      startAudioLevelMonitoring();
    }
  }, [settings.stt.enabled, startAudioLevelMonitoring]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      stopAudioLevelMonitoring();
    }
  }, [stopAudioLevelMonitoring]);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !settings.tts.enabled) return;

    // Stop any current speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = availableVoices.find(voice => voice.name === settings.tts.voice);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = settings.tts.rate;
    utterance.pitch = settings.tts.pitch;
    utterance.volume = settings.tts.volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    
    if (onSpeech) {
      onSpeech(text);
    }
  }, [settings.tts, availableVoices, onSpeech]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      tts: { ...prev.tts, ...(newSettings.tts || {}) },
      stt: { ...prev.stt, ...(newSettings.stt || {}) }
    }));
  }, []);

  const exportRecordings = useCallback(() => {
    const data = {
      recordings,
      settings,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-recordings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [recordings, settings]);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <AudioWaveform className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Voice Integration
              </h3>
            </div>
            
            {isListening && (
              <motion.div
                className="flex items-center space-x-2 text-red-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm">Listening...</span>
              </motion.div>
            )}
            
            {isSpeaking && (
              <motion.div
                className="flex items-center space-x-2 text-green-500"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-sm">Speaking...</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <AnimatedButton
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              size="sm"
            >
              <Settings className="w-4 h-4" />
            </AnimatedButton>

            <AnimatedButton
              onClick={exportRecordings}
              variant="ghost"
              size="sm"
              disabled={recordings.length === 0}
            >
              <Download className="w-4 h-4" />
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* TTS Settings */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Text-to-Speech</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.tts.enabled}
                        onChange={(e) => updateSettings({ tts: { ...settings.tts, enabled: e.target.checked } })}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300">Enable TTS</label>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Voice</label>
                      <select
                        value={settings.tts.voice}
                        onChange={(e) => updateSettings({ tts: { ...settings.tts, voice: e.target.value } })}
                        className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        {availableVoices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Rate: {settings.tts.rate}
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.tts.rate}
                        onChange={(e) => updateSettings({ tts: { ...settings.tts, rate: parseFloat(e.target.value) } })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Pitch: {settings.tts.pitch}
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={settings.tts.pitch}
                        onChange={(e) => updateSettings({ tts: { ...settings.tts, pitch: parseFloat(e.target.value) } })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* STT Settings */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Speech-to-Text</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.stt.enabled}
                        onChange={(e) => updateSettings({ stt: { ...settings.stt, enabled: e.target.checked } })}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300">Enable STT</label>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Language</label>
                      <select
                        value={settings.stt.language}
                        onChange={(e) => updateSettings({ stt: { ...settings.stt, language: e.target.value } })}
                        className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.stt.continuous}
                        onChange={(e) => updateSettings({ stt: { ...settings.stt, continuous: e.target.checked } })}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300">Continuous recognition</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.stt.interimResults}
                        onChange={(e) => updateSettings({ stt: { ...settings.stt, interimResults: e.target.checked } })}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300">Show interim results</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Controls */}
      <div className="p-4">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <AnimatedButton
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            disabled={!settings.stt.enabled}
            className="relative"
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-lg bg-red-500 opacity-20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </AnimatedButton>

          <AnimatedButton
            onClick={isSpeaking ? stopSpeaking : undefined}
            variant={isSpeaking ? "destructive" : "ghost"}
            size="lg"
            disabled={!settings.tts.enabled || !isSpeaking}
          >
            {isSpeaking ? <Square className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </AnimatedButton>
        </div>

        {/* Audio Level Indicator */}
        {isListening && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                animate={{ width: `${audioLevel * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        )}

        {/* Transcript Display */}
        {(transcript || interimTranscript) && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transcript:</div>
            <div className="text-gray-900 dark:text-white">
              {transcript}
              {interimTranscript && (
                <span className="text-gray-500 dark:text-gray-400 italic">
                  {interimTranscript}
                </span>
              )}
            </div>
            {confidence > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Confidence: {(confidence * 100).toFixed(1)}%
              </div>
            )}
          </div>
        )}

        {/* Recent Recordings */}
        {recordings.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Recent Recordings</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {recordings.slice(0, 5).map((recording) => (
                <div
                  key={recording.id}
                  className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                >
                  <div className="text-gray-900 dark:text-white">
                    {recording.transcript}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{new Date(recording.timestamp).toLocaleTimeString()}</span>
                    <span>Confidence: {(recording.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
