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
        icon: Icons.UsersIcon,
        items: [
          { title: "All Players", url: "/igralci" },
          { title: "Add Player", url: "/addplayer" },
        ],
      },
      {
        title: "Trainings",
        icon: Icons.ActivityIcon,
        items: [
          { title: "All Trainings", url: "/treningi" },
          { title: "Add Training", url: "/addtraning" },
        ],
      },
      {
        title: "Games",
        icon: Icons.FootballIcon,
        items: [
          { title: "All Games", url: "/tekme" },
          { title: "Add Game", url: "/addgame" },
        ],
      },
    ],
  },
];
