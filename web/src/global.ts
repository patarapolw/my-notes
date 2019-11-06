import { IUser } from './db';

declare global {
  interface Window {
    fetchJSON(url: string, data?: any, method?: string): Promise<Response>
  }
}

export const fetchJSON = (url: string, data?: any, method: string = "POST") => fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json"
  },
  body: data ? JSON.stringify(data) : undefined
});

window.fetchJSON = fetchJSON;

export const g: {
  q: string;
  user: Partial<IUser>
} = {
  q: "",
  user: {}
};
