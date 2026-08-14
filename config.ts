import { data as momentList } from "#theme/data/moments.data";
import { data as friendList } from "#theme/data/friends.data";
import { data as iconList } from "#theme/configs/iconList";
import { data as photoList } from "#theme/data/photos.data";
import { data as contributorList } from "#theme/components/contributors/contributors";
import type { GlobalConfig } from "#config.types";

// ----------------------------------------------------------------------------
// Internationalization (i18n)
// ----------------------------------------------------------------------------
import { zh, en } from "#theme/lang/index";

const languageMap: Record<string, any> = { zh, en };

// ----------------------------------------------------------------------------
// Language configuration
// ----------------------------------------------------------------------------
// Default site language. Change to "zh" to use Chinese.
// Supported values: "zh" | "en"
const defaultLanguage = "en";

// Automatically selects the language file based on `defaultLanguage`.
// Do not edit this line.
const languageFile = languageMap[defaultLanguage] || en;

// ============================================================================
// Global site configuration
// ============================================================================
export const globalConfig: GlobalConfig = {
  // --------------------------------------------------------------------------
  // Basic site information
  // --------------------------------------------------------------------------
  informations: {
    title: "Silvaire's Blog", // Site title shown in the browser tab and header.
    description: "Per Aspera Ad Astra", // Short site description / tagline.
    author: "Silvaire", // Site author name.
    favicon:
      "https://wsrv.nl/?url=avatars.githubusercontent.com/u/184231508?s=400&u=0a370792ba6bbb95a04d309171b562bcd7283a0f&v=4&mask=circle", // Site favicon URL (circle mask recommended).
    avatar:
      "https://wsrv.nl/?url=avatars.githubusercontent.com/u/184231508?s=400&u=0a370792ba6bbb95a04d309171b562bcd7283a0f&v=3", // Site avatar URL
    url: "https://silvaire.top", // Main site URL without trailing slash.
    dateCreated: "2024-03-23", // Site creation date (YYYY-MM-DD).
    github: {
      name: "Miralous", // GitHub username.
      repo: "Miracle", // GitHub repository name.
    },
  },

  // --------------------------------------------------------------------------
  // Feature toggles
  // --------------------------------------------------------------------------
  features: {
    deepHideNegative: true, // Press and hold "s" for 1 second to reveal the negative button.
    multiSelect: false, // Allow selecting multiple tags/categories/artists to combine their content.
    // If true, friend links can be added automatically from GitHub issues.
    // ! Requires a GitHub environment named "friend-link-review" with yourself as reviewer.
    allowWorkflowAddFriendLink: true,
  },

  // --------------------------------------------------------------------------
  // Theme styles
  // --------------------------------------------------------------------------
  styles: {
    color: {
      hue: 280, // Brand hue (0-360) used to generate the color palette.
      monochrome: false, // If true, the site uses a monochrome color scheme.
      globalHue: false, // If true, the hue applies to all colors. If false, only the brand hue changes.
      rainbow: {
        enabled: false, // If true, the hue cycles automatically.
        speed: 10, // Hue change speed: hue = (currentHue + speed) % 360.
      },
    },
    visual: {
      transition: 10, // Transition duration in hundredths of a second (10 = 0.1s).
      gap: 12, // Gap between cards/elements in pixels.
      radius: 26, // Border radius for cards and elements in pixels.
      enableCardTitle: true, // Show titles on custom cards (warning, danger, etc.).
      transparent: false, // Use transparent backgrounds for year/artist sections.
      uppercase: false, // Display category names in uppercase.
      mono: false, // Use a monospace font for titles.
      pageAnimation: {
        enabled: false, // Enable page transition animations.
        time: 0.7, // Animation duration in seconds.
      },
      card: {
        type: "column", // Layout direction for music and friend cards: "column" | "row".
        hover: {
          enabled: true, // Enable hover effects on cards.
          scale: 1.02, // Card scale on hover.
          maxMove: 4, // Maximum card movement (translate) on hover in pixels.
          maxRotate: 1, // Maximum 3D rotation angle on hover (set 0 to disable 3D).
          easing: 0.2, // Easing factor for smooth hover movement.
        },
      },
    },
  },

  // --------------------------------------------------------------------------
  // Friend sorting weights
  // Default weight is 0. Higher weight = displayed lower.
  // --------------------------------------------------------------------------
  friendWeights: {
    // Example: -99, // This friend would appear at the top.
    Miracle: -99,
    friends: -1,
    unable: 0, // This friend will appear at the bottom.
  },

  // --------------------------------------------------------------------------
  // NetEase music settings
  // --------------------------------------------------------------------------
  netease: {
    musicList: "17942010185", // NetEase playlist ID.
    metingApi: "https://api.qijieya.cn/meting", // Meting API endpoint.
    demoMode: true, // If false, music player control buttons are hidden.
    showTranslation: true, // Show translated lyrics.
    showRoman: false, // Show romanized lyrics.
    autoplay: true, // Auto-play music when the page loads.
    visualizer: false, // Show audio visualizer at the bottom of the player.
    musicSlice: 0, // Max number of singers to display in the music list (0 = all).
    QQMusicLyricsSource: true, // Use QQ Music API as an extra lyrics source. Increases word-by-word lyric coverage but may occasionally match the wrong song.
  },

  // --------------------------------------------------------------------------
  // Photo settings
  // --------------------------------------------------------------------------
  photo: {
    exifGps: true, // Show GPS data in photo EXIF metadata if available.
    abbreviatedMetadata: ["Model", "ISO", "ExposureTime", "ApertureValue"], // Metadata shown in abbreviated view.
    detailMetadata: [
      "Model",
      "ISO",
      "ExposureTime",
      "ApertureValue",
      "FocalLengthIn35mmFormat",
      "GPS",
    ], // Metadata shown in detail view.
    convertPhotos: false, // Convert photos to WebP/AVIF on upload/processing.
    convertPhotosFormat: "webp", // Target conversion format: "webp" | "avif".
    convertPhotosQuality: 80, // Conversion quality (0-100).
  },

  // --------------------------------------------------------------------------
  // Homepage settings
  // --------------------------------------------------------------------------
  homePage: {
    banner: {
      type: "text", // Banner type: "text" | "image".
      image: {
        url: "https://i.mji.rip/2026/05/26/b15f373cb4e715b252bb9aa3f5687904.jpeg", // Banner image URL. Only used when type is "image".
        height: "70vh", // Banner height. Only used when type is "image", e.g. "65vh".
      },
    },
    modules: {
      pictures: false, // Show pictures module.
      lastMoment: true, // Show latest moment module.
      recentPosts: true, // Show recent posts module.
      projects: true, // Show projects module (may be slow to load).
      musics: true, // Show music list module.
      techStack: true, // Show tech stack module.
      friends: true, // Show friends module.
    },

    // Tech stack icons. Icon names come from devicons:
    // https://cdn.jsdelivr.us/gh/devicons/devicon/icons/${stack.icon}/${stack.icon}-original.svg
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

  // --------------------------------------------------------------------------
  // Navigation menu
  // --------------------------------------------------------------------------
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
        // Music list page
        { text: languageFile.musics, link: "/musics" },
        { text: languageFile.photos, link: "/photos" },
        // Whiteboard / comments page
        { text: languageFile.whiteboard, link: "/whiteboard" },
      ],
    },
  ],

  // --------------------------------------------------------------------------
  // About page
  // --------------------------------------------------------------------------
  about: {
    desc: "A student who is learning frontend development", // Short personal description.
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
      monday: [{ time: "07:30-07:50", name: "English" }],
      tuesday: [{ time: "07:30-07:50", name: "Maths" }],
      wednesday: [{ time: "07:30-07:50", name: "Geography" }],
      thursday: [{ time: "07:30-07:50", name: "Chinese" }],
      friday: [{ time: "07:30-07:50", name: "English" }],
      saturday: [{ time: "09:30-12:00", name: "Maths" }],
      sunday: [{ time: "09:30-12:00", name: "English" }],
    },
  },

  // --------------------------------------------------------------------------
  // Comments
  // --------------------------------------------------------------------------
  comments: {
    enabled: true,
    type: "giscus", // Comment system: "giscus" | "twikoo".
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
      env: "https://twikoo.qwq.blue", // Twikoo server URL.
    },
  },

  // --------------------------------------------------------------------------
  // Waterfall layout
  // --------------------------------------------------------------------------
  waterfall: {
    oneColumnMax: 700, // Max viewport width (px) for one-column layout.
    twoColumnMax: 1050, // Max viewport width (px) for two-column layout.
  },

  // --------------------------------------------------------------------------
  // Auto-imported data — DO NOT EDIT
  // --------------------------------------------------------------------------
  friends: friendList,
  contributors: contributorList,
  moments: momentList,
  photos: photoList,
  lang: languageFile,
  icon: iconList,
};
