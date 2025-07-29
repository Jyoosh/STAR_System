// src/components/common/TooltipInfo.js

import React, { useState, useRef, useEffect } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { createPortal } from 'react-dom';

export default function TooltipInfo({ title = "Instructions", content }) {
  const [show, setShow] = useState(false);
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);

  const isJSX = typeof content === 'object' && !Array.isArray(content);
  const safeContent = !isJSX
    ? Array.isArray(content)
      ? content
      : [String(content)]
    : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setShow(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const TooltipContent = () => {
    if (!show || !buttonRef.current) return null;

    const rect = buttonRef.current.getBoundingClientRect();
    const tooltipWidth = 288; // ~18rem
    const padding = 10;
    const viewportWidth = window.innerWidth;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding));

    const top = rect.bottom + 10;

    return createPortal(
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          top,
          left,
          zIndex: 9999,
          maxWidth: '90vw',
        }}
        className="bg-white border border-gray-300 shadow-xl rounded-lg p-4 text-sm w-[18rem] max-h-[70vh] overflow-auto"
      >
        <p className="font-semibold mb-2">📘 {title}</p>
        {isJSX ? (
          <div>{content}</div>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {safeContent.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )}
      </div>,
      document.body
    );
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setShow((prev) => !prev)}
        className="text-blue-700 hover:text-blue-900 text-lg font-bold cursor-pointer focus:outline-none"
        aria-label="Toggle tooltip"
        type="button"
      >
        <FaInfoCircle />
      </button>
      <TooltipContent />
    </>
  );
}
