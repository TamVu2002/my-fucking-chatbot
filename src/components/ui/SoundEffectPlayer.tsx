'use client';

import { useEffect, useRef, useState } from 'react';

interface SoundConfig {
  volume: number;
  enabled: boolean;
}

interface SoundEffectPlayerProps {
  enabled?: boolean;
  volume?: number;
}

type SoundType = 'send' | 'receive' | 'typing' | 'error' | 'notification';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, AudioBuffer> = new Map();
  private config: SoundConfig = { volume: 0.5, enabled: true };
  constructor() {
    if (typeof window !== 'undefined') {
      try {
        // Type assertion for webkit compatibility
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioContextClass();
        this.initializeSounds();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
  }

  private async initializeSounds() {
    if (!this.audioContext) return;

    // Generate synthetic sounds using Web Audio API
    const sounds: Record<SoundType, () => AudioBuffer> = {
      send: () => this.createTone(800, 0.1, 'sine'),
      receive: () => this.createTone(600, 0.15, 'sine'),
      typing: () => this.createTone(400, 0.05, 'square'),
      error: () => this.createTone(300, 0.2, 'sawtooth'),
      notification: () => this.createChime()
    };

    for (const [type, generator] of Object.entries(sounds)) {
      try {
        this.sounds.set(type as SoundType, generator());
      } catch (error) {
        console.warn(`Failed to create ${type} sound:`, error);
      }
    }
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
          break;
        case 'sawtooth':
          sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
          break;
        default:
          sample = Math.sin(2 * Math.PI * frequency * t);
      }

      // Apply envelope (fade in/out)
      const envelope = Math.min(1, Math.min(i / (sampleRate * 0.01), (length - i) / (sampleRate * 0.01)));
      data[i] = sample * envelope * 0.3;
    }

    return buffer;
  }

  private createChime(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const length = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a pleasant chime with multiple harmonics
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 chord

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      frequencies.forEach((freq, index) => {
        const amplitude = 1 / (index + 1); // Decreasing amplitude for harmonics
        sample += Math.sin(2 * Math.PI * freq * t) * amplitude;
      });

      // Apply envelope
      const envelope = Math.exp(-t * 3) * Math.min(1, i / (sampleRate * 0.01));
      data[i] = sample * envelope * 0.2;
    }

    return buffer;
  }

  updateConfig(config: Partial<SoundConfig>) {
    this.config = { ...this.config, ...config };
  }

  async play(soundType: SoundType) {
    if (!this.config.enabled || !this.audioContext || !this.sounds.has(soundType)) {
      return;
    }

    try {
      // Resume AudioContext if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const buffer = this.sounds.get(soundType);
      if (!buffer) return;

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = buffer;
      gainNode.gain.value = this.config.volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      console.warn(`Failed to play ${soundType} sound:`, error);
    }
  }
}

// Singleton instance
let soundManager: SoundManager | null = null;

export const useSoundEffects = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (typeof window !== 'undefined' && !soundManager) {
      soundManager = new SoundManager();
    }
  }, []);

  useEffect(() => {
    if (soundManager) {
      soundManager.updateConfig({ enabled: isEnabled, volume });
    }
  }, [isEnabled, volume]);

  const playSound = async (soundType: SoundType) => {
    if (soundManager) {
      await soundManager.play(soundType);
    }
  };

  return {
    playSound,
    isEnabled,
    setIsEnabled,
    volume,
    setVolume
  };
};

export const SoundEffectPlayer: React.FC<SoundEffectPlayerProps> = ({ 
  enabled = true, 
  volume = 0.5 
}) => {
  const managerRef = useRef<SoundManager | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !managerRef.current) {
      managerRef.current = new SoundManager();
      soundManager = managerRef.current;
    }
  }, []);

  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.updateConfig({ enabled, volume });
    }
  }, [enabled, volume]);

  // This component doesn't render anything, it just manages sound
  return null;
};

export default SoundEffectPlayer;