// popup script
//-------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
//------------------------------Use button---------------------------------------
    // listen to event by clicking the button in popup
    // document.getElementById("button1").addEventListener("click", popup);
//------------------------------Use enter----------------------------------------
// Get the input field
    var search = document.getElementById("search-bar");
    var rating = document.getElementById("rating")
    // search.addEventListener("oninput", function(event) {
    //     reload();
    // });
    // Execute a function when the user releases a key on the keyboard
    search.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            sendQuestion();
        }
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            console.log("ok");
            rating.style.display = "block";
            var firstReturnedAnswer = document.getElementById("firstReturnedAnswer");
            var secondReturnedAnswer = document.getElementById("secondReturnedAnswer");
            var thirdReturnedAnswer = document.getElementById("thirdReturnedAnswer");
            firstReturnedAnswer.innerText = message.answerList.firstAnswer
            secondReturnedAnswer.innerText = message.answerList.secondAnswer
            thirdReturnedAnswer.innerText = message.answerList.thirdAnswer
            sendResponse({
                data: "I am fine, thank you. How is life in the background?"
            }); 
            document.getElementById("firstReturnedAnswer").addEventListener("click", scrolling(1));
            document.getElementById("secondReturnedAnswer").addEventListener("click", scrolling(2));
            document.getElementById("thirdReturnedAnswer").addEventListener("click", scrolling(3));
        });

        // document.getElementById("firstReturnedAnswer").addEventListener("click", scrolling(1));
        // document.getElementById("secondReturnedAnswer").addEventListener("click", scrolling(2));
        // document.getElementById("thirdReturnedAnswer").addEventListener("click", scrolling(3));

        // firstReturnedAnswer.addEventListener("click", scrolling("1", document.getElementById("rate-container-1")));
        // secondReturnedAnswer.addEventListener("click", scrolling("2", document.getElementById("rate-container-2")));
        // thirdReturnedAnswer.addEventListener("click", scrolling("3", document.getElementById("rate-container-3")));

        // document.getElementById("down").addEventListener("click", scrollDown);
        // document.getElementById("up").addEventListener("click", scrollUp);
    });
});
//-------------------------------------------------------------------------------
function sendQuestion() {
    var question = document.getElementById("search-bar").value;
    console.log(question);
    // determine the target tab
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        console.log(tabs[0]);
            let msg = {
                txt: "question here",
                question: question
            }
        // send message
        chrome.tabs.sendMessage(tabs[0].id, msg)
    });
}

// function reload() {
//     // var checkInput = document.getElementById("search-bar");
//     // console.log(checkInput);
//     chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
//         var activeTab = tabs[0];
//         console.log(tabs[0]);
//             let msg = {
//                 txt: "new session",
//             }
//         // send message
//         chrome.tabs.sendMessage(tabs[0].id, msg)
//     });
// }



function scrolling(position) {
    console.log(position);
    // starContainer.style.display = "block"
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        console.log(tabs[0]);
            let msg = {
                txt: position,
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

// function showDiv(element) {
//    document.getElementById(element).style.display = "block";
// }