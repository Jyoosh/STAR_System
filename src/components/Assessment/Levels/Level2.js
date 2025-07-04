import React, { useEffect, useRef, useState, useCallback } from 'react';
import Confetti from 'react-confetti';

const cvcWords = [
  { word: 'cat', context: 'Say "cat" as in "the cat is on the mat."' },
  { word: 'dog', context: 'Say "dog" as in "the dog is barking."' },
  { word: 'bat', context: 'Say "bat" as in "the bat flew in the night."' },
  { word: 'hat', context: 'Say "hat" as in "the hat is on my head."' },
  { word: 'mat', context: 'Say "mat" as in "the mat on the floor."' },
  { word: 'pen', context: 'Say "pen" as in "the pen is blue."' },
  { word: 'fan', context: 'Say "fan" as in "the fan is spinning."' },
  { word: 'man', context: 'Say "man" as in "the man is walking."' },
  { word: 'sun', context: 'Say "sun" as in "the sun is shining."' },
  { word: 'run', context: 'Say "run" as in "I like to run."' }
];

export default function Level2({ onComplete }) {
  const [words, setWords] = useState([]);
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

  const wordsRef = useRef([]);
  const idxRef = useRef(0);
  const recognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const countdownRef = useRef(null);

  const dingSound = '/assets/audio/sound_effects/ding.mp3';
  const incorrectSound = '/assets/audio/sound_effects/incorrect.mp3';

  const playSound = src => { new Audio(src).play().catch(err => console.warn(err)); };

  const advance = useCallback(() => {
    const next = idxRef.current + 1;
    if (next < wordsRef.current.length) {
      setIdx(next);
      setTranscript('');
      setFailCount(0);
      setStatus('🎙️ Ready for next word');
    } else {
      setShowConfetti(true);
      setStatus('🎉 Level complete!');
      setTimeout(() => onComplete(score), 1500);
      setCompleted(true);
    }
  }, [onComplete, score]);

  useEffect(() => {
    const shuffled = [...cvcWords].sort(() => 0.5 - Math.random()).slice(0, 10);
    setWords(shuffled);
    wordsRef.current = shuffled;
  }, []);

  useEffect(() => {
    idxRef.current = idx;
    setHasPlayed(false);
    setFailCount(0);
    setAnimation('');
    setTranscript('');
  }, [idx]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setStatus('❌ Speech Recognition not supported.');
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => recognitionRunningRef.current = true;
    recognition.onend = () => { recognitionRunningRef.current = false; setListening(false); };
    recognition.onerror = e => { setStatus(`⚠️ ${e.error}`); recognitionRunningRef.current = false; setListening(false); };
    recognition.onresult = e => {
      if (completed) return;
      const raw = e.results[0][0].transcript.trim();
      const heard = raw.split(/\s+/);
      const expected = wordsRef.current[idxRef.current]?.word;
      if (!expected) return setStatus('⚠️ No word to recognize.');
      const accepted = [expected.toLowerCase()];

      setTranscript(raw);
      setStatus('⏳ Processing...');

      const correct = heard.filter(w => accepted.includes(w.toLowerCase())).length;
      setTimeout(() => {
        if (completed) return;
        if (correct) {
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
          setStatus(`❌ Heard "${raw}". Try again (${tries}/3).`);
          if (tries >= 3) setTimeout(() => { setAnimation(''); advance(); }, 3000);
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
      if (cnt <= 0) { clearInterval(countdownRef.current); setStatus('🎤 Speak now!');
        setTimeout(() => { recognitionRef.current.start(); recognitionRunningRef.current = true; setListening(true); setStatus('🎧 Listening…'); }, 500);
      }
    }, 1000);
  };

  const stopListening = () => {
    if (recognitionRunningRef.current) { recognitionRef.current.abort(); recognitionRunningRef.current = false; }
    setListening(false);
    setStatus('🛑 Stopped');
  };

  const speakWord = onDone => {
    if (!speechReady) return setStatus('🧠 Initializing speech…');
    if (hasPlayed) return onDone && onDone();
    const word = words[idx]?.word;
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = 'en-US';
    utter.onend = () => { setHasPlayed(true); onDone && onDone(); };
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  };

  return (
    <>
      {showConfetti && <Confetti numberOfPieces={400} recycle={false} gravity={0.4} />}
      <div className="w-full sm:max-w-lg md:max-w-xl bg-white shadow-xl rounded-lg space-y-4 p-6 mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-blue-700">Level 2: CVC Recognition</h2>

        {completed ? (
          <div className="text-center text-lg text-green-700">
            ✅ You finished! Your score: <strong>{score}</strong> out of <strong>{words.length}</strong>.
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600">Word {idx + 1} of {words.length}</p>
            <div className={`text-6xl text-center font-extrabold text-indigo-700 ${animation}`}>{words[idx]?.word || '...'}</div>
            <p className="text-center text-gray-500">{words[idx]?.context || ''}</p>
            <p className="text-center text-gray-500">Attempt: {Math.min(failCount + 1, 3)} of 3</p>

            <button onClick={startListening} disabled={listening || countdown > 0} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">
              {countdown > 0 ? `⏳ ${countdown}` : (listening ? '🎧 Listening…' : '🎤 Start Listening')}
            </button>
            {listening && <button onClick={stopListening} className="w-full mt-2 py-2 bg-red-500 text-white rounded hover:bg-red-600">🛑 Stop</button>}
            {!hasPlayed && <button onClick={() => speakWord()} className="w-full mt-2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">🔊 Hear It</button>}
            <button onClick={advance} className="w-full mt-2 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">⏭️ Skip</button>

            <pre className="text-xs text-gray-700 mt-2">{status}</pre>
            {transcript && <p className="text-center text-gray-800"><strong>You said:</strong> {transcript}</p>}
          </>
        )}
      </div>
    </>
  );
}
