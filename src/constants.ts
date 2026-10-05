import { SCREENSAVERS_DATA } from './i18n';

export const SCREENSAVERS = SCREENSAVERS_DATA.map(s => ({
  id: s.id,
  name: s.name.ko
}));

