// ==================== 用户 ====================
export interface IUser {
  id: number;
  username: string;
  email: string;
  phone?: string;
  nickname: string;
  avatarUrl?: string;
  bio?: string;
  level: UserLevel;
  points: number;
  status: UserStatus;
  role: UserRole;
  wechatOpenid?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserLevel {
  LV1_NEWBIE = 1,    // 新手
  LV2_ADVANCED = 2,  // 进阶
  LV3_EXPERT = 3,    // 达人
  LV4_MASTER = 4,    // 专家
}

export enum UserStatus {
  DISABLED = 0,
  ACTIVE = 1,
}

export enum UserRole {
  USER = 'user',
  EXPERT = 'expert',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// ==================== 提示词 ====================
export interface IPrompt {
  id: number;
  title: string;
  description: string;
  content: string;
  categoryId: number;
  authorId: number;
  aiToolIds: number[];
  difficulty: PromptDifficulty;
  exampleImages: string[];
  status: PromptStatus;
  viewCount: number;
  useCount: number;
  favoriteCount: number;
  ratingAvg: number;
  ratingCount: number;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export enum PromptDifficulty {
  BEGINNER = 1,    // 入门
  ADVANCED = 2,    // 进阶
  EXPERT = 3,      // 高级
}

export enum PromptStatus {
  DRAFT = 0,       // 草稿
  REVIEWING = 1,   // 审核中
  PUBLISHED = 2,   // 已发布
  REMOVED = 3,     // 下架
}

// ==================== 分类 ====================
export interface ICategory {
  id: number;
  name: string;
  parentId?: number;
  icon?: string;
  sortOrder: number;
  status: number;
  children?: ICategory[];
  createdAt: string;
}

// ==================== 标签 ====================
export interface ITag {
  id: number;
  name: string;
  useCount: number;
  createdAt: string;
}

// ==================== 评论 ====================
export interface IComment {
  id: number;
  userId: number;
  targetType: CommentTargetType;
  targetId: number;
  parentId?: number;
  content: string;
  likeCount: number;
  status: number;
  createdAt: string;
}

export enum CommentTargetType {
  PROMPT = 'prompt',
  ARTICLE = 'article',
}

// ==================== 收藏 ====================
export interface IFavorite {
  id: number;
  userId: number;
  targetType: FavoriteTargetType;
  targetId: number;
  folderId?: number;
  createdAt: string;
}

export enum FavoriteTargetType {
  PROMPT = 'prompt',
  ARTICLE = 'article',
}

// ==================== 评分 ====================
export interface IRating {
  id: number;
  userId: number;
  promptId: number;
  score: number;
  createdAt: string;
}

// ==================== 文章 ====================
export interface IArticle {
  id: number;
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  authorId: number;
  categoryId?: number;
  tags: number[];
  chapterStructure?: IChapter[];
  viewCount: number;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface IChapter {
  title: string;
  level: 1 | 2 | 3;
  children?: IChapter[];
}

export enum ArticleStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  REMOVED = 2,
}

// ==================== AI工具 ====================
export interface IAITool {
  id: number;
  name: string;
  logoUrl?: string;
  category: string;
  description: string;
  officialUrl?: string;
  sortOrder: number;
  status: number;
}

// ==================== 浏览历史 ====================
export interface IViewHistory {
  id: number;
  userId: number;
  targetType: string;
  targetId: number;
  viewedAt: string;
}

// ==================== API 响应 ====================
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ==================== 搜索 ====================
export interface SearchQuery extends PaginationQuery {
  keyword?: string;
  categoryId?: number;
  tagIds?: number[];
  aiToolId?: number;
  difficulty?: PromptDifficulty;
  sortBy?: 'relevance' | 'hot' | 'newest' | 'rating';
}
