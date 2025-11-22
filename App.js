import React, { useEffect } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import Navigation from './src/navigation/StackNavigation';
import analytics from '@react-native-firebase/analytics';
import messaging from '@react-native-firebase/messaging';

const App = () => {

  const requestAndroidPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      } catch (e) {
        console.log("Permission error:", e);
      }
    }
  };

  useEffect(() => {
    analytics().logAppOpen();
  }, []);

  useEffect(() => {
    requestAndroidPermission();
    async function setupFCM() {
      try {
        const authStatus = await messaging().requestPermission();

        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log("📌 Notification Permission Granted");
        }

        // Get FCM Token
        const fcmToken = await messaging().getToken();
        console.log("🔥 FCM Token:", fcmToken);

        // NO DISPATCH HERE ❌
        messaging().onMessage(async remoteMessage => {
          console.log("📩 Foreground Notification:", remoteMessage);
        });

      } catch (err) {
        console.log("⚠️ FCM Error:", err);
      }
    }

    setupFCM();
  }, []);

  

  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
};

export default App;
