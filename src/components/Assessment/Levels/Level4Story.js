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

const Level4Story = ({ onComplete }) => {
  const [hasRead, setHasRead] = useState(false);

  const handleProceed = () => {
    setHasRead(true);
    onComplete(); // Proceed to the quiz
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4 sm:px-6">
      <div className="w-full sm:max-w-lg md:max-w-xl bg-white shadow-xl rounded-lg space-y-4 p-4 sm:p-6 md:p-8 relative">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-blue-700">Story of the Honest Boy</h2>
        <p className="text-gray-600 text-center mb-4">{storyText}</p>
        <button
          onClick={handleProceed}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={hasRead}
        >
          {hasRead ? 'Proceed to Quiz' : 'I Have Read the Story'}
        </button>
      </div>
    </div>
  );
};

export default Level4Story;
