"use client";
import { useTheme } from "next-themes";
import { useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleSelect = (value: "light" | "dark") => {
    setTheme(value);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="px-3 py-1 rounded border text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition"
        onClick={() => setOpen((prev) => !prev)}
      >
        Theme: {theme === "dark" ? "Dark" : "Light"}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
          <button
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === "light" ? "font-bold" : ""}`}
            onClick={() => handleSelect("light")}
          >
            Light
          </button>
          <button
            className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${theme === "dark" ? "font-bold" : ""}`}
            onClick={() => handleSelect("dark")}
          >
            Dark
          </button>
        </div>
      )}
    </div>
  );
}
