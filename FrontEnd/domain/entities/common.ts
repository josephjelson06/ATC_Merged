// Common domain types — shared across entities

export type ViewMode = 'super' | 'hotel';

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}
