const broadcast = new BroadcastChannel('channel');
self.addEventListener('push', (event) => {
    let notification = event.data.json();
    broadcast.postMessage({ notification });
});
broadcast.onmessage = (event) => {
    if (event.data) {
        console.log(event.data);
    }
};