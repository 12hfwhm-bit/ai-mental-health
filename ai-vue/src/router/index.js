import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '@/components/BackendLayout.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import FrontedLayout from '@/components/FrontedLayout.vue'

// 前端路由配置
const frontendroutes = [
  {
    path: '/',

    component: FrontedLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/home.vue'),
        // meta: {
        //   title: '首页',
        //   icon: 'Home'
        // }
      },
      {
        path: 'consultation',
        name: 'consultation',
        component: () => import('@/views/consultation.vue'),
        meta: {
          title: 'AI咨询',
          icon: 'Message',
          requiresAuth: true
        }
      },
      {
        path: 'emotion-diary',
        name: 'emotion-diary',
        component: () => import('@/views/emotionDiary.vue'),
        meta: {
          title: '情绪日记',
          icon: 'User',
          requiresAuth: true
        }
      },
      {
        path: 'frontend-knowledge',
        name: 'frontend-knowledge',
        component: () => import('@/views/frontendKnowledge.vue'),
        meta: {
          title: '知识库',
          icon: 'ChatLineRound'
        }
      },
      {
        path: 'knowledge/article/:id',
        name: 'knowledge-article',
        component: () => import('@/views/articleDetail.vue'),
        props: true,
        meta: {
          title: '知识文章详情',
          icon: 'ChatLineRound'
        }
      }
    ]
  },
]






// 后台路由配置
const backendroutes = [
  {
    path: '/',
    redirect: '/back/dashboard'
  },

  {
    path: '/back',
    component: BackendLayout,
    // 子路由
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: {
          title: '数据分析',
          icon: 'PieChart'
        }
      },

      {
        path: 'knowledge',
        name: 'knowledge',
        component: () => import('@/views/knowledge.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineRound'
        }
      },
      {
        path: 'consultations',
        name: 'consultations',
        component: () => import('@/views/consultations.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message'
        }
      },
      {
        path: 'emotional',
        name: 'emotional',
        component: () => import('@/views/emotional.vue'),
        meta: {
          title: '情绪日志',
          icon: 'User'
        }
      },

    ]
  }
  ,
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/login.vue'),
        meta: {
          title: '登录',

        }
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/register.vue'),
        meta: {
          title: '注册',
          icon: 'User'
        }
      }

    ]
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes: [...frontendroutes, ...backendroutes]
})

//路由前置守卫  
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (token) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo.userType === 2) {
      // 管理员可以访问后台和前台页面
      next()
    } else if (userInfo.userType === 1) {
      // 普通用户禁止访问后台页面
      if (to.path.startsWith('/back')) {
        next('/')
      } else {
        next()
      }
    } else {
      next()
    }
  } else {
    // 未登录时，尝试访问后台页面或需要认证的页面强制跳转登录
    if (to.path.startsWith('/back') || to.meta.requiresAuth) {
      next({ path: '/auth/login' })
    } else {
      next()
    }
  }
})


export default router