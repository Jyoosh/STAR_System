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
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 to-green-100 overflow-x-hidden relative">
      {/* Hero Section */}
      <div className="flex flex-row items-center justify-center w-full max-w-7xl mx-auto px-4 py-16">
        <div className="hidden lg:block w-1/4">
          <Lottie animationData={welcomeAnimation} loop />
        </div>

        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg text-center mx-4">
          <StarLogo className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold text-gray-800 mb-3 tracking-tight">
            Welcome to <span className="text-yellow-400">STAR</span>
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            Systematic Techniques and Approaches in Reading
          </p>
          <Link
            to="/signin"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md"
          >
            <FaSignInAlt className="text-lg" /> Sign In
          </Link>
        </div>

        <div className="hidden lg:block w-1/4">
          <Lottie animationData={readingAnimation} loop />
        </div>
      </div>

      {/* Info & Carousel Section */}
      <div className="bg-white py-12 px-6 md:px-20 rounded-t-3xl shadow-inner text-center max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">What is STAR?</h2>
        <p className="text-gray-600 mb-8 max-w-3xl mx-auto text-base leading-relaxed">
          STAR is a reading assessment tool designed to help students improve their literacy through guided techniques and interactive modules. Teachers can track student progress, while learners gain confidence in their reading journey.
        </p>

        <div className="max-w-4xl mx-auto relative">
          <Carousel
            showThumbs={false}
            showStatus={false}
            showIndicators={false}
            autoPlay
            infiniteLoop
            interval={4000}
            selectedItem={carouselIndex}
            onChange={(index) => setCarouselIndex(index)}
            className="rounded-xl shadow-md"
          >
            {Array.from({ length: imageCount }, (_, i) => (
              <div
                key={i}
                onClick={() => handleOpen(i)}
                className="cursor-zoom-in relative h-[200px] md:h-[300px] lg:h-[400px] overflow-hidden rounded-xl"
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

          {/* Fraction Pagination */}
          <div className="absolute top-2 right-4 bg-white bg-opacity-70 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full shadow">
            {carouselIndex + 1} / {imageCount}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal with Swipe */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={handleClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={`/assets/STAR${modalIndex + 1}.jpg`}
            alt={`Fullscreen STAR${modalIndex + 1}`}
            className="max-w-full max-h-full rounded-lg shadow-lg transition-all duration-300"
          />
        </div>
      )}
    </div>
  );
}
