<template>
    <el-space direction="vertical"
              class="actor_card" alignment="stretch" :size="3"
              :key="actor.uuid"
              :style="{'color': group_color}">

        <!-- actor avatar -->
        <div class="avatar">
            <el-image class="avatar-img" :src="actor.icon"/>

            <svg-icon v-if="actor.has_main_actor"
                      size="30px" name="avatar"
                      class="avatar-friend"
                      @click="findLinkedActor"/>

            <svg-icon v-if="show_lock"
                      size="30px"
                      :name=" locked ? 'locked' : 'lock'"
                      class="avatar-lock  blink-class"
                      @click="onLockClick"/>

            <svg-icon v-if="!show_lock && locked"
                      size="30px"
                      name="locked"
                      class="avatar-lock"/>

            <svg-icon v-if="show_select"
                      size="30px"
                      :name=" actor_data.selected ? 'completed' : 'minus'"
                      class="avatar-select"
                      @click="onSelectCLick"/>
            <!-- Stars -->
            <el-rate class="avatar-rate"
                     v-model="actor.show_score"
                     :colors="star_colors"
                     void-color="#777777"
                     :max="6"
                     @change="changeScore"
                     allow-half/>
        </div>

        <!-- actor name, click to open menu items -->
        <!-- downloading related icons -->
        <div class="actor_name_line">
            <el-popover trigger="click" placement="top"
                        v-model:visible="is_show_op"
                        :popper-style="{'border-color': group_color, 'width': 300}"
                        popper-class="op_popper"
                        :offset="6">
                <template #reference>
                    <el-text class="actor_name" :style="{'color': group_color}">
                        {{ actor.actor_name }}
                    </el-text>
                </template>
                <template #default>
                    <el-space direction="vertical" alignment="center">
                        <el-space direction="horizontal">
                            <el-button class="pop-button"
                                       type="primary"
                                       @click="showPosts">
                                Show Posts
                            </el-button>
                            <el-button class="pop-button"
                                       type="primary"
                                       @click="gotoActorPage">
                                Go To Page
                            </el-button>
                        </el-space>
                        <el-space direction="horizontal" v-if="hasFolder()">
                            <el-button class="pop-button"
                                       type="warning"
                                       @click="resetPosts">
                                Reset Posts
                            </el-button>
                            <el-button class="pop-button"
                                       type="warning"
                                       @click="clearFolder">
                                Clear Folder
                            </el-button>
                        </el-space>
                        <el-space direction="horizontal" v-if="hasFolder()">
                            <el-button class="pop-button"
                                       type="success"
                                       @click="toDownload"
                                       v-if="hasFolder()">
                                Download
                            </el-button>
                            <el-button class="pop-button"
                                       type="success"
                                       @click="openFolder"
                                       v-if="hasFolder()">
                                Open Folder
                            </el-button>
                        </el-space>
                    </el-space>
                </template>
            </el-popover>
            <svg-icon v-if="is_downing" name="download"
                      style="color: lightskyblue"
                      size="24px" class="blink-class"/>
            <svg-icon v-if="is_video_all" name="file_checked"
                      style="color: orange"
                      size="24px"/>
        </div>

        <!-- actor post info -->
        <el-space direction="vertical"
                  v-if="actor.file_info"
                  style="gap: 1px 0"
                  fill>
            <el-text style="color: black;text-align: center" tag="ins">
                {{ actor.post_desc }}
            </el-text>
            <!-- actor res info -->
            <el-space v-for="res_file_info in actor.file_info.res_info"
                      direction="horizontal"
                      style="gap: 0 3px"
                      :class="res_file_info.res_state_class">
                <el-text class="res_info">
                    {{ res_file_info.str_state }}
                </el-text>
                <el-text class="res_info">
                    {{ res_file_info.str_size }}
                </el-text>
                <el-text class="res_info">
                    {{ res_file_info.str_img_count }}
                </el-text>
                <el-text class="res_info">
                    {{ res_file_info.str_video_count }}
                </el-text>
            </el-space>
        </el-space>

        <!--actor remark + category + edit button -->
        <el-space direction="horizontal" alignment="stretch">
            <!-- actor remark -->
            <svg-icon :name="actor.has_remark ? 'remark' : 'remark_empty'"
                      @click="startEditRemark"
                      size="24px"/>
            <!-- actor category -->
            <el-select v-model="actor.actor_group_id"
                       @change="setActorGroup"
                       style="width: 140px">
                <el-option
                    v-for="group in group_list"
                    :label="group.group_name"
                    :value="group.group_id"
                    :style="{'color': group.group_color, 'text-decoration':'underline' }"
                >
                    {{ group.show_content }}
                </el-option>
            </el-select>
            <!-- click to edit tags -->
            <svg-icon v-if="has_tag" size="24px" name="edit" @click="startEditTag"/>
            <el-popover v-else placement="right" trigger="click"
                        :popper-style="{'border-color': group_color, 'width': 260}">
                <template #reference>
                    <svg-icon size="24px" name="edit"/>
                </template>
                <el-space direction="vertical" size="small" fill>
                    <el-text style="font-style: italic">
                        click to apply tags to actor
                    </el-text>
                    <el-space v-for="tag_record in tag_history"
                              direction="horizontal" size="small"
                              alignment="flex-start"
                              style="border: 1px solid ; border-radius: 4px; padding: 2px;"
                              @click="onSubmitTag(tag_record.tags)">
                        <el-tag v-for="tag_id in tag_record.tags"
                                :class="getTagStyleName(tag_id)"
                                round>
                            {{ getTagName(tag_id) }}
                        </el-tag>
                    </el-space>
                    <el-button size="default" type="primary" @click="startEditTag">
                        Choose Other Tags
                    </el-button>
                </el-space>
            </el-popover>
        </el-space>

        <!--actor tags-->
        <el-space wrap style="margin-top: 5px">
            <el-tag v-for="tag_id in actor.tag_ids"
                    :class="getTagStyleName(tag_id)"
                    round>
                {{ getTagName(tag_id) }}
            </el-tag>
        </el-space>
    </el-space>
    <!-- actor remark editing dialog-->
    <el-dialog v-model="is_show_remark"
               :title="actor.actor_name"
               width="600px">
        <RemarkEditor :actor="actor"
                      @submit="onSubmitRemark"
                      @cancel="onCancelRemark"/>
    </el-dialog>
    <!-- actor tags editing dialog-->
    <el-dialog v-model="is_editing_tags"
               :title="actor.actor_name"
               width="67%">
        <ActorTagChooser :actor="actor"
                         @submit="onSubmitTag"
                         @cancel="onCancelAddTag"
        />
    </el-dialog>
    <!-- actor posts dialog-->
    <el-dialog v-model="is_show_post"
               title="Posts"
               width=720px>
        <Posts :specific_actor_id="actor.actor_id"></Posts>
    </el-dialog>
