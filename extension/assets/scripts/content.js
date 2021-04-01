// content script 
//---------------------------------------------------------------
// content script received message from popup
const trustedURLs = ['www.theguardian.com', 'www.bbc.com'];
var host = location.hostname;
var data = {};

chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(request.txt === "hello" ) {
            if(!trustedURLs.includes(host)) {
                alert("MRC system has not been optimized for this webpage.\nThe result can be incorrect or null.")
            }

            var target;
            switch (host) {
                case 'www.theguardian.com':
                    target = 'body h1, main>div>div>p'
                    break;
                case 'www.bbc.com':
                    target = 'article h1, div>p';
                    break;
                
                default:
                    target = 'body div p'
                    break;
            }

            var allParagraphs = document.querySelectorAll(target);

            // save text type paragraphs to data
            var index = 0;
            for (paragraph of allParagraphs) {
                data[index] = paragraph.innerText;
                data[index] = data[index].replace(/(\r\n|\n|\r)/gm, "");
                index++;
            }

            // log the input question which sent from popup
            console.log("Your question: " + request.question);

            // change to json
            var jsonData = JSON.stringify(data);
            console.log(jsonData);

            // download json file of data
            download(jsonData, "data.json", "application/json");
        }
    }
);


// function for creating file and downloading
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}