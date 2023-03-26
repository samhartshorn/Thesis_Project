const tabTimeObjectKey = "tabTimesObject";
const lastActiveTabKey = "lastActiveTab";

var str = "GeeksforGeeks";
    console.log(str);

chrome.runtime.onInstalled.addListener(function(){
    chrome.storage.sync.set({color: "#3aa757"}, function(){
        console.log("Green Colour");
        });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function(){
    chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
    });
});


chrome.windows.onFocusChanged.addListener(function(windowId){
    if(windowId == chrome.windows.WINDOW_ID_NONE){
        //reset the last date and store the difference
        processTabChange(false);
    }
    else{
        processTabChange(true);
    }
});

function processTabChange(isWindowActive){
    console.log(`TAB_CHANGE [1] Tab changed`);
    chrome.tabs.query({'active':true}, function (tabs){
        console.log("isWindowActive: " + isWindowActive);
        console.log("Open Tabs: " + JSON.stringify(tabs));

        if (tabs.length > 0 && tabs[0] != null){
            let currentTab = tabs[0];
            let url = currentTab.url;
            let title = currentTab.title;
            
            // GET URL OF CURRENT TAB
            let urlObject = new URL(url);
            let hostPath = urlObject.pathname;
            try{
                if(!urlObject.hostname.includes("wiki")){
                    console.log(`WIKI_IF [1] URL does not contains Wiki, Returning...`);
                    return;
                }
                else{
                    let tempArray = hostPath.split("/");
                    hostPath = tempArray[2];
                    console.log(hostPath);
                }
                console.log(`WIKI_IF [2] URL contains Wiki`);
            } catch (e){
                console.warn(`URL_WARN [1] FAILED TO CONSTRUCT URL`);
            }
            
            // STORE VARIABLE
            chrome.storage.local.get([tabTimeObjectKey, lastActiveTabKey], function(result){
                let lastActiveTabString = result[lastActiveTabKey];
                let tabTimeObjectString = result[tabTimeObjectKey];
                console.log("CHROME_STORE [1] Get result:");
                console.log("Result: " + JSON.stringify(result));
                var tabTimeObject = {};
                if (tabTimeObjectString != null){
                    tabTimeObject = JSON.parse(tabTimeObjectString);
                }
                var lastActiveTab = {};
                if (lastActiveTabString != null){
                    lastActiveTab = JSON.parse(lastActiveTabString);
                }

                //if last tab has been an entry, stop time
                //if it hasn't
                if (lastActiveTab.hasOwnProperty("url") && lastActiveTab.hasOwnProperty("lastDateVal") ){

                    let lastUrl = lastActiveTab["url"];
                    let currentDateVal_ = Date.now();
                    let passedSeconds = (currentDateVal_ - lastActiveTab["lastDateVal"])*0.001; 

                    if (tabTimeObject.hasOwnProperty(lastUrl)){
                        let lastUrlObjectInfo = tabTimeObject[lastUrl];
                        if(lastUrlObjectInfo.hasOwnProperty("trackedSeconds")){
                            lastUrlObjectInfo["trackedSeconds"] = lastUrlObjectInfo["trackedSeconds"] + passedSeconds;
                        }
                        else{
                            lastUrlObjectInfo["trackedSeconds"] = passedSeconds;
                        }
                        lastUrlObjectInfo["lastDateVal"] = currentDateVal_;
                    }
                    else {
                        let newUrlInfo = {Path: lastUrl, trackedSeconds: passedSeconds, lastDateVal: currentDateVal_};
                        tabTimeObject[lastUrl] = newUrlInfo;
                    }
                }


                //let currentDate = new Date() - tracking minutes and seconds
                let currentDateValue = Date.now();
                //storing current tab info
                let lastTabInfo = {"URL": url, "lastDateVal": currentDateValue };
                if (!isWindowActive){
                    lastTabInfo = {};
                }

                let newLastTabObject = {};
                newLastTabObject[lastActiveTabKey] = JSON.stringify(lastTabInfo);

                chrome.storage.local.set(newLastTabObject, function(){
                    console.log("lastActiveWikiTab stored: " + url);
                    const tabTimesObjectString = JSON.stringify(tabTimeObject);
                    let newTabTimesObject = {};
                    newTabTimesObject[tabTimeObjectKey] = tabTimesObjectString;
                    chrome.storage.local.set(newTabTimesObject, function(){
                    });
                });
            });
        }
    });
}

function onTabTrack(activeInfo){
    let tabId = activeInfo.tabId;
    let windowId = activeInfo.windowId;

    processTabChange(true);
}

chrome.tabs.onActivated.addListener(onTabTrack);
