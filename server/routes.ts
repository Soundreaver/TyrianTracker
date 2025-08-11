import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApiKeySchema } from "@shared/schema";
import { z } from "zod";

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

async function fetchGW2API(endpoint: string, apiKey: string) {
  const response = await fetch(`${GW2_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`GW2 API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
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

        // Create or update account
        const account = await storage.createOrUpdateAccount(accountData, apiKey.id);

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

        // Fetch character inventories and equipment
        for (const char of charactersData.slice(0, 5)) { // Limit to first 5 chars to avoid rate limits
          try {
            // Get character equipment
            const equipment = await fetchGW2API(`/characters/${encodeURIComponent(char.name)}/equipment`, key);
            
            // Get character inventory (bags)
            const inventory = await fetchGW2API(`/characters/${encodeURIComponent(char.name)}/inventory`, key);
            
            // Store equipment and inventory data (would need to extend schema)
            console.log(`Fetched equipment and inventory for ${char.name}`);
          } catch (error) {
            console.log(`Failed to fetch inventory for ${char.name}:`, error);
          }
        }

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

  const httpServer = createServer(app);
  return httpServer;
}
