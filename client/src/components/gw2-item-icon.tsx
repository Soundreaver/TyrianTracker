import { useState } from "react";
import { Package } from "lucide-react";

interface GW2ItemIconProps {
  itemId?: number;
  iconUrl?: string;
  count?: number;
  size?: "sm" | "md" | "lg";
  rarity?: string;
  className?: string;
}

const RARITY_COLORS = {
  "Junk": "border-gray-400 bg-gray-100/20",
  "Basic": "border-white bg-white/20", 
  "Fine": "border-blue-400 bg-blue-100/20",
  "Masterwork": "border-green-400 bg-green-100/20",
  "Rare": "border-yellow-400 bg-yellow-100/20",
  "Exotic": "border-orange-400 bg-orange-100/20",
  "Ascended": "border-pink-400 bg-pink-100/20",
  "Legendary": "border-purple-400 bg-purple-100/20",
};

const SIZE_CLASSES = {
  sm: "w-8 h-8",
  md: "w-12 h-12", 
  lg: "w-16 h-16",
};

export function GW2ItemIcon({ 
  itemId, 
  iconUrl, 
  count, 
  size = "md", 
  rarity = "Basic",
  className = "" 
}: GW2ItemIconProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const rarityClass = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS["Basic"];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div className={`${sizeClass} relative rounded border-2 ${rarityClass} ${className}`}>
      {iconUrl && !imageError ? (
        <>
          <img
            src={iconUrl}
            alt={`Item ${itemId}`}
            className={`w-full h-full object-cover rounded transition-opacity ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400/30 to-amber-600/30">
          <Package className="h-1/2 w-1/2 text-amber-600" />
        </div>
      )}
      
      {count && count > 1 && (
        <span className="absolute bottom-0 right-0 bg-black/80 text-white text-xs px-1 rounded text-[10px] font-bold border border-current">
          {count > 9999 ? `${Math.floor(count/1000)}k` : count}
        </span>
      )}
    </div>
  );
}