import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView.vue'),
        children: [
          {
            path: '',
            redirect: 'selection', // Redirect to 'selection' by default
          },
          {
            path: 'selection',
            name: 'selection',
            component: () => import(/* webpackChunkName: "selection" */ '@/components/selection/selectionsPage.vue'),
          }
        ]
      }
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

