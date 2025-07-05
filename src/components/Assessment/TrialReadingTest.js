import React, { useEffect, useRef, useState, useCallback } from 'react';
import Confetti from 'react-confetti';

const aliases = {
  A: ['ay', 'a'], B: ['bee', 'be'], C: ['see', 'sea'], D: ['dee', 'd'], E: ['ee', 'e'],
  F: ['ef', 'eff'], G: ['gee'], H: ['aitch', 'h'], I: ['eye', 'i'], J: ['jay'],
  K: ['kay'], L: ['el'], M: ['em'], N: ['en'], O: ['oh'], P: ['pee'], Q: ['queue', 'cue'],
  R: ['ar', 'are'], S: ['ess'], T: ['tee'], U: ['you', 'yew', 'u'], V: ['vee'],
  W: ['double you'], X: ['ex'], Y: ['why'], Z: ['zee', 'zed']
};

export default function TrialReadingTest({ onClose }) {
  const [letters, setLetters] = useState([]);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('🔄 Preparing...');
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [animation, setAnimation] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);

  const lettersRef = useRef([]);
  const idxRef = useRef(0);
  const recognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const countdownRef = useRef(null);

  const dingSound = '/assets/audio/sound_effects/ding.mp3';
  const incorrectSound = '/assets/audio/sound_effects/incorrect.mp3';

  const sampleWord = letter => ({
    A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Elephant',
    F: 'Fish', G: 'Goat', H: 'Hat', I: 'Igloo', J: 'Jam',
    K: 'Kite', L: 'Lion', M: 'Monkey', N: 'Nose', O: 'Orange',
    P: 'Pig', Q: 'Queen', R: 'Rabbit', S: 'Sun', T: 'Tiger',
    U: 'Umbrella', V: 'Violin', W: 'Whale', X: 'Xylophone',
    Y: 'Yak', Z: 'Zebra'
  })[letter] || '';

  const playSound = src => { new Audio(src).play().catch(err => console.warn(err)); };

  const advance = useCallback(() => {
    const next = idxRef.current + 1;
    if (next < lettersRef.current.length) {
      setIdx(next);
      setTranscript('');
      setFailCount(0);
      setStatus('🎙️ Ready for next letter');
    } else {
      setShowConfetti(true);
      setStatus('🎉 Trial complete!');
      setCompleted(true);
    }
  }, []);

  const skipToResults = () => {
    setCompleted(true);
    setShowConfetti(true);
    setStatus('🎉 Skipped to results.');
  };

  useEffect(() => {
    const randomLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').sort(() => 0.5 - Math.random()).slice(0, 5);
    setLetters(randomLetters);
    lettersRef.current = randomLetters;
  }, []);

  useEffect(() => {
    idxRef.current = idx;
    setHasPlayed(false);
    setFailCount(0);
    setAnimation('');
    setTranscript('');
  }, [idx]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return setStatus('❌ Speech Recognition not supported.');

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => recognitionRunningRef.current = true;
    recognition.onend = () => { recognitionRunningRef.current = false; setListening(false); };
    recognition.onerror = e => { setStatus(`⚠️ ${e.error}`); recognitionRunningRef.current = false; setListening(false); };
    recognition.onresult = event => {
      if (completed) return;
      const raw = event.results[0][0].transcript.trim();
      const heardWords = raw.split(/\s+/);
      const expected = lettersRef.current[idxRef.current];
      const accepted = [expected.toLowerCase(), ...(aliases[expected]||[]).map(a=>a.toLowerCase())];

      setTranscript(raw);
      setStatus('⏳ Processing...');

      const correctCount = heardWords.filter(w => accepted.includes(w.toLowerCase())).length;
      setTimeout(() => {
        if (completed) return;
        if (correctCount) {
          playSound(dingSound);
          setStatus(`✅ Correct: "${raw}"`);
          setScore(s => s + 1);
          setAnimation('animate-bounce');
          setTimeout(() => { setAnimation(''); advance(); }, 1000);
        } else {
          const tries = failCount + 1;
          setFailCount(tries);
          playSound(incorrectSound);
          setAnimation('animate-shake');

          if (tries >= 3) {
            setStatus(`❌ Incorrect 3 times. Say "${expected}" as in "${sampleWord(expected)}".`);
            setTimeout(() => { setAnimation(''); advance(); }, 3000);
          } else {
            setStatus(`❌ Heard "${raw}". Try again (${tries}/3).`);
            setTimeout(() => setAnimation(''), 1000);
          }
        }
      }, 1000);
    };

    recognitionRef.current = recognition;
    setStatus('✅ Ready to start');
  }, [failCount, advance, completed]);

  useEffect(() => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) setSpeechReady(true);
    else speechSynthesis.onvoiceschanged = () => setSpeechReady(true);
  }, []);

  const startListening = () => {
    if (!speechReady) return setStatus('🧠 Initializing speech…');
    if (!recognitionRef.current || recognitionRunningRef.current) return;

    let cnt = 3;
    setCountdown(cnt);
    setStatus('⏳ Get ready...');
    countdownRef.current = setInterval(() => {
      cnt--; setCountdown(cnt);
      if (cnt <= 0) {
        clearInterval(countdownRef.current);
        setStatus('🎤 Speak now!');
        setTimeout(() => {
          try { recognitionRef.current.start(); recognitionRunningRef.current = true; setListening(true); setStatus('🎧 Listening…'); }
          catch { setStatus('⚠️ Mic error.'); }
        }, 500);
      }
    }, 1000);
  };

  const stopListening = () => {
    if (recognitionRunningRef.current) {
      recognitionRef.current.abort(); recognitionRunningRef.current = false;
    }
    setListening(false);
    setStatus('🛑 Stopped');
  };

  const speakLetter = onDone => {
    if (!speechReady) return setStatus('🧠 Initializing speech…');
    if (hasPlayed) return onDone && onDone();

    const letter = letters[idx];
    const utter = new SpeechSynthesisUtterance(`${letter}, as in ${sampleWord(letter)}`);
    utter.lang = 'en-US';
    utter.rate = 1;
    utter.onend = () => { setHasPlayed(true); setStatus('🕒 Get ready...'); onDone && onDone(); };
    speechSynthesis.cancel(); speechSynthesis.speak(utter);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
      {showConfetti && <Confetti numberOfPieces={400} recycle={false} gravity={0.4} />}
      <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl" title="Exit trial">✖</button>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 mb-4">🧪 Alphabet Trial</h2>

        {completed ? (
          <div className="text-center text-lg sm:text-xl text-green-700">
            ✅ You finished! Your score: <strong>{score}</strong> out of <strong>{letters.length}</strong>.
            <button onClick={onClose} className="mt-6 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">🎉 Finish</button>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 text-sm">Letter {idx + 1} of {letters.length}</p>
            <div className={`text-6xl font-extrabold text-center text-indigo-700 ${animation}`}>{letters[idx]}</div>
            <p className="text-center text-gray-500 text-sm mb-1">Say: <strong>{letters[idx]} as in "{sampleWord(letters[idx])}"</strong></p>
            <p className="text-center text-gray-500 text-sm">Attempt: <strong>{Math.min(failCount + 1, 3)} of 3</strong></p>

            <button onClick={startListening} disabled={listening || countdown > 0} className="w-full mt-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-lg">
              {countdown > 0 ? `⏳ ${countdown}` : (listening ? '🎧 Listening…' : '🎤 Start Listening')}
            </button>
            {listening && <button onClick={stopListening} className="w-full mt-2 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-lg">🛑 Stop</button>}
            {!hasPlayed && <button onClick={() => speakLetter()} className="w-full mt-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-lg">🔊 Hear How to Say It</button>}
            {idx < letters.length - 1 ? (
              <button onClick={advance} className="w-full mt-2 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-lg">⏭️ Skip Letter</button>
            ) : (
              <button onClick={skipToResults} className="w-full mt-2 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-lg">⏩ Skip to Results</button>
            )}

            <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-line mt-4">{status}</pre>
            {transcript && <p className="text-center text-gray-800 mt-1"><strong>You said:</strong> {transcript}</p>}
          </>
        )}
      </div>
    </div>
  );
}
