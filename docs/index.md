---
layout: home
title: 火箭吧
titleTemplate: 越记录，越美好
hero:
    name: 火箭吧
    text: 越记录，越美好
    tagline: 记录，成长
    actions:
        - theme: brand
          text: 指南
          link: /guide/husky
        - theme: alt
          text: VUE源码
          link: /vue/chapter-4/proxyAchieve
    image: /img/vitepress-logo-large.webp
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>