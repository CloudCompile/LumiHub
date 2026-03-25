export interface CharacterAsset {
  type: string;
  uri: string;
  name: string;
  ext: string;
}

export interface LorebookEntry {
  keys: string[];
  content: string;
  extensions?: Record<string, any>;
  enabled: boolean;
  insertion_order: number;
  case_sensitive?: boolean;
  use_regex?: boolean;
  constant?: boolean;
  name?: string;
  priority?: number;
  id?: number | string;
  comment?: string;
  selective?: boolean;
  secondary_keys?: string[];
  position?: string | number;
  depth?: number;
  match_whole_words?: boolean;
  [key: string]: unknown;
}

export interface Lorebook {
  name?: string;
  description?: string;
  scan_depth?: number;
  token_budget?: number;
  recursive_scanning?: boolean;
  extensions: Record<string, any>;
  entries: LorebookEntry[];
}

/** Full character representation following the CCv3 spec. */
export interface LumiCharacter {
  id: string;
  name: string;
  nickname?: string;
  description: string;
  personality: string;
  scenario: string;
  first_mes: string;
  alternate_greetings: string[];
  group_only_greetings: string[];
  mes_example: string;
  creator: string;
  creator_notes: string;
  creator_notes_multilingual?: Record<string, string>;
  tags: string[];
  character_version: string;
  system_prompt: string;
  post_history_instructions: string;
  source?: string[];
  assets: CharacterAsset[];
  character_book?: Lorebook;
  extensions: Record<string, any>;
  creation_date?: number;
  modification_date?: number;
  image_path?: string;
  downloads: number;
  created_at: Date;
  updated_at: Date;
}
