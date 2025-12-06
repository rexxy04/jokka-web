import React from "react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean; // <--- 1. Kita tambahkan tipe data ini
}

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false, // <--- 2. Default nilainya false (aktif)
}) => {
  // Base Styles
  const baseStyles = "inline-flex items-center justify-center px-6 py-2 rounded-full font-semibold transition duration-300 ease-in-out";

  // Style tambahan kalau tombol sedang Disabled (Lumpuh)
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed hover:shadow-none pointer-events-none" : "";

  // Variant Styles
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 border border-transparent",
    outline: "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50",
    ghost: "bg-transparent text-blue-600 hover:text-blue-700 hover:bg-blue-50",
  };

  // Gabungkan semua class
  const combinedClassName = `${baseStyles} ${variants[variant]} ${className} ${disabledStyles}`;

  // Logika Link: Hanya render Link jika ada href DAN tombol tidak sedang disabled
  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  // Render Button Biasa
  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={combinedClassName}
      disabled={disabled} // <--- 3. Pasang properti disabled ke elemen HTML asli
    >
      {children}
    </button>
  );
};

export default Button;