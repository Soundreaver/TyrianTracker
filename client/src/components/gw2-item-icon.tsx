import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Package, ShieldAlert } from "lucide-react";

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
  iconUrl: initialIconUrl,
  count,
  size = "md",
  rarity: initialRarity = "Basic",
  className = "",
}: GW2ItemIconProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    data: itemData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["item", itemId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/items/${itemId}`);
      return response.json();
    },
    enabled: !!itemId && !initialIconUrl, // Only fetch if itemId is provided and no initial iconUrl
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const iconUrl = initialIconUrl || itemData?.icon;
  const rarity = initialRarity || itemData?.rarity || "Basic";

  const rarityClass = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS["Basic"];
  const sizeClass = SIZE_CLASSES[size];

  if (isLoading) {
    return (
      <div className={`${sizeClass} relative rounded border-2 border-border bg-muted animate-pulse ${className}`} />
    );
  }

  if (isError) {
    return (
      <div className={`${sizeClass} relative rounded border-2 border-destructive bg-destructive/20 ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <ShieldAlert className="h-1/2 w-1/2 text-destructive" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClass} relative rounded border-2 ${rarityClass} ${className}`}>
      {iconUrl && !imageError ? (
        <>
          <img
            src={iconUrl}
            alt={`Item ${itemId || "icon"}`}
            className={`w-full h-full object-cover rounded transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-50" />
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
          <Package className="h-1/2 w-1/2 text-muted-foreground" />
        </div>
      )}

      {count && count > 1 && (
        <span className="absolute bottom-0 right-0 bg-black/80 text-white text-xs px-1 rounded-sm font-bold border border-current">
          {count > 9999 ? `${Math.floor(count / 1000)}k` : count}
        </span>
      )}
    </div>
  );
}
