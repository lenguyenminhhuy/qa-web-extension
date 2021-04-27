// content script 
//---------------------------------------------------------------
// content script received message from popup
// import library
const testData = {
  0: "Born in 1732 into a Virginia planter family, he learned the morals, manners, and body of knowledge requisite for an 18th century Virginia gentleman.",
  1: "",  
  2: "On April 30, 1789, George Washington, standing on the balcony of Federal Hall on Wall Street in New York, took his oath of office as the first President of the United States. “As the first of every thing, in our situation will serve to establish a Precedent,” he wrote James Madison, “it is devoutly wished on my part, that these precedents may be fixed on true principles.”",
  3: "He pursued two intertwined interests: military arts and western expansion. At 16 he helped survey Shenandoah lands for Thomas, Lord Fairfax. Commissioned a lieutenant colonel in 1754, he fought the first skirmishes of what grew into the French and Indian War. The next year, as an aide to Gen. Edward Braddock, he escaped injury although four bullets ripped his coat and two horses were shot from under him."
}

const testQuestion = "Who is the first president of the United States?";
const trustedURLs = ['www.theguardian.com', 'www.bbc.com', '127.0.0.1'];
var host = location.hostname;

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
const allParaInnerHTML = allParagraphs.innerHTML
var bodyPage = document.querySelector('body')

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         if(request.txt === "new session" ) {
//             console.log(1);
//             document.querySelectorAll(target).innerHTML = allParaInnerHTML;
//             console.log(document.querySelectorAll(target).innerHTML);
//             console.log(2);
//             scrollToTop(bodyPage);
//         }
//     }
// );

chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(request.question === "") {
            console.log("question null");
        } else if(request.txt === "question here" && request.question !== "" ) {
            if(!trustedURLs.includes(host)) {
                alert("MRC system has not been optimized for this webpage.\nThe result can be incorrect.")
            }
            console.log(1);
            document.querySelectorAll(target).innerHTML = allParaInnerHTML;
            console.log(document.querySelectorAll(target).innerHTML);
            console.log(2);
            // scrollToTop(bodyPage);

            var data = {};

            // save text type paragraphs to data
            var index = 0;
            for (paragraph of allParagraphs) {
                data[index] = paragraph.innerText;
                data[index] = data[index].replace(/(\r\n|\n|\r)/gm, "");
                index++;
            }

            // log the input question which sent from popup
            // console.log("Your question: " + request.question);

            // change to json
            // var jsonData = JSON.stringify(data);
            
            // create context 
            // data = testData
            let question = request.question;
            let context = "";
            let paragraphStartIndexes = []
            let arrData = Object.entries(data);
            arrData.map(function(item) {
                let index = item[0]; 
                let value = item[1];
                if (index == 0) {
                    paragraphStartIndexes.push(0)
                    context += value + "\n"
                } else {
                    let len = arrData[index-1][1].length
                    if (len == 0) {
                        paragraphStartIndexes.push(paragraphStartIndexes[index-1])
                    } else {
                        paragraphStartIndexes.push(len + paragraphStartIndexes[index-1] + 1) 
                    }
                    
                    if (value !== "") {
                        context += value + "\n"
                    }
                }
            })

            // Send to server
            // question = testQuestion;
            data = {"question": question, "context": context};
            let config = {
                method: 'post',
                url: 'https://localhost:5000/predictions/my_tc',
                headers: { 
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data)
            }
            console.log(data)

            // send data to server
            console.log("Sending...")
            axios(config)
            .then(function (response) {
                //console.log(response.data);
                let firstAnswer = context.slice(response.data.index_0[0], response.data.index_0[1]);
                let secondAnswer = context.slice(response.data.index_1[0], response.data.index_1[1]);
                let thirdAnswer = context.slice(response.data.index_2[0], response.data.index_2[1]);
                console.log(firstAnswer);
                console.log(secondAnswer);
                console.log(thirdAnswer);

                console.log(paragraphStartIndexes);
                // console.log(`Answer: ${context.slice(response.data.index_0[0], response.data.index_0[1])}`);
                // console.log(`Answer: ${context.slice(response.data.index_1[0], response.data.index_1[1])}`);
                // console.log(`Answer: ${context.slice(response.data.index_2[0], response.data.index_2[1])}`);
                
                //3 returned answers' indexes
                let firstAnswerIndexes = response.data.index_0
                console.log(firstAnswerIndexes);
                let secondAnswerIndexes = response.data.index_1
                console.log(secondAnswerIndexes);
                let thirdAnswerIndexes = response.data.index_2
                console.log(thirdAnswerIndexes);
                
                
                //3 paragraphs of 3 returned answers
                let firstParaIndex = getParagraphIndex(firstAnswerIndexes, paragraphStartIndexes);
                console.log(`1st paragraph index: ${firstParaIndex}`);
                let secondParaIndex = getParagraphIndex(secondAnswerIndexes, paragraphStartIndexes);
                console.log(`2nd paragraph index: ${secondParaIndex}`);
                let thirdParaIndex = getParagraphIndex(thirdAnswerIndexes, paragraphStartIndexes);
                console.log(`3rd paragraph index: ${thirdParaIndex}`);
                
                //3 raw innerHTML of 3 returned answers
                let firstParaInnerHTML = allParagraphs[firstParaIndex].innerHTML
                let secondParaInnerHTML = allParagraphs[secondParaIndex].innerHTML
                let thirdParaInnerHTML = allParagraphs[thirdParaIndex].innerHTML
                
                // highlight and scroll to the first answer
                highlight(firstAnswerIndexes, firstParaIndex, allParagraphs, paragraphStartIndexes)
                scrolling(firstParaIndex, allParagraphs)

                let answerList = {
                    firstAnswer: firstAnswer,
                    secondAnswer: secondAnswer,
                    thirdAnswer: thirdAnswer
                }

                chrome.runtime.sendMessage({
                    data: "Hello popup, how are you",
                    answerList
                }, function (response) {
                    console.dir(response);
                });

                // Scroll to the next answer
                var current = 1;
                chrome.runtime.onMessage.addListener(
                    // moveUDNextAnswer(request, current)
                    function(request, sender, sendResponse) {
                        switch (current) {
                            case 1:
                                if(request.txt === "down") {
                                    moveNextAnswer(firstParaInnerHTML, firstParaIndex, secondParaIndex, secondAnswerIndexes, allParagraphs, paragraphStartIndexes)
                                    current = 2
                                    break;
                                }
                            case 2:
                                if(request.txt === "down") {
                                    moveNextAnswer(secondParaInnerHTML, secondParaIndex, thirdParaIndex, thirdAnswerIndexes, allParagraphs, paragraphStartIndexes)
                                    current = 3
                                    break;
                                }
                                if(request.txt === "up") {
                                    moveNextAnswer(secondParaInnerHTML, secondParaIndex, firstParaIndex, firstAnswerIndexes, allParagraphs, paragraphStartIndexes)
                                    current = 1
                                    break;
                                }
                            case 3:
                                if(request.txt === "up") {
                                    moveNextAnswer(thirdParaInnerHTML, thirdParaIndex, secondParaIndex, secondAnswerIndexes, allParagraphs, paragraphStartIndexes)
                                    current = 2
                                    break;
                                }
                            default:
                                break;
                        }
                    }
                )
            }).catch(function (error) {
                console.log(error);
            })


        }
    }
);
//         }
//     }
// );


