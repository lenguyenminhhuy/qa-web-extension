chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
    // console.log("content.js received " + message.txt);
    if (message.txt === "hello") {
        // let paragraphs = document.getElementsByTagName('body').textContent
        let paragraphs = document.querySelectorAll('body div p');
        // var headings = document.evaluate("//h1[contains(., 'Hello')]", document, null, XPathResult.ANY_TYPE, null );
        let data;
        var article = {};
        var index = 0;
        for (elt of paragraphs) {
            // console.log(elt);
            article[index] = elt.innerText;
            index++;
            // let eltText = elt.textContent || elt.innerText;
            // data += (elt.innerText + '\n')
            // elt.style['background-color'] = '#FF9966';
            // data += (eltText + " ")
            
        }

        console.log(JSON.stringify(article));
        var jsonData = JSON.stringify(article);

        download(jsonData, "data.json", "application/json");
    }
} 

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}