</template>

<script lang="ts">
import ActorData from "../data/ActorData";
import {
    ChangeActorTag,
    changeActorGroup,
    openActorFolder, changeActorRemark, getActorFileInfo, changeActorScore, clearActorFolder, resetActorPosts
} from "../ctrls/ActorCtrl";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import SvgIcon from "./SvgIcon/index.vue";
import ActorTagChooser from "./ActorTagChooser.vue";
import RemarkEditor from "./RemarkEditor.vue";
import Posts from "./Posts.vue";
import {ActorElement} from "../data/ArrayElement";
import {ActorGroupStore} from "../store/ActorGroupStore";
import ActorGroupData from "../data/ActorGroupData";
import {Star_Colors} from "../data/Consts";
import {logInfo, logWarn} from "../ctrls/FetchCtrl";
import {ActorFilterStore} from "../store/ActorFilterStore";
import ActorFileInfo from "../data/FileInfo";

export default {
    name: "ActorCard",
    components: {ActorTagChooser, SvgIcon, RemarkEditor, Posts},
    // props from parent
    props: {
        actor_data: ActorElement,
        locked: Boolean,
        show_lock: Boolean,
        show_select: Boolean
    },
    computed: {
        ...mapState(ActorGroupStore, {group_list: 'sorted_list'}),
        ...mapState(ActorTagStore, {
            tag_history: 'tag_history',
        }),
        actor(): ActorData {
            return this.actor_data.data
        },
        has_tag(): boolean {
            return this.actor_data.data.tag_ids.length > 0
        },
        star_colors() {
            return Star_Colors
        },
        group_color(): string {
            let group = this.getActorGroup(this.actor_data.data.actor_group_id)
            return group.group_color
        },
        is_downing(): boolean {
            return this.is_actor_downing(this.actor_data.data.actor_id)
        },
        is_video_all(): boolean {
            return this.hasFolder() && this.actor_data.data.is_video_all
        },
    },
    // declare emitted events to parent
    emits: ['refresh', 'link', 'download', 'friend', 'lock'],
    data() {
        return {
            is_show_remark: false,
            is_editing_tags: false,
            is_show_post: false,
            is_show_op: false
        }
    },
    mounted() {
        // console.log(`mounted[${this.actor_data.id}]: ${this.actor.actor_name}`)
        this.actor.sortTags(this.compareActorTagId)
        this.getFileInfo()
    },
    methods: {
        ...mapActions(ActorTagStore, {
            compareActorTagId: 'compareTagId',
            getTagStyleName: 'getStyleName',
            getTagName: 'getName',
            addTagRecord: 'addRecord',
        }),

        ...mapActions(ActorGroupStore, {
            getActorGroup: 'get',
        }),

        ...mapActions(ActorFilterStore, {
            is_actor_downing: "is_downing",
        }),

        getActorGroupData(): ActorGroupData {
            let group_id = this.actor_data.data.actor_group_id
            return this.getActorGroup(group_id)
        },

        hasFolder(): boolean {
            let group = this.getActorGroupData()
            return group.has_folder
        },

        onRecvActorMsg(ok: boolean, new_actor: ActorData, msg: string) {
            if (ok) {
                this.actor_data.data = new_actor
                this.actor.sortTags(this.compareActorTagId)
                this.$emit('refresh', this.actor_data)
                logInfo(msg)
                // request file info
                this.getFileInfo()
            }
        },

        gotoActorPage() {
            this.is_show_op = false
            window.open(this.actor.href, '_blank', 'noreferrer');
        },
        openFolder() {
            this.is_show_op = false
            openActorFolder(this.actor.actor_id)
        },
        async clearFolder() {
            this.is_show_op = false
            const [ok, file_info] = await clearActorFolder(this.actor.actor_id)
            if (ok) {
                this.setFileInfo(file_info)
                logInfo("clear folder succeed")
            }
        },
        async resetPosts() {
            this.is_show_op = false
            const [ok, file_info] = await resetActorPosts(this.actor.actor_id)
            if (ok) {
                this.setFileInfo(file_info)
                logInfo("reset posts succeed")
            }
        },
        async setActorGroup() {
            if (this.actor.tag_ids.length == 0) {
                logWarn("add any tag before setting category")
                return
            }
            const [ok, new_actor] = await changeActorGroup(this.actor.actor_id, this.actor.actor_group_id)
            this.onRecvActorMsg(ok, new_actor, "change category succeed")
        },
        startEditTag() {
            this.is_editing_tags = true
        },
        async onSubmitTag(new_tag_list: number[]) {
            this.is_editing_tags = false
            if (new_tag_list.length > 0) {
                this.addTagRecord(new_tag_list)
            }
            //request
            const [ok, new_actor] = await ChangeActorTag(this.actor.actor_id, new_tag_list)
            this.onRecvActorMsg(ok, new_actor, "change tags succeed")
        },
        async onCancelAddTag() {
            this.is_editing_tags = false
        },

        toDownload() {
            this.is_show_op = false
            this.$emit('download', this.actor_data)
        },

        showPosts() {
            this.is_show_op = false
            this.is_show_post = true
        },

        async changeScore() {
            const [ok, new_actor] = await changeActorScore(this.actor.actor_id, this.actor.score)
            this.onRecvActorMsg(ok, new_actor, "change score succeed")
        },
        async findLinkedActor() {
            this.$emit('friend', this.actor_data)
        },
        onLockClick() {
            this.$emit('lock', this.actor_data, !this.locked)
        },
        onSelectCLick() {
            this.actor_data.selected = !this.actor_data.selected
        },
        startEditRemark() {
            this.is_show_remark = true
        },
        onCancelRemark() {
            this.is_show_remark = false
        },
        async onSubmitRemark(new_remark: string) {
            this.is_show_remark = false
            if (new_remark == this.actor.remark) {
                return
            }
            const [ok, new_actor] = await changeActorRemark(this.actor.actor_id, new_remark)
            this.onRecvActorMsg(ok, new_actor, "change remark succeed")
        },
        async getFileInfo() {
            const [ok, file_info] = await getActorFileInfo(this.actor.actor_id)
            if (ok) {
                this.setFileInfo(file_info)
            }
        },
        setFileInfo(file_info) {
            this.actor.file_info = new ActorFileInfo(file_info)
        },
    }
    ,
}
</script>

<style scoped>

.actor_name {
    font-size: 22px;
    word-wrap: nowrap;
    text-align: center;
}

.actor_name_line {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 5px;
    background-color: #000000a0;
}

.actor_card {
    position: relative;
    border: 1px solid;
    padding: 2px;
    box-shadow: 2px 2px;
    width: 210px;
    background-color: var(--el-card-bg-color);
}

.avatar {
    position: relative;
    /*width: 180px;*/
    height: 180px;
    margin-top: 15px;
}

.avatar-img {
    width: 180px;
    height: 180px;
    position: absolute;
    top: 0;
    left: 15px;
}

.avatar-rate {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
}

.avatar-lock {
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
}

.avatar-select {
    position: absolute;
    top: 0;
    right: 15px;
}

.avatar-friend {
    position: absolute;
    top: 0;
    left: 15px;
}

.pop-button {
    width: 126px;
    height: 32px;
}

.res_info {
    width: 50px;
    text-align: right;
    text-wrap: nowrap;
    font-size: 16px;
}

.blink-class {
    animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
    25% {
        opacity: 0.5;
    }
    50% {
        opacity: 0;
    }
    75% {
        opacity: 0.5;
    }
}

</style>