// ***FUNCTION***
// -----------------------------------------------------------------------------------------------    
// Function to get index of the paragraph
function getParagraphIndex(answerIndexes, paragraphStartIndexes) {
    let answerStartIndex = answerIndexes[0]; // get the start index from the answerIndexes
    let paragraphIndex = binarySearch(answerStartIndex, paragraphStartIndexes); // get the paragraph index
    for (let i = paragraphIndex + 1; i < paragraphStartIndexes.length; i++) {
        if (paragraphStartIndexes[i] == answerStartIndex) {
            paragraphIndex = i;
        } else {
            break;
        }
    }
    return paragraphIndex;
}

// binary search
function binarySearch(value, indexArr) {
    let low = 0;
    let high = indexArr.length - 1;
    let mid = 0;
    while (low <= high) {
        mid = low + Math.floor((high - low)/2)
        let midValue = indexArr[mid];
        if (midValue <= value) {
            if (indexArr[mid + 1] > value) {
                return mid
            } else {
                low = mid + 1;
            }
        } else if (midValue > value) {
            high = mid - 1;
        } 
    }
    return mid;
}

// -----------------------------------------------------------------------------------------------    
// Function highlight the answer in the paragraph
function highlight(answerIndexes, paraIndex, allParagraphs, paragraphStartIndexes) {
    // console.log("Highlighting...");
    let answerStartIndex = answerIndexes[0] - paragraphStartIndexes[paraIndex];
    let answerEndIndex = answerIndexes[1] - paragraphStartIndexes[paraIndex];
    oldInnerText = allParagraphs[paraIndex].innerText;
    const regex = /\s\s+/g
    innerText = oldInnerText.replace(regex, "")
    let color = "#FFA61F";
    var highlightedAnswer = "<span id='highlighted-answer' style='cursor: pointer; background-color: " + color + ";'>" + innerText.substring(answerStartIndex,answerEndIndex) + "</span>"
    innerText = innerText.substring(0,answerStartIndex) + highlightedAnswer + innerText.substring(answerEndIndex);
    // innerText = innerText.substring(0,answerStartIndex) + "<span style='background-color: " + color + ";'>" + innerText.substring(answerStartIndex, answerEndIndex) + "</span>" + innerText.substring(answerEndIndex);
    allParagraphs[paraIndex].innerHTML = innerText;
}

