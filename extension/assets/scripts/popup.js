// popup script
//-------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
//------------------------------Use button---------------------------------------
    // listen to event by clicking the button in popup
    // document.getElementById("button1").addEventListener("click", popup);
//------------------------------Use enter----------------------------------------
// Get the input field
    var search = document.getElementById("search-bar");
    var rating = document.getElementById("result-container")
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
            if(message.greeting === "Hi popup, there are the answers") {
                console.log("content -> popup " + message.greeting);
                rating.style.display = "block";
                var firstReturnedAnswer = document.getElementById("firstReturnedAnswer");
                var secondReturnedAnswer = document.getElementById("secondReturnedAnswer");
                var thirdReturnedAnswer = document.getElementById("thirdReturnedAnswer");
                firstReturnedAnswer.innerText = message.answerList.firstAnswer;
                secondReturnedAnswer.innerText = message.answerList.secondAnswer;
                thirdReturnedAnswer.innerText = message.answerList.thirdAnswer;
                
                // var choseAnswerValue = getRadioValue('first-answer-radio')
                // var choseAnswerValue = getRadioValue('second-answer-radio')
                // var choseAnswerValue = getRadioValue('third-answer-radio')
                
                sendScrollingRequest('first-answer-radio');
                sendScrollingRequest('second-answer-radio');
                sendScrollingRequest('third-answer-radio');
            }
        });
    });
});

function sendScrollingRequest(selectorID) {
    console.log("test1");
    document.getElementById(selectorID).addEventListener("click", function () {
        var selectedAnswerValue = document.getElementById(selectorID).value
        console.log(selectedAnswerValue);
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
            var activeTab = tabs[0];
            console.log(tabs[0]);
                let msg = {
                    greeting: "Hi content. Scroll for me",
                    value: selectedAnswerValue
                }
            // send message
            chrome.tabs.sendMessage(tabs[0].id, msg)
        });
    })
}

//-------------------------------------------------------------------------------
// function sendScrollingRequest(selectorID) {
//     var selectedAnswerValue = getRadioValue(selectorID);
//     // determine the target tab
//     chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
//         var activeTab = tabs[0];
//         console.log(tabs[0]);
//             let msg = {
//                 greeting: "Hi content. Scroll for me",
//                 value: selectedAnswerValue
//             }
//         // send message
//         chrome.tabs.sendMessage(tabs[0].id, msg)
//     });
// }

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