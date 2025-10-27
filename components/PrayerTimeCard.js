import React from "react";
import Card from "./ui/Card";

const PrayerTimeCard = ({
  title,
  times,
  icon,
  color = "idf-olive",
  className = "",
  logo,
  showTitle = true,
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    teal: "from-teal-500 to-teal-600",
    gray: "from-gray-500 to-gray-600",
    emerald: "from-emerald-500 to-emerald-600",
    sky: "from-sky-500 to-sky-600",
    violet: "from-violet-500 to-violet-600",
    rose: "from-rose-500 to-rose-600",
    amber: "from-amber-500 to-amber-600",
    "idf-olive": "from-idf-olive-500 to-idf-olive-600",
    "idf-gold": "from-idf-gold-500 to-idf-gold-600",
  };

  const iconClasses = {
    blue: "text-blue-500",
    green: "text-green-500",
    orange: "text-orange-500",
    purple: "text-purple-500",
    red: "text-red-500",
    teal: "text-teal-500",
    gray: "text-gray-500",
    emerald: "text-emerald-500",
    sky: "text-sky-500",
    violet: "text-violet-500",
    rose: "text-rose-500",
    amber: "text-amber-500",
    "idf-olive": "text-idf-olive-600",
    "idf-gold": "text-idf-gold-600",
  };

  const bgColor = colorClasses[color] || colorClasses["idf-olive"];
  const iconColor = iconClasses[color] || iconClasses["idf-olive"];

  return (
    <Card
      variant="glass-olive"
      className={`group hover:scale-105 transition-all duration-300 ${className}`}
    >
      <div
        className={`relative p-6 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700`}
      >
        {/* Background gradient overlay for hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-idf-olive-50/30 to-idf-gold-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {logo && (
          <img
            src={logo}
            alt="Logo"
            className="absolute top-4 left-4 h-10 w-10 rounded-full object-cover z-10"
          />
        )}

        <div className="relative z-10">
          {showTitle && (
            <div className="flex items-center mb-4">
              <span className={`text-3xl mr-3 ${iconColor}`}>{icon}</span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {title}
              </h3>
            </div>
          )}

          <ul className="space-y-3">
            {times.map((time, index) => (
              <li
                key={index}
                className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600"
              >
                <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {time.label}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-600 px-3 py-1 rounded-md border border-gray-200 dark:border-gray-500 shadow-sm">
                  {time.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default PrayerTimeCard;
