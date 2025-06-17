<template>
    <el-space direction="horizontal" size="small" alignment="flex-start">
        <el-space direction="vertical" style="gap: 3px" fill>
            <el-text style="text-align: center;font-style: italic"> Show/Hide</el-text>
            <el-checkbox size="default" border v-model="filter_condition.show_category">Category</el-checkbox>
            <el-checkbox size="default" border v-model="filter_condition.show_tag">Tag</el-checkbox>
            <el-checkbox size="default" border v-model="filter_condition.show_score">Star</el-checkbox>
            <el-checkbox size="default" border v-model="filter_condition.show_name">Name/Link</el-checkbox>
            <el-checkbox size="default" border v-model="filter_condition.show_remark">Remark</el-checkbox>
        </el-space>

        <el-space direction="vertical" style="padding: 5px">
            <el-form :model="filter_condition"
                     label-width="auto"
                     label-position="right"
                     class="filter-form">

                <!-- filter category -->
                <el-form-item label="Category" v-if="filter_condition.show_category">
                    <el-checkbox-group
                        v-model="filter_condition.group_id_list"
                        @change="onAnyConditionChange"
                        size="default">
                        <el-checkbox-button v-for="group in actor_group_list"
                                            :value="group.group_id">
                            {{ group.group_name }}<br>{{ getActorCount(group.group_id) }}
                        </el-checkbox-button>
                    </el-checkbox-group>

                    <el-switch
                        v-model="is_category_all"
                        size="large"
                        active-text="All"
                        inactive-text="None"
                        style="padding: 0 10px"
                        width="80px"
                        inline-prompt
                    />

                </el-form-item>

                <!-- filter tags -->
                <el-form-item label="Tags" v-if="filter_condition.show_tag">
                    <ActorTagFilter :tag_filter="filter_condition.tag_filter"
                                    @change="onAnyConditionChange"/>
                </el-form-item>

                <!-- score -->
                <el-form-item label="Star" v-if="filter_condition.show_score">
                    <el-rate v-model="filter_condition.show_min_score"
                             @change="onAnyConditionChange"
                             :colors="star_colors"
                             void-color="#777777"
                             :max="6"
                             allow-half/>
                    <el-text>~</el-text>
                    <el-rate v-model="filter_condition.show_max_score"
                             @change="onAnyConditionChange"
                             :colors="star_colors"
                             void-color="#777777"
                             :max="6"
                             allow-half/>
                </el-form-item>

                <!-- filter name -->
                <el-form-item label="Name" v-if="filter_condition.show_name">
                    <el-input v-model="filter_condition.name"
                              @change="onAnyConditionChange"
                              style="width: 300px; font-size: 24px;"
                              clearable/>
                    <el-checkbox v-model="filter_condition.linked"
                                 @change="onAnyConditionChange"
                                 style="margin-left: 10px;font-size: 24px;"
                                 border>
                        Linked
                    </el-checkbox>
                </el-form-item>

                <!-- remark -->
                <el-form-item label="Remark" v-if="filter_condition.show_remark">

                    <el-checkbox v-model="filter_condition.has_remark"
                                 @change="onAnyConditionChange"
                                 style="font-size: 24px;margin-right: 10px;"
                                 border>
                        {{ filter_condition.has_remark ? "Search" : "Has Remark" }}
                    </el-checkbox>
                    <el-input v-if="filter_condition.has_remark"
                              v-model="filter_condition.remark_str"
                              @change="onAnyConditionChange"
                              style="width: 200px; font-size: 24px;"
                              clearable/>
                </el-form-item>

                <!-- Sort_Options -->
                <el-form-item label="Sort">
                    <div v-for="sort_item in filter_condition.sort_items"
                         class="sort_item">
                        <el-select v-model="sort_item.show_sort_type"
                                   style="width: 150px">
                            <el-option
                                v-for="option in sort_option_list"
                                :label="option.label"
                                :value="option.value"
                            />
                        </el-select>
                        <svg-icon :name="sort_item.icon"
                                  size="30px"
                                  @click="sort_item.switch()"/>
                    </div>
                    <el-button style="font-size: 28px"
                               @click="filter_condition.addSortItem()"
                               plain>
                        +
                    </el-button>
                </el-form-item>
            </el-form>
            <!-- buttons -->
            <el-space direction="horizontal" class="filter">
                <el-button :type="cond_changed ? 'warning' : 'primary'"
                           size="large" @click="onFilterSubmit">
                    Search
                </el-button>
                <el-button type="warning" size="large" @click="onFilterCancel">
                    Reset
                </el-button>
                <el-button v-if="has_filter_history" type="success"
                           size="large" @click="toPreviousFilter">
                    Previous
                </el-button>

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
import {Sort_Options, Star_Colors} from "../data/Consts";
import {ActorFilterStore} from "../store/ActorFilterStore";
import SvgIcon from "./SvgIcon/index.vue";
import ActorTagFilter from "./ActorTagFilter.vue";
import {getActorCountOfGroups} from "../ctrls/ActorCtrl";

export default {
    name: "ActorFilter",
    // props from parent
    props: {
        filter_condition: ActorFilterData
    },
    // declare emitted events to parent
    emits: ['submit'],
    components: {ActorTagFilter, SvgIcon, NewActorTag},
    data() {
        return {
            cond_changed: false,
            is_category_all: false,
            group_count_map: new Map<number, number>(),
            show_actor_tag: false,
        }
    },

    computed: {
        ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
        ...mapState(ActorGroupStore, {actor_group_list: 'sorted_list'}),
        ...mapState(ActorFilterStore, {has_filter_history: 'has_history'}),

        sort_option_list() {
            return Sort_Options
        },
        star_colors() {
            return Star_Colors
        },
        is_show_category() {
            return this.filter_condition.show_category
        }
    },

    watch: {
        async is_category_all(new_val, _) {
            if (new_val) {
                this.fillAllCategory()
            }
            this.filter_condition.checkAllCategory(new_val)
        },

        async is_show_category(new_val, _) {
            if (!new_val) {
                return
            }
            const [ok, gc_map] = await getActorCountOfGroups()
            if (ok) {
                this.group_count_map = gc_map
            }
        }
    },

    methods: {
        ...mapActions(ActorFilterStore, {
            saveFilterCondition: "setFilter",
            getPreviousFilter: "getPreviousFilter",
        }),
        onAnyConditionChange() {
            this.cond_changed = true
        },
        async onFilterSubmit() {
            this.cond_changed = false
            this.filter_condition.simplifySortItems()
            this.saveFilterCondition(this.filter_condition)
            this.$emit('submit')
        },
        onFilterCancel() {
            this.filter_condition.reset()
            this.cond_changed = true
        },
        toPreviousFilter() {
            let previous_filter = this.getPreviousFilter()
            if (previous_filter != null) {
                this.filter_condition.copy(previous_filter)
                this.cond_changed = true
            }
        },
        fillAllCategory() {
            this.filter_condition.setAllGroupList(this.actor_group_list.map(group => group.group_id))
        },
        getActorCount(group_id: number): number {
            return this.group_count_map.get(group_id) || 0
        }
    },
    mounted() {
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