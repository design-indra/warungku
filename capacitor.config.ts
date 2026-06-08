import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.warungku.app',
  appName: 'WarungKu',
  webDir: 'out',
  server: {
    url: 'https://warungku-one.vercel.app/dashboard',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#1d4ed8',
  },
};

export default config;
