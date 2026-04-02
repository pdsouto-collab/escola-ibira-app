import { MenuItem } from "./menu-item";

export interface Menu {
    id: string;
    date: string; // YYYY-MM-DD
    items: MenuItem[];
}
