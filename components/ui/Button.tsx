import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "gradient-primary text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02]",
    secondary: "bg-surface-container-highest ghost-border text-on-surface hover:bg-surface-bright",
    ghost: "bg-transparent text-on-surface hover:bg-white/5",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs rounded-lg",
    md: "px-6 py-3 text-sm rounded-xl",
    lg: "px-8 py-4 text-base rounded-2xl",
    xl: "px-10 py-5 text-lg rounded-xl", // Following the xl radius rule for large buttons
  };

  const radiusStyles = size === "xl" ? "rounded-[3rem]" : size === "lg" ? "rounded-[2rem]" : "rounded-xl";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${radiusStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
