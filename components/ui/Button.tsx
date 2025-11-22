import React from "react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string; // Jika ada href, dia jadi Link
  onClick?: () => void; // Jika tidak, dia jadi Button biasa
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}) => {
  // Base Styles (Wajib ada di semua tombol)
  const baseStyles = "inline-flex items-center justify-center px-6 py-2 rounded-full font-semibold transition duration-300 ease-in-out";

  // Variant Styles (Pilihan warna)
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 border border-transparent",
    outline: "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50",
    ghost: "bg-transparent text-blue-600 hover:text-blue-700 hover:bg-blue-50",
  };

  // Gabungkan class
  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  // Logika: Render sebagai <Link> jika ada props href, render <button> jika tidak.
  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  );
};

export default Button;