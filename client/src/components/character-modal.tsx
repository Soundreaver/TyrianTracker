import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Shield, Sword, Heart, Zap, Clock, Calendar, Package, Search, Eye, Crown, Moon, Plus } from "lucide-react";
import type { Character } from "@shared/schema";

interface CharacterModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterModal({ character, isOpen, onClose }: CharacterModalProps) {
  if (!character) return null;

  const getEliteSpecIcon = (profession: string) => {
    // Elite specialization icons - in a real app, these would be actual images
    const specs: Record<string, string> = {
      Guardian: "🛡️",
      Warrior: "⚔️",
      Engineer: "🔧",
      Ranger: "🏹",
      Thief: "🗡️",
      Elementalist: "⚡",
      Mesmer: "🔮",
      Necromancer: "💀",
      Revenant: "👻",
    };
    return specs[profession] || "⚔️";
  };

  const getProfessionColor = (profession: string) => {
    // Official GW2 profession colors matching the game UI
    const colors: Record<string, string> = {
      Guardian: "from-blue-400 to-blue-600",
      Warrior: "from-red-500 to-red-700",
      Engineer: "from-orange-400 to-orange-600",
      Ranger: "from-green-500 to-green-700",
      Thief: "from-purple-500 to-purple-700",
      Elementalist: "from-cyan-400 to-cyan-600",
      Mesmer: "from-pink-500 to-pink-700",
      Necromancer: "from-gray-500 to-gray-700",
      Revenant: "from-amber-500 to-amber-700",
    };
    return colors[profession] || "from-gray-500 to-gray-700";
  };

  const getProfessionIcon = (profession: string) => {
    // Professional Lucide icons that match GW2 profession themes
    const icons: Record<string, any> = {
      Guardian: Shield,
      Warrior: Sword,
      Engineer: Package,
      Ranger: Search,
      Thief: Eye,
      Elementalist: Zap,
      Mesmer: Crown,
      Necromancer: Moon,
      Revenant: Plus,
    };
    return icons[profession] || Sword;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${getProfessionColor(character.profession || "")} rounded-lg flex items-center justify-center relative overflow-hidden shadow-lg`}>
              <div className="absolute inset-0 bg-black/30"></div>
              {(() => {
                const IconComponent = getProfessionIcon(character.profession || "");
                return <IconComponent className="h-8 w-8 text-white relative z-10 drop-shadow-md" />;
              })()}
            </div>
            <div>
              <DialogTitle className="text-2xl">{character.name}</DialogTitle>
              <DialogDescription className="sr-only">
                Character details for {character.name}, a level {character.level} {character.profession}
              </DialogDescription>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">{character.profession}</Badge>
                <Badge variant="outline">{character.race} {character.gender}</Badge>
                <Badge className="bg-gw2-gold text-white">Level {character.level}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="bags">Bags</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    Character Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Age</span>
                    <span>{Math.floor((character.age || 0) / 3600)} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Deaths</span>
                    <span>{character.deaths || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span>{character.created ? new Date(character.created).toLocaleDateString() : "Unknown"}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Level Progress</span>
                      <span>{character.level}/80</span>
                    </div>
                    <Progress value={(character.level || 0) / 80 * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Playtime Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-gw2-gold/10 to-yellow-100/50 dark:from-gw2-gold/20 dark:to-yellow-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-gw2-gold">
                      {Math.floor((character.age || 0) / 3600)}h
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Total Playtime
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold">{Math.floor((character.age || 0) / 86400)}</div>
                      <div className="text-xs text-muted-foreground">Days</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-semibold">{character.deaths || 0}</div>
                      <div className="text-xs text-muted-foreground">Deaths</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Equipment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {/* Equipment slots with actual names */}
                  {[
                    { name: "Helmet", slot: "Helm" },
                    { name: "Shoulders", slot: "Shoulders" },
                    { name: "Coat", slot: "Coat" },
                    { name: "Gloves", slot: "Gloves" },
                    { name: "Leggings", slot: "Leggings" },
                    { name: "Boots", slot: "Boots" },
                    { name: "Main Hand", slot: "WeaponA1" },
                    { name: "Off Hand", slot: "WeaponA2" },
                    { name: "Aquatic", slot: "WeaponAquaticA" },
                    { name: "Alt Main", slot: "WeaponB1" },
                    { name: "Alt Off", slot: "WeaponB2" },
                    { name: "Alt Aquatic", slot: "WeaponAquaticB" },
                    { name: "Back Item", slot: "Backpack" },
                    { name: "Accessory 1", slot: "Accessory1" },
                    { name: "Accessory 2", slot: "Accessory2" },
                    { name: "Ring 1", slot: "Ring1" },
                    { name: "Ring 2", slot: "Ring2" },
                    { name: "Amulet", slot: "Amulet" },
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                      <div className="aspect-square w-16 border-2 border-dashed border-muted rounded-lg flex items-center justify-center relative bg-gradient-to-br from-amber-500/20 to-amber-600/20 hover:border-amber-500 transition-colors">
                        <Shield className="h-6 w-6 text-amber-600" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg"></div>
                      </div>
                      <span className="text-xs text-center text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Equipment details require character API endpoint with gear inventory permission
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bags" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Inventory ({character.name})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Character bags */}
                  {Array.from({ length: 5 }).map((_, bagIndex) => (
                    <div key={bagIndex} className="border rounded-lg p-4 bg-gradient-to-r from-muted/30 to-muted/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium">
                          {bagIndex === 0 ? "Starting Bag" : `Bag ${bagIndex}`}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {bagIndex === 0 ? "4 slots" : "20 slots"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-10 gap-2">
                        {Array.from({ length: bagIndex === 0 ? 4 : 20 }).map((_, slotIndex) => (
                          <div 
                            key={slotIndex} 
                            className="aspect-square border border-muted rounded flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 hover:border-gw2-gold transition-colors cursor-pointer relative"
                          >
                            {/* Random mock items for demonstration */}
                            {Math.random() > 0.7 && (
                              <>
                                <Package className="h-3 w-3 text-amber-600" />
                                <span className="absolute bottom-0 right-0 text-xs bg-black/70 text-white px-1 rounded text-[10px]">
                                  {Math.floor(Math.random() * 99) + 1}
                                </span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg mt-4">
                  <p className="text-sm text-muted-foreground">
                    Character inventory requires individual character API calls with inventory permission
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}