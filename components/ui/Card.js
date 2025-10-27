import React from "react";

const Card = ({
  children,
  variant = "default",
  padding = "medium",
  className = "",
  ...props
}) => {
  const baseClasses = `
    rounded-xl shadow-lg
    transition-all duration-300 ease-in-out
    hover:shadow-xl
    ${className}
  `;

  const variants = {
    default:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100",
    glass:
      "bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-700/20 text-gray-900 dark:text-gray-100",
    "glass-olive": "glass-olive dark:bg-gray-800/80 dark:border-gray-700/20",
    "glass-gold": "glass-gold dark:bg-gray-800/80 dark:border-gray-700/20",
    gradient:
      "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100",
    dark: "bg-gray-800 border border-gray-700 text-white",
    primary:
      "bg-gradient-to-br from-idf-olive-50 to-idf-olive-100 dark:from-idf-olive-900 dark:to-idf-olive-800 border border-idf-olive-200 dark:border-idf-olive-700 text-gray-900 dark:text-gray-100",
    success:
      "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-700 text-gray-900 dark:text-gray-100",
    warning:
      "bg-gradient-to-br from-idf-gold-50 to-idf-gold-100 dark:from-idf-gold-900 dark:to-idf-gold-800 border border-idf-gold-200 dark:border-idf-gold-700 text-gray-900 dark:text-gray-100",
    danger:
      "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border border-red-200 dark:border-red-700 text-gray-900 dark:text-gray-100",
  };

  const paddings = {
    none: "",
    small: "p-3",
    medium: "p-4",
    large: "p-6",
    xl: "p-8",
  };

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${paddings[padding]}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
