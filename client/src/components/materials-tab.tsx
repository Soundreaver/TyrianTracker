import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Gem, Hammer, Sparkles } from "lucide-react";
import { ItemTooltip } from "@/components/item-tooltip";
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

  const groupedMaterials = materials.reduce((acc, material) => {
    const category = material.category || 0;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(material);
    return acc;
  }, {} as Record<number, Material[]>);

  // Note: The search functionality will be limited without item names.
  // A full implementation would require fetching all item details.
  const filteredMaterials = Object.entries(groupedMaterials);

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
          disabled // Disabled until item names are available for searching
        />
      </div>

      {/* Materials Grid */}
      <div className="space-y-6">
        {filteredMaterials.map(([category, mats]) => (
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
                  <ItemTooltip
                    key={material.id}
                    itemId={material.itemId}
                    count={material.count}
                    size="lg"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
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
