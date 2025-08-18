<template>
	<el-container>
		<el-aside width="var(--el-aside-width)" style="padding: 0 10px">
			<el-menu mode="vertical" class="el-aside-menu" @select="onNoticeTypeChange">
				<el-menu-item index="0" class="el-aside-menu-item">
					<div class="center-row" style="gap: 5px">
						<svg-icon name="search" size="20px" />
						<span>Search</span>
					</div>
				</el-menu-item>
				<el-menu-item v-for="nt in notice_type_list" :index="nt.toString()" class="el-aside-menu-item">
					<el-badge v-if="getNoticeCount(nt) > 0" :value="getNoticeCount(nt)" :max="999">
						{{ getNoticeName(nt) }}
					</el-badge>
					<span v-else>{{ getNoticeName(nt) }}</span>
				</el-menu-item>
			</el-menu>
		</el-aside>
		<el-main>
			<el-space direction="vertical" v-if="is_search">
				<el-space>
					<el-input v-model="search_actor_name" placeholder="Search Actor Name" />
					<el-button type="primary" @click="search">Search</el-button>
				</el-space>
				<el-text class="notice-type-tip">
					{{ notice_config!.tip }}
				</el-text>
				<el-table :data="notice_list" border>
					<el-table-column v-for="col in notice_config!.notice_columns" :key="col.prop_name"
						:prop="col.prop_name" :label="col.col_name" :width="200" />
				</el-table>
			</el-space>
			<el-space v-else-if="notice_count == 0" direction="vertical" fill>
				<el-text style="font-size: 24px">
					No Notice Found
				</el-text>
				<el-button v-if="is_similar" type="primary" size="default" @click="findSimilar">
					Find Similar Actor Names
				</el-button>
			</el-space>
			<el-space v-else direction="vertical" fill>
				<div class="split-row" style="min-width: 750px;">
					<div class="center-row">
						<el-pagination v-model:current-page="page_index" :page-size="page_size" :total="notice_count"
							@current-change="onPageChange" layout="total, prev, pager, next" background
							style="margin: 5px" />
						<el-text class="notice-type-tip">
							{{ notice_config!.tip }}
						</el-text>
					</div>
					<el-button type="danger" style="margin-right: 5px;" @click="deleteAll">Delete All</el-button>
				</div>
				<el-table :data="notice_list" border>
					<el-table-column v-for="col in notice_config!.notice_columns" :key="col.prop_name"
						:prop="col.prop_name" :label="col.col_name" />
					<el-table-column label="Op" width="220px">
						<template #default="scope">
							<div class="center-row">
								<el-button v-if="can_search_actor_name" type="primary" @click="toActors(scope.row)">
									Search
								</el-button>
								<el-button type="danger" @click="delNotice(scope.row.notice_id)">
									Delete
								</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>

			</el-space>
		</el-main>
	</el-container>
</template>

<script lang="ts">
import { Notice_Type_Config_Default, Notice_Type_Configs, Notice_Type_Names, Notice_Type_Values } from "../data/Consts";
import { EFilterRow, MainMenu, NoticeType } from "../data/Enums"
import NoticeData from "../data/NoticeData";
import { deleteNotice, delNoticesByType, getNotices, searchNotices } from "../ctrls/NoticeCtrl";
import { mapActions } from "pinia";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { SubMenuStore } from "../store/SubMenuStore";
import { ActorFilterData } from "../data/ActorFilterData";
import { BadgeStore } from "../store/BadgeStore";
import { findSimilarActorNames } from "../ctrls/ActorCtrl";
import { logInfo } from "../ctrls/FetchCtrl";
import { NoticeColumn, NoticeTypeConfig } from "../data/Interfaces";
import SvgIcon from "./SvgIcon/index.vue";

