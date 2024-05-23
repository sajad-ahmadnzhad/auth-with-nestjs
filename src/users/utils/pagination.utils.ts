import { Model } from "mongoose";

interface OutputPagination<T> {
  count: number;
  page: number;
  pages: number;
  data: T[];
}

export const mongoosePagination = async <T>(
  limitQuery: number,
  pageQuery: number,
  query: any,
  model: Model<T>
): Promise<OutputPagination<T>> => {
  const page = pageQuery || 1;
  const pageSize = limitQuery || 20;
  const skip = (page - 1) * pageSize;
  const total = await model.countDocuments();
  const pages = Math.ceil(total / pageSize);
  query = query.skip(skip).limit(pageSize);

  const result: T[] = await query;

  return {
    count: result.length,
    page,
    pages,
    data: result,
  };
};

export const cachePagination = async <T>(
  limitQuery: number,
  pageQuery: number,
  cachedData: T[]
): Promise<OutputPagination<T>> => {
  const page = pageQuery || 1;
  const pageSize = limitQuery || 20;
  const skip = (page - 1) * pageSize;

  const total = cachedData.length;

  const pages = Math.ceil(total / pageSize);

  const filteredData = cachedData.slice(skip, skip + pageSize);

  return {
    count: filteredData.length,
    page,
    pages,
    data: filteredData,
  };
};
