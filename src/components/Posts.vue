<template>
  <el-space direction="vertical" :fill="true" style="padding-bottom: 5px">
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
    <el-space v-if="specific_actor_id == 0" direction="horizontal" wrap>
      <el-radio-group v-model="conditionForm.actor_id"
                      @change="getActorPosts">
        <el-radio v-for="actor_info in actor_post_list"
                  :value="actor_info.actor_id">
          {{ actor_info.actor_name }}
          <el-badge class="mark" :value="actor_info.post_count"/>
        </el-radio>
      </el-radio-group>
    </el-space>
    <el-divider style="margin: 5px 0"/>
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
  </el-space>
</template>

<script lang="ts">
import {getPostCountList, getPosts, setPostComment} from "../ctrls/PostCtrl";
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
    }
  },
  mounted() {
    // console.log(`posts of ${this.specific_actor_id}`)
    this.conditionForm = new PostConditionForm(this.specific_actor_id)
  }
}
</script>

<style scoped>

</style>