export const GAME_STATUSES = ["released", "in_development", "coming_soon"] as const;
export type GameStatus = (typeof GAME_STATUSES)[number];
export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  released: "Released",
  in_development: "In Development",
  coming_soon: "Coming Soon",
};

export const PLATFORMS = ["pc", "mobile", "tablet", "console", "vr"] as const;
export type Platform = (typeof PLATFORMS)[number];
export const PLATFORM_LABELS: Record<Platform, string> = {
  pc: "PC & Mac",
  mobile: "Mobile",
  tablet: "Tablet",
  console: "Console",
  vr: "VR",
};

export const PROJECT_CATEGORIES = ["game", "ui", "models", "web", "experimental"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  game: "Roblox Games",
  ui: "UI & Interface",
  models: "Models & Assets",
  web: "Web & Tools",
  experimental: "Experimental",
};

export const PROJECT_STATUSES = ["completed", "in_progress", "upcoming"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  upcoming: "Upcoming",
};

export const POST_CATEGORIES = ["release", "update", "devlog", "community", "event", "teaser"] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];
export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  release: "New Release",
  update: "Game Update",
  devlog: "Dev Progress",
  community: "Community",
  event: "Event",
  teaser: "Sneak Peek",
};

export const CACHE_TAGS = {
  settings: "settings",
  games: "games",
  projects: "projects",
  posts: "posts",
  roblox: "roblox",
  discord: "discord",
} as const;
