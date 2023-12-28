import {createApp} from 'vue'
import {createPinia} from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import {createRouter, createWebHashHistory} from "vue-router";

import Home from "./Home.vue";
import Actors from "./components/Actors.vue";
import Download from "./components/Download.vue";
import Welcome from "./components/Welcome.vue";
import ActorTags from "./components/ActorTags.vue";
import Tasks from "./components/Tasks.vue";

import svgIcon from "./components/SvgIcon/index.vue";
import 'virtual:svg-icons-register'


// 1. 定义路由组件.
// 也可以从其他文件导入

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
    {path: '/', component: Welcome},
    {path: '/actors', component: Actors},
    // {path: '/actor_links', component: ActorLink},
    {path: '/actor_tags', component: ActorTags},
    // 动态字段以冒号开始
    {path: '/download', component: Download},
    {path: '/tasks', component: Tasks}
]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
})

//data store
const pinia = createPinia()

// 5. 创建并挂载根实例
const app = createApp(Home)
//确保 _use_ 路由实例使
//整个应用支持路由。
app.use(router)
// pinia store
app.use(pinia)
//element ui
app.use(ElementPlus)
//svg icon component
app.component('svg-icon', svgIcon)
//运行
app.mount('#app')
