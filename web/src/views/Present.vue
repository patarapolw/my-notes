<template lang="pug">
v-container.pa-0(style="height: 100%")
  v-row(style="height: 100%")
    v-col.col-lg-4.h-100(fixed style="overflow-y: scroll;" :class="id ? 'hidden-md-and-down' : 'col-md-12'")
      v-treeview(@update:active="onSelected" :open="open" :items="items" item-key="data._id" open-on-click activatable return-object)
    v-divider(vertical)
    v-col
      iframe#iframe(ref="iframe" v-if="id" :src="'reveal.html?id=' + id" frameborder="0" 
      :style="{width: $vuetify.breakpoint.lgAndUp ? 'calc(70vw - 256px)' : '100%'}")
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { normalizeArray, setTitle } from "../util";
import ToNested, { ITreeViewItem } from "record-to-nested";
import matter from "gray-matter";
import db from "../db";

@Component
export default class Reveal extends Vue {
  private items: any[] = [];
  private open = [];

  private toNested = new ToNested({key: "deck"});
  private title = "";
  private html = "";

  async mounted() {
    this.title = "";
    const r = await db.cols.post.find("type=reveal", {
      limit: null,
      fields: ["_id", "deck", "title"]
    });

    this.items = this.toNested.toNested(r.data);
    this.onTitleChange();
  }

  get id() {
    const {id} = this.$route.query;
    return id as string;
  }

  set id(value: string) {
    if (value) {
      this.$router.push({query: {id: value}});
    } else {
      this.$router.push({query: {}});
    }
  }

  async onSelected(v: ITreeViewItem[]) {
    if (v.length > 0) {
      const {data} = v[0];
      if (data) {
        this.title = data.title;
        this.id = data._id;
      } else {
        this.title = "";
        this.id = "";
      }
    }
  }

  @Watch("$route", {deep: true})
  async onTitleChange() {
    setTitle(`${this.title ? `${this.title} - ` : ""}Quiz`);
    if (this.id) {
      const r = (await db.cols.post.get(this.id)) || {} as any;
      const m = matter(r.content || "");
      this.html = m.content;
    }
  }
}
</script>

<style lang="scss">
#iframe {
  position: fixed;
  height: calc(98vh - 64px);
}
</style>