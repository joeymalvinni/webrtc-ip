<p align="center">
    <img src="https://raw.githubusercontent.com/joeymalvinni/webrtc-ip/main/imgs/webrtc-ips-banner.svg"></img>
    <br>
</p>
<p align="center">
  <a href="https://travis-ci.com/joeymalvinni/webrtc-ip">
    <img alt="Build Status" src="https://travis-ci.com/joeymalvinni/is-tor.svg?branch=main">
  </a>
  <a href="https://opensource.org/licenses/Apache-2.0">
	<img alt="Apache 2.0 License" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg">
  </a>
  <a href="https://github.com/joeymalvinni/webrtc-ip/contributors/">
	<img alt="Github contributors" src="https://img.shields.io/github/contributors/joeymalvinni/webrtc-ip.svg">
  </a>
  <a href="https://snyk.io/test/github/joeymalvinni/webrtc-ip/">
	<img alt="Snyk vulnerabilities" src="https://snyk.io/test/github/joeymalvinni/webrtc-ip/badge.svg?targetFile=package.json">
  </a>
  <a href="https://github.com/joeymalvinni/webrtc-ip/pulls">
	<img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg">
  </a>
</p>

<br>

This software is for educational purposes only. This software should not be used for illegal activity. The author is not responsible for its use.


## Quick Start

To use `webrtc-ips`, you need to include the `<script` tag in the `<head>` section of your HTML document.

```html
<script src="https://cdn.jsdelivr.net/gh/joeymalvinni/webrtc-ip/dist/production.min.js"></script>
<!---- OR use the dev bundle: ----->
<script src="https://cdn.jsdelivr.net/gh/joeymalvinni/webrtc-ip/dist/bundle.dev.js"></script>
```

Now you have access to the `getIPs()` function:

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

## Examples

  The example (located at [`/example`](https://github.com/joeymalvinni/webrtc-ip/tree/main/example)) is being hosted on [Heroku](https://webrtc-ip.herokuapp.com/).
  
## Authors

The author of webrtc-ips is [Joey Malvinni](https://github.com/joeymalvinni)

[List of all contributors](https://github.com/joeymalvinni/webrtc-ip/graphs/contributors)

## License

  [Apache 2.0](LICENSE)
