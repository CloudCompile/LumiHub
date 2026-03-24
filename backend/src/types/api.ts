/**
 * Planned. Subject to change.
 */

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface UploadResponse {
  id: string;
  message: string;
}

export interface DownloadResponse {
  downloads: number;
}

export interface NSFWDetectionResult {
  nsfw: boolean;
  predictions: Record<string, number>;
  threshold: number;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  tags?: string;
  nsfw?: boolean;
  ownerId?: string;
}
