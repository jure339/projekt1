import * as Icons from "../icons";
import { ReactElement } from "react";

// Tipi
export type NavSubItem = {
  title: string;
  url: string;
};

export type NavItem = {
  title: string;
  url?: string;
  icon: React.ElementType;
  items: NavSubItem[];
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

// Podatki
export const NAV_DATA: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Home",
        url: "/dashboard",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: Icons.Calendar,
        items: [],
      },
    ],
  },
];
