export interface PaginatedUserList<T> {
  count: number;
  page: number;
  pages: number;
  data: T[];
} 