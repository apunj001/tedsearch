export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: any[];
  searchEntryPoint?: {
    renderedContent?: string;
  };
  webSearchQueries?: string[];
}

export interface SearchResult {
  text: string;
  groundingMetadata: GroundingMetadata | null;
}

export enum SearchState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}