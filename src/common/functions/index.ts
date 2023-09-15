import { ElMessage, ElMessageBox } from "element-plus";
import { useStorage } from "../common";
import router from "@/routers";
import { useUserStore, useWebConfigStore } from "@/stores";
/**
 * 节流函数会确保在指定的时间间隔内，函数被调用的次数不超过设定的阈值。
 * @param func 节流函数
 * @param wait 时间（毫秒）
 * @returns function
 */
export function throttle<F extends (...args: any[]) => void>(func: F, wait: number): F {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
        if (!timer) {
            timer = setTimeout(() => {
                timer = undefined;
                func.apply(this, args);
            }, wait);
        }
    } as F;
}
/**
 * 防抖函数会延迟函数的执行，直到一定的静默期过去后，才真正执行该函数。
 * @param func 防抖函数
 * @param wait 时间（毫秒）
 * @returns function
 */
export function debounce<F extends (...args: any[]) => void>(func: F, wait: number): F {
    let timer: ReturnType<typeof setTimeout> | undefined;
    return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            timer = undefined;
            func.apply(this, args);
        }, wait);
    } as F;
}
/**
 * 监听浏览器滚动
 * @param func 回调函数
 * @param wait 回调频率
 */
export function onScroll<F extends (...args: any[]) => void>(func: F, wait: number = 0): void {
    let event = func;
    if (wait > 0) {
        event = debounce(func, wait);
    }
    const eventScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        event(scrollTop);
    }
    onMounted(() => {
        globalThis.addEventListener('scroll', eventScroll);
    });
    onUnmounted(() => {
        globalThis.removeEventListener('scroll', eventScroll);
    });
}
/**
 * 监听浏览器尺寸变化
 * @param func 回调函数
 * @param wait 回调频率
 */
export function onWindowResize<F extends (...args: any[]) => void>(func: F, wait: number = 0): void {
    let event = func;
    if (wait > 0) {
        event = debounce(func, wait);
    }
    const eventResize = () => {
        event({ w: window.innerWidth, h: window.innerHeight });
    }
    onMounted(() => {
        globalThis.addEventListener('resize', eventResize);
    });
    onUnmounted(() => {
        globalThis.removeEventListener('resize', eventResize);
    });
}
/**
 * 观察目标元素与其祖先元素或视窗之间的交叉状态。提供一种有效且高性能的方式来检测元素是否进入或离开视图区域。
 * @param el 元素
 * @param func 回调方法
 */
export function onObserve<F extends (...args: any[]) => void>(el: any, func: F): void {
    const done = (target: Element) => {
        observer.unobserve(target);
    }
    const observer = new IntersectionObserver((e) => {
        func(e, done);
    });
    onMounted(() => {
        el.value && observer.observe(el.value);
    });
    onUnmounted(() => {
        el.value && done(el.value);
    });
}
/**
 * 监听storage变化
 * @param key 监听的key
 * @param func 回调方法
 * @returns F() 
 * @example onStoreageChange('key',()=>{})
**/
export function onStoreageChange<F extends (...args: any[]) => void>(key: string, func: F): F {
    const event = (e: StorageEvent): any => {
        if (e.key === null) {
            func();
        } else if (e.key === key) {
            func(e);
        }
    }
    globalThis.addEventListener('storage', event);
    return function () {
        globalThis.removeEventListener('storage', event);
    } as F
}
/**
 * 秒转换为天时分秒
 * @param time 时间（秒）
 * @returns string
 */
export function timetostr(time: number | undefined): string {
    let str = '';
    if (!time) { return str }
    let d = 0, h = 0, m = 0, s = 0;
    if (time >= 3600 * 24) {
        d = Math.floor(time / (3600 * 24));
        time = time % (3600 * 24);
    }
    if (time >= 3600) {
        h = Math.floor(time / (60 * 60));
        time = time % (60 * 60);
    }
    if (time >= 60) {
        m = Math.floor(time / 60);
    }
    s = time % 60;
    if (d > 0) {
        str = d + '天';
    }
    if (d > 0 || h > 0) {
        str += h + '小时';
    }
    if (d > 0 || h > 0 || m > 0) {
        str += m + '分';
    }
    if (d > 0 || h > 0 || m > 0 || s > 0) {
        str += s + '秒';
    }
    return str
}
/**
 * 设置剪切板内容
 * @param text 内容
 * @returns void
 */
export function setClipboard(text: string): void {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(_ => {
            ElMessage.success('已复制');
        })
    } else {
        let input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('Copy');
        input.remove();
        ElMessage.success('已复制');
    }
}
export function useLoginConfirm<F extends () => void>(func?: F): void {
    const storage = useStorage();
    const { hasLogin } = useUserStore()
    if (!hasLogin()) {
        ElMessageBox.confirm(
            '您还未登录，请先登录后操作',
            '提示',
            {
                confirmButtonText: '去登录',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
            .then(() => {
                storage.set('login_redirect_url', router.currentRoute.value.fullPath);
                router.push('/login');
            })
            .catch(() => { })
    } else {
        typeof func === 'function' && func();
    }
}
/**
 * 数字转千分位
 * @param num 数字
 * @returns string
 * @example 10000 => 10,000
 * @example 10000.123 => 10,000.123
 * @example 10000.123456 => 10,000.123456
 */
export function toThousands(num: number | string): string {
    let result = '', counter = 0;
    num = (num || 0).toString();
    for (let i = num.length - 1; i >= 0; i--) {
        counter++;
        result = num.charAt(i) + result;
        if (!(counter % 3) && i !== 0) { result = ',' + result; }
    }
    return result;
}
export function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
export function openWin(url: string) {
    window.open(url);
}
/**
 * 替换地址栏#参数不跳转
 * @param key 参数名
 * @param value 参数值
 * @returns void
 * @example replaceUrlParam('key','value')
 */
export function replaceUrlParam(key: string, value: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url.href);
}
/**
 * 批量替换地址栏#参数不跳转
 * @param params 参数对象
 * @returns void
 * @example replaceUrlParams({key1:'value1',key2:'value2'})
 */
export function replaceUrlParams(params: Record<string, string>): void {
    const url = new URL(window.location.href);
    for (const key in params) {
        url.searchParams.set(key, params[key]);
    }
    window.history.replaceState({}, '', url.href);
}
/**
 * 设置网站标题
 * @param title 标题
 * @returns void
 * @example setDocumentTitle('标题')
 */
export function setDocumentTitle(title: string): void {
    const { WEBCONFIG } = useWebConfigStore();
    let webName = WEBCONFIG.siteinfo.name;
    let subTitle = '';
    if (webName) {
        subTitle = ` - ${webName}`;
    }
    globalThis.document.title = `${title}${subTitle}`
}
/**
 * 分时函数
 * @param arr 数组
 * @param fn 回调函数
 * @returns {clear:()=>void}
 * @example timeChunk([1,2,3,4,5,6,7,8,9,10],(item)=>{console.log(item)})
 */
export function timeChunk<T>(arr: T[], fn: (item: T) => void): { clear: () => void } {
    let isBreak = false;
    const clear = () => {
        isBreak = true;
    }
    let i = 0;
    function _run() {
        globalThis.requestIdleCallback((idle) => {
            while (idle.timeRemaining() > 0 && i < arr.length) {
                fn(arr[i++]);
            }
            if (i < arr.length && isBreak === false) {
                _run();
            }
        })
    }
    if (arr.length > 0) _run();
    return {
        clear
    }
}