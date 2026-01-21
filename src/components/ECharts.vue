<template>
	<el-container>
		<el-aside width="var(--el-aside-width)">
			<el-menu mode="vertical" class="el-aside-menu" @select="onMenuItemSelect">
				<el-menu-item index="tag_relatives" class="el-aside-menu-item">
					Tag Relatives
				</el-menu-item>
				<el-menu-item index="tag_scores" class="el-aside-menu-item">
					Tag Scores
				</el-menu-item>
				<el-menu-item index="score_tags" class="el-aside-menu-item">
					Score Tags
				</el-menu-item>
				<el-menu-item index="actor_group_time" class="el-aside-menu-item">
					Actor Group Time
				</el-menu-item>
				<el-menu-item index="actor_name_stats" class="el-aside-menu-item">
					Actor Name Stats
				</el-menu-item>
			</el-menu>
		</el-aside>
		<el-main>
			<router-view></router-view>
		</el-main>
	</el-container>
</template>

<script setup lang="ts">
// imports
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { SubMenuStore } from "../store/SubMenuStore";
import { MainMenu } from "../data/Enums";
// emits
// stores/routers
const subMenuStore = SubMenuStore()
const router = useRouter()
// props/models
// variables
// computed
// watch
// methods
// lifecycle

function onMenuItemSelect(key: string) {
	subMenuStore.set(MainMenu.Charts, key)
	router.push(`/echarts/${key}`)
}

onMounted(() => {
	let sub_menu = subMenuStore.get(MainMenu.Charts)
	if (sub_menu) {
		onMenuItemSelect(sub_menu)
	}
})
</script>

<style scoped></style>