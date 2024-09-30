import EditableData from "./EditableData";

export default class NoticeData extends EditableData {
    notice_id: number
    notice_param0: string
    notice_param1: string
    notice_param2: string

    get sub_string01() {
        if (this.notice_param0 && this.notice_param1) {
            return this.getSameSubString(this.notice_param0, this.notice_param1)
        }
        return ""
    }

    private getSameSubString(str1: string, str2: string) {
        const arr1 = []     //动态规划模拟矩阵
        let max_count = 0   //记录最长字符串的长度
        let max_str = [-1, -1]     //记录某个最长字符串的结束索引
        for (let n1 = 0; n1 < str1.length; n1++) {
            const v1 = str1[n1]
            arr1.push([])
            for (let n2 = 0; n2 < str2.length; n2++) {
                const v2 = str2[n2]
                if (v1 == v2) {
                    let temp = 1
                    if (n1 >= 1 && n2 >= 1) {
                        temp = arr1[n1 - 1][n2 - 1] + 1
                    }
                    arr1[n1].push(temp)
                    if (max_count < temp) {
                        max_str[0] = n1
                        max_str[1] = n2
                        max_count = temp
                    }
                } else {
                    arr1[n1].push(0)
                }
            }
        }
        return str1.substring(max_str[0] - max_count + 1, max_str[0] + 1)
    }
}