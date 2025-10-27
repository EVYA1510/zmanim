import React, { useState, useEffect } from "react";
import Button from "./ui/Button";

const ThemeToggle = ({ className = "" }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setIsDark(shouldBeDark);

    // Apply theme immediately
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    console.log("Toggling theme to:", newTheme ? "dark" : "light");
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      console.log("Applied dark theme");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      console.log("Applied light theme");
    }
  };

  return (
    <Button
      variant="outline"
      size="small"
      onClick={toggleTheme}
      className={`flex items-center justify-center ${className}`}
      title={isDark ? "מעבר למצב יום" : "מעבר למצב לילה"}
      aria-label={isDark ? "מעבר למצב יום" : "מעבר למצב לילה"}
    >
      <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
    </Button>
  );
};

export default ThemeToggle;
