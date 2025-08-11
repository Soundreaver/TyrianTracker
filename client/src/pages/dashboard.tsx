import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CharacterModal } from "@/components/character-modal";
import { MaterialsTab } from "@/components/materials-tab";
import { GW2ItemIcon } from "@/components/gw2-item-icon";
import { 
  Coins, 
  Gem, 
  Trophy, 
  Eye, 
  EyeOff, 
  Moon, 
  Sun, 
  Key, 
  Check, 
  X, 
  Crown,
  RefreshCw,
  Plus,
  Search,
  Package,
  Shield,
  Sword,
  Zap
} from "lucide-react";
import type { AccountWithDetails, Character } from "@shared/schema";

export default function Dashboard() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [validatedKey, setValidatedKey] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Validate API key mutation
  const validateKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest("POST", "/api/validate-key", { key });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setValidatedKey(apiKey);
        toast({
          title: "API Key Validated",
          description: "Successfully connected to your GW2 account!",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Validation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch account data
  const { data: account, isLoading } = useQuery<AccountWithDetails>({
    queryKey: ["/api/account", validatedKey],
    enabled: !!validatedKey,
  });

  // Refresh data mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/refresh/${validatedKey}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/account", validatedKey] });
      toast({
        title: "Data Refreshed",
        description: "Account data has been updated!",
      });
    },
  });

  const handleValidateKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your GW2 API key",
        variant: "destructive",
      });
      return;
    }
    validateKeyMutation.mutate(apiKey);
  };

  const getGoldValue = () => {
    if (!account?.wallet) return "0";
    const goldCurrency = account.wallet.find(w => w.currencyId === 1);
    return goldCurrency ? Math.floor(goldCurrency.value / 10000).toLocaleString() : "0";
  };

  const getGemsValue = () => {
    if (!account?.wallet) return "0";
    const gemsCurrency = account.wallet.find(w => w.currencyId === 4);
    return gemsCurrency ? gemsCurrency.value.toLocaleString() : "0";
  };

  const getProfessionColor = (profession: string) => {
    // Official GW2 profession colors matching the game UI
    const colors: Record<string, string> = {
      Guardian: "from-blue-400 to-blue-600", // Blue
      Warrior: "from-red-500 to-red-700", // Red  
      Engineer: "from-orange-400 to-orange-600", // Orange
      Ranger: "from-green-500 to-green-700", // Green
      Thief: "from-purple-500 to-purple-700", // Purple (Specter)
      Elementalist: "from-cyan-400 to-cyan-600", // Cyan
      Mesmer: "from-pink-500 to-pink-700", // Pink/Magenta
      Necromancer: "from-gray-500 to-gray-700", // Dark Gray
      Revenant: "from-amber-500 to-amber-700", // Amber/Orange
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

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    setIsCharacterModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gw2-light dark:bg-gw2-dark transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 dark:bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gw2-gold to-yellow-600 rounded-lg flex items-center justify-center">
                  <Crown className="text-white" size={16} />
                </div>
                <span className="text-xl font-bold text-foreground">GW2 Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleTheme}
                className="p-2 text-foreground border-border hover:bg-accent hover:text-accent-foreground"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {account && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-gw2-purple to-purple-600 rounded-full"></div>
                  <span className="hidden sm:inline text-sm font-medium text-foreground">{account.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* API Key Section */}
        <Card className="animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gw2-gold/10 dark:bg-gw2-gold/20 rounded-lg flex items-center justify-center">
                <Key className="text-gw2-gold h-5 w-5" />
              </div>
              <div>
                <CardTitle>API Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">Connect your Guild Wars 2 account to view your data</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXXXXXXXXX"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono text-sm pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a 
                    href="https://account.arena.net/applications" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gw2-gold hover:underline"
                  >
                    Account.Arena.net
                  </a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Required Permissions</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Account</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Inventories</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <X className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Trading Post (Optional)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={handleValidateKey}
                disabled={validateKeyMutation.isPending}
                className="bg-gw2-gold hover:bg-gw2-gold/80 text-black dark:text-white font-medium"
              >
                {validateKeyMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Connect Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Overview */}
        {validatedKey && (
          <div className="animate-in slide-in-from-bottom-4 duration-700 space-y-8">
            {isLoading ? (
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Skeleton className="h-20" />
                      <Skeleton className="h-20" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <Skeleton className="h-32" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : account ? (
              <>
                <div className="grid lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Account Overview</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
                          Connected
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refreshMutation.mutate()}
                          disabled={refreshMutation.isPending}
                        >
                          {refreshMutation.isPending ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-gw2-gold/10 to-yellow-100/50 dark:from-gw2-gold/20 dark:to-yellow-900/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Coins className="text-gw2-gold h-6 w-6" />
                            <div>
                              <p className="text-sm text-muted-foreground">Total Gold</p>
                              <p className="text-2xl font-bold">{getGoldValue()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-br from-gw2-purple/10 to-purple-100/50 dark:from-gw2-purple/20 dark:to-purple-900/20 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Gem className="text-gw2-purple h-6 w-6" />
                            <div>
                              <p className="text-sm text-muted-foreground">Gems</p>
                              <p className="text-2xl font-bold">{getGemsValue()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium">Achievement Points</span>
                          <span className="font-bold">{(account.dailyAp || 0) + (account.monthlyAp || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium">World vs World Rank</span>
                          <span className="font-bold">{account.wvwRank || "Unranked"}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium">Fractal Level</span>
                          <span className="font-bold">{account.fractalLevel || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Server Info</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">World</span>
                          <span className="font-medium">{account.world || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Created</span>
                          <span className="font-medium">
                            {account.created ? new Date(account.created).toLocaleDateString() : "Unknown"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Commander</span>
                          <span className="font-medium">{account.commander ? "Yes" : "No"}</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Fractal Progress</span>
                            <span>{account.fractalLevel}%</span>
                          </div>
                          <Progress value={Math.min(account.fractalLevel || 0, 100)} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Characters</span>
                            <span>{account.characters.length}</span>
                          </div>
                          <Progress value={Math.min((account.characters.length / 9) * 100, 100)} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Main Content Tabs */}
                <Card>
                  <Tabs defaultValue="characters" className="w-full">
                    <CardHeader>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="characters">Characters</TabsTrigger>
                        <TabsTrigger value="storage">Bank Storage</TabsTrigger>
                        <TabsTrigger value="materials">Materials</TabsTrigger>
                      </TabsList>
                    </CardHeader>

                    <CardContent>
                      <TabsContent value="characters" className="space-y-6 mt-0">
                        {account.characters.length > 0 ? (
                          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {account.characters.map((character) => (
                              <div
                                key={character.name}
                                onClick={() => handleCharacterClick(character)}
                                className="relative p-4 rounded-lg border hover:shadow-lg transition-all duration-200 cursor-pointer group overflow-hidden"
                              >
                                {/* Professional background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${getProfessionColor(character.profession || "")} opacity-15`}></div>
                                
                                <div className="relative flex items-center space-x-4">
                                  <div className={`w-16 h-16 bg-gradient-to-br ${getProfessionColor(character.profession || "")} rounded-lg flex items-center justify-center relative overflow-hidden shadow-lg`}>
                                    <div className="absolute inset-0 bg-black/20"></div>
                                    {(() => {
                                      const iconUrl = getProfessionIcon(character.profession || "");
                                      return iconUrl ? (
                                        <img 
                                          src={iconUrl} 
                                          alt={`${character.profession} icon`}
                                          className="h-10 w-10 relative z-10 drop-shadow-md filter brightness-110"
                                          onError={(e) => {
                                            console.log(`Failed to load icon for ${character.profession}`);
                                            e.currentTarget.style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <Shield className="h-8 w-8 text-white relative z-10 drop-shadow-md" />
                                      );
                                    })()}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-semibold">{character.name}</h3>
                                    <p className="text-sm text-muted-foreground">{character.profession}</p>
                                    <p className="text-xs text-muted-foreground">Level {character.level}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">{Math.floor((character.age || 0) / 3600)}h</p>
                                    <p className="text-xs text-muted-foreground">Played</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No character data available</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="storage" className="space-y-6 mt-0">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">Bank Storage</h3>
                            <p className="text-sm text-muted-foreground">
                              {account.bankItems.length}/250 slots used
                            </p>
                          </div>
                          <Badge variant="outline">
                            {account.bankItems.length} items
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-10 gap-2">
                          {Array.from({ length: 50 }).map((_, index) => {
                            const item = account.bankItems.find(item => item.slot === index);
                            return (
                              <div
                                key={index}
                                className={`aspect-square rounded border-2 transition-colors cursor-pointer ${
                                  item
                                    ? "border-gw2-gold bg-gradient-to-br from-gw2-gold/20 to-yellow-600/20 hover:border-gw2-gold/80"
                                    : "border-border bg-muted hover:border-muted-foreground"
                                }`}
                              >
                                {item && (
                                  <GW2ItemIcon
                                    itemId={item.itemId ?? undefined}
                                    iconUrl={`https://render.guildwars2.com/file/PLACEHOLDER/${item.itemId ?? 0}.png`}
                                    count={item.count ?? undefined}
                                    rarity="Fine"
                                    size="md"
                                    className="w-full h-full"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex space-x-2 pt-4">
                          <Button className="flex-1 bg-gw2-gold hover:bg-gw2-gold/80">
                            <Search className="mr-2 h-4 w-4" />
                            Search Items
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="materials" className="mt-0">
                        <MaterialsTab materials={account.materials} />
                      </TabsContent>
                    </CardContent>
                  </Tabs>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Activity</CardTitle>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {account.activities.length > 0 ? (
                      <div className="space-y-4">
                        {account.activities.slice(0, 5).map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Trophy className="text-green-600 dark:text-green-400 h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{activity.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : "Recently"}
                              </p>
                            </div>
                            {activity.reward && (
                              <div className="flex items-center text-gw2-gold">
                                <Plus className="h-3 w-3 mr-1" />
                                <span className="text-sm font-medium">{activity.reward}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No recent activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Failed to load account data</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Character Modal */}
        <CharacterModal 
          character={selectedCharacter}
          isOpen={isCharacterModalOpen}
          onClose={() => setIsCharacterModalOpen(false)}
        />
      </main>
    </div>
  );
}