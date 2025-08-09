<template>
    <el-space direction="vertical" size="small" style="width: 100%" fill>
        <!-- posts -->
        <el-form label-width="auto" label-position="left">
            <el-form-item v-for="actor_log in actor_log_list"
                          :label="actor_log.log_type_name">
                <div v-if="actor_log.log_type == ActorLogType.Group">
                    <el-text :style="{'color': getGroupColor(actor_log.group_id)}">
                        {{ getGroupName(actor_log.group_id) }}
                    </el-text>
                </div>
                <div v-else-if="actor_log.log_type == ActorLogType.Score">
                    <el-rate v-model="actor_log.show_score"
                             :colors="star_colors"
                             void-color="#777777"
                             :max="6"
                             style="background-color: #1a1a1a50;"
                             disabled allow-half/>
                </div>
                <div v-else-if="actor_log.log_type == ActorLogType.Tag">
                    <el-tag v-for="tag_id in actor_log.tag_id_list"
                            :style="{'background': getTagBgColor(tag_id)}"
                            style="margin-right: 10px"
                            round>
                        {{ getTagName(tag_id) }}
                    </el-tag>
                </div>
                <div v-else-if="actor_log.log_type == ActorLogType.Remark">
                    <el-text class="log-remark">
                        {{ actor_log.remark }}
                    </el-text>
                </div>
                <div v-else-if="actor_log.log_type == ActorLogType.Link">
                    <el-text v-for="actor_name in actor_log.actor_names"
                             style="margin-right:10px;text-decoration-line: underline">
                        {{ actor_name }}
                    </el-text>
                </div>
                <div v-else-if="actor_log.log_type == ActorLogType.PostCount">
                    <el-text>
                        {{ actor_log.post_count }}
                    </el-text>
                </div>
                <div v-else>
                    <el-text>
                        {{ actor_log.log_param }}
                    </el-text>
                </div>
            </el-form-item>
        </el-form>
    </el-space>
</template>

<script lang="ts">
import {getActorLogs} from "../ctrls/ActorCtrl";
import {mapActions} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {ActorGroupStore} from "../store/ActorGroupStore";
import {ActorLogType} from "../data/Enums";
import {Actor_Log_Type_Names, Star_Colors} from "../data/Consts";
import ActorLog from "../data/ActorLog";

export default {
    name: "ActorLogs",
    computed: {
        ActorLogType() {
            return ActorLogType
        },
        star_colors() {
            return Star_Colors
        },
    },
    // props from parent
    props: {
        specific_actor_id: Number
    },
    data() {
        return {
            actor_log_list: [] as ActorLog[],
        }
    },
    methods: {
        ...mapActions(ActorTagStore, {
            getTagBgColor: 'getBgColor',
            getTagName: 'getName',
        }),

        ...mapActions(ActorGroupStore, {
            getGroupName: 'getName',
        }),

		getGroupColor(group_id: number): string {
			let group = this.getActorGroup(group_id)
			if (group) {
				return group.group_color
			}
			return "#000000"
		},
		
        async getLogs() {
            const [ok, new_list] = await getActorLogs(this.specific_actor_id)
            if (ok) {
                this.actor_log_list = new_list.map(item => new ActorLog(item))
            }
        },
    },
    mounted() {
        console.log(`actor logs of ${this.specific_actor_id}`)
        this.getLogs()
    }
}
</script>

<style scoped>

.log-remark {
    white-space: pre-wrap;
    word-break: break-all;
}
</style>