# **webrtc-ip**
💻 Gets a users public and private IP addresses in the browser. 

## *Disclaimer
This software is for educational purposes only. This software should not be used for illegal activity. The author is not responsible for its use.

---

## Getting Started
If you are using this in the browser, include the following script in the `<head>` part of your HTML to access the `getIPs()` function:
```html
<script src="https://cdn.jsdelivr.net/gh/joeymalvinni/webrtc-ip/dist/production.min.js"></script>
```

You now have access to the `getIPs()` function.

---

## Usage

```js
// Using Promises:
getIPs().then(data=>{
    console.log(data.join('\n'))
})

// Using Async/Await:
(async function(){
  let data = await getIPs();
  console.log(data.join('\n'));
})();
```
