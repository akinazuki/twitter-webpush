/* Push notification logic. */

async function registerServiceWorker() {
  await navigator.serviceWorker.register('./service-worker.js');
  updateUI();
}

async function unregisterServiceWorker() {
  const registration = await navigator.serviceWorker.getRegistration();
  await registration.unregister();
  updateUI();
}

// Convert a base64 string to Uint8Array.
// Must do this so the server can understand the VAPID_PUBLIC_KEY.
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

async function subscribeToPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: new Uint8Array([4, 94, 104, 18, 141, 49, 13, 74, 96, 202, 82, 131, 78, 91, 29, 242, 150, 102, 197, 0, 53, 149, 230, 8, 54, 38, 62, 173, 43, 28, 89, 130, 191, 222, 213, 128, 147, 62, 21, 49, 187, 95, 212, 194, 196, 253, 140, 157, 234, 34, 8, 234, 143, 158, 221, 15, 83, 8, 222, 111, 100, 204, 213, 48, 75]),
  });
  return subscription.toJSON()
  // postToServer('/add-subscription', subscription);
  // updateUI();
}

async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  postToServer('/remove-subscription', {
    endpoint: subscription.endpoint
  });
  await subscription.unsubscribe();
  updateUI();
}

async function notifyMe() {
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  postToServer('/notify-me', { endpoint: subscription.endpoint });
}

async function notifyAll() {
  const response = await fetch('/notify-all', {
    method: 'POST'
  });
  if (response.status === 409) {
    document.getElementById('notification-status-message').textContent =
      'There are no subscribed endpoints to send messages to, yet.';
  }
}
let notification_data = []
window.notification_queue = async function () {
  return notification_data.pop()
}
window.get_service_worker_ready = async function () {
  return await navigator.serviceWorker.ready
}
window.get_notification_token = async function () {
  const data = await subscribeToPush()
  console.log(data)
  return data
}
async function updateUI() {
  await navigator.serviceWorker.register('./service-worker.js')
  const broadcast = new BroadcastChannel('channel');

  broadcast.onmessage = (event) => {
    console.log(event.data);
    notification_data.push(event.data)
  };

  broadcast.postMessage({
    type: 'START',
  });

  console.log('Updating UI...');
  const registrationButton = document.getElementById('register');
  const unregistrationButton = document.getElementById('unregister');
  const registrationStatus = document.getElementById('registration-status-message');
  const subscriptionButton = document.getElementById('subscribe');
  const unsubscriptionButton = document.getElementById('unsubscribe');
  const subscriptionStatus = document.getElementById('subscription-status-message');
  const notifyMeButton = document.getElementById('notify-me');
  const notificationStatus = document.getElementById('notification-status-message');
  // Disable all buttons by default.
  registrationButton.disabled = true;
  unregistrationButton.disabled = true;
  subscriptionButton.disabled = true;
  unsubscriptionButton.disabled = true;
  notifyMeButton.disabled = true;
  // Service worker is not supported so we can't go any further.
  if (!'serviceWorker' in navigator) {
    registrationStatus.textContent = "This browser doesn't support service workers.";
    subscriptionStatus.textContent = "Push subscription on this client isn't possible because of lack of service worker support.";
    notificationStatus.textContent = "Push notification to this client isn't possible because of lack of service worker support.";
    return;
  }
  const registration = await navigator.serviceWorker.getRegistration();
  // Service worker is available and now we need to register one.
  if (!registration) {
    registrationButton.disabled = false;
    registrationStatus.textContent = 'No service worker has been registered yet.';
    subscriptionStatus.textContent = "Push subscription on this client isn't possible until a service worker is registered.";
    notificationStatus.textContent = "Push notification to this client isn't possible until a service worker is registered.";
    return;
  }
  registrationStatus.textContent =
    `Service worker registered. Scope: ${registration.scope}`;
  const subscription = await registration.pushManager.getSubscription();
  // Service worker is registered and now we need to subscribe for push
  // or unregister the existing service worker.
  if (!subscription) {
    unregistrationButton.disabled = false;
    subscriptionButton.disabled = false;
    subscriptionStatus.textContent = 'Ready to subscribe this client to push.';
    notificationStatus.textContent = 'Push notification to this client will be possible once subscribed.';
    return;
  }
  // Service worker is registered and subscribed for push and now we need
  // to unregister service worker, unsubscribe to push, or send notifications.
  subscriptionStatus.textContent =
    `Service worker subscribed to push. Endpoint: ${subscription.endpoint}`;
  notificationStatus.textContent = 'Ready to send a push notification to this client!';
  unregistrationButton.disabled = false;
  notifyMeButton.disabled = false;
  console.log(subscription.toJSON());
  unsubscriptionButton.disabled = false;
}

/* Utility functions. */

async function postToServer(url, data) {
  let response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

window.onload = updateUI;