// content script 
//---------------------------------------------------------------
// content script received message from popup
chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if( request.txt === "hello" ) {
            // most of webpage use <p> for containing the article
            let allParagraphs = document.querySelectorAll('body div p');
            var data = {};
            var index = 0;
            
            // save text type paragraphs to data
            for (paragraph of allParagraphs) {
                data[index] = paragraph.innerText;
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