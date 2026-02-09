import * as Icons from "../icons";

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
    label: "TEAM",
    items: [
      {
        title: "Home",
        url: "/playerdashboard",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Profile",
        url: "/playerprofile",
        icon: Icons.User,
        items: [],
      },
    ],
  },
];
