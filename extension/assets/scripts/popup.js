// popup script
//-------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    //------------------------------Use button---------------------------------------
    // listen to event by clicking the button in popup
    // document.getElementById("button1").addEventListener("click", popup);
    //------------------------------Use enter----------------------------------------
    // Get the input field
    var search = document.getElementById("search-bar");
    var progressBar = document.getElementById("progress-bar");
    var resultContainer = document.getElementById("result-container");
    var objURLandHeader = {
        article_header: "",
        // article_url: "",
        question: "",
        best_answer: "",
    };
    var returnedAnswers = {
        firstReturnedAnswer: "",
        secondReturnedAnswer: "",
        thirdReturnedAnswer: "",
    };

    // Execute a function when the user releases a key on the keyboard
    search.addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            var question = document.getElementById("search-bar").value;
            // Cancel the default action, if needed
            // event.preventDefault();
            // event.stopPropagation();
            // Trigger the button element with a click
            console.log(question);
            if (question === "") {
                resultContainer.style.display = "none";
                console.log("invalid");
                return false;
            } else if (question !== "") {
                sendQuestion(question);
                resultContainer.style.display = "none";
                progressBar.style.display = "block";
            }
        }
    });

    // message "Hi popup, there are the answers"
    chrome.runtime.onMessage.addListener(function (message) {
        if (message.greeting === "Hi popup, catch error") {
            progressBar.style.display = "none";
            console.log("catch error");
            // display <span></span>
            // status.style.display = "block";
        } else if (message.greeting === "Hi popup, there are the answers") {
            console.log(message.greeting);

            // re-render
            progressBar.style.display = "none";
            resultContainer.style.display = "block";
            reRenderRadio("star-radio");
            reRenderRadio("answer-radio");

            var firstReturnedAnswer = document.getElementById(
                "firstReturnedAnswer"
            );
            var secondReturnedAnswer = document.getElementById(
                "secondReturnedAnswer"
            );
            var thirdReturnedAnswer = document.getElementById(
                "thirdReturnedAnswer"
            );

            firstReturnedAnswer.innerText = message.answerList.firstAnswer;
            secondReturnedAnswer.innerText = message.answerList.secondAnswer;
            thirdReturnedAnswer.innerText = message.answerList.thirdAnswer;

            var firstReturnedAnswerBox =
                document.getElementById("result-elm-1");
            var secondReturnedAnswerBox =
                document.getElementById("result-elm-2");
            var thirdReturnedAnswerBox =
                document.getElementById("result-elm-3");

            if (
                firstReturnedAnswer.innerText == null ||
                firstReturnedAnswer.innerText == ""
            ) {
                firstReturnedAnswerBox.style.display = "none";
            } else {
                firstReturnedAnswerBox.style.display = "none";
                firstReturnedAnswerBox.style.display = "block";
            }

            if (
                secondReturnedAnswer.innerText == null ||
                secondReturnedAnswer.innerText == ""
            ) {
                secondReturnedAnswerBox.style.display = "none";
            } else {
                secondReturnedAnswerBox.style.display = "none";
                secondReturnedAnswerBox.style.display = "block";
            }

            if (
                thirdReturnedAnswer.innerText == null ||
                thirdReturnedAnswer.innerText == ""
            ) {
                thirdReturnedAnswerBox.style.display = "none";
            } else {
                thirdReturnedAnswerBox.style.display = "none";
                thirdReturnedAnswerBox.style.display = "block";
            }

            returnedAnswers = Object.assign(returnedAnswers, {
                firstReturnedAnswer: message.answerList.firstAnswer,
                secondReturnedAnswer: message.answerList.secondAnswer,
                thirdReturnedAnswer: message.answerList.thirdAnswer,
            });
        }
    });

    chrome.runtime.onMessage.addListener(function (message) {
        if (message.greeting === "Hi popup, there are url and header") {
            console.log(message.greeting);
            objURLandHeader = Object.assign(objURLandHeader, {
                article_header: message.articleHeader,
                article_url: message.articleURL,
            });
        }
    });

    sendScrollingRequest("first-answer-radio");
    sendScrollingRequest("second-answer-radio");
    sendScrollingRequest("third-answer-radio");

    var firstAnswerStar = document.getElementById("first-answer-star");
    var secondAnswerStar = document.getElementById("second-answer-star");
    var thirdAnswerStar = document.getElementById("third-answer-star");

    firstAnswerStar.addEventListener("click", async () => {
        var question = document.getElementById("search-bar").value;

        const rawResponse = await fetch(
            "http://localhost:3000/best_answer_collection",
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    article_header: objURLandHeader.article_header,
                    article_url: objURLandHeader.article_url,
                    question: question,
                    best_answer: returnedAnswers.firstReturnedAnswer,
                }),
            }
        );
        const content = await rawResponse.json();

        console.log(content);
    });

    secondAnswerStar.addEventListener("click", async () => {
        var question = document.getElementById("search-bar").value;

        const rawResponse = await fetch(
            "http://localhost:3000/best_answer_collection",
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    article_header: objURLandHeader.article_header,
                    article_url: objURLandHeader.article_url,
                    question: question,
                    best_answer: returnedAnswers.secondReturnedAnswer,
                }),
            }
        );
        const content = await rawResponse.json();

        console.log(content);
    });

    thirdAnswerStar.addEventListener("click", async () => {
        var question = document.getElementById("search-bar").value;

        const rawResponse = await fetch(
            "http://localhost:3000/best_answer_collection",
            {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    article_header: objURLandHeader.article_header,
                    article_url: objURLandHeader.article_url,
                    question: question,
                    best_answer: returnedAnswers.thirdReturnedAnswer,
                }),
            }
        );
        const content = await rawResponse.json();

        console.log(content);
    });
});

