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
					<el-badge v-if="badge_store.getNoticeCount(nt) > 0" :value="badge_store.getNoticeCount(nt)"
						:max="999">
						{{ getNoticeName(nt) }}
					</el-badge>
					<span v-else>{{ getNoticeName(nt) }}</span>
				</el-menu-item>
			</el-menu>
		</el-aside>
		<el-main>
			<div class="left-column" v-if="is_search">
				<div class="center-row">
					<el-input v-model="search_actor_name" placeholder="Search Actor Name" />
					<el-button type="primary" @click="search">Search</el-button>
				</div>
				<span class="notice-type-tip">
					{{ notice_config!.tip }}
				</span>
				<el-table :data="notice_list" border>
					<el-table-column v-for="col in notice_config!.notice_columns" :key="col.prop_name"
						:prop="col.prop_name" :label="col.col_name" />
				</el-table>
			</div>
			<div class="left-column" v-else-if="notice_count == 0">
				<span style="font-size: 24px">
					No Notice Found
				</span>
				<el-button v-if="notice_config!.btn_text" type="primary" size="default" @click="generateNotices()">
					{{ notice_config!.btn_text }}
				</el-button>
				<span v-if="notice_config!.api_path" class="last-time-text">
					Last Run: {{ getLastApiTime(notice_config!.api_path) }}
				</span>
			</div>
			<div class="left-column" v-else>
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
			</div>
		</el-main>
	</el-container>
</template>

<script setup lang="ts">
// imports
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import SvgIcon from "./SvgIcon/index.vue";
import { LogMessages } from "../data/Messages";
import { EConfirmOp, MainMenu, NoticeType } from "../data/Enums"
import { Notice_Type_Config_Default, Notice_Type_Configs, Notice_Type_Values } from "../data/Consts";
import { NoticeData } from "../data/NoticeData";
import { ActorFilterData } from "../data/ActorFilterData";
import { ActorFilterStore } from "../store/ActorFilterStore";
import { SubMenuStore } from "../store/SubMenuStore";
import { BadgeStore } from "../store/BadgeStore";
import { confirmOp, logInfo } from "../ctrls/FetchCtrl";
import { findSimilarActorIcons, findSimilarActorNames, getLastRunTimes } from "../ctrls/OtherCtrl";
import { deleteNotice, delNoticesByType, getNotices, searchNotices } from "../ctrls/NoticeCtrl";

// emits
// stores/routers
const router = useRouter()
const actor_filter_store = ActorFilterStore()
const sub_menu_store = SubMenuStore()
const badge_store = BadgeStore()
// props/models
// variables

const cur_notice_type = ref(0)
const notice_config = ref(Notice_Type_Config_Default)
const notice_list = ref([] as NoticeData[])
const notice_count = ref(0)
const page_index = ref(1)
const page_size = ref(50)
const search_actor_name = ref("")
const last_run_times = ref<Record<string, string>>({})
// computed
const notice_type_list = computed(() => {
	return Notice_Type_Values
})
const can_search_actor_name = computed(() => {
	return cur_notice_type.value != NoticeType.InvalidPost
})
const is_search = computed(() => {
	return cur_notice_type.value == NoticeType.All
})

// methods	

async function onNoticeTypeChange(index: string) {
	sub_menu_store.set(MainMenu.Notices, index)

	cur_notice_type.value = parseInt(index)
	notice_config.value = Notice_Type_Configs[cur_notice_type.value]
	if (cur_notice_type.value == NoticeType.All) {
		notice_count.value = 0
		notice_list.value = []
		search_actor_name.value = ""
	} else {
		notice_count.value = badge_store.getNoticeCount(cur_notice_type.value)
		page_index.value = 1
		await onPageChange()
	}
}

async function delNotice(notice_id: number) {
	const [ok, _] = await deleteNotice(notice_id)
	if (ok) {
		const index = notice_list.value.findIndex((item) => item.notice_id === notice_id)
		if (index !== -1) {
			notice_list.value.splice(index, 1)
			notice_count.value -= 1
			badge_store.setNoticeCount(cur_notice_type.value, notice_count.value)
		}
	}
}

async function deleteAll() {
	await confirmOp(EConfirmOp.DelAllNotice, async () => {
		const [ok, _] = await delNoticesByType(cur_notice_type.value)
		if (ok) {
			notice_count.value = 0
			notice_list.value = []
			badge_store.setNoticeCount(cur_notice_type.value, 0)
		}
	})
}

function formatActorName(notice: NoticeData): string {
	switch (cur_notice_type.value) {
		case NoticeType.SameActorName:
			return `${notice.notice_param0}`
		case NoticeType.UnlinkedActor:
			return `${notice.notice_param0}||${notice.notice_param1}`
		case NoticeType.HasLinkedAccount:
		case NoticeType.SimilarActorName:
		case NoticeType.SimilarIcon:
			return [notice.notice_param0, notice.notice_param1, notice.notice_param2, notice.notice_param3]
				.filter(param => param != null && param != "")
				.join("||")
		default:
			return ""
	}
}

function toActors(notice: NoticeData) {
	const actor_name = formatActorName(notice)
	const filter_condition = new ActorFilterData()
	filter_condition.setName(actor_name)
	actor_filter_store.saveFilter(filter_condition)
	router.push("/actors")
}

async function onPageChange() {
	const [ok, new_list] = await getNotices(cur_notice_type.value, page_size.value, (page_index.value - 1) * page_size.value)
	if (ok) {
		notice_list.value = new_list
	}
}

async function generateNotices() {
	switch (cur_notice_type.value) {
		case NoticeType.SimilarActorName:
			await findSimilarNames()
			break
		case NoticeType.SimilarIcon:
			await findSimilarIcons()
			break
		default:
			break
	}
}

async function findSimilarNames() {
	const [ok, _] = await findSimilarActorNames()
	if (ok) {
		await badge_store.fetchAllNoticeCount()
		logInfo(LogMessages.SimilarActorNames())
		await onNoticeTypeChange(cur_notice_type.value.toString())
	}
}

async function findSimilarIcons() {
	const [ok, _] = await findSimilarActorIcons()
	if (ok) {
		await badge_store.fetchAllNoticeCount()
		logInfo(LogMessages.SimilarActorIcons())
		await onNoticeTypeChange(cur_notice_type.value.toString())
	}
}

async function search() {
	const [ok, new_list] = await searchNotices(search_actor_name.value)
	if (ok) {
		notice_list.value = new_list
		notice_count.value = new_list.length
	}
}

function getNoticeName(nt: NoticeType): string {
	return Notice_Type_Configs[nt].name
}

function getLastApiTime(api_path: string) {
	return last_run_times.value[api_path]
}

async function fetchLastRunTimes() {
	const [ok, ret] = await getLastRunTimes()
	if (ok) {
		last_run_times.value = ret
	}
}

// lifecycle
onMounted(async () => {
	let sub_menu = sub_menu_store.get(MainMenu.Notices)
	if (sub_menu) {
		await onNoticeTypeChange(sub_menu)
	}
	await fetchLastRunTimes()
})
</script>
<style scoped>
.notice-type-tip {
	font-style: italic;
	color: var(--el-text-color-secondary);
}

.last-time-text {
	font-size: 14px;
	color: var(--el-text-color-regular);
}
</style>