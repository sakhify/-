
export enum UserRole {
  DEALER = 'DEALER',
  FARMER = 'FARMER'
}

export interface RateLadderItem {
  minPoints: number;
  rate: number;
}

export interface DailyEntry {
  day: number;
  date: string;
  feedSacks: number;
  feedType: string;
  transportCost: number;
  mortality: number;
  medicine: string;
}

export interface SalesBatch {
  id: string;
  farmerId: string;
  batchName: string;
  chickCount: number;
  chickRate: number;
  company: string;
  dealer: string;
  feedName: string;
  startDate: string;
  endDate?: string; // New field for closing date
  dailyEntries: DailyEntry[];
  weighingData: number[][]; // Grid of weights (10x10)
  returnedKg: number;
  returnedPiece: number;
  stockKg: number;
  stockPiece: number;
  stockRate: number;
  applyMortalityCharge: boolean;
  manualDeductions: {
    label: string;
    amount: number;
  }[];
  marketRate: number;
  medicineCost: number;
  feedCostPerSack: number;
  weightUnit?: string;
  pieceUnit?: string;
  isCompleted?: boolean;
}

export interface FarmerProfile {
  id: string;
  name: string;
  location: string;
  mobile?: string;
  profilePic?: string;
}

export interface AppState {
  currentUserRole: UserRole | null;
  selectedFarmerId: string | null;
  selectedBatchId: string | null;
  farmers: FarmerProfile[];
  batches: Record<string, SalesBatch>;
  rateLadder: RateLadderItem[];
}
