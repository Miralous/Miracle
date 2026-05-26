---
title: Markdown Test File
published: 2026-05-02
description: A lovely VitePress theme QwQ
tags: [Miracle, Demo, Markdown]
category: Miracle
origin: https://github.com/silviare-qwq/Miracle
image: "https://i.mji.rip/2026/05/26/b15f373cb4e715b252bb9aa3f5687904.jpeg"
---

# H1

## H2

### H3

#### H4

##### H5

###### H6

> Blockquote

> [!DANGER]
> DANGER

> [!WARNING]
> WARNING

> [!TIP]
> TIP

> [!NOTE]
> NOTE

> [!IMPORTANT]
> IMPORTANT

[Normal Link](https://github.com/Miralous/Miracle/archive/refs/heads/main.zip). Or you can try to download <File text="This File" url="https://github.com/Miralous/Miracle/archive/refs/heads/main.zip" icon="ph:file-archive-duotone"/>.

**Bold** _Italic_ **_Both_** ~~Delete~~ ++ins++

```typescript
import { h } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";

import { handleEasterEgg } from "./utils/easterEgg";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";

import "./styles/style.css";
import "./styles/gencolor.css";
import "./utils/rainbow";

import beforeDocs from "./components/layout/beforeDocs.vue";
import Comments from "./components/layout/afterDocs.vue";

import { registerComponents } from "./configs/registerComponents";
import { applyCssVars } from "./configs/applyCssVars";
import { globalConfig } from "#config";

let catppuccinLoaded = false;

export default {
  extends: DefaultTheme,

  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "doc-before": () => h(beforeDocs),
      "doc-after": () => h(Comments),
    }),

  enhanceApp({ app, router }) {
    enhanceAppWithTabs(app);
    registerComponents(app);

    if (typeof window === "undefined") return;

    const loadCatppuccin = async () => {
      const c = globalConfig?.styles?.color?.catppuccin;

      if (!c?.enabled) return;
      if (catppuccinLoaded) return;

      const flavor = c.flavor ?? "mocha";
      const color = c.color ?? "mauve";

      await import(
        /* @vite-ignore */
        `./styles/catppuccin/${flavor}/${color}.css`
      );

      catppuccinLoaded = true;
    };

    const init = async () => {
      await loadCatppuccin();
      applyCssVars();
    };

    const runInit = () => init();

    if (document.readyState === "complete") {
      runInit();
    } else {
      window.addEventListener("DOMContentLoaded", runInit, { once: true });
    }

    router.onAfterRouteChanged = runInit;

    document.addEventListener("keydown", ({ code }) => handleEasterEgg(code));
  },
} satisfies Theme;
```

$[-2^{15}, 2^{15} - 1]$
H~2~O
H^2^O

Footnote 1 link[^first].

[^first]: Footnote can reference [^second].

[^second]: Other footnote.

- [ ] 1
- [x] 2

==powerful==

::: left
Contents to align left
:::

::: center
Contents to align center
:::

::: right
Contents to align right
:::

::: justify
Contents to align justify
:::


![idk =100x100](https://agxcoy.shimakaze.org/assets/bottles_main-DQsJgB38.webp)
![2](https://agxcoy.shimakaze.org/assets/bottles_new_venv-Fo3s9gYU.webp)

asdasdasda

::: details
asdfhjkasfhkjdfsakhjlfsdahkjlfdsakjhlfds
:::

::: tabs
== tab 123
asfdjhkfsdajhklfda
== tab sdafkhjfkjhfskjhf
:::

::: tip
This is a tip.
:::

::: info
This is an info box.
:::

::: warning
Watch out!
:::

::: danger
STOP! This is dangerous.
:::

Markdown It Spoiler !!十分强大!!。

::: code-group

```sh [npm]
npm install vitepress-plugin-group-icons
```

```sh [yarn]
yarn add vitepress-plugin-group-icons
```

```sh [pnpm]
pnpm add vitepress-plugin-group-icons
```

```sh [bun]
bun add vitepress-plugin-group-icons
```

:::

## Big Title

This tests links in Github markdown.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac sapien vulputate, iaculis purus quis, commodo mauris. Maecenas id neque purus. Nullam a lacus porttitor, auctor diam nec, luctus sapien. Ut viverra sapien nec mauris luctus, ac molestie ante viverra. Mauris nisi nisl, commodo et condimentum non, eleifend et velit. Maecenas mollis semper massa a gravida. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi pharetra accumsan luctus. Suspendisse vitae iaculis augue. Etiam ultrices massa sit amet augue laoreet, sit amet gravida nisi bibendum. Vivamus nulla eros, ullamcorper eu tellus at, malesuada vehicula tortor. Ut sollicitudin tincidunt dolor eget varius. Mauris commodo, ipsum eget tincidunt accumsan, quam massa porta massa, at mollis risus sem a lectus. Maecenas sapien dui, eleifend sed risus eu, laoreet mattis nisi. Nunc suscipit condimentum arcu, ut venenatis turpis suscipit non.

### Medium Title

Donec hendrerit nisl sed ipsum hendrerit, eget molestie ante porttitor. Ut sed congue magna, eget tristique felis. Vestibulum ut congue lacus, non iaculis dui. Sed nec cursus nulla. Pellentesque at risus sed eros tristique semper a eu lectus. Aliquam ut cursus eros. Donec non augue et enim ullamcorper rutrum ac nec lacus. Donec eu blandit leo, quis faucibus mi.

Morbi ultrices at mi a fringilla. Nulla magna risus, pellentesque in adipiscing at, fermentum ut dolor. Donec sollicitudin ut magna non aliquam. Aenean vulputate vitae est quis dapibus. Aenean laoreet diam justo, at consequat nisi pellentesque ut. Ut molestie vulputate urna eu viverra. Praesent id commodo nisl. Aliquam quis consectetur nibh. Aenean ultricies pellentesque elit lacinia gravida. Cras a auctor magna.

#### Small Title

Donec in elementum ante, eu aliquet orci. Maecenas non venenatis ante. Etiam vel sollicitudin diam, a sodales sem. Aenean interdum quam commodo porta sagittis. Curabitur non aliquam odio. Nam pharetra tempor purus, sit amet iaculis odio placerat id. Sed hendrerit consequat lorem quis faucibus. Aenean eu eros ante. Nulla nec nunc id eros consequat dictum.

Aliquam id dolor quis est dictum hendrerit rutrum sit amet eros. Sed vehicula posuere massa, vitae auctor purus ultricies ultricies. Quisque ac neque vitae velit varius fermentum tincidunt vitae enim. Phasellus eu venenatis orci. Nullam dignissim hendrerit arcu hendrerit auctor. Nunc dapibus lobortis enim, quis dictum ante accumsan vehicula. Nam tellus nisl, eleifend vel rhoncus ut, mollis ut tellus. Curabitur quis diam sit amet risus porttitor elementum. Suspendisse potenti.

Quisque elementum augue id ipsum viverra, vel dictum velit lacinia. Quisque eget porta dui. Morbi eget nulla ut purus blandit consectetur a nec nisi. Nam ac sodales enim, suscipit mollis neque. Fusce condimentum, augue vitae elementum pellentesque, tortor erat mollis enim, non molestie libero augue vel leo. Phasellus bibendum aliquet velit, ac commodo nulla vulputate vitae. Aliquam nibh nibh, suscipit ac tellus eget, eleifend pellentesque turpis. Nullam eu fermentum tortor. Vestibulum varius ac diam nec venenatis. Sed aliquam tempus ante eget placerat. Nullam mollis eget dui vel convallis. Morbi sed nibh et metus fringilla sagittis.

Praesent nec euismod erat. Etiam ullamcorper ultrices tempus. Quisque accumsan consequat augue, id consequat magna suscipit quis. Praesent gravida pellentesque quam at porta. In consectetur sollicitudin leo vitae adipiscing. Donec in varius tortor. Vivamus nec dictum est. Cras non turpis malesuada, congue erat sit amet, congue elit. Morbi dictum condimentum nulla vitae aliquet. Curabitur eros nisl, fringilla eget ultrices sed, ullamcorper nec quam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pellentesque ultrices mi non interdum. Nulla non accumsan dolor. Curabitur eget tellus sapien.

Cras vulputate tortor sed nulla tristique condimentum in sit amet ipsum. Sed condimentum convallis eleifend. Donec pharetra, enim eu rutrum tincidunt, massa arcu consequat ipsum, sed posuere neque lorem in felis. Donec faucibus quam quis est tincidunt, id aliquam leo tempor. Quisque eget massa pretium, pharetra justo iaculis, pulvinar magna. Nam facilisis dictum dictum. Aliquam tristique, sem nec euismod cursus, purus justo consequat enim, in sollicitudin lacus arcu ultrices neque. Integer et enim imperdiet, eleifend est sed, interdum eros. Mauris vitae elit molestie, ultricies mi nec, ultricies purus.