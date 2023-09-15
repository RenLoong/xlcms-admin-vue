import { ElMessage } from "element-plus";
import { $http } from "../common";

export const useVcode = (options?: VcodeInterface) => {
    let _config = {
        url: 'Sms/sendSMS',
        time: 60,
        method: 'POST',
        message: true
    };

    _config = Object.assign(_config, options ?? {});
    onUnmounted(() => {
        clear();
    })
    const vcodeText = ref<string>('获取验证码');
    const isDisabled = ref<boolean>(false);
    let _timeEr: string | number | NodeJS.Timer | undefined = undefined;
    const time = ref<number>(_config.time);
    const getVcode = (data: object): void => {
        if (isDisabled.value) return;
        let q;
        if (_config.method.toLocaleUpperCase() === 'POST') {
            q = $http.post(_config.url, data);
        } else {
            q = $http.get(_config.url, { params: data });
        }
        q?.then((res: any) => {
            if (res.code === $http.ResponseCode.SUCCESS) {
                ElMessage.success(res.msg);
                _timeTiming();
            } else {
                ElMessage.info(res.msg);
            }
        })
    }
    const _timeTiming = () => {
        isDisabled.value = true;
        _timeEr = setInterval(() => {
            time.value--;
            if (time.value <= 0) {
                clear();
            } else {
                vcodeText.value = time.value + 's';
            }
        }, 1000)
    }
    const clear = () => {
        clearInterval(_timeEr);
        _timeEr = undefined;
        isDisabled.value = false;
        time.value = _config.time;
        vcodeText.value = '获取验证码';
    }
    return {
        isDisabled,
        vcodeText,
        getVcode,
        clear
    }
}