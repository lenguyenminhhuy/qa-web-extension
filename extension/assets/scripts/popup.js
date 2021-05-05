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
    var progressBar = document.getElementById("progress-bar")
    var resultContainer = document.getElementById("result-container")

    // Execute a function when the user releases a key on the keyboard
    search.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // reload results
            resultContainer.style.display = "none";
            reloadDIV("result-container");
            // Trigger the button element with a click
            sendQuestion();
            progressBar.style.display = "block";
        }
        chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
            if(message.greeting === "Hi popup, catch error") {
                progressBar.style.display = "none";
                console.log("catch error");
                // display <span></span>
                // status.style.display = "block";
            }
            if(message.greeting === "Hi popup, there are the answers") {
                console.log("content -> popup " + message.greeting);
                progressBar.style.display = "none";
                rating.style.display = "block";
                var firstReturnedAnswer = document.getElementById("firstReturnedAnswer");
                var secondReturnedAnswer = document.getElementById("secondReturnedAnswer");
                var thirdReturnedAnswer = document.getElementById("thirdReturnedAnswer");
                firstReturnedAnswer.innerText = message.answerList.firstAnswer;
                secondReturnedAnswer.innerText = message.answerList.secondAnswer;
                thirdReturnedAnswer.innerText = message.answerList.thirdAnswer;
                
                if ((firstReturnedAnswer.innerText == null) || (firstReturnedAnswer.innerText == "")) {
                    var firstReturnedAnswerBox = document.getElementById('result-elm-1');
                    firstReturnedAnswerBox.style.display = "none";
                };
                if ((secondReturnedAnswer.innerText == null) || (secondReturnedAnswer.innerText == "")) {
                    var secondReturnedAnswerBox = document.getElementById('result-elm-2');
                 secondReturnedAnswerBox.style.display = "none";
                };
                if ((thirdReturnedAnswer.innerText == null) || (thirdReturnedAnswer.innerText == "")) {
                    var thirdReturnedAnswerBox = document.getElementById('result-elm-3');
                    thirdReturnedAnswerBox.style.display = "none";
                };
                
                sendScrollingRequest('first-answer-radio');
                sendScrollingRequest('second-answer-radio');
                sendScrollingRequest('third-answer-radio');
            }
        });
    });
});

function sendScrollingRequest(selectorID) {
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
function reloadDIV(div) {document.getElementById(div).innerHTML = document.getElementById(div).innerHTML ;}
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

// function scrolling(position) {
//     console.log(position);
//     // starContainer.style.display = "block"
//     chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
//         var activeTab = tabs[0];
//         console.log(tabs[0]);
//             let msg = {
//                 txt: position,
//             }
//         // send message
//         chrome.tabs.sendMessage(tabs[0].id, msg)
//     });
// }
