import { Menu } from "@/types/menu";
import { MenuItem } from "@/types/menu-item";

export const menusDataSeed: Omit<Menu, "items">[] = [
  {
    id: "menu-1",
    date: "2024-02-12"
  }
];

export const menuItemsDataSeed: (MenuItem & { menuId: string })[] = [
  {
    id: "menu-item-1",
    menuId: "menu-1",
    time: "09:30",
    title: "Lanche da Manhã",
    description: "Frutas da estação e suco natural."
  },
  {
    id: "menu-item-2",
    menuId: "menu-1",
    time: "11:30",
    title: "Almoço",
    description: "Arroz, feijão, legumes e proteína."
  },
  {
    id: "menu-item-3",
    menuId: "menu-1",
    time: "15:00",
    title: "Lanche da Tarde",
    description: "Pão de queijo e chá."
  }
];
