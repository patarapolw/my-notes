// import { IUser } from '@my-notes/db';
import { fetchJSON } from './util';

declare global {
  interface Window {
    fetchJSON(url: string, data?: any, method?: string): Promise<Response>
  }
}

window.fetchJSON = fetchJSON;

export const g: {
  q: string;
  // user: Partial<IUser>
} = {
  q: "",
  // user: {}
};
