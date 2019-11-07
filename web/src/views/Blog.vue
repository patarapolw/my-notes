<template lang="pug">
v-row
  v-col.col-lg-8.col-md-12
    h1.tag(v-if="$route.params.tag") {{$route.params.tag}}
    div(v-if="posts && posts.length > 0")
      post(v-for="p in posts" :id="p._id" :is-teaser="true" :key="p._id" :content="p.content")
      v-pagination(v-model="page" :length="Math.ceil(count / perPage)")
    div(v-else-if="posts")
      empty
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Post from "../components/Post.vue";
import Empty from "../components/Empty.vue";
import { normalizeArray, setTitle } from "../util";
import { g } from "../global";
import db from "../db";

@Component({
  components: {
    Post, Empty
  }
})
export default class Search extends Vue {
  private posts?: any[] | null = null;

  private page: number = 1;
  private count: number = 0;
  private perPage: number = 5;
  
  private g = g;

  public mounted() {
    this.updatePosts();
    this.onQChanged();
  }

  @Watch("$route", {deep: true})
  private async updatePosts() {
    this.page = parseInt(normalizeArray(this.$route.query.page) || "1");
    const q: string [] = [normalizeArray(this.$route.query.q || ""), "type=diary"];
    if (this.$route.params.tag) {
      q.push(`tag=${this.$route.params.tag}`);
    }
    const r = await db.cols.post.find(q.join(" "), {
      offset: (this.page - 1) * this.perPage,
      limit: this.perPage,
      sort: {
        key: "date",
        desc: true
      }
    });

    this.count = r.count;
    this.posts = r.data;
  }

  @Watch("g.q")
  onQChanged() {
    if (this.g.q.includes("\n")) {
      this.g.q = this.g.q.trim();
      this.$router.push({query: {q: this.g.q}})
      setTitle(`${this.g.q ? `${this.g.q} - ` : ""}Blog`);
    }
  }

  @Watch("page")
  onPageChanged(p: number) {
    this.$router.push({query: {page: (p || 1).toString()}});
  }
}
</script>