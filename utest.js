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

// let arr = [1,2,3,4,5,6,7,8,9];
// console.log(binarySearch(3, arr)); // 2


function getParagraphIndex(answerIndexes, paragraphStartIndexes) {
    let answerStartIndex = answerIndexes[0];
    let paragraphIndex = binarySearch(answerStartIndex, paragraphStartIndexes);
    for (let i = paragraphIndex + 1; i < paragraphStartIndexes.length; i++) {
        if (paragraphStartIndexes[i] == answerStartIndex) {
            paragraphIndex = i;
        } else {
            break;
        }
    }

    return paragraphIndex
}

// let answerIndexes = [74, 10];
// let paragraphStartIndexes = [0, 75, 428, 428, 1010, 1314, 1840, 2210, 2737, 3035, 3584, 4367, 4754, 5394, 5695, 6148, 6730, 7461, 8315, 8568, 9053, 9481];
// console.log(getParagraphIndex(answerIndexes, paragraphStartIndexes));




test_str = "'Own your grey hair and be powerful': women on no longer dyeing their hair\nI had an epiphany one day. I couldn’t stand the demarcation line. My hair had been so damaged from all the processing. Covid had everything shut down. It was time. I didn’t feel it was necessary to hide behind hair dye any more. I took the shears to my own hair and mowed it all off. The second picture is two and a half months of new, fresh, regrowth.\nI am now living my true self. I feel liberated, free, and released. I am loving the change, the colour, and all the silver – it reminds me of the warrior woman I am. It is by far, the most empowering and wonderful thing I have ever done for myself. Society places enough pressure on women to act, look, dress, and speak a certain way. In the last year, following Covid-19, I personally feel there have been enough restrictions placed on our lives. Own your grey hair and be powerful. Lisa Sparrow, 57, respiratory therapist, used to live in Northamptonshire but now lives in the US\nI was born with a couple of white hairs and had grey streaks in my 20s. I then started dyeing it in my early 30s. I’ve been thinking about stopping dyeing my hair for a couple of years now so when the second lockdown happened, it was a good excuse to stop. I also had a plan to stop on my 50th birthday.\nI’m four months into the grow out process and I love it. Because it was my ‘choice’ it’s suddenly no longer embarrassing any more. I absolute love my greys and if anyone mentions them I say the same thing – no more self conscious me. I’ll be honest, I’m a little nervous starting my next placement in a hospital. It’ll be a new place where no one knows me and I just know there’ll be lots of comments to come: “You’re too young to be going grey” being the main one. I’m just not sure my hair got that memo! Heather, 31, student nurse, Milton Keynes"
console.log(JSON.stringify(test_str))

a = "'Own your grey hair and be powerful':";
b = `question : ${a}`;
console.log(JSON.stringify(b));