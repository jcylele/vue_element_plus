<template>
    <el-space direction="vertical" size="small" fill style="padding-bottom: 5px">
        <!-- search line -->
        <el-space direction="horizontal" size="small">
            <el-input v-if="conditionForm.fixed_actor_id != 0" disabled>
                {{ conditionForm.fixed_actor_id }}
            </el-input>
            <el-input v-model="conditionForm.post_id_prefix"
                      placeholder="Post Id Prefix"
                      clearable
                      :disabled="!conditionForm.is_editing"
                      style="width: 150px;"/>
            <el-checkbox v-model="conditionForm.has_comment"
                         :disabled="!conditionForm.is_editing"
                         style="font-size: 20px;"
                         size="default"
                         border>
                Has Comment
            </el-checkbox>
            <el-button v-if="!conditionForm.is_editing" type="success" @click="startEdit">Edit</el-button>
            <el-button v-if="conditionForm.is_editing" type="primary" @click="endEdit">Save</el-button>
        </el-space>
        <el-divider v-if="specific_actor_id == 0" style="margin: 5px 0"/>
        <!-- actors -->
        <el-space v-if="specific_actor_id == 0" direction="horizontal" wrap>
            <el-radio-group v-model="conditionForm.actor_id"
                            @change="onActorChanged">
                <el-radio v-for="actor_info in actor_post_list"
                          :value="actor_info.actor_id">
                    {{ actor_info.actor_name }}
                    <el-badge class="mark" :value="actor_info.post_count"/>
                </el-radio>
            </el-radio-group>
        </el-space>
        <el-divider style="margin: 5px 0"/>
        <!-- posts -->
        <el-space v-for="post_info in post_list"
                  direction="horizontal">
            <el-text style="font-size: 22px;color: royalblue">
                {{ post_info.post_id }}
            </el-text>
            <svg-icon @click="onPostEdit(post_info)"
                      size="24px"
                      :name="post_info.is_editing ? 'check': 'edit'"/>
            <el-input v-if="post_info.is_editing"
                      v-model="post_info.comment"
                      placeholder="add comment for post"
                      clearable
                      style="width: 300px;font-size: 20px"/>
            <el-text v-if="!post_info.is_editing"
                     style="font-size: 20px">
                {{ post_info.comment }}
            </el-text>
        </el-space>
        <!-- video states -->
        <el-space direction="horizontal" size="small">
            <el-text style="font-size: 24px;width: 80px;color: hotpink">
                Video States
            </el-text>
            <el-space direction="vertical" style="gap: 0px 0px" fill>
                <el-space v-for="line in video_state_list"
                          direction="horizontal"
                          alignment="start"
                          style="height: 26px;gap: 0px 0px">
                    <el-text v-for="video_state in line"
                             :class="'res' + video_state[0]"
                             style="font-size: 20px;">
                        {{ '●'.repeat(video_state[1]) }}
                    </el-text>
                </el-space>
            </el-space>
        </el-space>
        <el-divider style="margin: 5px 0"/>
    </el-space>
</template>

<script lang="ts">
import {getPostCountList, getPosts, getVideoStates, setPostComment} from "../ctrls/PostCtrl";
import {PostConditionForm, PostData} from "../data/PostData";
import {logInfo, logWarn} from "../ctrls/FetchCtrl";
import {ActorPostInfo} from "../data/WebData";


export default {
    name: "Posts",
    // props from parent
    props: {
        specific_actor_id: {
            type: Number,
            required: false,
        },
    },
    data() {
        return {
            conditionForm: PostConditionForm,
            actor_post_list: [] as ActorPostInfo[],
            post_list: [] as PostData[],
            video_state_list: [] as [number, number][][],
            video_state_per_line: 40,
        }
    },
    methods: {
        startEdit() {
            this.conditionForm.is_editing = true

            this.actor_post_list = []
            this.post_list = []
        },
        endEdit() {
            this.conditionForm.is_editing = false

            if (this.conditionForm.is_editing) {
                let min_len = this.conditionForm.calcMinPrefixLength()
                logWarn(`prefix of post id should be at least ${min_len} bits`)
                return
            }
            if (this.conditionForm.actor_id !== 0) {
                this.getActorPosts()
                this.getActorVideoStates()
            } else {
                this.getActorNames()
            }
        },
        async getActorNames() {
            const [ok, new_list] = await getPostCountList(this.conditionForm)
            if (ok) {
                this.actor_post_list = new_list
                this.post_list = []
            }
        },
        async onActorChanged() {
            await this.getActorPosts()
            await this.getActorVideoStates()
        },
        async getActorPosts() {
            const [ok, new_list] = await getPosts(this.conditionForm)
            if (ok) {
                this.post_list = new_list
            }
        },
        async onPostEdit(post_info: PostData) {
            if (post_info.is_editing) {
                const [ok, _] = await setPostComment(post_info.post_id, post_info.comment)
                if (ok) {
                    post_info.is_editing = false
                    logInfo("set comment for post succeed")
                }
            } else {
                post_info.is_editing = true
            }
        },
        async getActorVideoStates() {
            console.log(`getActorVideoStates ${this.conditionForm.actor_id}`)
            const [ok, new_list] = await getVideoStates(this.conditionForm.actor_id)
            if (ok) {
                this.video_state_list = this.splitVideoStates(new_list)
            }
        },
        /***
         * split video states into lines
         * @param video_states [state, count][]
         * @returns  [state, count][][]
         */
        splitVideoStates(video_states: [number, number][]): [number, number][][] {
            let ret = [] as [number, number][][]
            let cur_line = []
            let left_state_count = this.video_state_per_line
            for (let i = 0; i < video_states.length; i++) {
                let [state, count] = video_states[i]
                let overflow = count - left_state_count
                if (overflow >= 0) {
                    cur_line.push([state, left_state_count])
                    ret.push(cur_line)
                    cur_line = []
                    left_state_count = this.video_state_per_line

                    if (overflow > 0) {
                        video_states[i] = [state, overflow]
                        i--
                    }
                } else {
                    cur_line.push([state, count])
                    left_state_count -= count
                }
            }
            if (cur_line.length > 0) {
                ret.push(cur_line)
            }
            return ret
        }
    },
    mounted() {
        // console.log(`posts of ${this.specific_actor_id}`)
        this.conditionForm = new PostConditionForm(this.specific_actor_id)
        if (this.specific_actor_id !== 0) {
            this.getActorVideoStates()
        }
    }
}
</script>

<style scoped>
</style>