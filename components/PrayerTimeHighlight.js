/**
 * Prayer Time Highlight Component
 * Highlights new or changed prayer times with animations
 */

import React, { useState, useEffect } from "react";

const PrayerTimeHighlight = ({
  children,
  isNew = false,
  isChanged = false,
  animationDelay = 0,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [animationDelay]);

  const getHighlightClasses = () => {
    let classes = "transition-all duration-500 ease-out";

    if (isNew) {
      classes +=
        " bg-idf-gold-100 border-2 border-idf-gold-300 shadow-glass-gold";
    } else if (isChanged) {
      classes +=
        " bg-idf-olive-100 border-2 border-idf-olive-300 shadow-glass-olive";
    }

    if (isVisible) {
      classes += " animate-fade-in";
    }

    return classes;
  };

  return (
    <div className={`${getHighlightClasses()} ${className}`}>{children}</div>
  );
};

export default PrayerTimeHighlight;
