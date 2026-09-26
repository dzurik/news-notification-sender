export type NewsCategory =
  'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology';

export interface NewsModel {
  articles: ArticleModel[];
  status: string;
  totalResults: number;
}

export interface UpdatedNewsModel {
  category: NewsCategory;
  articles: ArticleModel[];
}

export interface ArticleModel {
  author: string;
  content: string;
  description: string;
  publishedAt: Date;
  source: {
    id: string;
    name: string;
  };
  title: string;
  url: string;
  urlToImage: string;
}
