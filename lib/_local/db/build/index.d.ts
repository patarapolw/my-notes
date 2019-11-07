export interface IFindOptions {
    offset: number;
    limit: number | null;
    sort: {
        key: string;
        desc: boolean;
    } | null;
    fields: string[];
}
export declare type TimeStamp<T> = T & {
    createdAt: string;
    updatedAt?: string;
};
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
//# sourceMappingURL=index.d.ts.map