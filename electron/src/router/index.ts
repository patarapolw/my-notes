import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes: [
    {path: "/", redirect: "/post/view"},
    {
      path: "/post/edit",
      component: () => import(/* webpackChunkName: "PostEdit" */ '../views/PostEdit.vue')
    },
    {
      path: "/post/view",
      component: () => import(/* webpackChunkName: "PostView" */ '../views/PostView.vue')
    },
    {
      path: "/media/view",
      component: () => import(/* webpackChunkName: "MediaView" */ '../views/MediaView.vue')
    },
    {
      path: '/resource',
      name: 'resource',
      component: () => import(/* webpackChunkName: "resource" */ '../views/Resource.vue')
    },
    {
      path: '/present',
      name: 'present',
      component: () => import(/* webpackChunkName: "present" */ '../views/Present.vue')
    },
    {
      path: "/blog",
      component: () => import(/* webpackChunkName: "blog" */ '../views/Blog.vue'),
      children: [
        {
          path: "",
          name: "blog_home",
        },
        {
          path: "tag/:tag",
          name: "blog_tag",
        },
      ]
    },
    {
      path: "/post",
      component: () => import(/* webpackChunkName: "single" */ '../views/Single.vue'),
      children: [
        {
          path: "",
          name: "blog_p_query"
        },
        {
          path: ":y/:mo/:name",
          name: "blog_p_date"
        }
      ]
    }
  ]
})

export default router
