<template lang="pug">
v-container.pa-0(style="height: 100%")
  v-row(style="height: 100%")
    v-col.col-lg-4.h-100(fixed style="overflow-y: scroll;" :class="html ? 'hidden-md-and-down' : 'col-md-12'")
      v-treeview(@update:active="onSelected" :open="open" :items="items" item-key="data._id"
      open-on-click activatable return-object)
    v-divider(vertical)
    v-col.h-100(fixed style="overflow-y: scroll;" v-if="html")
      div(:code="html" style="width: 100%; white-space: pre-wrap;")
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { normalizeArray, setTitle } from "../util";
import ToNested, { ITreeViewItem } from "record-to-nested";
import matter from "gray-matter";
import dotProp from "dot-prop";
import Raw from "../components/Raw.vue";
import db from "../db";

@Component({
  components: {Raw}
})
export default class App extends Vue {
  private items: any[] = [];
  private open = [];

  private html: string = "";
  private title: string = "";

  private toNested = new ToNested({key: "deck"});

  async mounted() {
    const r = await db.cols.post.find("type=resource", {
      limit: null,
      fields: ["_id", "deck", "title"]
    });

    this.items = this.toNested.toNested(r.data);
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

  @Watch("$route", {deep: true})
  async onRouteChanged() {
    if (this.id) {
      const r = await db.cols.post.get(this.id);
      this.html = matter(r.content).content;
    } else {
      this.html = "";
    }
  }

  onSelected(v: ITreeViewItem[]) {
    if (v.length > 0) {
      const {data} = v[0];
      if (data) {
        this.id = data._id;
        this.title = data.title;
      } else {
        this.id = "";
        this.title = "";
      }
    }
  }

  @Watch("title")
  onTitleChange() {
    setTitle(`${this.title ? `${this.title} - ` : ""}Quiz`);
  }
}
</script>