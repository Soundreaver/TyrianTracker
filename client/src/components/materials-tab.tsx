import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Gem, Hammer, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Material } from "@shared/schema";

interface MaterialsTabProps {
  materials: Material[];
}

export function MaterialsTab({ materials }: MaterialsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Material categories with their icons
  const getMaterialIcon = (category: number) => {
    const icons: Record<number, React.ReactNode> = {
      5: <Package className="h-4 w-4" />, // Cooking
      6: <Hammer className="h-4 w-4" />, // Crafting
      29: <Gem className="h-4 w-4" />, // Gemstones
      38: <Sparkles className="h-4 w-4" />, // Mystic
    };
    return icons[category] || <Package className="h-4 w-4" />;
  };

  const getMaterialName = (itemId: number) => {
    // In a real app, this would lookup item names from the GW2 API
    const itemNames: Record<number, string> = {
      19699: "Bloodstone Dust",
      19746: "Empyreal Fragments", 
      19750: "Dragonite Ore",
      24289: "Pile of Auric Dust",
      24290: "Ley Line Crystal",
      24295: "Chak Egg",
      // Add more as needed
    };
    return itemNames[itemId] || `Item ${itemId}`;
  };

  const getMaterialRarity = (itemId: number) => {
    // Mock rarity data - in real app would come from API
    const rarities: Record<number, string> = {
      19699: "Ascended",
      19746: "Ascended",
      19750: "Ascended",
      24289: "Exotic",
      24290: "Exotic", 
      24295: "Rare",
    };
    return rarities[itemId] || "Basic";
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      "Junk": "text-gray-400",
      "Basic": "text-white",
      "Fine": "text-blue-400", 
      "Masterwork": "text-green-400",
      "Rare": "text-yellow-400",
      "Exotic": "text-orange-400",
      "Ascended": "text-pink-400",
      "Legendary": "text-purple-400",
    };
    return colors[rarity] || "text-white";
  };

  const groupedMaterials = materials.reduce((acc, material) => {
    const category = material.category || 0;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(material);
    return acc;
  }, {} as Record<number, Material[]>);

  const filteredMaterials = Object.entries(groupedMaterials).reduce((acc, [category, mats]) => {
    const filtered = mats.filter(material => 
      getMaterialName(material.itemId).toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[parseInt(category)] = filtered;
    }
    return acc;
  }, {} as Record<number, Material[]>);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Materials Grid */}
      <div className="space-y-6">
        {Object.entries(filteredMaterials).map(([category, mats]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getMaterialIcon(parseInt(category))}
                <span>Category {category}</span>
                <Badge variant="secondary">{mats.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {mats.map((material) => (
                  <Tooltip key={material.id}>
                    <TooltipTrigger>
                      <div className="aspect-square border border-muted rounded-lg p-2 hover:bg-muted/50 transition-colors cursor-pointer relative">
                        {/* Material item with proper GW2-style styling */}
                        <div className="w-full h-full bg-gradient-to-br from-amber-400/40 to-amber-600/60 rounded flex items-center justify-center relative border border-amber-500/30">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded"></div>
                          <div className="relative z-10 text-amber-100 drop-shadow-sm">
                            {getMaterialIcon(material.category || 0)}
                          </div>
                        </div>
                        {/* Stack count with better styling */}
                        <div className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-400/50">
                          {material.count.toLocaleString()}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-2">
                        <div className={`font-semibold ${getRarityColor(getMaterialRarity(material.itemId))}`}>
                          {getMaterialName(material.itemId)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Count: {material.count.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Rarity: {getMaterialRarity(material.itemId)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Category: {material.category}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(filteredMaterials).length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No materials found matching your search." : "No materials available."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}