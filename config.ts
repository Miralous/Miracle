// DO NOT EDIT THESE LINES!!!!! ---------------------------------------------------
import { data as momentList } from "#theme/data/moments.data";
import { data as friendList } from "#theme/data/friends.data";
import { data as iconList } from "#theme/configs/iconList";
import { data as photoList } from "#theme/data/photos.data";
import { data as contributorList } from "#theme/components/contributors/contributors";

// Experimental: i18n
import { zh, en } from "#theme/lang/index";

const languageMap: Record<string, any> = { zh, en };

// Languages ----------------------------------------------------------------------
// Note: change this to "zh" to use Chinese.
// Website language (zh / en)
const defaultLanguage = "en";
const languageFile = languageMap[defaultLanguage] || en; // Do not edit this.
// Configs ----------------------------------------------------------------------
export const globalConfig = {
  title: "Silvaire's Blog", // Title
  description: "Per Aspera Ad Astra", // Description
  author: "Silvaire", // Your name
  favicon:
    "https://wsrv.nl/?url=avatars.githubusercontent.com/u/184231508?s=400&u=0a370792ba6bbb95a04d309171b562bcd7283a0f&v=4&mask=circle", // Favicon (suggest: circle mask)
  url: "https://silvaire.top", // Main URL (https://xxxx.xxx)
  dateCreated: "2024-03-23", // Date created (YYYY-MM-DD)
  deepHideNegative: true, // Enable pressing "s(how)" for 1s to show the negative button.
  multiSelect: false, // Allow selecting multiple tags/categories/artists at once to show their content together. If false, only one can be selected.
  // ! Please create an environment in GitHub settings called 'friend-link-review' and set yourself as a reviewer before using it.
  allowWorkflowAddFriendLink: true, // Allow adding friend links from issues automatically.
  textBannerMode: true,
  // Theme settings
  styles: {
    color: {
      hue: 280,
      monochrome: false,
      globalHue: false, // If true, the hue applies to all colors. If false, only the brand color hue changes; other colors are calculated from the Catppuccin Latte & Macchiato palette.
      rainbow: {
        enabled: false, // The hue will cycle.
        speed: 10, // Hue = (getCurrentHue() + x) % 360 ... (updateHue, 100).
      }, // Copied from the 2nd Easter egg updated in 2026 (just for fun).
    },
    visual: {
      transition: 10, // x[seconds] / 100 | e.g. 10 -> 0.1s (default)
      gap: 12, // x[px]
      radius: 26, // x[px]
      enableCardTitle: true, // Show title in custom cards (warning, danger, etc.)
      transparent: false, // Transparent? (for year & artist)
      uppercase: false, // CATEGORIES / Categories
      mono: false, // Use a monospace font for titles.
      pageAnimation: {
        enabled: false,
        time: 0.7, // (s)
      },
      card: "column", // Column / row for music & friend cards.
      cardHover: {
        enabled: true, // Enable card hover effect.
        scale: 1.02,
        maxMove: 4,
        maxRotate: 1, // 3D effect | set 0 to disable 3D.
        easing: 0.2,
      },
    },
  },

  // Homepage settings (when globalConfig.modules.banner is a URL)
  homePage: {
    avatar:
      "https://wsrv.nl/?url=avatars.githubusercontent.com/u/184231508?s=400&u=0a370792ba6bbb95a04d309171b562bcd7283a0f&v=3", // Your avatar
    // Modules
    modules: {
      banner: {
        imgurl:
          "https://i.mji.rip/2026/05/26/b15f373cb4e715b252bb9aa3f5687904.jpeg", // Only works when the type is image, e.g. "https://cdn.jsdelivr.net/gh/Miralous/Miracle@main/src/assets/banner.png"
        image: "70vh", // Only works when the type is "image", e.g. "65vh"
      },
      pictures: false, // Show pictures
      lastMoment: true, // Last moment
      recentPosts: true, // Recent posts
      projects: true, // Projects (may be very slow)
      musics: true, // Music list
      techStack: true, // Tech stack
      friends: true, // Friends
    },

    // Stacks (https://cdn.jsdelivr.us/gh/devicons/devicon/icons/${stack.icon}/${stack.icon}-original.svg)
    stacks: [
      { name: "Arch Linux", icon: "archlinux" },
      { name: "CSS", icon: "css3" },
      { name: "HTML", icon: "html5" },
      { name: "Linux", icon: "linux" },
      { name: "Vue", icon: "vuejs" },
      { name: "JSON", icon: "json" },
      { name: "JavaScript", icon: "javascript" },
      { name: "PNPM", icon: "pnpm" },
      { name: "Visual Studio Code", icon: "vscode" },
      { name: "VSCodium", icon: "vscodium" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Node.js", icon: "nodejs" },
      { name: "Vite", icon: "vitejs" },
      { name: "Vim", icon: "vim" },
      { name: "Neovim", icon: "neovim" },
      { name: "Windows", icon: "windows11" },
      { name: "Git", icon: "git" },
      { name: "NPM", icon: "npm" },
      { name: "Yarn", icon: "yarn" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
      { name: "Docker", icon: "docker" },
    ],
  },

  github: "Miralous", // Your GitHub username
  miracleRepoName: "Miracle", // Miracle repo name

  // Navigation items
  nav: [
    { text: languageFile.dashboard, link: "/" },
    {
      text: languageFile.articles,
      items: [
        { text: languageFile.archives, link: "/archives" },
        { text: languageFile.moments, link: "/moments" },
        { text: languageFile.timeline, link: "/timeline" },
        { text: languageFile.about, link: "/about" },
      ],
    },
    {
      text: languageFile.others,
      items: [
        { text: languageFile.friends, link: "/friends" },
        // Enable / disable music list
        { text: languageFile.musics, link: "/musics" },
        { text: languageFile.photos, link: "/photos" },
        // Enable / disable comments
        { text: languageFile.whiteboard, link: "/whiteboard" },
      ],
    },
  ],

  EXIF_GPS: true, // Enable GPS in EXIF (if false, GPS is hidden).
  // Shows the 'GPS' field in the configuration below.
  abbreviated_metadata: ["Model", "ISO", "ExposureTime", "ApertureValue"],
  detail_metadata: [
    "Model",
    "ISO",
    "ExposureTime",
    "ApertureValue",
    "FocalLengthIn35mmFormat",
    "GPS",
  ],

  convert_photos: false, // Enable converting photos to WebP or AVIF (if false, photos are not converted).
  convert_photos_format: "webp", // Convert photos to WebP or AVIF (webp / avif).
  convert_photos_quality: 80, // Convert photos quality (0-100).

  // About
  about: {
    desc: "A student who is learning frontend development",
    tags: [
      {
        icon: "ph:city-duotone",
        title: "Location",
        content: "Tianjin",
      },
      {
        icon: "ph:ruler-duotone",
        title: "Height",
        content: "152 CM",
      },
    ],
    todo: [
      { complete: true, text: "Write more articles" },
      { complete: false, text: "Miracle v2" },
      { complete: false, text: "Make more friends" },
    ],
    schedule: {
      enabled: true,
      monday: [
        { time: "07:30-07:50", name: "English" },
        { time: "08:00-08:45", name: "Chinese" },
        { time: "09:15-10:00", name: "Biology" },
        { time: "10:15-11:00", name: "Geography" },
        { time: "11:15-12:00", name: "English" },
        { time: "13:30-14:15", name: "Maths" },
        { time: "14:30-15:15", name: "Physical Education" },
        { time: "15:30-16:15", name: "English" },
        { time: "16:45-17:30", name: "English" },
        { time: "17:45-18:20", name: "Drama" },
      ],
      tuesday: [
        { time: "07:30-07:50", name: "Maths" },
        { time: "08:00-08:45", name: "Maths" },
        { time: "09:15-10:00", name: "English" },
        { time: "10:15-11:00", name: "Physical Education" },
        { time: "11:15-12:00", name: "Biology" },
        { time: "13:30-14:15", name: "Political Education" },
        { time: "14:30-15:15", name: "Labor" },
        { time: "15:30-16:15", name: "Chinese" },
        { time: "16:45-17:30", name: "Geography" },
        { time: "17:45-18:20", name: "History" },
      ],
      wednesday: [
        { time: "07:30-07:50", name: "Geography" },
        { time: "08:00-08:45", name: "Chinese" },
        { time: "09:15-10:00", name: "Political Education" },
        { time: "10:15-11:00", name: "Maths" },
        { time: "11:15-12:00", name: "Maths" },
        { time: "13:30-14:15", name: "Chinese" },
        { time: "14:30-15:15", name: "Physical Education (Public)" },
        { time: "15:30-16:15", name: "Geography" },
        { time: "16:45-17:30", name: "Maths" },
        { time: "17:45-18:20", name: "Maths" },
      ],
      thursday: [
        { time: "07:30-07:50", name: "Chinese" },
        { time: "08:00-08:45", name: "English" },
        { time: "09:15-10:00", name: "Information Technology" },
        { time: "10:15-11:00", name: "Music" },
        { time: "11:15-12:00", name: "History" },
        { time: "13:30-14:15", name: "Physical Education" },
        { time: "14:30-15:15", name: "Chinese" },
        { time: "15:30-16:15", name: "Chinese" },
        { time: "16:45-17:30", name: "Chinese" },
        { time: "17:45-18:20", name: "Chinese" },
      ],
      friday: [
        { time: "07:30-07:50", name: "English" },
        { time: "08:00-08:45", name: "Art" },
        { time: "09:15-10:00", name: "Biology" },
        { time: "10:15-11:00", name: "Political Education" },
        { time: "11:15-12:00", name: "History" },
        { time: "13:30-14:15", name: "English" },
        { time: "14:30-15:15", name: "Maths" },
        { time: "15:30-16:15", name: "Physical Education (Public)" },
        { time: "16:45-17:30", name: "English" },
        { time: "17:45-18:20", name: "English" },
      ],
      saturday: [
        { time: "09:30-12:00", name: "Maths" },
        { time: "14:00-15:00", name: "Physical Education (Kick Boxing)" },
        { time: "19:00-21:30", name: "Chinese / Drama" },
      ],
      sunday: [
        { time: "09:30-12:00", name: "English" },
        { time: "15:00-16:00", name: "Instrument" },
      ],
    },
  },

  // Comments
  comments: {
    enabled: true,
    type: "giscus",
    giscus: {
      repo: "Miralous/Miracle",
      repoId: "R_kgDOPz1WLw",
      categoryId: "DIC_kwDOPz1WL84Cvsrq",
      themes: {
        light: "https://giscus.catppuccin.com/themes/latte.css",
        dark: "https://giscus.catppuccin.com/themes/mocha.css",
      },
    },
    twikoo: {
      env: "https://twikoo.qwq.blue",
    },
  },

  // Waterfall
  waterfall: {
    oneColumnMax: 700,
    twoColumnMax: 1050,
  },

  // Friend weight (default: 0)
  // The higher the weight, the lower the friend appears.
  friendWeights: {
    // Example: -99, // "example" will be displayed at the top
    Miracle: -99,
    friends: -1,
    unable: 0, // "unable" will be displayed at the bottom.
  },

  // NetEase music list
  netease: {
    musicList: "17942010185",
    metingApi: "https://api.qijieya.cn/meting",
    demoMode: true, // If false, control buttons are hidden.
    showTranslation: true, // Show translated lyrics (default: false; set true to show).
    showRoman: false, // Show romanized lyrics (default: false; set true to show).
    autoplay: true, // Auto-play music when the page loads.
    visualizer: false, // Show visualizer at the bottom of player (default: false; set true to show).
    musicSlice: 0, // How many singers to display in the music list (default: 20; set 0 to display all).
    QQMusicLyricsSource: true, // Use QQ Music API to get lyrics (default: true). This greatly increases word-by-word lyrics coverage, but there is a small chance of matching the wrong song.
  },

  // ! DO NOT EDIT THESE VALUES
  friends: friendList,
  contributors: contributorList,
  moments: momentList,
  photos: photoList,
  lang: languageFile,
  icon: iconList,
};
