<template lang="pug">
v-card.ma-3
  .post--meta.pa-2
    .d-flex
      span
        v-icon mdi-account
      span.ml-3 {{author}}
      //- span
      //-   a(:href="dotProp.get(author, 'info.website') || '#'"): img.avatar(:src="author.picture")
      //- span.ml-3
      //-   a(:href="dotProp.get(author, 'info.website') || '#'") dotProp.get(author, 'info.name')
      span(style="flex-grow: 1")
      span {{dateString}}
  v-card-title
    router-link(:to="to") {{title}}
  v-card-text
    raw(:code="html")
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import moment from "moment";
import matter from "gray-matter";
import { g } from '../global';
import dotProp from "dot-prop";
import Raw from "./Raw.vue";

@Component({
  components: {Raw}
})
export default class Post extends Vue {
  @Prop() id!: string;
  @Prop({default: false}) isTeaser!: boolean;
  @Prop() content!: string;

  dotProp = dotProp;

  get matter() {
    return matter(this.content);
  }

  get title() {
    if (this.matter.data) {
      return this.matter.data.title || "";
    }

    return "";
  }

  get moment(): moment.Moment | null {
    if (this.matter.data && this.matter.data.date) {
      return moment(this.matter.data.date);
    }

    return null;
  }

  get dateString() {
    return this.moment ? this.moment.format("ddd D MMMM YYYY") : "";
  }

  get author() {
    const author = this.matter.data ? this.matter.data.author : null;
    if (!author) {
      return "Admin";
      // return g.user;
    }

    return author;
  }

  get to() {
    const m = this.moment;
    if (m) {
      return `/post/${m.format("YYYY")}/${m.format("MM")}/${this.id}`;
    }

    return "";
  }

  get html(): string {
    const { content } = this.matter;
    if (this.isTeaser) {
      return content.split(/\r?\n===\r?\n/)[0];
    } else {
      return content;
    }
  }
}
</script>

<style lang="scss">
.avatar {
  border-radius: 50%;
  height: 24px;
}

.hanzi-img {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  font-size: 80px;
  font-family: serif;
}

.post--meta {
  a {
    text-decoration: none;
  }
}
</style>