export default {
	name: "Notices",
	components: { SvgIcon },

	data() {
		return {
			cur_notice_type: 0,
			notice_config: Notice_Type_Config_Default,
			notice_list: [] as NoticeData[],
			notice_count: 0,
			page_index: 1,
			page_size: 50,
			search_actor_name: "",
		}
	},

	computed: {
		notice_type_list() {
			return Notice_Type_Values
		},
		can_search_actor_name(): boolean {
			return this.cur_notice_type != NoticeType.InvalidPost
		},
		is_similar(): boolean {
			return this.cur_notice_type == NoticeType.SimilarActorName
		},
		is_search(): boolean {
			return this.cur_notice_type == NoticeType.All
		}
	},

	methods: {
		...mapActions(ActorFilterStore, {
			saveFilterCondition: "saveFilter",
		}),
		...mapActions(SubMenuStore, {
			setSubMenu: "set",
			getSubMenu: "get",
		}),
		...mapActions(BadgeStore, {
			getNoticeCount: "getNoticeCount",
			setNoticeCount: "setNoticeCount",
			fetchAllNoticeCount: "fetchAllNoticeCount"
		}),

		async onNoticeTypeChange(index: string) {
			this.setSubMenu(MainMenu.Notices, index)

			this.cur_notice_type = parseInt(index)
			this.notice_config = Notice_Type_Configs[this.cur_notice_type]
			if (this.cur_notice_type == NoticeType.All) {
				this.notice_count = 0
				this.notice_list = []
				this.search_actor_name = ""
			} else {
				this.notice_count = this.getNoticeCount(this.cur_notice_type)
				this.page_index = 1
				await this.onPageChange()
			}
		},

		async delNotice(notice_id: number) {
			const [ok, _] = await deleteNotice(notice_id)
			if (ok) {
				const index = this.notice_list.findIndex((item) => item.notice_id === notice_id)
				if (index !== -1) {
					this.notice_list.splice(index, 1)
					this.notice_count -= 1
					this.setNoticeCount(this.cur_notice_type, this.notice_count)
				}
			}
		},

		async deleteAll() {
			const [ok, _] = await delNoticesByType(this.cur_notice_type)
			if (ok) {
				this.notice_count = 0
				this.notice_list = []
				this.setNoticeCount(this.cur_notice_type, 0)
			}
		},

		formatActorName(notice: NoticeData): string {
			switch (this.cur_notice_type) {
				case NoticeType.SameActorName:
					return `${notice.notice_param0}`
				case NoticeType.UnlinkedActor:
					return `${notice.notice_param0}||${notice.notice_param1}`
				case NoticeType.HasLinkedAccount:
				case NoticeType.SimilarActorName:
					return [notice.notice_param0, notice.notice_param1, notice.notice_param2, notice.notice_param3]
						.filter(param => param != null && param != "")
						.join("||")
				default:
					return ""
			}
		},

		toActors(notice: NoticeData) {
			const actor_name = this.formatActorName(notice)
			const filter_condition = new ActorFilterData()
			filter_condition.name = actor_name
			filter_condition.setRowVisible(EFilterRow.Name, true)
			this.saveFilterCondition(filter_condition)
			this.$router.push("/actors")
		},

		async onPageChange() {
			const [ok, new_list] = await getNotices(this.cur_notice_type, this.page_size, (this.page_index - 1) * this.page_size)
			if (ok) {
				this.notice_list = new_list
			}
		},

		async findSimilar() {
			const [ok, _] = await findSimilarActorNames()
			if (ok) {
				await this.fetchAllNoticeCount()
				logInfo("find similar actor names finished")
				await this.onNoticeTypeChange(this.cur_notice_type.toString())
			}
		},

		async search() {
			const [ok, new_list] = await searchNotices(this.search_actor_name)
			if (ok) {
				this.notice_list = new_list
				this.notice_count = new_list.length
			}
		},

		getNoticeName(nt: NoticeType) {
			return Notice_Type_Names[nt]
		}
	}
	,
	async mounted() {
		let sub_menu = this.getSubMenu(MainMenu.Notices)
		if (sub_menu) {
			await this.onNoticeTypeChange(sub_menu)
		}
	}
}
</script>
<style scoped>
.notice-type-tip {
	font-style: italic;
	color: var(--el-text-color-secondary);
}
</style>