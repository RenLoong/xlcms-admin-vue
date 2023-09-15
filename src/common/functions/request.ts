import { useMenuStore, useUserStore, useWebConfigStore } from "@/stores"
import { $http } from "@/common/common";

export const getUserInfo = (callback?: Function): Promise<any> => {
    const { setUserInfo } = useUserStore();
    const { setMenu } = useMenuStore();
    return $http.get('Admin/info')
        .then((res: any) => {
            if (res.code === $http.ResponseCode.SUCCESS) {
                setMenu(res.data.menu);
                setUserInfo(res.data.user as UserInfoInterface);
                callback && callback(res.data);
            } else {
                Promise.reject(res);
            }
        })
}
export function useInit(callback?: Function): void {
    const webConfigStore = useWebConfigStore();
    webConfigStore.initWebConfig();
    $http.get('Config/index').then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            webConfigStore.setWebConfig(res.data as WebConfigInterface);
            callback && callback();
        }
    })
}
export function getSiteList(params: any, callback?: Function): void {
    $http.get('UserSite/index', { params }).then((res: any) => {
        if (res.code === $http.ResponseCode.SUCCESS) {
            callback && callback(res.data.data);
        }
    }).finally(() => {
        callback && callback();
    })
}