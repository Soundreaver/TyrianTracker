import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApiKeySchema } from "./schema";
import { z } from "zod";
import cors from "cors";

const GW2_API_BASE = "https://api.guildwars2.com/v2";

interface GW2Account {
  id: string;
  name: string;
  age: number;
  world: number;
  guilds: string[];
  guild_leader: string[];
  created: string;
  access: string[];
  commander: boolean;
  fractal_level: number;
  daily_ap: number;
  monthly_ap: number;
  wvw_rank: number;
  pvp_rank: number;
  achievement_points: number;
}

interface GW2Character {
  name: string;
  race: string;
  gender: string;
  profession: string;
  level: number;
  guild?: string;
  age: number;
  created: string;
  deaths: number;
}

async function fetchGW2API(endpoint: string, apiKey?: string): Promise<any> {
  const headers: Record<string, string> = {};
  
  // Only add Authorization header if API key is provided and not empty
  if (apiKey && apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(`${GW2_API_BASE}${endpoint}`, { headers });

  if (!response.ok) {
    let errorMessage = `GW2 API Error: ${response.status} ${response.statusText}`;
    
    // Try to get more detailed error message from response
    try {
      const errorData = await response.json() as any;
      if (errorData?.text) {
        errorMessage += ` - ${errorData.text}`;
      }
    } catch {
      // Ignore JSON parsing errors, use basic error message
    }
    
    console.error(`API Error for ${endpoint}:`, errorMessage);
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Configure CORS for Vercel frontend
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Validate API key and fetch account data
  app.post("/api/validate-key", async (req, res) => {
    try {
      const { key } = insertApiKeySchema.parse(req.body);
      
      // Check if key already exists
      let apiKey = await storage.getApiKey(key);
      if (!apiKey) {
        apiKey = await storage.createApiKey({ key });
      }

      // Validate with GW2 API
      try {
        const accountData: GW2Account = await fetchGW2API("/account", key);
        
        // Update API key validation status
        await storage.updateApiKey(key, {
          isValid: true,
          accountName: accountData.name,
          lastValidated: new Date(),
          permissions: ["account"], // Would normally fetch from /v2/tokeninfo
        });

        // Calculate total achievement points
        let totalAchievementPoints = 0;
        try {
          console.log('Fetching achievement progress data...');
          const accountAchievements = await fetchGW2API("/account/achievements", key) as any[];
          
          // Get unique achievement IDs from account progress
          const achievementIds = [...new Set(accountAchievements.map((progress: any) => progress.id))];
          console.log(`Found ${achievementIds.length} achievements with progress`);
          
          if (achievementIds.length > 0) {
            // Fetch achievement details in batches (GW2 API limit is 200 per request)
            const batchSize = 200;
            const achievementPoints = new Map();
            
            for (let i = 0; i < achievementIds.length; i += batchSize) {
              const batch = achievementIds.slice(i, i + batchSize);
              const batchDetails = await fetchGW2API(`/achievements?ids=${batch.join(',')}`, key) as any[];
              
              batchDetails.forEach((ach: any) => {
                achievementPoints.set(ach.id, ach.points || 0);
              });
            }
            
            console.log(`Fetched details for ${achievementPoints.size} achievements`);
            
            // Debug: Check some achievement data
            let completedCount = 0;
            let pointGivingCount = 0;
            let sampleCompleted: any[] = [];
            let samplePointGiving: any[] = [];
            let sampleIncomplete: any[] = [];
            let pointDistribution = { zero: 0, low: 0, medium: 0, high: 0 };
            
            // Sum up points from completed achievements
            accountAchievements.forEach((progress: any) => {
              if (progress.done) {
                completedCount++;
                const points = achievementPoints.get(progress.id) || 0;
                
                // Categorize points for statistics
                if (points === 0) pointDistribution.zero++;
                else if (points <= 5) pointDistribution.low++;
                else if (points <= 15) pointDistribution.medium++;
                else pointDistribution.high++;
                
                // Sample first few completed (regardless of points)
                if (sampleCompleted.length < 5) {
                  sampleCompleted.push({ id: progress.id, points, repeated: progress.repeated || 0 });
                }
                
                // Sample achievements that actually give points
                if (points > 0) {
                  pointGivingCount++;
                  if (samplePointGiving.length < 5) {
                    samplePointGiving.push({ id: progress.id, points, repeated: progress.repeated || 0 });
                  }
                }
                
                totalAchievementPoints += points;
                // Handle repeatable achievements
                if (progress.repeated && progress.repeated > 0) {
                  totalAchievementPoints += points * progress.repeated;
                }
              } else if (sampleIncomplete.length < 3) {
                sampleIncomplete.push({ 
                  id: progress.id, 
                  done: progress.done, 
                  current: progress.current, 
                  max: progress.max 
                });
              }
            });
            
            console.log(`Found ${completedCount} completed achievements out of ${accountAchievements.length} total`);
            console.log(`Point distribution - 0pts: ${pointDistribution.zero}, 1-5pts: ${pointDistribution.low}, 6-15pts: ${pointDistribution.medium}, 16+pts: ${pointDistribution.high}`);
            console.log(`Found ${pointGivingCount} achievements that give points`);
            console.log(`Sample completed (any points):`, sampleCompleted);
            console.log(`Sample point-giving achievements:`, samplePointGiving);
            console.log(`Calculated total achievement points: ${totalAchievementPoints}`);
          }
        } catch (error) {
          console.log("Achievement points calculation failed:", error);
          totalAchievementPoints = 0;
        }

        // Create or update account with calculated achievement points
        const accountWithAchievements = {
          ...accountData,
          achievement_points: totalAchievementPoints
        };
        const account = await storage.createOrUpdateAccount(accountWithAchievements, apiKey.id);

        // Fetch and save characters with inventory
        const charactersData: GW2Character[] = await fetchGW2API("/characters?page=0", key);
        const characters = charactersData.map(char => ({
          id: Math.random().toString(36),
          name: char.name,
          race: char.race,
          gender: char.gender,
          profession: char.profession,
          level: char.level,
          created: new Date(char.created),
          age: char.age,
          deaths: char.deaths,
          accountId: account.id,
        }));
        await storage.saveCharacters(characters, account.id);

        // Fetch wallet
        try {
          const walletData = await fetchGW2API("/account/wallet", key);
          const wallet = walletData.map((item: any) => ({
            id: Math.random().toString(36),
            currencyId: item.id,
            value: item.value,
            accountId: account.id,
          }));
          await storage.saveWallet(wallet, account.id);
        } catch (error) {
          console.log("Wallet fetch failed:", error);
        }

        // Fetch bank
        try {
          const bankData = await fetchGW2API("/account/bank", key);
          const bankItems = bankData
            .map((item: any, index: number) => item ? ({
              id: Math.random().toString(36),
              itemId: item.id,
              count: item.count || 1,
              slot: index,
              accountId: account.id,
            }) : null)
            .filter(Boolean);
          await storage.saveBankItems(bankItems, account.id);
        } catch (error) {
          console.log("Bank fetch failed:", error);
        }

        // Fetch materials
        try {
          const materialsData = await fetchGW2API("/account/materials", key);
          const materials = materialsData.map((item: any) => ({
            id: Math.random().toString(36),
            itemId: item.id,
            category: item.category,
            count: item.count,
            accountId: account.id,
          }));
          await storage.saveMaterials(materials, account.id);
        } catch (error) {
          console.log("Materials fetch failed:", error);
        }

        // Add some sample activities
        await storage.saveActivity({
          type: "achievement",
          description: "Achievement completed",
          reward: "50 AP",
          accountId: account.id,
        }, account.id);

        res.json({ 
          success: true, 
          account: await storage.getAccountWithDetails(apiKey.id) 
        });

      } catch (error) {
        await storage.updateApiKey(key, {
          isValid: false,
          lastValidated: new Date(),
        });
        throw error;
      }

    } catch (error) {
      console.error("API validation error:", error);
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : "Invalid API key" 
      });
    }
  });

  // Get account data
  app.get("/api/account/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const apiKey = await storage.getApiKey(key);
      
      if (!apiKey || !apiKey.isValid) {
        return res.status(404).json({ error: "API key not found or invalid" });
      }

      const account = await storage.getAccountWithDetails(apiKey.id);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      res.json(account);
    } catch (error) {
      console.error("Get account error:", error);
      res.status(500).json({ error: "Failed to fetch account data" });
    }
  });

  // Refresh account data
  app.post("/api/refresh/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const apiKey = await storage.getApiKey(key);
      
      if (!apiKey || !apiKey.isValid) {
        return res.status(404).json({ error: "API key not found or invalid" });
      }

      // Re-fetch data from GW2 API
      const accountData: GW2Account = await fetchGW2API("/account", key);
      const account = await storage.createOrUpdateAccount(accountData, apiKey.id);

      res.json({ success: true, account: await storage.getAccountWithDetails(apiKey.id) });
    } catch (error) {
      console.error("Refresh error:", error);
      res.status(500).json({ error: "Failed to refresh account data" });
    }
  });

  // Fetch item details with icons from GW2 API
  app.get("/api/items/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      const apiKey = req.headers.authorization?.replace('Bearer ', '');
      
      if (!apiKey) {
        return res.status(401).json({ error: "API key required" });
      }

      const itemData = await fetchGW2API(`/items/${itemId}`, apiKey);
      
      res.json({
        id: itemData.id,
        name: itemData.name,
        icon: itemData.icon, // This is the full render service URL
        rarity: itemData.rarity,
        type: itemData.type,
        level: itemData.level,
        description: itemData.description,
      });
    } catch (error: any) {
      console.error("Item fetch error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Bulk fetch item details
  app.post("/api/items-bulk", async (req, res) => {
    try {
      const { ids } = z.object({ ids: z.array(z.number()) }).parse(req.body);
      const apiKey = req.headers.authorization?.replace('Bearer ', '');

      if (!apiKey) {
        return res.status(401).json({ error: "API key required" });
      }

      if (ids.length === 0) {
        return res.json([]);
      }

      // GW2 API has a limit of 200 IDs per request
      const items = await fetchGW2API(`/items?ids=${ids.join(',')}`, apiKey);
      res.json(items);
    } catch (error: any) {
      console.error("Bulk item fetch error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get profession data with icons (public endpoint - no API key needed)
  app.get("/api/professions", async (req, res) => {
    try {
      const professionsData = await fetchGW2API("/professions?ids=all");
      res.json(professionsData);
    } catch (error: any) {
      console.error("Professions fetch error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get all currencies with icons (public endpoint - no API key needed)
  app.get("/api/currencies", async (req, res) => {
    try {
      const currenciesData = await fetchGW2API("/currencies?ids=all");
      res.json(currenciesData);
    } catch (error: any) {
      console.error("Currencies fetch error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get character details with equipment and inventory
  app.get("/api/characters/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const apiKey = req.headers.authorization?.replace('Bearer ', '');

      if (!apiKey) {
        return res.status(401).json({ error: "API key required" });
      }

      const [equipment, inventory] = await Promise.all([
        fetchGW2API(`/characters/${encodeURIComponent(name)}/equipment`, apiKey),
        fetchGW2API(`/characters/${encodeURIComponent(name)}/inventory`, apiKey),
      ]);

      res.json({ equipment, inventory });
    } catch (error: any) {
      console.error(`Character fetch error for ${req.params.name}:`, error);
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
