const imageHolder = document.querySelector("#imageHolder");
const displayImg = document.querySelector("#zoom");
const submitBtn = document.querySelector("#submitBtn");
const convertBtn = document.querySelector("#convertBtn");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const psmMenuButton = document.querySelector("#psmMenuButton");
const languageMenuButton = document.querySelector("#languageMenuButton");
let files = [];

const content = document.querySelector("#content");
const reference = document.querySelector("#reference");
let currentImageURL = null;
let currentImageIndex = -1;
let currentPSM = 3;
let currentLang = "ben";
let currentPredictedText = '';

const API = "http://localhost:8000/api";
// const API = "https://reve-data-lake.herokuapp.com/api";

// let ui = new UI();

const picReader = new FileReader(); // RETRIEVE DATA URI

picReader.addEventListener("load", function (event) {
    // //Initiate the JavaScript Image object.
    // let image = new Image();

    // //Set the Base64 string return from FileReader as source.
    // image.src = event.target.result;

    // //Validate the File Height and Width.
    // image.onload = function () {
    //     var height = this.height;
    //     var width = this.width;
    //     if (height > 1080 || width > 1920) {
    //     alert("Height and Width must not exceed 100px.");
    //     return false;
    //     }
    //     alert("Uploaded image has valid Height and Width.");
    //     return true;
    // };
    // LOAD EVENT FOR DISPLAYING PHOTOS
    const picFile = event.target;
    // console.log("PicFile", picFile);
    // imageHolder.innerHTML = `<img class="img-fluid rounded" src="${picFile.result}" title="${files[currentImageIndex].name}"/>`;
    displayImg.setAttribute("src", picFile.result);
    displayImg.setAttribute("title", files[currentImageIndex].name);
    // <a href="large.jpg" class="MagicZoom" data-options="zoomPosition: inner"><img src="small.jpg" /></a>
    // output.appendChild(div);
    // console.log(picFile.result);
    currentImageURL = picFile.result;
});

const updatePrevNext = () => {
    if(currentImageIndex > 0){
        prevBtn.disabled = false;
    } else {
        prevBtn.disabled = true;
    }
    if(currentImageIndex < files.length - 1){
        nextBtn.disabled = false;
    } else{
        nextBtn.disabled = true;
    }
}

$(document).ready(function () {
    $('#psm a').on('click', function () {
      currentPSM = parseInt($(this).text().split(' ')[0]);
      psmMenuButton.textContent = currentPSM;
      console.log("Current PSM is "+ currentPSM);
    });

    $('#lang a').on('click', function () {
        currentLang = $(this).text().toLowerCase().slice(0,3);
        languageMenuButton.textContent = currentLang;
        console.log("Current Lang is "+ currentLang);
      });

    $("#zoom").imagezoomsl({
        innerzoom: true,
        innerzoommagnifier: false,
    });
});

if (document.querySelector('input[name="option"]')) {
    document.querySelectorAll('input[name="option"]').forEach(elem => {
        elem.addEventListener("change", function (event) {
            var item = event.target.value;
            console.log(item);
            if (item == "Manual") {
                reference.value = "";
                reference.disabled = true;
            } else {
                reference.disabled = false;
            }
        });
    });
}

/**
 * @param {"SHA-1"|"SHA-256"|"SHA-384"|"SHA-512"} algorithm https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
 * @param {string|Blob} data
 */
async function getHash(algorithm, data) {
    const main = async msgUint8 => {
        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
        const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join(""); // convert bytes to hex string
    };

    if (data instanceof Blob) {
        const arrayBuffer = await data.arrayBuffer();
        const msgUint8 = new Uint8Array(arrayBuffer);
        return await main(msgUint8);
    }
    const encoder = new TextEncoder();
    const msgUint8 = encoder.encode(data);
    return await main(msgUint8);
}

content.addEventListener("input", event => {
    // console.log("changed");
    if (content.value == "") {
        submitBtn.disabled = true;
    } else {
        submitBtn.disabled = false;
    }
});

submitBtn.addEventListener("click", async function (e) {
    let contentText = content.value;
    let referenceText = reference.value;
    let selected = document.querySelector('input[name="option"]:checked').value;

    console.log(contentText, referenceText);
    console.log(selected);

    // const hashHex = await getHash("SHA-256", content.value);
    // console.log(hashHex);

    if (selected == "Web Link" && referenceText == "") {
        alert(
            'Please provide a reference or select "Manual".\nThen click "Submit".'
        );
    } else {
        fetch(`${API}/postData`, {
            method: "POST",
            // mode: "no-cors",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: content.value,
                predictedText: currentPredictedText,
                reference: selected == "Manual" ? "Manual" : reference.value,
                ocr: displayImg.getAttribute("src")=='placeholderimgrgb.jpg'? false : true,
            }),
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                // this.setState({
                //     loading: false,
                // });
                console.log("Response: ", data);

                // this.setState({
                //     letter: data.letter,
                // });
            })
            .catch(err => {
                console.log("Error: ", err);
            });

        content.value = "";
        reference.value = "";
        // imageHolder.innerHTML = '';
        displayImg.setAttribute("src", "placeholderimgrgb.jpg");
        displayImg.setAttribute("title", "Placeholder Image");
        document.getElementById("webLink").checked = true;
        reference.disabled = false;
        submitBtn.disabled = true;
    }
    // Fetch API
    // fetch(`https://api.github.com/users/${userText}`)
    //     .then(result => result.json())
    //     .then(data => {
    //         //console.log(data);
    //         if (data.message == 'Not Found') {
    //             // Show Alert
    //             ui.showAlert("User not Found!", "alert alert-danger");
    //         } else {
    //             //Show Profile
    //             ui.showProfile(data);
    //         }
    //     })

    // Clear Profile
    // ui.clearProfile();
});

