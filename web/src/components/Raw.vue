<script lang="ts">
import { Vue, Component, Prop, Emit } from "vue-property-decorator";
import MakeHTML from "../lib/make-html";

let makeHTML: MakeHTML;

@Component
export default class Raw extends Vue {
  @Prop() code!: string;

  render(h: any){
    const {lang, content} = makeHTML.parse(this.code);
    this.emitLanguage(lang);

    const div = document.createElement("div");
    div.innerHTML = content;

    return h(Vue.compile(div.outerHTML));
  }

  @Emit("lang")
  emitLanguage(lang: string) {
    return lang;
  }
}
</script>