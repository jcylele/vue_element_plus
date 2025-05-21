<template>
    <el-space direction="vertical" size="small" fill style="padding:5px 5px">
        <!-- search line -->
        <el-space direction="horizontal" size="small">
            <el-checkbox v-model="condition_form.init_selected"
                         :disabled="!condition_form.is_editing"
                         style="font-size: 20px;"
                         size="default"
                         border>
                {{ init_actor_name }}
            </el-checkbox>
            <el-input v-model="condition_form.post_id_prefix"
                      placeholder="first 8 digits of post id"
                      maxlength="8"
                      @input="handlePostId"
                      :disabled="!condition_form.is_editing"
                      style="width: 160px;"
                      clearable/>
            <el-checkbox v-model="condition_form.has_comment"
                         :disabled="!condition_form.is_editing"
                         style="font-size: 20px;"
                         size="default"
                         border>
                {{ condition_form.has_comment ? "Search" : "Has Comment" }}
            </el-checkbox>
            <el-input v-if="condition_form.has_comment"
                      v-model="condition_form.comment"
                      placeholder="comment"
                      clearable
                      :disabled="!condition_form.is_editing"
                      style="width: 160px;"/>

            <el-button v-if="condition_form.is_editing" type="primary" @click="endEdit">Save</el-button>
            <el-button v-else type="success" @click="startEdit">Edit</el-button>
        </el-space>
        <el-divider style="margin: 5px 0"/>
        <div v-if="actor_post_list.length == 0"
             class="center-row">
            <el-text style="font-size: 24px">No Post Found</el-text>
        </div>
        <el-collapse v-else v-model="expanded_actors"
                     @change="onExpandChange">
            <el-collapse-item v-for="actor_info in actor_post_list"
                              :title="actor_info.actor_name"
                              :name="actor_info.actor_id">
                <el-space direction="vertical" size="small" fill>
                    <el-space v-for="post_info in actor_post_dict[actor_info.actor_id]"
                              direction="horizontal">
                        <el-text style="font-size: 22px;color: royalblue">
                            {{ post_info.post_id }}
                        </el-text>
                        <el-input v-if="post_info.is_editing"
                                  v-model="post_info.comment"
                                  placeholder="add comment for post"
                                  clearable
                                  style="width: 300px;font-size: 20px"/>
                        <el-text v-else
                                 style="font-size: 20px">
                            {{ post_info.comment }}
                        </el-text>
                        <svg-icon @click="onPostEdit(post_info)"
                                  :name="post_info.is_editing ? 'check': 'edit'"
                                  size="24px"/>
                    </el-space>
                </el-space>
            </el-collapse-item>
        </el-collapse>
    </el-space>
</template>

<script lang="ts">
import {getPostCountList, getPosts, setPostComment} from "../ctrls/PostCtrl";
import {PostConditionForm, PostData} from "../data/PostData";
import {logInfo, logWarn} from "../ctrls/FetchCtrl";
import {ActorPostInfo} from "../data/WebData";

export default {
    name: "Posts",
    components: {},
    // props from parent
    props: {
        actor_id: Number,
        actor_name: String
    },
    computed: {
        init_actor_name() {
            return this.condition_form.init_actor ? this.condition_form.init_actor.actor_name : ""
        }
    },
    data() {
        return {
            condition_form: PostConditionForm,
            actor_post_list: [] as ActorPostInfo[],
            actor_post_dict: {} as Map<number, PostData[]>,
            expanded_actors: [] as string[],
        }
    },
    methods: {
        startEdit() {
            this.actor_post_list = []
            this.actor_post_dict = {}

            this.condition_form.is_editing = true
        },
        async endEdit() {
            let min_len = this.condition_form.calcMinPrefixLength()
            if (this.condition_form.post_id_prefix.length < min_len) {
                logWarn(`prefix of post id should be at least ${min_len} bits`)
                return
            }

            this.condition_form.is_editing = false

            await this.getActorNames()
        },
        handlePostId(value) {
            // 移除非数字字符
            this.condition_form.post_id_prefix = value.replace(/[^\d]/g, '')
        },
        async onExpandChange(actors: string[]) {
            for (const actor_id_str of actors) {
                const actor_id = Number(actor_id_str)
                const post_list = this.actor_post_dict[actor_id]
                if (post_list.length == 0) {
                    await this.getActorPosts(actor_id)
                }
            }
        },
        async getActorNames() {
            const form = this.condition_form.createInitForm()
            const [ok, new_list] = await getPostCountList(form)
            if (ok) {
                this.expanded_actors = []
                this.actor_post_list = []
                this.actor_post_dict = {}
                for (const actor_info of new_list) {
                    this.actor_post_dict[actor_info.actor_id] = []
                }
                this.actor_post_list = new_list
            }
        },
        async getActorPosts(actor_id: number) {
            const form = this.condition_form.createFilterForm(actor_id)
            const [ok, new_list] = await getPosts(form)
            if (ok) {
                this.actor_post_dict[actor_id] = new_list
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
    },
    mounted() {
        const init_actor: ActorPostInfo = new ActorPostInfo({
            actor_id: this.actor_id,
            actor_name: this.actor_name
        })
        this.condition_form = new PostConditionForm(init_actor)
        console.log("mounted")
    }
}
</script>

<style scoped>
</style>