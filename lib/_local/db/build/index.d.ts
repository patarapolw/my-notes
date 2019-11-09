export declare let PORT: string | null | undefined;
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
declare class Collection<T extends {
    _id: string;
    tag?: string[];
}> {
    name: string;
    constructor(name: string);
    find(q: string, options?: Partial<IFindOptions>): Promise<{
        data: TimeStamp<T>[];
        count: number;
    }>;
    get(id: string): Promise<TimeStamp<T> | null>;
    create(entry: T): Promise<{
        id: string;
    }>;
    getSafeId(title?: string): Promise<any>;
    update(id: string, update: Partial<T>): Promise<any>;
    delete(id: string): Promise<any>;
    addTag(id: string, tag: string[]): Promise<any>;
    removeTag(id: string, tag: string[]): Promise<any>;
}
export default class Database {
    cols: {
        post: Collection<IPost>;
        media: Collection<IMedia>;
    };
    constructor();
    uploadMedia(data: File, tag?: string[]): Promise<string>;
}
export {};
//# sourceMappingURL=index.d.ts.map