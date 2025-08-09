<template>
    <el-space direction="horizontal" size="small" alignment="flex-start">
        <el-space direction="vertical" style="width: 150px;" fill>
            <el-select v-model="show_rows" @change="onShowRowsChange" multiple clearable>
                <el-option v-for="(name, index) in filter_names" :key="index" :label="name" :value="index"/>
                <template #tag>
                    <el-tag v-if="show_rows.length > 0" effect="plain" type="primary">
                        {{ show_rows.length }} rows
                    </el-tag>
                </template>
            </el-select>
            <el-checkbox v-for="row in show_rows" :key="row" :label="filter_names[row]" @change="hideRow(row)" checked
                         border/>
        </el-space>

        <el-space direction="vertical" style="padding: 5px">
            <el-form :model="filter_condition" label-width="auto" label-position="right" class="filter-form">

                <!-- filter group -->
                <el-form-item label="Group" v-if="filter_condition.show_group">
                    <el-checkbox-group v-model="filter_condition.group_id_list" @change="onAnyConditionChange"
                                       size="default">
                        <el-checkbox-button v-for="group in actor_group_list" :value="group.group_id">
                            {{ group.group_name }}<br>{{ getActorCount(group.group_id) }}
                        </el-checkbox-button>
                    </el-checkbox-group>

                    <el-switch v-model="is_group_all" size="large" active-text="All" inactive-text="None"
                               style="padding: 0 10px" width="80px" inline-prompt/>

                </el-form-item>

                <!-- filter tags -->
                <el-form-item label="Tags" v-if="filter_condition.show_tag">
                    <ActorTagFilter :tag_filter="filter_condition.tag_filter" @change="onAnyConditionChange"/>
                </el-form-item>

                <!-- score -->
                <el-form-item label="Star" v-if="filter_condition.show_score">
                    <el-rate v-model="filter_condition.show_min_score" @change="onAnyConditionChange"
                             :colors="star_colors" void-color="#777777" :max="6" allow-half/>
                    <el-text>~</el-text>
                    <el-rate v-model="filter_condition.show_max_score" @change="onAnyConditionChange"
                             :colors="star_colors" void-color="#777777" :max="6" allow-half/>
                </el-form-item>

                <!-- filter name -->
                <el-form-item label="Name" v-if="filter_condition.show_name">
                    <el-input v-model="filter_condition.name" @change="onAnyConditionChange"
                              style="width: 200px; font-size: 24px;" clearable/>
                    <el-checkbox v-model="filter_condition.linked" @change="onAnyConditionChange"
                                 style="margin-left: 10px;font-size: 24px;" border>
                        Linked
                    </el-checkbox>
                </el-form-item>

                <!-- folder -->
                <el-form-item label="Folder" v-if="filter_condition.show_folder">
                    <el-select v-model="filter_condition.folder_id" @change="onAnyConditionChange" style="width: 200px">
                        <el-option label="None" value="0"/>
                        <el-option v-for="folder in fav_folder_list" :label="folder.folder_name"
                                   :value="folder.folder_id"/>
                    </el-select>
                </el-form-item>

                <!-- remark -->
                <el-form-item label="Remark" v-if="filter_condition.show_remark">
                    <el-select v-model="filter_condition.has_remark" @change="onAnyConditionChange"
                               style="width: 200px">
                        <el-option v-for="option in remark_option_list" :label="option.label" :value="option.value"/>
                    </el-select>
                    <el-input v-if="has_remark" v-model="filter_condition.remark_str" @change="onAnyConditionChange"
                              placeholder="search in remark" style="width: 200px; font-size: 24px; margin-left: 10px"
                              clearable/>
                </el-form-item>

                <!-- Sort -->
                <el-form-item label="Sort">
                    <div v-for="(sort_item, index) in filter_condition.sort_items" class="sort_item">
                        <el-select v-model="sort_item.show_sort_type" style="width: 170px">
                            <template #header>
                                <el-button size="small" type="primary" @click="filter_condition.removeSortItem(index)"
                                           plain>
                                    Remove
                                </el-button>
                            </template>
                            <template #label>
                                <span>{{ sort_item.sort_option.full_label }}</span>
                            </template>
                            <el-option-group v-for="group in sort_group_list" :key="group.label" :label="group.label">
                                <el-option v-for="item in group.options" :key="item.value" :label="item.label"
                                           :value="item.value"/>
                            </el-option-group>
                        </el-select>
                        <svg-icon :name="sort_item.icon" size="30px" @click="sort_item.switch()"/>
                    </div>
                    <el-button style="font-size: 28px" @click="filter_condition.addSortItem()" plain>
                        +
                    </el-button>
                </el-form-item>
            </el-form>
            <!-- buttons -->
            <el-space direction="horizontal" class="filter">
                <el-button :type="cond_changed ? 'warning' : 'primary'" size="large" @click="onFilterSubmit">
                    Search
                </el-button>
                <el-button type="warning" size="large" @click="onFilterCancel">
                    Reset
                </el-button>
                <el-popover v-if="has_filter_history" trigger="hover" placement="right-start" :show-after="200"
                            :popper-style="{ 'width': 'auto' }">
                    <template #reference>
                        <el-button type="success" size="large" plain>
                            Previous
                        </el-button>
                    </template>

                    <template #default>
                        <el-space direction="vertical" size="small" fill>
                            <div v-for="filter in filter_list" :key="filter.uuid" class="common-group-item group-selectable"
                                 @click.stop="selectFilterInHistory(filter.uuid)">
                                <ActorFilterItem :item="desc" v-for="desc in filter.desc_list"/>
                            </div>
                        </el-space>
                    </template>
                </el-popover>

            </el-space>
        </el-space>
    </el-space>
