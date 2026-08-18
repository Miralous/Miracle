// ./registerComponents.ts
import { Icon } from "@iconify/vue";
import type { App } from "vue";
import Articles from "./components/article/article.vue";
import PostCard from "./components/common/postCard.vue";
import Tags from "./components/article/tags.vue";
import TagChip from "./components/common/TagChip.vue";
import ListCard from "./components/common/ListCard.vue";
import TextBanner from "./components/dashboard/TextBanner.vue";
import ImageBanner from "./components/dashboard/ImageBanner.vue";
import Friends from "./components/dashboard/Friends.vue";
import LastMoment from "./components/dashboard/LastMoment.vue";
import Projects from "./components/dashboard/Projects.vue";
import RecentPosts from "./components/dashboard/RecentPosts.vue";
import TechStack from "./components/dashboard/TechStack.vue";
import FriendCard from "./components/common/friendCard.vue";
import Comments from "./components/layout/afterDocs.vue";
import Twikoo from "./components/layout/twikoo.vue";
import Moments from "./components/moments/moments.vue";
import Musics from "./components/dashboard/Musics.vue";
import Pictures from "./components/dashboard/Pictures.vue";
import Timeline from "./components/timeline/timeline.vue";
import About from "./components/about/about.vue";
import MusicPlayer from "./components/player/player.vue";
import PhotoDetail from "./components/photo/photoDetail.vue";
import AddLink from "./components/friends/addLink.vue";

const components = {
  // Dashboard
  TextBanner,
  ImageBanner,
  RecentPosts,
  Projects,
  TechStack,
  Friends,
  LastMoment,
  Musics,
  // Components
  PostCard,
  Pictures,
  FriendCard,
  TagChip,
  ListCard,
  // Pages
  Articles,
  Tags,
  Timeline,
  About,
  AddLink,
  Moments,
  // Layout
  Icon,
  Comments,
  Twikoo,
  MusicPlayer,
  PhotoDetail,
};

type GlobalComponentTypes = typeof components;

declare module "vue" {
  interface GlobalComponents extends GlobalComponentTypes {}
}

declare global {
  interface Window {
    twikoo?: {
      init: (options: {
        envId: string;
        el: string;
        region?: string;
        path?: string;
        lang?: string;
      }) => void;
      version: string;
    };
  }
}

export function registerComponents(app: App) {
  for (const [name, component] of Object.entries(components)) {
    app.component(name, component);
  }
}
