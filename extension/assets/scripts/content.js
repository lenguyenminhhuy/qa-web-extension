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

chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(request.txt === "hello" ) {
            if(!trustedURLs.includes(host)) {
                alert("MRC system has not been optimized for this webpage.\nThe result can be incorrect or null.")
            }
            var data = {};
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
                    context += value + "\n";
                } else {
                    let len = arrData[index-1][1].length
                    if (len == 0) {
                        paragraphStartIndexes.push(paragraphStartIndexes[index-1])
                    } else {
                        paragraphStartIndexes.push(len + paragraphStartIndexes[index-1] + 1) 
                    }
                    
                    if (value !== "") {
                        context += value + "\n";
                    }
                }
            })             

            // Send to server
            // question = testQuestion;
            data = {"question": question, "context": context};
            let config = {
                method: 'post',
                url: 'https://0.0.0.0:5000/predictions/my_tc',
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
                console.log(response.data);
                // console.log(paragraphStartIndexes);
                let firstParaIndex = getParagraphIndex(response.data.index_0, paragraphStartIndexes);
                // console.log(`Paragraph index: ${index}`);
                // console.log(`Answer: ${context.slice(response.data.index_0[0], response.data.index_0[1])}`);
                // console.log(`Answer: ${context.slice(response.data.index_1[0], response.data.index_1[1])}`);
                // console.log(`Answer: ${context.slice(response.data.index_2[0], response.data.index_2[1])}`);
                highlight(firstParaIndex, response.data.index_0, allParagraphs, paragraphStartIndexes);
                console.log(`Answer: ${context.slice(response.data.index_0[0], response.data.index_0[1])}`);
                let indexArr = Object.values(response.data)
                // indexArr.map(function(index) {
                //     let paraIndex = getParagraphIndex(index, paragraphStartIndexes);
                //     highlight(paraIndex, index, allParagraphs);
                //     console.log(`Answer: ${context.slice(index[0], index[1])}`);
                //     return;
                // })
                scrolling(firstParaIndex, allParagraphs);

            }).catch(function (error) {
                console.log(error);
            })

        }
    }
);
// Function to get index of the paragraph
function getParagraphIndex(answerIndexes, paragraphStartIndexes) {
    let answerStartIndex = answerIndexes[0]; // get the start index from the answerIndexes
    let paragraphIndex = binarySearch(answerStartIndex, paragraphStartIndexes); // get the pargra
    for (let i = paragraphIndex + 1; i < paragraphStartIndexes.length; i++) {
        if (paragraphStartIndexes[i] == answerStartIndex) {
            paragraphIndex = i;
        } else {
            break;
        }
    }
    return paragraphIndex;
}

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

// function for creating file and downloading
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

// -----------------------------------------------------------------------------------------------    
// Scroll up/down to the answer
// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         var target;
//         switch (host) {
//             case 'www.theguardian.com':
//                 target = 'body h1, main>div>div>p'
//                 break;
//             case 'www.bbc.com':
//                 target = 'article h1, div>p';
//                 break;
            
//             default:
//                 target = 'body div p'
//                 break;
//         }
//         var allParagraphs = document.querySelectorAll(target);

//         if(request.txt === "down") {
//             if(index1) {
//                 scrolling(index2, allParagraphs)
//             } else if (index2) {
//                 scrolling(index3, allParagraphs)
//             }
//         } else if (request.txt === "up") {
//             if(index3) {
//                 scrolling(index2, allParagraphs)
//             } else if (index2) {
//                 scrolling(index1, allParagraphs)
//             }
//         } else {
//             scrolling(-1, allParagraphs)
//         }
//     }
// )

// -----------------------------------------------------------------------------------------------    
// Function to highlight the answer in the paragraph
function highlight(paraIndex, answerIndexes, allParagraphs, paragraphStartIndexes) {
    let answerStartIndex = answerIndexes[0] - paragraphStartIndexes[paraIndex] + 8;
    let answerEndIndex = answerIndexes[1] - paragraphStartIndexes[paraIndex] + 8;
    innerHTML = allParagraphs[paraIndex].innerHTML;
    let color = "#ffcc00";
    console.log(innerHTML);
    console.log("Text:", innerHTML.substring(answerStartIndex, answerEndIndex + 1));
    innerHTML = innerHTML.substring(0,answerStartIndex) + "<span style='background-color: " + color + ";'>" + innerHTML.substring(answerStartIndex, answerEndIndex + 1) + "</span>" + innerHTML.substring(answerEndIndex + 1);
    allParagraphs[paraIndex].innerHTML = innerHTML;
}

// -----------------------------------------------------------------------------------------------    
// Function to smooth scroll
function scrolling(paraIndex, allParagraphs) {
    allParagraphs[paraIndex].scrollIntoView({behavior: 'smooth', block:'center'})
}