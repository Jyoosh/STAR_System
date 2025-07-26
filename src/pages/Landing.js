import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaSignInAlt } from 'react-icons/fa';
import { ReactComponent as StarLogo } from '../assets/STAR_Logo.svg';
import Lottie from 'lottie-react';
import welcomeAnimation from '../animations/welcome.json';
import readingAnimation from '../animations/reading.json';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const API = process.env.REACT_APP_API_BASE;

export default function Landing() {
  const [carouselImages, setCarouselImages] = useState([]);
  const [modalIndex, setModalIndex] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const touchStartX = useRef(null);

  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        const res = await fetch(`${API}/carousel/getCarouselImages.php`);
        const data = await res.json();
        setCarouselImages(data);
      } catch (error) {
        console.error('Failed to load carousel images:', error);
      }
    };

    fetchCarouselImages();
  }, []);

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
        setModalIndex((prev) => (prev + 1) % carouselImages.length);
      } else {
        setModalIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 to-stargreen-light overflow-x-hidden">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 py-10 max-w-screen-xl mx-auto space-y-10 lg:space-y-0 lg:space-x-10">
        <div className="hidden lg:block w-1/4">
          <Lottie animationData={welcomeAnimation} loop />
        </div>

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
          {carouselImages.length > 0 && (
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
              {carouselImages.map((img, i) => (
                <div
                  key={img.id || i}
                  onClick={() => handleOpen(i)}
                  className="cursor-zoom-in relative h-[180px] sm:h-[240px] md:h-[300px] overflow-hidden rounded-xl"
                >
                  <img
                    src={`/assets/carousel/${img.filename}`}
                    alt={img.title || `Slide ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />

                  {img.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs sm:text-sm md:text-base px-4 py-2 text-center">
                      {img.title}
                    </div>
                  )}
                </div>

              ))}
            </Carousel>
          )}

          {carouselImages.length > 0 && (
            <div className="absolute top-2 right-4 bg-white bg-opacity-80 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow">
              {carouselIndex + 1} / {carouselImages.length}
            </div>
          )}
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
            src={`/assets/carousel/${carouselImages[modalIndex]?.filename}`}
            alt={`Fullscreen ${carouselImages[modalIndex]?.title || modalIndex + 1}`}
            className="max-h-full max-w-full object-contain rounded-lg shadow-lg transition-all duration-300"
          />
        </div>
      )}
    </div>
  );
}
