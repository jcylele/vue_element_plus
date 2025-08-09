import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createRouter, createWebHashHistory } from "vue-router";

import Home from "./Home.vue";

const Actors = () => import("./components/Actors.vue")
const Download = () => import("./components/Download.vue")
const Welcome = () => import("./components/Welcome.vue")
const ActorTags = () => import("./components/ActorTags.vue")
const ActorGroups = () => import("./components/ActorGroups.vue")
const ActorTagGroups = () => import("./components/ActorTagGroups.vue")
const FavFolders = () => import("./components/FavFolders.vue")
const ECharts = () => import("./components/ECharts.vue")
const Tasks = () => import("./components/Tasks.vue")
const Notices = () => import("./components/Notices.vue")
const Others = () => import("./components/Others.vue")
const TagScoresChart = () => import("./components/Chart/TagScoresChart.vue")
const ScoreTagsChart = () => import("./components/Chart/ScoreTagsChart.vue")
const TagRelativeChart = () => import("./components/Chart/TagRelativeChart.vue")


import svgIcon from "./components/SvgIcon/index.vue";
import 'virtual:svg-icons-register'

// Importing the global css file
import "./global.css"
import "./dark_global.css"


// 1. 定义路由组件.
// 也可以从其他文件导入

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
	{ path: '/', component: Welcome },
	{ path: '/actors', component: Actors },
	{ path: '/actor_tags', component: ActorTags },
	{ path: '/actor_groups', component: ActorGroups },
	{ path: '/actor_tag_groups', component: ActorTagGroups },
	{ path: '/fav_folders', component: FavFolders },
	{
		path: '/echarts',
		component: ECharts,
		children: [
			{ path: 'tag_relatives', component: TagRelativeChart },
			{ path: 'tag_scores', component: TagScoresChart },
			{ path: 'score_tags', component: ScoreTagsChart },
		]
	},
	// 动态字段以冒号开始
	{ path: '/download', component: Download },
	{ path: '/tasks', component: Tasks },
	{ path: '/notices', component: Notices },
	{ path: '/others', component: Others },
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
