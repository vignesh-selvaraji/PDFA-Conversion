/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import i18n from './localization/i18n';
const { t: $t } = i18n.global
// Plugins
import { registerPlugins } from '@/plugins'
import router from './router'; // Adjust the path based on your project structure
import VueLazyload from 'vue-lazyload';
const app = createApp(App)

registerPlugins(app)
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(VueLazyload)
app.config.globalProperties.$t = $t;
app.mount('#app')