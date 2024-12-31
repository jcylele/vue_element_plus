<template>
    <el-space direction="vertical" size="small" style="width: 100%" fill>
        <!-- posts -->
        <el-row v-for="actor_log in actor_log_list">
            <!-- type -->
            <el-col :span="4" style="align-content: center">
                <el-text>
                    {{ actor_log.log_type_name }}
                </el-text>
            </el-col>
            <!-- params -->
            <el-col :span="20" v-if="actor_log.log_type == ActorLogType.Group">
                <el-text :style="{'color': getGroupColor(actor_log.group_id)}">
                    {{ getGroupName(actor_log.group_id) }}
                </el-text>
            </el-col>
            <el-col :span="20" v-else-if="actor_log.log_type == ActorLogType.Score">
                <el-rate v-model="actor_log.show_score"
                         :colors="star_colors"
                         void-color="#777777"
                         :max="6"
                         style="background-color: #1a1a1a50;"
                         disabled allow-half/>
            </el-col>
            <el-col :span="20" v-else-if="actor_log.log_type == ActorLogType.Tag">
                <el-tag v-for="tag_id in actor_log.tag_id_list"
                        :class="getTagStyleName(tag_id)"
                        style="margin: 0 2px"
                        round>
                    {{ getTagName(tag_id) }}
                </el-tag>
            </el-col>
            <el-col :span="20" v-else-if="actor_log.log_type == ActorLogType.Remark">
                <el-text class="log-remark">
                    {{ actor_log.remark }}
                </el-text>
            </el-col>
            <el-col :span="20" v-else-if="actor_log.log_type == ActorLogType.Link">
                <el-text v-for="actor_name in actor_log.actor_names">
                    {{ actor_name }}
                </el-text>
            </el-col>
            <el-col :span="20" v-else-if="actor_log.log_type == ActorLogType.PostCount">
                <el-text>
                    {{ actor_log.post_count }}
                </el-text>
            </el-col>
            <el-col :span="20" v-else>
                <el-text>
                    {{ actor_log.log_param }}
                </el-text>
            </el-col>
        </el-row>
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
            getTagStyleName: 'getStyleName',
            getTagName: 'getName',
        }),

        ...mapActions(ActorGroupStore, {
            getGroupName: 'getName',
            getGroupColor: 'getColor',
        }),
        async getLogs() {
            const [ok, new_list] = await getActorLogs(this.specific_actor_id)
            if (ok) {
                this.actor_log_list = new_list.map(item => new ActorLog(item))
            }
        },
    },
    mounted() {
        this.getLogs()
    }
}
</script>

<style scoped>

.log-remark {
    //color: hotpink;
    white-space: pre-wrap;
    word-break: break-all;
}
</style>