import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Shield, Sword, Heart, Zap, Clock, Calendar, Package, Search, Eye, Crown, Moon, Plus } from "lucide-react";
import { ItemTooltip } from "@/components/item-tooltip";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Character } from "@shared/schema";

interface CharacterModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterModal({ character, isOpen, onClose }: CharacterModalProps) {
  const { data: charDetails, isLoading } = useQuery({
    queryKey: ["character", character?.name],
    queryFn: async () => {
      if (!character) return null;
      const response = await apiRequest("GET", `/api/characters/${character.name}`);
      return response.json();
    },
    enabled: isOpen && !!character,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (!character) return null;

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
    // Official GW2 profession icon URLs from the render service
    const iconUrls: Record<string, string> = {
      Guardian: "https://render.guildwars2.com/file/943538394A94A491C8632FBEF6203C2013443555/102478.png",
      Warrior: "https://render.guildwars2.com/file/4926CE43F614A7D9A83AB9D6D25DF57B61BF4DE5/102451.png", 
      Engineer: "https://render.guildwars2.com/file/502050C64A7EC7E3C9A4FB0B1F0D9E9F2CF2D73B/102456.png",
      Ranger: "https://render.guildwars2.com/file/298F3F67EA2D6BFAD3D516F6F5E09EFBA8B66E87/102473.png",
      Thief: "https://render.guildwars2.com/file/41CF590C6E5DC8F10EDA0D4C11309D1DD25E55E8/102447.png",
      Elementalist: "https://render.guildwars2.com/file/A7B0C1F982026C7648C32FA50CA8CB4B1EDC64F3/102461.png",
      Mesmer: "https://render.guildwars2.com/file/E54E7E5C2987B5BA17A5F5AACBB421DFE3F57AC0/102465.png",
      Necromancer: "https://render.guildwars2.com/file/1F4BAB7CB6299113FE6A6B462C8273B84F61FA67/102469.png",
      Revenant: "https://render.guildwars2.com/file/0F2FC4F020F7EE9F6E6B80B9CD7C2068FA2CFBF7/103822.png"
    };
    return iconUrls[profession];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${getProfessionColor(character.profession || "")} rounded-lg flex items-center justify-center relative overflow-hidden shadow-lg`}>
              <div className="absolute inset-0 bg-black/30"></div>
              {(() => {
                const iconUrl = getProfessionIcon(character.profession || "");
                return iconUrl ? (
                  <img 
                    src={iconUrl} 
                    alt={`${character.profession} icon`}
                    className="h-10 w-10 relative z-10 drop-shadow-md filter brightness-110"
                  />
                ) : (
                  <Shield className="h-8 w-8 text-white relative z-10 drop-shadow-md" />
                );
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
                  {isLoading
                    ? Array.from({ length: 18 }).map((_, i) => <Skeleton key={i} className="w-16 h-16" />)
                    : charDetails?.equipment.map((item: any) => (
                        <div key={item.id} className="flex flex-col items-center space-y-2">
                          <ItemTooltip itemId={item.id} size="lg" />
                          <span className="text-xs text-center text-muted-foreground">{item.slot}</span>
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
                        {isLoading
                          ? Array.from({ length: 20 }).map((_, i) => <Skeleton key={i} className="w-12 h-12" />)
                          : charDetails?.inventory[bagIndex]?.slots.map((item: any, slotIndex: number) => (
                              <div key={slotIndex} className="aspect-square">
                                {item ? (
                                  <ItemTooltip itemId={item.id} count={item.count} size="md" />
                                ) : (
                                  <div className="w-full h-full bg-muted rounded border-2 border-border" />
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
