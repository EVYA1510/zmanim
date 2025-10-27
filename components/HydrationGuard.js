/**
 * Hydration guard to prevent UI flash between SSR and CSR
 */

import React, { useState, useEffect } from "react";

const HydrationGuard = ({ children, fallback = null }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return fallback;
  }

  return children;
};

export default HydrationGuard;
