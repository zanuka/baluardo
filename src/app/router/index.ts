import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/detections',
    },
    {
      path: '/detections',
      name: 'detections',
      component: () => import('@/features/detections/views/DetectionsView.vue'),
      meta: { title: 'Detections' },
    },
    {
      path: '/detections/:id',
      name: 'detection-detail',
      component: () => import('@/features/detections/views/DetectionDetailView.vue'),
      meta: { title: 'Detection' },
    },
  ],
})
