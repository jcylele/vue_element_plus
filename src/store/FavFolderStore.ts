import { FolderData } from "../data/FolderData"
import { getFolders } from "../ctrls/FolderCtrl"
import createGroupStore from "./createGroupStore"

export const FavFolderStore = createGroupStore<FolderData>("FavFolderStore", getFolders)