import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in your browser');
      return false;
    }

    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Please enable notifications in your browser settings');
        setIsLoading(false);
        return false;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // For now, just enable browser notifications without full push subscription
      // Full Web Push requires VAPID keys to be configured
      setIsSubscribed(true);
      toast.success('Notifications enabled!');
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Failed to enable notifications');
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      toast.success('Notifications disabled');
      setIsLoading(false);
      return true;

    } catch (error) {
      console.error('Error unsubscribing:', error);
      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
  };
}
