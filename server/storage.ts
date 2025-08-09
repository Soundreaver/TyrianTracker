import { 
  type ApiKey, 
  type InsertApiKey, 
  type Account,
  type Character,
  type Wallet,
  type BankItem,
  type Material,
  type Activity,
  type AccountWithDetails 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // API Key management
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  getApiKey(key: string): Promise<ApiKey | undefined>;
  updateApiKey(key: string, data: Partial<ApiKey>): Promise<ApiKey | undefined>;
  
  // Account management
  createOrUpdateAccount(accountData: any, apiKeyId: string): Promise<Account>;
  getAccount(apiKeyId: string): Promise<Account | undefined>;
  getAccountWithDetails(apiKeyId: string): Promise<AccountWithDetails | undefined>;
  
  // Character management
  saveCharacters(characters: Character[], accountId: string): Promise<Character[]>;
  
  // Wallet management
  saveWallet(wallet: Wallet[], accountId: string): Promise<Wallet[]>;
  
  // Bank items
  saveBankItems(items: BankItem[], accountId: string): Promise<BankItem[]>;
  
  // Materials
  saveMaterials(materials: Material[], accountId: string): Promise<Material[]>;
  
  // Activities
  saveActivity(activity: Omit<Activity, 'id' | 'timestamp'>, accountId: string): Promise<Activity>;
  getRecentActivities(accountId: string, limit?: number): Promise<Activity[]>;
}

export class MemStorage implements IStorage {
  private apiKeys: Map<string, ApiKey>;
  private accounts: Map<string, Account>;
  private characters: Map<string, Character[]>;
  private wallet: Map<string, Wallet[]>;
  private bankItems: Map<string, BankItem[]>;
  private materials: Map<string, Material[]>;
  private activities: Map<string, Activity[]>;

  constructor() {
    this.apiKeys = new Map();
    this.accounts = new Map();
    this.characters = new Map();
    this.wallet = new Map();
    this.bankItems = new Map();
    this.materials = new Map();
    this.activities = new Map();
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const id = randomUUID();
    const newApiKey: ApiKey = {
      id,
      key: apiKey.key,
      accountName: null,
      permissions: null,
      isValid: false,
      lastValidated: null,
      createdAt: new Date(),
    };
    this.apiKeys.set(apiKey.key, newApiKey);
    return newApiKey;
  }

  async getApiKey(key: string): Promise<ApiKey | undefined> {
    return this.apiKeys.get(key);
  }

  async updateApiKey(key: string, data: Partial<ApiKey>): Promise<ApiKey | undefined> {
    const existing = this.apiKeys.get(key);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...data };
    this.apiKeys.set(key, updated);
    return updated;
  }

  async createOrUpdateAccount(accountData: any, apiKeyId: string): Promise<Account> {
    const account: Account = {
      id: accountData.id,
      name: accountData.name,
      world: accountData.world,
      created: accountData.created ? new Date(accountData.created) : null,
      access: accountData.access || [],
      commander: accountData.commander || false,
      fractalLevel: accountData.fractal_level || 0,
      dailyAp: accountData.daily_ap || 0,
      monthlyAp: accountData.monthly_ap || 0,
      wvwRank: accountData.wvw_rank || 0,
      apiKeyId,
    };
    
    this.accounts.set(apiKeyId, account);
    return account;
  }

  async getAccount(apiKeyId: string): Promise<Account | undefined> {
    return this.accounts.get(apiKeyId);
  }

  async getAccountWithDetails(apiKeyId: string): Promise<AccountWithDetails | undefined> {
    const account = this.accounts.get(apiKeyId);
    if (!account) return undefined;

    return {
      ...account,
      characters: this.characters.get(account.id) || [],
      wallet: this.wallet.get(account.id) || [],
      bankItems: this.bankItems.get(account.id) || [],
      materials: this.materials.get(account.id) || [],
      activities: this.activities.get(account.id) || [],
    };
  }

  async saveCharacters(characters: Character[], accountId: string): Promise<Character[]> {
    this.characters.set(accountId, characters);
    return characters;
  }

  async saveWallet(wallet: Wallet[], accountId: string): Promise<Wallet[]> {
    this.wallet.set(accountId, wallet);
    return wallet;
  }

  async saveBankItems(items: BankItem[], accountId: string): Promise<BankItem[]> {
    this.bankItems.set(accountId, items);
    return items;
  }

  async saveMaterials(materials: Material[], accountId: string): Promise<Material[]> {
    this.materials.set(accountId, materials);
    return materials;
  }

  async saveActivity(activity: Omit<Activity, 'id' | 'timestamp'>, accountId: string): Promise<Activity> {
    const newActivity: Activity = {
      id: randomUUID(),
      timestamp: new Date(),
      ...activity,
      accountId,
    };

    const existing = this.activities.get(accountId) || [];
    existing.unshift(newActivity);
    this.activities.set(accountId, existing.slice(0, 50)); // Keep only recent 50

    return newActivity;
  }

  async getRecentActivities(accountId: string, limit = 10): Promise<Activity[]> {
    const activities = this.activities.get(accountId) || [];
    return activities.slice(0, limit);
  }
}

export const storage = new MemStorage();
