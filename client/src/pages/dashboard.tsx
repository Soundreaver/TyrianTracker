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
import { 
  Shield, 
  Coins, 
  Gem, 
  Trophy, 
  Users, 
  Sword, 
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
  Filter,
  Sparkles
} from "lucide-react";
import type { AccountWithDetails } from "@shared/schema";

export default function Dashboard() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [validatedKey, setValidatedKey] = useState<string | null>(null);
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
    const goldCurrency = account.wallet.find(w => w.currencyId === 1); // GW2 gold currency ID
    return goldCurrency ? Math.floor(goldCurrency.value / 10000).toLocaleString() : "0";
  };

  const getGemsValue = () => {
    if (!account?.wallet) return "0";
    const gemsCurrency = account.wallet.find(w => w.currencyId === 4); // GW2 gems currency ID
    return gemsCurrency ? gemsCurrency.value.toLocaleString() : "0";
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

  const getProfessionIcon = (profession: string) => {
    const icons: Record<string, React.ReactNode> = {
      Guardian: <Shield className="text-white text-xl" />,
      Warrior: <Sword className="text-white text-xl" />,
      Engineer: <Sparkles className="text-white text-xl" />,
      Ranger: <Crown className="text-white text-xl" />,
      Thief: <Eye className="text-white text-xl" />,
      Elementalist: <Sparkles className="text-white text-xl" />,
      Mesmer: <Sparkles className="text-white text-xl" />,
      Necromancer: <Shield className="text-white text-xl" />,
      Revenant: <Sword className="text-white text-xl" />,
    };
    return icons[profession] || <Shield className="text-white text-xl" />;
  };

  return (
    <div className="min-h-screen bg-gw2-light dark:bg-gw2-dark transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gw2-dark/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gw2-gold to-yellow-600 rounded-lg flex items-center justify-center">
                  <Crown className="text-white" size={16} />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">GW2 Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleTheme}
                className="p-2"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {account && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-gw2-purple to-purple-600 rounded-full"></div>
                  <span className="hidden sm:inline text-sm font-medium">{account.name}</span>
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
                className="bg-gw2-gold hover:bg-gw2-gold/80"
              >
                {validateKeyMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Connect Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Overview */}
        {validatedKey && (
          <div className="animate-in slide-in-from-bottom-4 duration-700">
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
                          <span className="font-bold">{account.dailyAp + account.monthlyAp}</span>
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

                {/* Characters Section */}
                <Card className="animate-in slide-in-from-bottom-4 duration-900">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Characters</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {account.characters.length > 0 ? (
                      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {account.characters.map((character) => (
                          <div
                            key={character.name}
                            className={`p-4 bg-gradient-to-r ${getProfessionColor(character.profession || "")}/10 rounded-lg border hover:shadow-lg transition-all duration-200 cursor-pointer`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-16 h-16 bg-gradient-to-br ${getProfessionColor(character.profession || "")} rounded-lg flex items-center justify-center`}>
                                {getProfessionIcon(character.profession || "")}
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
                  </CardContent>
                </Card>

                {/* Inventory Section */}
                <div className="grid lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-1100">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Bank Storage</CardTitle>
                      <Badge variant="outline">
                        {account.bankItems.length}/250 slots
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-8 gap-2 mb-4">
                        {Array.from({ length: 32 }).map((_, index) => {
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
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-6 h-6 bg-gw2-gold rounded flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">
                                      {item.count > 1 ? item.count : ""}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button className="flex-1 bg-gw2-gold hover:bg-gw2-gold/80">
                          <Search className="mr-2 h-4 w-4" />
                          Search Items
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Material Storage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {account.materials.length > 0 ? (
                        <div className="space-y-3">
                          {account.materials.slice(0, 8).map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-gw2-gold to-yellow-600 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">M</span>
                                </div>
                                <span className="font-medium">Material {material.itemId}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold">{material.count}</span>
                                <span className="text-muted-foreground text-sm">/250</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No material data available</p>
                        </div>
                      )}
                      
                      <div className="mt-6 pt-4 border-t">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Storage Usage</span>
                          <span className="font-medium">{account.materials.length} items</span>
                        </div>
                        <Progress value={Math.min((account.materials.length / 100) * 100, 100)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="animate-in slide-in-from-bottom-4 duration-1300">
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
      </main>
    </div>
  );
}
