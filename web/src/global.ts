import { fetchJSON } from './util';

declare global {
  interface Window {
    fetchJSON(url: string, data?: any, method?: string): Promise<Response>
  }
}

window.fetchJSON = fetchJSON;

export const g: {
  q: string;
  user: any;
} = {
  q: "",
  user: null
};
