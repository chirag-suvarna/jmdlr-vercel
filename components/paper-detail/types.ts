export type AuthorProfile = {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_picture?: string | null;
};

export type PaperDetailData = {
  id: number;
  title: string;
  abstract: string;
  tags: string[];
  publishedDate: string | null;
  doi: string | null;
  pdfUrl: string | null;
  author: string;
  authorProfiles?: AuthorProfile[] | null;
  primaryAuthorId?: number | null;
  views: number;
  downloads: number;
  likes: number;
  comments: number;
  bookmarks: number;
  liked?: boolean;
  bookmarked?: boolean;
};
