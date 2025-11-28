export interface ReferenceItem {
  index: string;
  content: string;
  searchQuery: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface SearchResult {
  summary: string;
  sources: GroundingSource[];
  loading: boolean;
  error?: string;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYZING_PDF = 'ANALYZING_PDF',
  BROWSING_REFS = 'BROWSING_REFS',
}