</template>

<script lang="ts">
import {ActorFilterData} from "../data/ActorFilterData";
import NewActorTag from "./NewActorTag.vue";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {ActorGroupStore} from "../store/ActorGroupStore";
import {Remark_Options, Sort_Groups, Star_Colors} from "../data/Consts";
import {ActorFilterStore} from "../store/ActorFilterStore";
import {FavFolderStore} from "../store/FavFolderStore";
import SvgIcon from "./SvgIcon/index.vue";
import ActorTagFilter from "./ActorTagFilter.vue";
import {getActorCountOfGroups} from "../ctrls/ActorCtrl";
import {BoolEnum} from "../data/Enums";
import {Filter_Row_Names} from "../data/Consts";
import {nextTick} from "vue";
import ActorFilterItem from "./ActorFilterItem.vue";

export default {
    name: "ActorFilter",
    // props from parent
    props: {
        filter_condition: {
            type: ActorFilterData,
            required: true
        }
    },
    // declare emitted events to parent
    emits: ['submit'],
    components: {ActorTagFilter, SvgIcon, NewActorTag, ActorFilterItem},
    data() {
        return {
            cond_changed: false,
            is_group_all: false,
            group_count_map: new Map<number, number>(),
            show_rows: [],
        }
    },

    computed: {
        ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
        ...mapState(ActorGroupStore, {
            actor_group_list: 'sorted_list',
            group_count: 'count'
        }),
        ...mapState(FavFolderStore, {fav_folder_list: 'sorted_list'}),
        ...mapState(ActorFilterStore, {
            has_filter_history: 'has_history',
            filter_list: 'filter_list'
        }),

        sort_group_list() {
            return Sort_Groups
        },
        remark_option_list() {
            return Remark_Options
        },
        has_remark() {
            return this.filter_condition.has_remark == BoolEnum.TRUE
        },
        star_colors() {
            return Star_Colors
        },
        filter_names() {
            return Filter_Row_Names
        },
        is_show_group() {
            return this.filter_condition.show_group
        }
    },

    watch: {
        async is_group_all(new_val, _) {
            if (new_val) {
                this.fillAllGroup()
            }
            this.filter_condition.checkAllGroup(new_val)
        },

        async is_show_group(new_val, _) {
            if (!new_val) {
                return
            }
            await this.refreshGroupCount()
        },

        'filter_condition.show_rows': {
            handler(new_val: number[], _) {
                this.restoreShowRows()
            },
        }
    },

    methods: {
        ...mapActions(ActorFilterStore, {
            selectFilter: "selectFilter"
        }),

        restoreShowRows() {
            this.show_rows = this.filter_condition.getShowRows()
            // console.log("restoreShowRows", this.show_rows)
        },

        selectFilterInHistory(uuid: number) {
            const filter = this.selectFilter(uuid)
            if (filter) {
                this.filter_condition.copy(filter)
            }
        },
        async hideRow(row: number) {
            await nextTick()
            const index = this.show_rows.indexOf(row)
            if (index != -1) {
                this.show_rows.splice(index, 1)
                this.filter_condition.onRowsChange(this.show_rows)
            }
        },
        onShowRowsChange(rows: number[]) {
            this.filter_condition.onRowsChange(rows)
        },
        onAnyConditionChange() {
            this.cond_changed = true
        },
        async onFilterSubmit() {
            this.cond_changed = false
            this.$emit('submit')
        },
        onFilterCancel() {
            this.filter_condition.reset()
            this.cond_changed = true
        },
        fillAllGroup() {
            this.filter_condition.setAllGroupList(this.actor_group_list.map(group => group.group_id))
        },
        getActorCount(group_id: number): number {
            return this.group_count_map.get(group_id) || 0
        },

        async refreshGroupCount() {
            const [ok, gc_map] = await getActorCountOfGroups()
            if (ok) {
                this.group_count_map = gc_map
            }
        },

    },
    mounted() {
        this.restoreShowRows()
    }
}
</script>

<style scoped>
.sort_item {
    display: flex;
    flex-direction: row;
    margin-right: 10px;
    border-style: solid;
    border-width: 1px;
    border-radius: 5px;
    border-color: var(--el-border-color);
}
</style>