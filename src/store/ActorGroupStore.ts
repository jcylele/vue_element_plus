import ActorGroupData from "../data/ActorGroupData";
import { getActorGroupList } from "../ctrls/ActorGroupCtrl";
import createGroupStore from "./createGroupStore";

export const ActorGroupStore = createGroupStore<ActorGroupData>('ActorGroupStore', getActorGroupList)