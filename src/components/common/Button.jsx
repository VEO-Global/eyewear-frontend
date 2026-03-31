import React from "react";

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "cursor-pointer",
  children,
  textColor = "text-white",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-teal-500 hover:bg-teal-700 hover:shadow-md focus:ring-teal-500",
    secondary:
      "bg-amber-500 hover:bg-amber-600 hover:shadow-md focus:ring-amber-500",
    outline:
      "border-2 border-teal-600 bg-teal-600 hover:bg-teal-700 focus:ring-teal-500",
    ghost: "bg-gray-500 hover:bg-gray-600 focus:ring-gray-500",
    danger: "bg-red-500 hover:bg-red-600 hover:shadow-md focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className} cursor-pointer${textColor} }`}
      {...props}
    >
      {children}
    </button>
  );
}
