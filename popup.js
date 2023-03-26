let showTableBtn = document.getElementById('btnShowTable');
let clearTimesBtn = document.getElementById('btnClearTimes');

let errorMessageElement = document.getElementById('errorMessage');
let timeTable = document.getElementById("timeTable");

clearTimesBtn.onclick = function(element){
    chrome.storage.local.set({"tabTimesObject": "{}"}, function(){
    });
}

// key is hostname part of the url, later it is the date first, then the url, 
//value is: url:string, trackedSeconds:number, lastDate:Date (or let's just store the value or date string?)
showTableBtn.onclick = function(element){
    
    console.log("Display Table contents in extension");

    chrome.storage.local.get("tabTimesObject", function(dataCont){
        console.log(dataCont);
        let dataString = dataCont['tabTimesObject'];
        if (dataString == null){
            return;
        }

        console.log(" DATASTRING" + dataString)

        try{
            let data = JSON.parse(dataString);

            //delete all rows
            var rowCount = timeTable.rows.length;
            for (var x=rowCount-1; x>=0; x--){
                timeTable.deleteRow(x);
            }

            let entries = [];
            for (var key in data){
                if (data.hasOwnProperty(key)){    
                    entries.push(data[key]);
                    console.log("adding " + key)
                }
            }
            console.log("FUCKING DATA " + JSON.stringify(data))

            entries.sort(function(e1, e2){
                let e1S = e1["trackedSeconds"];
                let e2S = e2["trackedSeconds"];
                if (isNaN(e1S) || isNaN(e2S)){
                    return 0;
                }
                if (e1S > e2S){
                    return 1;
                }
                else if (e1S < e2S){
                    return -1;
                }
                return 0;
            });

            entries.map(function(urlObject){
                let newRow = timeTable.insertRow(1); //insert on top
                    let celHostname = newRow.insertCell(0);
                    // let celTimeMinutes = newRow.insertCell(1);
                    let celTime = newRow.insertCell(1);
                    let celLastDate = newRow.insertCell(2);
                    celHostname.innerHTML = urlObject["url"];
                    let time_ = urlObject["trackedSeconds"] != null ? urlObject["trackedSeconds"] : 0;
                    celTime.innerHTML = Math.round(time_);

                    // celTimeMinutes.innerHTML = (time_ / 60).toFixed(2);
                    // let date = new Date();
                    // date.setTime(urlObject["lastDateVal"] != null ? urlObject["lastDateVal"] : 0);
                    // celLastDate.innerHTML = date.toUTCString();

                    console.log('TABLE_ENTRY [1]' + celHostname + ' ' + celTime )
            });

            //inserting headers
            let headerRow = timeTable.insertRow(0);
            headerRow.insertCell(0).innerHTML = "Path";
            // headerRow.insertCell(1).innerHTML = "Minutes";
            headerRow.insertCell(1).innerHTML = "Seconds";
            // headerRow.insertCell(2).innerHTML = "Last Date";
        }
        catch(err){
            console.error( "DISPLAY_EXT_ERROR [1] loading the Showtime went wrong:" + err.toString() );
            // console.error(message);
            // errorMessageElement.innerText = message;
            // errorMessageElement.innerText = dataString;
        }
    });
}