import en from './en.json';
import zhCN from './zh-CN.json';
import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

export const i18nMessages = {
  en,
  'zh-CN': zhCN
};

export const i18nLocale = () => {
  return 'zh-CN';
};

// Create VueI18n instance with options
export const i18n = new VueI18n({
  locale: i18nLocale(),
  messages: i18nMessages
});

export default {
  i18nMessages,
  i18nLocale,
  i18n
};
