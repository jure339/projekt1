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
        url: "/dashboard",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Players",
        url: "/igralci",
        icon: Icons.UsersIcon,
        items: [],
      },
      {
        title: "Trainings",
        url: "/treningi",
        icon: Icons.ActivityIcon,
        items: [],
      },
      {
        title: "Games",
        url: "/tekme",
        icon: Icons.FootballIcon,
        items: [],
      },
    ],
  },
];
