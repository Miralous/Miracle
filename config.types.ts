import { data as momentList } from "#theme/data/moments.data";
import { data as friendList } from "#theme/data/friends.data";
import { data as iconList } from "#theme/data/iconList";
import { data as photoList } from "#theme/data/photos.data";
import { zh, en } from "#theme/lang/index";

const languageMap: Record<string, any> = { zh, en };
const languageFile = languageMap["en"] || en;

export interface GithubInfo {
  name: string;
  repo: string;
}

export interface Informations {
  title: string;
  description: string;
  author: string;
  favicon: string;
  avatar: string;
  url: string;
  dateCreated: string;
  github: GithubInfo;
}

export interface Features {
  deepHideNegative: boolean;
  multiSelect: boolean;
  allowWorkflowConfigFriendLink: boolean;
}

export interface RainbowColor {
  enabled: boolean;
  speed: number;
}

export interface ColorConfig {
  hue: number;
  monochrome: boolean;
  globalHue: boolean;
  rainbow: RainbowColor;
}

export interface CardHover {
  enabled: boolean;
  scale: number;
  maxMove: number;
  maxRotate: number;
  easing: number;
}

export interface CardVisual {
  type: "column" | "row";
  hover: CardHover;
}

export interface PageAnimation {
  enabled: boolean;
  time: number;
  translateY: number;
  blur: number;
}

export interface VisualConfig {
  transition: number;
  gap: number;
  radius: number;
  enableCardTitle: boolean;
  transparent: boolean;
  uppercase: boolean;
  mono: boolean;
  pageAnimation: PageAnimation;
  card: CardVisual;
}

export interface StylesConfig {
  color: ColorConfig;
  visual: VisualConfig;
}

export type FriendWeights = Record<string, number>;

export interface NeteaseConfig {
  musicList: string;
  metingApi: string;
  showButtons: boolean;
  showTranslation: boolean;
  showRoman: boolean;
  autoplay: boolean;
  visualizer: boolean;
  musicSlice: number;
  QQMusicLyricsSource: boolean;
}

export interface PhotoConfig {
  exifGps: boolean;
  abbreviatedMetadata: string[];
  detailMetadata: string[];
  convertPhotos: boolean;
  convertPhotosFormat: "webp" | "avif";
  convertPhotosQuality: number;
}

export interface BannerImage {
  url: string;
  height: string;
}

export interface BannerConfig {
  type: "text" | "image";
  image: BannerImage;
}

export interface HomeModules {
  pictures: boolean;
  lastMoment: boolean;
  recentPosts: boolean;
  projects: boolean;
  musics: boolean;
  techStack: boolean;
  friends: boolean;
}

export interface Stack {
  name: string;
  icon: string;
}

export interface HomePageConfig {
  banner: BannerConfig;
  modules: HomeModules;
  stacks: Stack[];
}

export interface NavSubItem {
  text: string;
  link: string;
}

export interface NavLinkItem {
  text: string;
  link: string;
  items?: never;
}

export interface NavGroupItem {
  text: string;
  link?: never;
  items: NavSubItem[];
}

export type NavItem = NavLinkItem | NavGroupItem;

export interface AboutTag {
  icon: string;
  title: string;
  content: string;
}

export interface TodoItem {
  complete: boolean;
  text: string;
}

export interface ContactItem {
  icon: string;
  platform: string;
  account: string;
  link?: string;
}

export interface ScheduleItem {
  time: string;
  name: string;
}

export interface ScheduleConfig {
  enabled: boolean;
  monday: ScheduleItem[];
  tuesday: ScheduleItem[];
  wednesday: ScheduleItem[];
  thursday: ScheduleItem[];
  friday: ScheduleItem[];
  saturday: ScheduleItem[];
  sunday: ScheduleItem[];
}

export interface AboutConfig {
  desc: string;
  tags: AboutTag[];
  todo: TodoItem[];
  contacts: ContactItem[];
  schedule: ScheduleConfig;
}

export interface GiscusThemes {
  light: string;
  dark: string;
}

export interface GiscusConfig {
  repo: string;
  repoId: string;
  categoryId: string;
  themes: GiscusThemes;
}

export interface TwikooConfig {
  env: string;
}

export interface CommentsConfig {
  enabled: boolean;
  type: "giscus" | "twikoo";
  giscus?: GiscusConfig;
  twikoo?: TwikooConfig;
}

export interface WaterfallConfig {
  oneColumnMax: number;
  twoColumnMax: number;
}

export interface GlobalConfig {
  informations: Informations;
  features: Features;
  styles: StylesConfig;
  friendWeights: FriendWeights;
  netease: NeteaseConfig;
  photo: PhotoConfig;
  homePage: HomePageConfig;
  nav: NavItem[];
  about: AboutConfig;
  comments: CommentsConfig;
  waterfall: WaterfallConfig;

  friends: typeof friendList;
  moments: typeof momentList;
  photos: typeof photoList;
  lang: typeof languageFile;
  icon: typeof iconList;
}
