<template lang="pug">
v-app
  v-navigation-drawer(v-model="isDrawer" :clipped="$vuetify.breakpoint.lgAndUp" app)
    v-list(dense)
      v-list-item(to="/post/view")
        v-list-item-avatar
            v-icon mdi-newspaper
        v-list-item-content
          v-list-item-title Posts
      v-list-item(to="/media/view")
        v-list-item-avatar
            v-icon mdi-image-size-select-actual
        v-list-item-content
          v-list-item-title Media
      v-list-item(to="/blog")
        v-list-item-avatar
          v-icon mdi-calendar-account
        v-list-item-content
          v-list-item-title Blog
      v-list-item(to="/resource")
        v-list-item-avatar
          v-icon mdi-sitemap
        v-list-item-content
          v-list-item-title Resource
      v-list-item(to="/present")
        v-list-item-avatar
          v-icon mdi-play-box-outline
        v-list-item-content
          v-list-item-title Presentations
      v-list-item(to="/settings")
        v-list-item-avatar
          v-icon mdi-settings-outline
        v-list-item-content
          v-list-item-title Settings
      v-list-item(@click="openInNewWindow('https://github.com/patarapolw/my-notes')")
        v-list-item-avatar
          v-icon mdi-github-circle
        v-list-item-content
          v-list-item-title GitHub
    template(v-slot:append)
      v-list(dense)
        v-list-item(v-if="!g.user" href="/api/login")
          v-list-item-avatar
            v-icon mdi-account-off-outline
          v-list-item-content
            v-list-item-title Not logged in
        v-list-item(v-else @click="logout")
          v-list-item-avatar
            img(v-if="g.user.picture" :src="g.user.picture")
            v-icon(v-else) mdi-account-lock-outline
          v-list-item-content
            v-list-item-title Logged in as
            v-list-item-title {{g.user.email}}
  v-app-bar(:clipped-left="isDrawer" app color="orange" dark)
    v-toolbar-title.mr-3
      v-app-bar-nav-icon.mr-2(@click.stop="isDrawer = !isDrawer")
      span.hidden-md-and-down
        router-link(:to="$router.resolve('/').href" style="text-decoration: none; color: inherit;") My Notes
    .flex-grow-1
    v-text-field.col-lg-4(flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search"
      v-model="g.q" @keydown="onSearchKeydown")
  v-content(fluid fill-height)
    router-view
  v-dialog(:value="isSynchronizing" max-width="250" persistent)
    v-card
      v-card-title Synchronizing
      v-card-text.text-center
        v-progress-circular(indeterminate)
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { g } from "./global";
import dotProp from "dot-prop";
import db from "./db";
import { openInNewWindow, fetchJSON } from "./util";

@Component
export default class App extends Vue {
  private isDrawer: boolean = this.$vuetify.breakpoint.lgAndUp;
  private g = g;
  
  isSynchronizing = false;

  openInNewWindow = openInNewWindow;

  async created() {
    const user = await fetchJSON("/api/user");
    this.$set(this.g, "user", user);
    console.log(user)

    if (user) {
      // this.isSynchronizing = true;
    }
  }

  mounted() {
    Array.from(document.getElementsByTagName("input")).forEach((input) => {
      input.spellcheck = false;
      input.autocapitalize = "off";
      input.autocomplete = "off";
    });
  }

  @Watch("$route.path")
  onRouteChanged(to: string) {
    this.g.q = this.$route.query.q as string || "";
  }

  onSearchKeydown(evt: KeyboardEvent) {
    if (evt.code === "Enter") {
      this.g.q += "\n";
    }
  }

  async logout() {
    if (confirm("Are you sure you want to logout?")) {
      await fetchJSON("/api/logout");
      this.$set(this.g, "user", null);
    }
  }
}
</script>

<style lang="scss">
a {
  text-decoration: none;
}

img {
  max-width: 100%;
}

iframe {
  border: none;
  border-width: 0;
}

pre {
  white-space: pre-wrap;
}

.w-100 {
  width: 100%;
}

.h-100 {
  height: 100%;
}

.click-table {
  width: 100%;

  tbody tr {
    cursor: pointer;

    &:hover {
      background-color: rgb(219, 236, 241) !important;
    }
  }
}

.CodeMirror {
  .cm-tab {
    background: gray;
  }
}

input {
  caret-color: gray;
}
</style>
