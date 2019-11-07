export interface IFindOptions {
  offset: number;
  limit: number | null;
  sort: {
    key: string;
    desc: boolean;
  } | null;
  fields: string[];
}

export type TimeStamp<T> = T & {
  createdAt: string;
  updatedAt?: string;
}

export interface IUser {
  _id: string;
  type?: string;
  email: string;
  picture?: string;
  secret: string;
  info?: {
    name?: string;
    website?: string;
  };
  tag?: string[];
}

export interface IPost {
  _id: string;
  title: string;
  date?: string;
  type?: string;
  tag?: string[];
  headers: any;
  content: string;
}

export interface IMedia {
  _id: string;
  name: string;
  tag?: string[];
}