// -----------------------------------------------------------------------------------------------    
// Function remove highlight the answer in the paragraph
function removeHighlight(innerHTML, curParaIndex, allParagraphs) {
    // console.log("");
    // console.log("Highlight removing...");
    allParagraphs[curParaIndex].innerHTML = innerHTML;
}

// -----------------------------------------------------------------------------------------------    
// Function smooth scroll
function scrolling(nextParaIndex, allParagraphs) {
    console.log("Scrolling to paragraph" + nextParaIndex);
    allParagraphs[nextParaIndex].scrollIntoView({behavior: 'smooth', block:'center'});
}

// -----------------------------------------------------------------------------------------------    
// Function scroll to next answer (include un-highlight the old one, highlight the new one)
function moveNextAnswer(innerHTML, curParaIndex, nextParaIndex, answerIndexes, allParagraphs, paragraphStartIndexes) {
    removeHighlight(innerHTML, curParaIndex, allParagraphs);
    highlight(answerIndexes, nextParaIndex, allParagraphs, paragraphStartIndexes);
    scrolling(nextParaIndex, allParagraphs);
}
// -----------------------------------------------------------------------------------------------    

function moveUDNextAnswer(request, current) {
    switch (current) {
        case 1:
            if(request.txt === "down") {
                moveNextAnswer(firstParaInnerHTML, firstParaIndex, secondParaIndex, secondAnswerIndexes, allParagraphs, paragraphStartIndexes)
                current = 2
                break;
            }
        case 2:
            if(request.txt === "down") {
                moveNextAnswer(secondParaInnerHTML, secondParaIndex, thirdParaIndex, thirdAnswerIndexes, allParagraphs, paragraphStartIndexes)
                current = 3
                break;
            }
            if(request.txt === "up") {
                moveNextAnswer(secondParaInnerHTML, secondParaIndex, firstParaIndex, firstAnswerIndexes, allParagraphs, paragraphStartIndexes)
                current = 1
                break;
            }
        case 3:
            if(request.txt === "up") {
                moveNextAnswer(thirdParaInnerHTML, thirdParaIndex, secondParaIndex, secondAnswerIndexes, allParagraphs, paragraphStartIndexes)
                current = 2
                break;
            }
        default:
            break;
    }
}
// -----------------------------------------------------------------------------------------------    

// function scrollToTop(element) {
//   element.scrollIntoView({behavior: "smooth", block: "top"});
// }