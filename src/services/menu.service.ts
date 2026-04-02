import { Menu } from "@/types/menu";

export const menuService = {
  getMenus: async (): Promise<Menu[]> => {
    const res = await fetch("/api/menus");
    if (!res.ok) throw new Error("Failed to fetch menus");
    return res.json();
  },

  getMenuById: async (id: string): Promise<Menu> => {
    const res = await fetch(`/api/menus/${id}`);
    if (!res.ok) throw new Error("Failed to fetch menu");
    return res.json();
  },

  createMenu: async (menu: Partial<Menu>): Promise<Menu> => {
    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menu),
    });
    if (!res.ok) throw new Error("Failed to create menu");
    return res.json();
  },

  updateMenu: async (id: string, menu: Partial<Menu>): Promise<Menu> => {
    const res = await fetch(`/api/menus/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menu),
    });
    if (!res.ok) throw new Error("Failed to update menu");
    return res.json();
  },

  deleteMenu: async (id: string): Promise<void> => {
    const res = await fetch(`/api/menus/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete menu");
  },
};
