# **webrtc-ip**
💻 Gets a users public IP address in the browser. 
  

### NOTICE:
This script no longer gets users private IP addresses, due to security concerns originating with the teams at Google and Apple, but reliably gets public ones. For more information, please read [this](https://bloggeek.me/psa-mdns-and-local-ice-candidates-are-coming/) great article that explains all you need to know. 
  

### Disclaimer
This software is for educational purposes only. This software should not be used for illegal activity. The author is not responsible for its use.
  

---
  


### Getting Started
If you are using this in the browser, include the following script in the `<head>` part of your HTML to access the `getIPs()` function:
```html
<script src="https://cdn.jsdelivr.net/gh/joeymalvinni/webrtc-ip/dist/production.min.js"></script>
<!---- OR use the dev bundle: ----->
<script src="https://cdn.jsdelivr.net/gh/joeymalvinni/webrtc-ip/dist/bundle.dev.js"></script>
```
  
You now have access to the `getIPs()` function.
  

### Alternatives

If you don't want to include this as a script, you can run the code on the website like this:
```js
(async() => {
  eval(await (await fetch("https://cdn.jsdelivr.net/gh/joeymalvinni/webrtc-ip/dist/bundle.dev.js")).text());
  alert(await getIPs());
})()
```
Please note: this does not work on sites like Github where `unsafe-eval` is disabled.


---  
  


### Usage
  
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

# webrtc-ip

💻 Gets a users public IP address in the browser. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine to test the example server.

### Prerequisites

Clone the github repository (you will need Node.js and NPM installed on your device):

```
$ git clone https://github.com/joeymalvinni/webrtc-ip.git
```


### Installing

Install dependencies:

```
npm install
```

Start up the server:

```
$ npm start
```

The example server should now be running on `http://localhost`.

## Running the tests

If you would like to triple check that this server works, you can test it:

```
npm test
```

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/joeymalvinni/webrtc-ip/tags). 

## Authors

* **Joseph Malvinni** - *Initial work* - [joeymalvinni](https://github.com/joeymalvinni)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Code inspiration taken from 
* Inspiration
* etc
