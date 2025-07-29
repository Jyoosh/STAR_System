import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TooltipInfo from '../../common/TooltipInfo';

const questions = [
  {
    question: 'What was Raj known for in his village?',
    options: ['His strength', 'His honesty', 'His intelligence', 'His wealth'],
    answer: 'His honesty',
  },
  {
    question: 'What did Raj find one day while walking home from school?',
    options: ['A book', 'A wallet', 'A toy', 'A bicycle'],
    answer: 'A wallet',
  },
  {
    question: 'What did Raj do when he found the wallet with money inside?',
    options: ['Kept it', 'Threw it away', 'Took it to the village office', 'Gave it to a friend'],
    answer: 'Took it to the village office',
  },
  {
    question: 'How did the merchant react when he got his wallet back?',
    options: ['He was angry', 'He was grateful', 'He ignored Raj', 'He took Raj\'s money'],
    answer: 'He was grateful',
  },
  {
    question: 'What did Raj do when the merchant offered him a reward?',
    options: ['Accepted it', 'Refused it', 'Took half', 'Gave it to charity'],
    answer: 'Refused it',
  },
];

const Level4Quiz_SD = ({ onComplete }) => {
  const [responses, setResponses] = useState(Array(questions.length).fill(''));
  const [score, setScore] = useState(0);
  const [hasSentResult, setHasSentResult] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (index, value) => {
    const newResponses = [...responses];
    newResponses[index] = value;
    setResponses(newResponses);
  };

  const handleSubmit = () => {
    const newScore = responses.reduce((acc, response, index) => {
      return response === questions[index].answer ? acc + 1 : acc;
    }, 0);
    setScore(newScore);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-visible">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-xl overflow-visible">
          <div className="px-6 py-4">

            <div className="flex justify-center items-center gap-2 mb-4 relative">
              <TooltipInfo
                content={
                  <div>
                    <ul className="list-disc list-inside">
                      <li>Read each question carefully.</li>
                      <li>Select the best answer from the options.</li>
                      <li>Make sure all questions are answered before submitting.</li>
                      <li>You’ll get your score after submission.</li>
                      <li>Try to get all 5 correct!</li>
                    </ul>
                  </div>
                }
              />
              <h2 className="text-2xl font-bold text-center text-blue-700">
                Comprehension Quiz
              </h2>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-4"
              >
                <div className={`text-4xl font-bold mb-4 ${score === questions.length
                  ? 'text-green-500'
                  : score >= questions.length / 2
                    ? 'text-blue-500'
                    : 'text-amber-500'
                  }`}>
                  {score}/{questions.length}
                </div>
                <p className="text-lg text-gray-700 mb-6">
                  {score === questions.length
                    ? 'Perfect score! 🎉'
                    : score >= questions.length / 2
                      ? 'Good job! 👍'
                      : 'Keep practicing!'}
                </p>
                <button
                  onClick={() => {
                    if (hasSentResult) return;
                    setHasSentResult(true);
                    onComplete(score);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  See Results
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-2">
                {questions.map((q, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      {index + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((option, i) => (
                        <label
                          key={i}
                          className={`flex items-center p-3 rounded-md cursor-pointer transition ${responses[index] === option
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                            }`}
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={responses[index] === option}
                            onChange={() => handleChange(index, option)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 mr-3"
                          />
                          <span className="select-none">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!submitted && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <button
                onClick={handleSubmit}
                disabled={responses.some(response => response === '')}
                className={`w-full py-3 rounded-lg font-medium transition ${responses.some(response => response === '')
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                Submit Answers
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Level4Quiz_SD;
