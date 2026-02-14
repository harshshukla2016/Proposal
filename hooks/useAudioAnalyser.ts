
import { useRef, useEffect, useState, useCallback } from 'react';

interface AudioAnalyserResult {
  audioReady: boolean;
  getFrequencyData: () => Uint8Array;
  getAverageFrequency: () => number;
  startAudioContext: () => void; // Added for explicit context resume
}

export const useAudioAnalyser = (audioFileUrl: string): AudioAnalyserResult => {
  const [audioReady, setAudioReady] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>(new Uint8Array(0)); // Initialize with empty array
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize AudioContext and AnalyserNode once
  useEffect(() => {
    // FIX: Removed deprecated `window.webkitAudioContext` reference.
    // Modern browsers universally support `AudioContext`.
    if (!window.AudioContext) {
      console.warn("Web Audio API not supported in this browser.");
      return;
    }
    
    // Create AudioContext only if it doesn't exist.
    if (!audioContextRef.current) {
      // FIX: Removed deprecated `window.webkitAudioContext` fallback.
      // Instantiate `AudioContext` directly.
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.connect(audioContextRef.current.destination); // Connect to speakers
    }
  }, []);

  const startAudioContext = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => {
        console.log('AudioContext resumed!');
      }).catch(e => console.error("Error resuming AudioContext:", e));
    }
  }, []);

  // Load and play audio when URL changes or component mounts
  useEffect(() => {
    const audioContext = audioContextRef.current;
    const analyser = analyserRef.current;

    if (!audioContext || !analyser || !audioFileUrl) {
      return;
    }

    // Stop existing audio if any
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    setAudioReady(false); // Reset ready state

    const loadAudio = async () => {
      try {
        const response = await fetch(audioFileUrl);
        if (!response.ok) {
          throw new Error(`Failed to load audio file: ${response.status} ${response.statusText} for ${audioFileUrl}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        sourceNodeRef.current = audioContext.createBufferSource();
        sourceNodeRef.current.buffer = audioBuffer;
        sourceNodeRef.current.connect(analyser); // Connect source to analyser
        sourceNodeRef.current.loop = true; // Loop the background track
        sourceNodeRef.current.start(0);
        setAudioReady(true);
      } catch (error) {
        console.error("Error loading or decoding audio:", error);
        setAudioReady(false);
      }
    };

    loadAudio();

    // Cleanup: stop audio and disconnect on unmount
    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
    };
  }, [audioFileUrl]);

  const getFrequencyData = useCallback(() => {
    if (analyserRef.current && dataArrayRef.current.length > 0) { // Check length
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      return dataArrayRef.current;
    }
    return new Uint8Array(0);
  }, []);

  const getAverageFrequency = useCallback(() => {
    const data = getFrequencyData();
    if (data.length === 0) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
  }, [getFrequencyData]);

  return { audioReady, getFrequencyData, getAverageFrequency, startAudioContext };
};