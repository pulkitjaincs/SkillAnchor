import { Anchor } from "lucide-react";

interface BrandLogoProps {
  className?: string;
  iconSize?: number;
}

export default function BrandLogo({ className = "text-indigo-600 dark:text-indigo-400", iconSize = 32 }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Anchor size={iconSize} strokeWidth={3} />
    </div>
  );
}
