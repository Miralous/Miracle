export interface Contributor {
  /** display name */
  title: string;
  /** role / group label, e.g. "Maintainer" */
  role: string;
  /** profile or homepage link */
  link?: string;
  /** one-line description */
  desc?: string;
  /** avatar image url */
  img?: string;
}

// Keep the order of this array — it is the fixed display order.
export const data: Contributor[] = [
  // {
  //   title: "",
  //   role: "",
  //   link: "",
  //   desc: "",
  //   img: "",
  // },
  {
    title: "Silvaire",
    role: "Develop",
    link: "https://github.com/silvaire-qwq",
    desc: "Founder, Develop, UI/UX Design",
    img: "https://wsrv.nl/?url=avatars.githubusercontent.com/u/184231508?s=400&u=0a370792ba6bbb95a04d309171b562bcd7283a0f&v=4&mask=circle",
  },
  {
    title: "Sptanmok",
    role: "Develop",
    link: "https://github.com/Sptanmok",
    desc: "Designer of Music Player",
    img: "https://wsrv.nl/?url=https://avatars.githubusercontent.com/u/210366073?v=4&mask=circle",
  },
  {
    title: "SilverAg.H",
    role: "Develop",
    link: "https://github.com/AgxCOy",
    desc: "User, Maintain",
    img: "https://wsrv.nl/?url=https://avatars.githubusercontent.com/u/60431010?v=4&mask=circle",
  },
  {
    title: "Refac7",
    role: "Develop",
    link: "https://github.com/Refac7",
    desc: "Debug",
    img: "https://wsrv.nl/?url=avatars.githubusercontent.com/u/177718191?v=4&mask=circle",
  },
  {
    title: "Android",
    role: "Collaborators",
    link: "https://github.com/Android-KitKat",
    desc: "Co-Founder",
    img: "https://wsrv.nl/?url=avatars.githubusercontent.com/u/6592315?v=4&mask=circle",
  },
  {
    title: "Zhilu",
    role: "Collaborators",
    link: "https://github.com/pubsite",
    desc: "Develop, UI/UX Support",
    img: "https://wsrv.nl/?url=avatars.githubusercontent.com/u/52318121?v=4&mask=circle",
  },
  {
    title: "Shiroha",
    role: "Collaborators",
    link: "https://github.com/shiroha-qwq",
    desc: "Develop, Documents, Translate",
    img: "https://wsrv.nl/?url=avatars.githubusercontent.com/u/262825339?v=4&mask=circle",
  },
  {
    title: "Shimakaze",
    role: "Collaborators",
    link: "https://github.com/frg2089",
    desc: "Develop",
    img: "https://wsrv.nl/?url=avatars.githubusercontent.com/u/42184238?v=4&mask=circle",
  },
  {
    title: "Pinpe",
    role: "Collaborators",
    link: "https://github.com/Pinpe",
    desc: "Develop",
    img: "https://wsrv.nl/?url=avatars.githubusercontent.com/u/114710694?v=4&mask=circle",
  },
];
