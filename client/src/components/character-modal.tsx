import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Shield, Sword, Heart, Zap, Clock, Calendar } from "lucide-react";
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
    const colors: Record<string, string> = {
      Guardian: "from-blue-500 to-blue-600",
      Warrior: "from-red-500 to-red-600",
      Engineer: "from-orange-500 to-orange-600",
      Ranger: "from-green-500 to-green-600",
      Thief: "from-purple-500 to-purple-600",
      Elementalist: "from-cyan-500 to-cyan-600",
      Mesmer: "from-pink-500 to-pink-600",
      Necromancer: "from-gray-500 to-gray-600",
      Revenant: "from-amber-500 to-amber-600",
    };
    return colors[profession] || "from-gray-500 to-gray-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 bg-gradient-to-r ${getProfessionColor(character.profession || "")} rounded-lg flex items-center justify-center text-2xl`}>
              {getEliteSpecIcon(character.profession || "")}
            </div>
            <div>
              <DialogTitle className="text-2xl">{character.name}</DialogTitle>
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
                <div className="grid grid-cols-6 gap-4">
                  {/* Equipment slots - placeholder for now */}
                  {Array.from({ length: 18 }).map((_, index) => (
                    <div key={index} className="aspect-square border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Equipment data will be loaded when available from the API
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bags" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Bag slots - placeholder for now */}
                  {Array.from({ length: 4 }).map((_, bagIndex) => (
                    <div key={bagIndex} className="border rounded-lg p-4">
                      <div className="text-sm font-medium mb-3">Bag {bagIndex + 1}</div>
                      <div className="grid grid-cols-8 gap-2">
                        {Array.from({ length: 20 }).map((_, slotIndex) => (
                          <div key={slotIndex} className="aspect-square border border-muted rounded flex items-center justify-center">
                            <div className="w-6 h-6 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Inventory data will be loaded when available from the API
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}