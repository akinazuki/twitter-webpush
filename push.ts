import puppeteer from 'puppeteer-extra';
import os from 'os';
import fs from 'fs/promises';
const default_path = `/tmp/chrome`
async function initalize_env() {
    try {
        await fs.access(default_path)
    } catch (error) {
        await fs.mkdir(`${default_path}/Default/`, {
            recursive: true
        })
        await fs.writeFile(`${default_path}/Default/Preferences`, JSON.stringify({
            "profile": { "default_content_setting_values": { "notifications": 1 } } // important!!! if here is not set, the chrome notification permission will be pop up and `pushManager.subscribe()` will be block until user click the allow button
        }))
    }
}
function get_chromium_path() {
    if (os.platform() === 'darwin') {
        return `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`;
    } else {
        return '/usr/bin/google-chrome-stable';
    }
}
(async () => {
    await initalize_env();
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--user-data-dir=${default_path}`,
            '--enable-features=NetworkService,NetworkServiceInProcess,',
        ],
        ignoreHTTPSErrors: true,
        executablePath: get_chromium_path()
    });
    const page = await browser.newPage();
    const domain = 'http://127.0.0.1:3000'

    await page.goto(domain);
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    const token = await page.evaluate(async () => {
        return await window.navigator.serviceWorker.ready.then(async (serviceWorkerRegistration) => {
            const registration = await navigator.serviceWorker.getRegistration();
            console.log(`getRegistration: ${registration}`);
            try {
                const cert = {
                    userVisibleOnly: true,
                    applicationServerKey: new Uint8Array([4, 94, 104, 18, 141, 49, 13, 74, 96, 202, 82, 131, 78, 91, 29, 242, 150, 102, 197, 0, 53, 149, 230, 8, 54, 38, 62, 173, 43, 28, 89, 130, 191, 222, 213, 128, 147, 62, 21, 49, 187, 95, 212, 194, 196, 253, 140, 157, 234, 34, 8, 234, 143, 158, 221, 15, 83, 8, 222, 111, 100, 204, 213, 48, 75]),
                }
                // console.log(`getSubscription: ${await serviceWorkerRegistration.pushManager.subscribe(cert)}`);
                const subscription = await serviceWorkerRegistration.pushManager.subscribe(cert);
                return subscription.toJSON()
            } catch (error) {
                console.log(`Error when subscribe: ${error}`);
                return null
            }
        })
    }).catch(e => { });
    console.log(`WebPush: ${JSON.stringify(token)}`);
    if (token) {
        while (true) {
            let notification = await page.evaluate(async () => {
                return await window.notification_queue()
            })
            if (notification) {
                console.log(`Got notification: `, notification)
            }
        }
    }
})().catch(e => console.log(`Browser Error:`, e));
