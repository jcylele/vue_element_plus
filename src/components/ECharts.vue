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
			</el-menu>
		</el-aside>
		<el-main>
			<router-view></router-view>
		</el-main>
	</el-container>
</template>

<script lang="ts">

import { mapActions } from "pinia";
import { SubMenuStore } from "../store/SubMenuStore";
import { MainMenu } from "../data/Enums";

export default {
	name: "ECharts",
	components: [],
	data() {
		return {}
	},
	computed: {},
	methods: {
		...mapActions(SubMenuStore, {
			setSubMenu: "set",
			getSubMenu: "get",
		}),
		onMenuItemSelect(key: string) {
			this.setSubMenu(MainMenu.Charts, key)
			this.$router.push(`/echarts/${key}`)
		},
	},
	mounted() {
		let sub_menu = this.getSubMenu(MainMenu.Charts)
		if (sub_menu) {
			this.onMenuItemSelect(sub_menu)
		}
	}
}

</script>

<style scoped></style>