import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaSignInAlt } from 'react-icons/fa';
import { ReactComponent as StarLogo } from '../assets/STAR_Logo.svg';
import Lottie from 'lottie-react';
import welcomeAnimation from '../animations/welcome.json';
import readingAnimation from '../animations/reading.json';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const imageCount = 16;

export default function Landing() {
  const [modalIndex, setModalIndex] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const touchStartX = useRef(null);

  const handleOpen = (index) => setModalIndex(index);
  const handleClose = () => setModalIndex(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX.current - touchEndX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        setModalIndex((prev) => (prev + 1) % imageCount);
      } else {
        setModalIndex((prev) => (prev - 1 + imageCount) % imageCount);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 to-stargreen-light overflow-x-hidden">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 py-10 max-w-screen-xl mx-auto space-y-10 lg:space-y-0 lg:space-x-10">
        {/* Left Lottie (Desktop only) */}
        <div className="hidden lg:block w-1/4">
          <Lottie animationData={welcomeAnimation} loop />
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-xl text-center">
          <StarLogo className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 mb-2 leading-snug">
            Welcome to <span className="text-stargreen-dark">STAR</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            Systematic Techniques and Approaches in Reading
          </p>
          <Link
            to="/signin"
            className="inline-flex items-center justify-center gap-2 bg-stargreen-medium hover:bg-stargreen-dark text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all duration-200 shadow"
          >
            <FaSignInAlt className="text-base" /> Sign In
          </Link>
        </div>

        {/* Right Lottie (Desktop only) */}
        <div className="hidden lg:block w-1/4">
          <Lottie animationData={readingAnimation} loop />
        </div>
      </div>

      {/* Info Section + Carousel */}
      <div className="bg-white py-10 px-4 sm:px-6 md:px-16 rounded-t-3xl shadow-inner text-center max-w-screen-xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">What is STAR?</h2>
        <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          STAR is a reading assessment tool designed to help students improve their literacy through guided techniques and interactive modules. Teachers can track student progress, while learners gain confidence in their reading journey.
        </p>

        <div className="max-w-3xl mx-auto relative">
          <Carousel
            showThumbs={false}
            showStatus={false}
            showIndicators={false}
            autoPlay
            infiniteLoop
            interval={4000}
            selectedItem={carouselIndex}
            onChange={(index) => setCarouselIndex(index)}
            className="rounded-xl shadow"
          >
            {Array.from({ length: imageCount }, (_, i) => (
              <div
                key={i}
                onClick={() => handleOpen(i)}
                className="cursor-zoom-in relative h-[180px] sm:h-[240px] md:h-[300px] overflow-hidden rounded-xl"
              >
                <img
                  src={`/assets/STAR${i + 1}.jpg`}
                  alt={`STAR Slide ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </Carousel>

          {/* Pagination Indicator */}
          <div className="absolute top-2 right-4 bg-white bg-opacity-80 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow">
            {carouselIndex + 1} / {imageCount}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={`/assets/STAR${modalIndex + 1}.jpg`}
            alt={`Fullscreen STAR${modalIndex + 1}`}
            className="max-h-full max-w-full object-contain rounded-lg shadow-lg transition-all duration-300"
          />
        </div>
      )}
    </div>
  );
}
