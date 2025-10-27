import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  onClick,
  className = "",
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700
      hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800
      text-white shadow-lg hover:shadow-xl
      focus:ring-blue-500 dark:focus:ring-blue-400
    `,
    secondary: `
      bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600
      hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500
      text-gray-800 dark:text-gray-200 shadow-md hover:shadow-lg
      focus:ring-gray-500 dark:focus:ring-gray-400
    `,
    success: `
      bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700
      hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800
      text-white shadow-lg hover:shadow-xl
      focus:ring-green-500 dark:focus:ring-green-400
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700
      hover:from-red-600 hover:to-red-700 dark:hover:from-red-700 dark:hover:to-red-800
      text-white shadow-lg hover:shadow-xl
      focus:ring-red-500 dark:focus:ring-red-400
    `,
    outline: `
      border-2 border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400
      hover:bg-blue-500 hover:text-white dark:hover:bg-blue-400 dark:hover:text-white
      focus:ring-blue-500 dark:focus:ring-blue-400
    `,
    ghost: `
      text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700
      focus:ring-gray-500 dark:focus:ring-gray-400
    `,
  };

  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
