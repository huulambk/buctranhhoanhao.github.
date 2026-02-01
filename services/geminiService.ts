// Replaced Gemini TTS with native Web Speech API to remove API key requirement
export const initGemini = () => {
  // No initialization needed for Web Speech API
  // Kept for compatibility with existing imports
};

export const speakText = async (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      console.warn("Web Speech API not supported in this browser.");
      resolve();
      return;
    }

    // Cancel any ongoing speech to prevent overlap/queueing
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Set to English
    utterance.rate = 0.9; // Slightly slower for better clarity

    // Safety timeout in case onend doesn't fire (known browser quirk)
    const timeout = setTimeout(() => {
        resolve();
    }, 5000);

    utterance.onend = () => {
        clearTimeout(timeout);
        resolve();
    };
    
    utterance.onerror = (e) => {
        console.error("TTS Error", e);
        clearTimeout(timeout);
        resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
};