// ***FUNCTION***
// -----------------------------------------------------------------------------------------------
function sendScrollingRequest(selectorID) {
    document.getElementById(selectorID).addEventListener("click", function () {
        var selectedAnswerValue = document.getElementById(selectorID).value;
        console.log(selectedAnswerValue);
        chrome.tabs.query(
            { currentWindow: true, active: true },
            function (tabs) {
                var activeTab = tabs[0];
                console.log(tabs[0]);
                let msg = {
                    greeting: "Hi content. Scroll for me",
                    value: selectedAnswerValue,
                };
                // send message
                chrome.tabs.sendMessage(tabs[0].id, msg);
            }
        );
    });
}

//-------------------------------------------------------------------------------
function reloadDIV(div) {
    document.getElementById(div).innerHTML =
        document.getElementById(div).innerHTML;
}
//-------------------------------------------------------------------------------
function sendQuestion(question) {
    // determine the target tab
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0];
        console.log(tabs[0]);
        let msg = {
            txt: "question here",
            question: question,
        };
        // send message
        chrome.tabs.sendMessage(tabs[0].id, msg);
    });
    return console.log("send success");
}
//-------------------------------------------------------------------------------
// re-render
function reRenderRadio(eleName) {
    var eleRadio = document.getElementsByName(eleName);
    for (var i = 0; i < eleRadio.length; i++) {
        eleRadio[i].checked = false;
    }
}
//-------------------------------------------------------------------------------
function Validator(rowNames) {
    function validate(inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(
            rowNames.errorSelector
        );
        var errorMsg = rule.test(inputElement.value);
        if (errorMsg) {
            errorElement.innerText = errorMsg;
            inputElement.parentElement.classList.add("invalid");
        } else {
            errorElement.innerText = "";
            inputElement.parentElement.classList.remove("invalid");
        }
    }

    var formElement = document.querySelector(rowNames.form);
    if (formElement) {
        rowNames.rules.forEach(function (rule) {
            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                inputElement.oninput = function () {
                    var errorElement = inputElement.parentElement.querySelector(
                        rowNames.errorSelector
                    );
                    errorElement.innerText = "";
                    inputElement.parentElement.classList.remove("invalid");
                };
            }
        });
    }
}
