import { getActorTagGroupList } from "../ctrls/ActorTagGroupCtrl"
import { ActorTagGroupData } from "../data/ActorTagGroupData"
import createGroupStore from "./createGroupStore"

export const ActorTagGroupStore = createGroupStore<ActorTagGroupData>('ActorTagGroupStore', getActorTagGroupList)