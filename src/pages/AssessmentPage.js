import React, { useState } from 'react';
import ReadingTest from '../components/Assessment/ReadingTest';
import TrialReadingTest from '../components/Assessment/TrialReadingTest';
import StartAssessmentModal from '../components/Assessment/StartAssessmentModal';

export default function AssessmentPage() {
  const [showModal, setShowModal] = useState(true);
  const [showTrial, setShowTrial] = useState(false);
  const [startAssessment, setStartAssessment] = useState(false);

  const handleTakeTrial = () => {
    setShowTrial(true);
    setShowModal(false);
  };

  const handleStartAssessment = () => {
    setStartAssessment(true);
    setShowModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold mb-4 text-center">📖 Reading Assessment</h2>

      {showModal && (
        <StartAssessmentModal
          onClose={() => setShowModal(false)}
          onTakeTrial={handleTakeTrial}
          onStartAssessment={handleStartAssessment}
        />
      )}

      {showTrial && (
        <TrialReadingTest onClose={() => {
          setShowTrial(false);
          setShowModal(true); // Optionally return to modal after trial
        }} />
      )}

      {startAssessment && <ReadingTest />}
    </div>
  );
}
