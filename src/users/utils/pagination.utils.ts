import { NotFoundException } from "@nestjs/common";
import { Document, Model } from "mongoose";
import { User } from "src/schemas/User.schema";

export const mongoosePagination = async <T>(
  limitQuery: number,
  pageQuery: number,
  query: any,
  model: Model<T>
) => {
  const page = pageQuery || 1;
  const pageSize = limitQuery || 20;
  const skip = (page - 1) * pageSize;
  const total = await model.countDocuments();
  const pages = Math.ceil(total / pageSize);
  query = query.skip(skip).limit(pageSize);

  if (page > pages) {
    throw new NotFoundException("Page not found !!");
  }

  const result = await query;

  return {
    count: result.length,
    page,
    pages,
    data: result,
  };
};

export const cachePagination = async (
  limitQuery: number,
  pageQuery: number,
  cachedData: User[],
) => {
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