document.querySelector("#files").addEventListener("change", e => {
    console.log("Image Image !!!");
    //CHANGE EVENT FOR UPLOADING PHOTOS
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //CHECK IF FILE API IS SUPPORTED
        files = e.target.files; //FILE LIST OBJECT CONTAINING UPLOADED FILES
        // const output = document.querySelector("#result");
        // output.innerHTML = "";
        for (let i = 0; i < files.length; i++) {
            // LOOP THROUGH THE FILE LIST OBJECT
            if (!files[i].type.match("image"))
            {
                files.splice(i,1) // ONLY PHOTOS (SKIP CURRENT ITERATION IF NOT A PHOTO)
            };
        }
        if(files.length>0){
            currentImageIndex = 0;
            console.log(files[currentImageIndex]);
            picReader.readAsDataURL(files[currentImageIndex]);
            updatePrevNext();
        }
    } else {
        alert("Your browser does not support File API");
    }
});

convertBtn.addEventListener("click", e => {
    e.preventDefault();
    fetch(`${API}/convert`, {
        method: "POST",
        // mode: "no-cors",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            image: currentImageURL,
            psm_mode: currentPSM,
            lang: currentLang,
        }),
    })
        .then(response => {
            console.log("Response!");
            return response.json();
        })
        .then(data => {
            // this.setState({
            //     loading: false,
            // });
            console.log("Response: ", data);

            content.value = data.result;
            currentPredictedText = data.result;
            submitBtn.disabled = false;
            // this.setState({
            //     letter: data.letter,
            // });
        })
        .catch(err => {
            console.log("Error: ", err);
        });
});

prevBtn.addEventListener("click", e => {
    e.preventDefault();
    if(currentImageIndex > 0){
        currentImageIndex--;
        picReader.readAsDataURL(files[currentImageIndex]); //READ PREV IMAGE
        // console.log("Pic Reader", picReader);
    }
    updatePrevNext();
});

nextBtn.addEventListener("click", e => {
    if(currentImageIndex < files.length - 1){
        currentImageIndex++;
        picReader.readAsDataURL(files[currentImageIndex]); //READ NEXT IMAGE
        // console.log("Pic Reader", picReader);
    }
    updatePrevNext();
});

// let sha256 = function sha256(ascii) {
//     function rightRotate(value, amount) {
//         return (value>>>amount) | (value<<(32 - amount));
//     };

//     var mathPow = Math.pow;
//     var maxWord = mathPow(2, 32);
//     var lengthProperty = 'length'
//     var i, j; // Used as a counter across the whole file
//     var result = ''

//     var words = [];
//     var asciiBitLength = ascii[lengthProperty]*8;

//     //* caching results is optional - remove/add slash from front of this line to toggle
//     // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
//     // (we actually calculate the first 64, but extra values are just ignored)
//     var hash = sha256.h = sha256.h || [];
//     // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
//     var k = sha256.k = sha256.k || [];
//     var primeCounter = k[lengthProperty];
//     /*/
//     var hash = [], k = [];
//     var primeCounter = 0;
//     //*/

//     var isComposite = {};
//     for (var candidate = 2; primeCounter < 64; candidate++) {
//         if (!isComposite[candidate]) {
//             for (i = 0; i < 313; i += candidate) {
//                 isComposite[i] = candidate;
//             }
//             hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
//             k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
//         }
//     }

//     ascii += '\x80' // Append Ƈ' bit (plus zero padding)
//     while (ascii[lengthProperty]%64 - 56) ascii += '\x00' // More zero padding
//     for (i = 0; i < ascii[lengthProperty]; i++) {
//         j = ascii.charCodeAt(i);
//         if (j>>8) return; // ASCII check: only accept characters in range 0-255
//         words[i>>2] |= j << ((3 - i)%4)*8;
//     }
//     words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
//     words[words[lengthProperty]] = (asciiBitLength)

//     // process each chunk
//     for (j = 0; j < words[lengthProperty];) {
//         var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
//         var oldHash = hash;
//         // This is now the undefinedworking hash", often labelled as variables a...g
//         // (we have to truncate as well, otherwise extra entries at the end accumulate
//         hash = hash.slice(0, 8);

//         for (i = 0; i < 64; i++) {
//             var i2 = i + j;
//             // Expand the message into 64 words
//             // Used below if
//             var w15 = w[i - 15], w2 = w[i - 2];

//             // Iterate
//             var a = hash[0], e = hash[4];
//             var temp1 = hash[7]
//                 + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
//                 + ((e&hash[5])^((~e)&hash[6])) // ch
//                 + k[i]
//                 // Expand the message schedule if needed
//                 + (w[i] = (i < 16) ? w[i] : (
//                         w[i - 16]
//                         + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
//                         + w[i - 7]
//                         + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
//                     )|0
//                 );
//             // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
//             var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
//                 + ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj

//             hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
//             hash[4] = (hash[4] + temp1)|0;
//         }

//         for (i = 0; i < 8; i++) {
//             hash[i] = (hash[i] + oldHash[i])|0;
//         }
//     }

//     for (i = 0; i < 8; i++) {
//         for (j = 3; j + 1; j--) {
//             var b = (hash[i]>>(j*8))&255;
//             result += ((b < 16) ? 0 : '') + b.toString(16);
//         }
//     }
//     return result;
// };
