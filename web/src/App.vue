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
          v-icon mdi-calendar-edit
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
      v-list-item(href="https://github.com/patarapolw/my-notes" target="_blank")
        v-list-item-avatar
          v-icon mdi-github-circle
        v-list-item-content
          v-list-item-title GitHub
    //- template(v-if="user" v-slot:append)
    //-   v-card
    //-     v-card-title Logged in
    //-     v-card-text user.email
  v-app-bar(:clipped-left="isDrawer" app color="orange" dark)
    v-toolbar-title.mr-3
      v-app-bar-nav-icon.mr-2(@click.stop="isDrawer = !isDrawer")
      span.hidden-md-and-down(style="cursor: pointer;" @click="$router.push('/')") My-Notes
    .flex-grow-1
    v-text-field.col-lg-4(flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search"
      v-model="g.q" @keydown="onSearchKeydown")
  v-content(fluid fill-height)
    router-view
  //-   router-view(v-if="isUserInit")
  //- v-dialog(v-model="isUserInit === false" max-width="800")
  //-   v-card
  //-     v-card-title Create new admin user
  //-     v-card-text
  //-       v-text-field(label="Name" :value="getUserDeep('info.name')" @input="setUserDeep('info.name', $event)")
  //-       v-text-field(label="Image" :value="g.user.picture" @input="$set(g.user, 'picture', $event)")
  //-       v-text-field(label="Email" :value="g.user.email" @input="$set(g.user, 'email', $event)")
  //-       v-text-field(label="Website" :value="getUserDeep('info.website')" @input="setUserDeep('info.website', $event)")
  //-     v-card-actions
  //-       v-btn(@click="onNewUserSaved") Save
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { g } from "./global";
import dotProp from "dot-prop";
import db from "./db";

@Component
export default class App extends Vue {
  private isDrawer: boolean = this.$vuetify.breakpoint.lgAndUp;
  private g = g;
  // private isUserInit: boolean | null = null;

  async mounted() {
    Array.from(document.getElementsByTagName("input")).forEach((input) => {
      input.spellcheck = false;
      input.autocapitalize = "off";
      input.autocomplete = "off";
    });

    // g.user = (await db.cols.user.find("", {limit: 1})).data[0] || {};
    // this.isUserInit = !!g.user._id;
  }

  // getUserDeep(path: string) {
  //   return dotProp.get(g.user, path);
  // }

  // setUserDeep(path: string, value: string) {
  //   dotProp.set(g.user, path, value);
  //   this.$set(this.g, "user", g.user);
  // }

  @Watch("$route.path")
  onRouteChanged(to: string) {
    this.g.q = this.$route.query.q as string || "";
  }

  onSearchKeydown(evt: KeyboardEvent) {
    if (evt.code === "Enter") {
      this.g.q += "\n";
    }
  }

  // async onNewUserSaved() {
  //   if (g.user.email) {
  //     const sArray = new Uint32Array(1);
  //     crypto.getRandomValues(sArray);

  //     const _id = await db.cols.user.getSafeId(g.user.email);

  //     await db.cols.user.create({
  //       _id,
  //       email: g.user.email,
  //       secret: sArray[0].toString(16),
  //       type: "admin",
  //       ...g.user
  //     });

  //     g.user._id = _id;

  //     this.isUserInit = true;
  //     location.reload();
  //   }
  // }
}
</script>
