// Set unshort server
var unshortPattern = "https://unshort.link";
var directRedirect = false;
var active = true;
function loadOptions() {
    function setData(result) {
        unshortPattern = result.serverUrl || "https://unshort.link";
        directRedirect = result.directRedirect || false;
    }
    chrome.storage.sync.get(["serverUrl","directRedirect"],setData);
}

loadOptions();

// Redirect services via unshort.link
function redirect(requestDetails) {
    if (!active) {
      console.log("Skip unshort plugin button was set to inactive");
      return;
    }
    
    if (requestDetails.originUrl != undefined) {
      var l = document.createElement("a");
      l.href = requestDetails.originUrl;
      if (
        requestDetails.originUrl.startsWith(unshortPattern) ||
        requestDetails.url.includes(l.hostname)
      ) {
        console.log("Skip unshort because origin is " + unshortPattern);
        return;
      }
    }
    console.log("Unshort: ",requestDetails.url)
    var p = "/d/"
    if (directRedirect) {
        console.log("direct redirect")
        p = "/"
    }
    return {
        redirectUrl: unshortPattern + p + requestDetails.url
    };
}

// Load available services from server
var req = new XMLHttpRequest();
req.open("GET", unshortPattern + "/providers", true);
req.addEventListener("load", function () {
    let servicesUrls = [];

    let services = JSON.parse(req.response);
    services.forEach(function (item, index) {
        if (item.length == 0){
            return
        }
        servicesUrls.push("*://" + item + "/*")
    });


    chrome.webRequest.onBeforeRequest.addListener(
        redirect,
        { urls: servicesUrls },
        ["blocking"]
    );
});
req.send(null);





chrome.browserAction.onClicked.addListener(function() {
    if (active) {
      active = false;
      chrome.browserAction.setIcon({ path: "icons/128_deactivated.png" });
    } else {
      active = true;
      chrome.browserAction.setIcon({ path: "icons/128.png" });
    }
  });