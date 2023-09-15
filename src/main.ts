import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import "@/assets/css/theme.min.css";
import "@/assets/css/common.min.css";
import 'highlight.js/styles/atom-one-dark.css';
import App from './App.vue'
import { createPinia } from 'pinia'
const pinia = createPinia()
import router from "@/routers";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import NumberScrollDirective from "@/common/functions/numberScroll";
import zhCn from 'element-plus/es/locale/lang/zh-cn';
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
// 全局数字滚动效果指令
app.use(NumberScrollDirective);
// 全局注册components/x-form下的组件
const requireComponent = import.meta.glob('./components/x-form/*.vue', {
    eager: true,
    import: 'default'
});
Object.values(requireComponent).map((item: any) => {
    app.component(item.__name, item);
})
app.use(ElementPlus, { locale: zhCn }).use(pinia).use(router).mount('#app')