import React, { useState } from 'react';

const storyText = `
Once there was a young boy named Raj who lived in a small village. Raj was known for his honesty. 
One day, while walking home from school, he found a wallet on the ground. He opened it and saw a lot of money inside. 
Raj immediately thought about the person who had lost it. He knew that it was important to return it, 
so he decided to take the wallet to the village office. 

The village officer asked Raj, “How did you find this wallet?” Raj explained that he found it on the road while walking home from school. 
The officer was surprised by Raj’s honesty and said, “You could have kept this money for yourself, but instead, you brought it to me. That is very rare.” 

The owner of the wallet, who was a wealthy merchant, came to claim it. He thanked Raj and said, “I lost this wallet and was so worried. 
I appreciate your honesty. As a reward, I want to give you something.” But Raj, in his modesty, refused to accept any reward. 
He said, “I did what was right, and I don’t need any reward.” The merchant was impressed by Raj’s values and said, 
“You are an honest boy. Keep this money as a reward for your honesty.” Raj finally accepted the reward, but only because the merchant insisted. 
From that day on, Raj’s reputation as an honest boy spread throughout the village.
`;

export default function Level4Story_SD({ onComplete }) {
  const [hasRead, setHasRead] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white shadow-xl rounded-lg p-4 sm:p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 mb-4">
          The Story of the Honest Boy<br />
        </h2>

        <div className="text-gray-700 text-justify whitespace-pre-line leading-relaxed max-h-[60vh] overflow-y-auto border border-gray-200 rounded p-4 bg-gray-50">
          {storyText}
        </div>

        <div className="mt-6 space-y-3">
          {/* <button
            onClick={handlePlayStory}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            🔊 Play Story Aloud
          </button> */}

          {!hasRead ? (
            <button
              onClick={() => setHasRead(true)}
              className="w-full py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              I Have Read the Story
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Proceed to Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
