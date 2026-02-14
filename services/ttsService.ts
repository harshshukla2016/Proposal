
// This is a simplified Text-to-Speech service using the browser's Web Speech API.
// For higher quality, multi-speaker, or specific voice requirements, integrate with
// a cloud-based TTS service (e.g., Google Cloud Text-to-Speech or Gemini's TTS).

export const speakText = (text: string, onEnd?: () => void) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // You can change the language
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;

    if (onEnd) {
      utterance.onend = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech Synthesis API not supported in this browser.");
    if (onEnd) {
      // If TTS not supported, call onEnd immediately so flow continues
      onEnd();
    }
  }
};

export const cancelSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
    