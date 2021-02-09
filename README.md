# **webrtc-ip**
💻 Gets a users public IP address in the browser. 
<br>
<br>
<br>
### NOTICE:
This script no longer gets users private IP addresses, due to security concerns originating with the teams at Google and Apple, but reliably gets public ones. For more information, please read [this](https://bloggeek.me/psa-mdns-and-local-ice-candidates-are-coming/) great article that explains all you need to know. 
<br>
<br>
<br>

### Disclaimer
This software is for educational purposes only. This software should not be used for illegal activity. The author is not responsible for its use.

<br>
<br>
<br>

---

<br>
<br>
<br>

### Getting Started
If you are using this in the browser, include the following script in the `<head>` part of your HTML to access the `getIPs()` function:
```html
<script src="https://cdn.jsdelivr.net/gh/joeymalvinni/webrtc-ip/dist/production.min.js"></script>
<!---- OR use the dev bundle: ----->
<script src="https://cdn.jsdelivr.net/gh/joeymalvinni/webrtc-ip/dist/bundle.dev.js"></script>
```
  
You now have access to the `getIPs()` function.

<br>
<br>

---  
  


### Usage
<br>

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