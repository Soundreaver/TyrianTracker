import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GW2ItemIcon } from "@/components/gw2-item-icon";
import { useItemDetails } from "@/hooks/use-item-details";
import type { GW2Item } from "@/types";

interface ItemTooltipProps {
  itemId: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const RARITY_COLORS: Record<string, string> = {
  Junk: "text-gray-400",
  Basic: "text-white",
  Fine: "text-blue-400",
  Masterwork: "text-green-400",
  Rare: "text-yellow-400",
  Exotic: "text-orange-400",
  Ascended: "text-pink-400",
  Legendary: "text-purple-400",
};

export function ItemTooltip({ itemId, count, size, className }: ItemTooltipProps) {
  const { data: itemData, isLoading } = useItemDetails(itemId) as { data: GW2Item | undefined; isLoading: boolean };

  const rarityColor = itemData?.rarity ? RARITY_COLORS[itemData.rarity] || "text-white" : "text-white";

  return (
    <Tooltip>
      <TooltipTrigger>
        <GW2ItemIcon
          itemId={itemId}
          count={count}
          size={size}
          className={className}
          rarity={itemData?.rarity}
          iconUrl={itemData?.icon}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs bg-black/80 border-border text-white">
        {isLoading ? (
          <p>Loading...</p>
        ) : itemData ? (
          <div className="space-y-2">
            <p className={`font-semibold ${rarityColor}`}>{itemData.name}</p>
            <p className="text-sm text-gray-400">{itemData.description}</p>
            <p className="text-sm">Rarity: {itemData.rarity}</p>
          </div>
        ) : (
          <p>Item not found</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
