<template>
    <el-space direction="vertical" fill style="width: 100%">
        <NewActorGroup @group_added="onNewGroupAdded"/>
        <el-table :data="actor_group_list" row-key="uuid">
            <el-table-column label="Name" min-width="100px">
                <template #default="scope">
                    <el-input v-model="scope.row.group_name" @change="scope.row.changed = true"/>
                </template>
            </el-table-column>
            <el-table-column label="Desc" min-width="300px">
                <template #default="scope">
                    <el-input v-model="scope.row.group_desc" @change="scope.row.changed = true"/>
                </template>
            </el-table-column>
            <el-table-column label="Priority" min-width="150px">
                <template #default="scope">
                    <el-input-number v-model="scope.row.group_priority"
                                     :min="0" :max="100"
                                     @change="scope.row.changed = true"/>
                </template>
            </el-table-column>
            <el-table-column label="Condition" min-width="150px">
                <template #default="scope">
                    <el-space direction="horizontal">
                        <svg-icon size="30px" name="edit"
                                  @click="startEditCondition(scope.row)"/>
                        <el-space direction="vertical" size="small" style="align-items: flex-start">
                            <el-text v-for="cond in scope.row.cond_list">
                                {{ cond.desc }}
                            </el-text>
                        </el-space>
                    </el-space>
                </template>
            </el-table-column>
            <el-table-column label="Has Folder" min-width="80px">
                <template #default="scope">
                    <el-switch v-model="scope.row.has_folder"
                               @change="scope.row.changed = true"/>
                </template>
            </el-table-column>
            <el-table-column label="Color" min-width="80px">
                <template #default="scope">
                    <el-color-picker v-model="scope.row.group_color"
                                     @change="scope.row.changed = true"/>
                </template>
            </el-table-column>
            <el-table-column label="Operations" min-width="250px">
                <template #default="scope">
                    <el-button v-if="scope.row.changed"
                               type="primary" size="default"
                               @click="onSaveActorGroup(scope.row)">
                        Save
                    </el-button>
                    <el-button v-if="scope.row.changed"
                               type="warning" size="default"
                               @click="onResetActorGroup(scope.row)">
                        Reset
                    </el-button>
                    <el-button type="danger" size="default"
                               @click="onDeleteActorGroup(scope.row)">
                        Delete
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-space>
    <el-dialog v-model="is_show_condition"
               :title="cond_title"
               @close="cond_actor_group = null"
               width="360px">
        <GroupCondEditor :group="cond_actor_group"
                         @submit="onSubmitCondition"
                         @cancel="onCancelCondition"/>
    </el-dialog>
</template>

<script lang="ts">
import {mapActions, mapState} from "pinia";
import {ActorGroupStore} from "../store/ActorGroupStore";
import ActorGroupData from "../data/ActorGroupData";
import NewActorGroup from "./NewActorGroup.vue";
import {delActorGroup, getActorGroup, setGroupCondition, updateActorGroup} from "../ctrls/ActorGroupCtrl";
import {logInfo, logWarn} from "../ctrls/FetchCtrl";
import SvgIcon from "./SvgIcon/index.vue";
import RemarkEditor from "./RemarkEditor.vue";
import GroupCondEditor from "./GroupCondEditor.vue";
import ActorGroupCond from "../data/ActorGroupCond";

export default {
    name: "ActorGroups",
    components: {GroupCondEditor, RemarkEditor, SvgIcon, NewActorGroup},
    data() {
        return {
            cond_actor_group: null as ActorGroupData,
        }
    },
    computed: {
        ...mapState(ActorGroupStore, {actor_group_list: 'sorted_list'}),
        is_show_condition() {
            return this.cond_actor_group != null
        },
        cond_title() {
            return this.cond_actor_group != null ? this.cond_actor_group.group_name : ""
        }
    },
    methods: {
        ...mapActions(ActorGroupStore, {
            getGroupsFromServer: 'getFromServer',
            updateGroup: 'update',
            removeGroup: 'remove',
        }),

        startEditCondition(actorGroup: ActorGroupData) {
            this.cond_actor_group = actorGroup
        },

        onNewGroupAdded() {

        },
        async onSaveActorGroup(actorGroup: ActorGroupData) {
            const [ok, actor_group] = await updateActorGroup(actorGroup)
            if (ok) {
                this.updateGroup(actor_group)
                logInfo("save succeed")
            }
        },

        async onResetActorGroup(actorGroup: ActorGroupData) {
            const [ok, actor_group] = await getActorGroup(actorGroup.group_id)
            if (ok) {
                this.updateGroup(actor_group)
                logInfo("reset succeed")
            }
        },

        async onDeleteActorGroup(actorGroup: ActorGroupData) {
            const [ok, succeed] = await delActorGroup(actorGroup.group_id)
            if (ok) {
                if (succeed) {
                    this.removeGroup(actorGroup.group_id)
                    logInfo("delete group succeed")
                } else {
                    logWarn("delete group failed, maybe has actors in it")
                }
            }
        },

        async onSubmitCondition(cond_list: ActorGroupCond[]) {
            const [ok, _] = await setGroupCondition(this.cond_actor_group.group_id, cond_list)
            if (ok) {
                this.cond_actor_group.cond_list = cond_list
                logInfo("set condition succeed")
            }
            this.cond_actor_group = null
        },
        onCancelCondition() {
            this.cond_actor_group = null
        },
    },
    async mounted() {
        await this.getGroupsFromServer()
    },
}
</script>

<style scoped>

</style>