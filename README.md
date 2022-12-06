## Install
```
sudo apt install xvfb # install Xvfb (X virtual framebuffer)
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && sudo dpkg -i google-chrome-stable_current_amd64.deb # install Chrome
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash - # install Node.js
sudo apt-get install -y nodejs # install Node.js

npm install # install dependencies
npm install -g tsx pm2 # install tsx and pm2
pm2 start npx -- serve ./web
xvfb-run tsx push
```

## Normal Log

```
nazuki@container:~/swpush$ xvfb-run tsx push
PAGE LOG: Updating UI...
PAGE LOG: Failed to load resource: the server responded with a status of 404 (Not Found)
PAGE LOG: getRegistration: [object ServiceWorkerRegistration]
PAGE LOG: JSHandle@object
WebPush: {"endpoint":"https://fcm.googleapis.com/fcm/send/fG25B16ApP4:APA91bFB0D0QMlFFxnQ4fOD9t9ditxW6k5076b2f97MwmigUfBviCDcwcGcUxGtqqM3KxP4V5jlP1IpMN3k8seniG_p6cpUSMlxllb4wj4gr6v1gC3sNkl7od5O4Db1pzfuBct1JEuhp","expirationTime":null,"keys":{"p256dh":"BCtvKs_a_Q_60xfzg7-dmHrzP06uhVEccuw4BXT6TCRFrRsW4PjjQuNVudME6gLw8C6bWmOOlPvRpVROK0kWxN0","auth":"W-p3zEi4ubiupJEPo8JNzg"}} #here is the WebPush token, use it to receive push notifications
PAGE LOG: JSHandle@object
Got notification:  {
  notification: {
    registration_ids: [
      'https://fcm.googleapis.com/fcm/send/fG25B16ApP4:APA91bFB0D0QMlFFxnQ4fOD9t9ditxW6k5076b2f97MwmigUfBviCDcwcGcUxGtqqM3KxP4V5jlP1IpMN3k8seniG_p6cpUSMlxllb4wj4gr6v1gC3sNkl7od5O4Db1pzfuBct1JEuhp'
    ],
    title: '过拟合晴猫@奈月亭',
    body: '过拟合晴猫@奈月亭：w',
    icon: 'https://pbs.twimg.com/profile_images/1552378066638622720/QiCKdJNx_reasonably_small.jpg',
    timestamp: '1668394489804',
    tag: 'dm_message_one_to_one_push-850937205040087040-1509199287334309892',
    data: {
      lang: 'zh-tw',
      bundle_text: '{num_total, number} 個新{num_total, plural, other {互動}}',
      type: 'dm_message_one_to_one_push',
      uri: '/messages/850937205040087040-1509199287334309892',
      impression_id: 'ace160aa94ba4df48f0f9356aebf34a9',
      title: '过拟合晴猫@奈月亭',
      body: '过拟合晴猫@奈月亭：w',
      tag: 'dm_message_one_to_one_push-850937205040087040-1509199287334309892',
      scribe_target: 'direct_message',
      multi_body: '{num_others, number} 則{num_others, plural, other {其他訊息}}。\n过拟合晴猫@奈月亭：w'
    }
  }
}
```

## Twitter Settings

```
curl --location --request POST 'https://twitter.com/i/api/1.1/notifications/settings/login.json' \
--header 'sec-ch-ua: "Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"' \
--header 'x-twitter-client-language: zh-tw' \
--header 'x-csrf-token: cb2d216f64e06a74c9fbd3837d742ef0b46e499b323760010b9b7e74063e769b0c8503f623910410201dd48f83e3c6f3d319009cee0e911da3d20403e1c05c179e845fb4ca2c8a813a47c5bb121082cc' \
--header 'sec-ch-ua-mobile: ?0' \
--header 'authorization: Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA' \
--header 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36' \
--header 'content-type: application/json' \
--header 'Referer: https://twitter.com/settings/push_notifications' \
--header 'x-twitter-auth-type: OAuth2Session' \
--header 'x-twitter-active-user: yes' \
--header 'sec-ch-ua-platform: "macOS"' \
--header 'Cookie: {{YOUR TWITTER COOKIE}}' \
--data-raw '{
    "push_device_info": {
        "os_version": "Mac/Chrome",
        "udid": "Mac/Chrome",
        "env": 3,
        "locale": "zh-tw",
        "protocol_version": 1,
        "token": "{{the WebPush endpoint you got}}",
        "encryption_key1": "{{ WebPush p256dh parameter }}",
        "encryption_key2": "{{ WebPush auth parameter }}"
    }
}'
```