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
  tags?: string[];
}

export interface IPost {
  _id: string;
  title: string;
  date?: string;
  type?: string;
  tags?: string[];
  headers: any;
  content: string;
}