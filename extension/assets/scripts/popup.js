// popup script
//-------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
//------------------------------Use button-----------------------------------
    // // listen to event by clicking the button in popup
    // document.getElementById("button1").addEventListener("click", popup);
//------------------------------Use enter------------------------------------
// Get the input field
    var search = document.getElementById("search-bar");
    // Execute a function when the user releases a key on the keyboard
    search.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            // document.getElementById("button1").click();
            popup();
        }
        document.getElementById("down").addEventListener("click", scrollDown);
        document.getElementById("up").addEventListener("click", scrollUp);
    });
//----------------------------------------------------------------------------
});


function popup() {
    var question = document.getElementById("search-bar").value;
    console.log(question);
    // determine the target tab
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        console.log(tabs[0]);
            let msg = {
                txt: "hello",
                question: question
            }
        // send message
        chrome.tabs.sendMessage(tabs[0].id, msg)
    });
}

function scrollDown() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        console.log(tabs[0]);
            let msg = {
                txt: "down",
            }
        // send message
        chrome.tabs.sendMessage(tabs[0].id, msg)
    });
}

function scrollUp() {
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        console.log(tabs[0]);
            let msg = {
                txt: "up",
            }
        // send message
        chrome.tabs.sendMessage(tabs[0].id, msg)
    });
}