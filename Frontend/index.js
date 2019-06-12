var name = '';
var encoded = null;
var fileExt = null;
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const synth = window.speechSynthesis;
const recognition = new SpeechRecognition();
const icon = document.querySelector('i.fa.fa-microphone')

function previewFile(input){
  var reader  = new FileReader();
  name = input.files[0].name;
  console.log("name:"+name);
  
  fileExt = name.split(".").pop();
  var onlyname = name.replace(/\.[^/.]+$/, "");
  var id = new Date().getTime();
  var finalName = onlyname + "_" + id + "." + fileExt;

  console.log("finalName:"+finalName);
  name = finalName;

  reader.onload = function (e) {
    var src = e.target.result;
    console.log(src);

    document.getElementById("uploadPreview").src = src;
  
    var newImage = document.createElement("img");
    newImage.src = src;
  
    encoded = newImage.outerHTML;

    }
    reader.readAsDataURL(input.files[0]);
}

function upload(){
  last_index_quote = encoded.lastIndexOf('"');
  console.log("last_index_quote:"+last_index_quote);
  if(fileExt == 'jpg' || fileExt == 'jpeg'){
    encodedStr = encoded.substring(33, last_index_quote);  
  }
  else{
      encodedStr = encoded.substring(32, last_index_quote);
  }
  console.log("encodedStr:"+encodedStr);
  
  var apigClient = apigClientFactory.newClient({apiKey: "<YOUR-API-KEY>"});

  var params = {
  folder:name,
  'Content-Type':'text/plain',
  Accept: 'image/jpeg'
  };

  var additionalParams = {};


  apigClient.uploadFolderPut(params, encodedStr, additionalParams)
  .then(function(result){
    console.log('Photo uploaded!');
    alert ("Photo uploaded successfully!");
  }).catch( function(result){
    console.log(result);
  });
}

function searchFromVoice(){
  recognition.start();
  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    console.log(speechToText)

    var apigClient = apigClientFactory.newClient({apiKey: "<YOUR-API-KEY>"});
    
    var params = {
      "q":speechToText
    };
    
    var body = {
      "q":speechToText
    };

    var additionalParams = {
      queryParams: {
      q: speechToText
      }
    };

  apigClient.searchGet(params, body, additionalParams)
  .then(function(result){
    console.log('Search from voice success!');
    showImages(result.data.results);
    console.log(result);
  }).catch( function(result){
    console.log(result);
    console.log(speechToText);
  });

  
  }
}

function search(){
  var searchTerm = document.getElementById("search").value;
  var apigClient = apigClientFactory.newClient({apiKey: "<YOUR-API-KEY>"});
  
  var params = {
  "q":searchTerm
  };
  
  var body = {
  "q":searchTerm
  };

  var additionalParams = {
  queryParams: {
  q: searchTerm
  }
  };
  
  console.log(searchTerm);
  apigClient.searchGet(params, body, additionalParams)
  .then(function(result){
    console.log('Search from text success!');
    console.log("result:"+result.data.results);
    showImages(result.data.results);
  }).catch( function(result){
    console.log(result);
  });
}

function showImages(res){
  var newDiv = document.getElementById("div");
  
  while(newDiv.firstChild){
    newDiv.removeChild(newDiv.firstChild);
  }
  console.log(res);

  if(res.length==0){
     var newContent = document.createTextNode("No image to display");
     newDiv.appendChild(newContent);
     newDiv.setAttribute("style","color:red;font-weight:bold;font-size:40px");
     var currentDiv = document.getElementById("div1"); 
     document.body.insertBefore(newDiv, currentDiv);
   }
  
  else{
	   for (var i = 0; i < res.length; i++) {
	   console.log(res[i]);
	   var newDiv = document.getElementById("div");
	   newDiv.style.display = 'inline'
	   var newContent = document.createElement("img");
	   newContent.src = res[i];
	   newContent.style.padding = "20px";
	   newContent.style.height = "200px";
	   newContent.style.width = "200px";
	   newDiv.appendChild(newContent);
	   var currentDiv = document.getElementById("div1"); 
	   document.body.insertBefore(newDiv, currentDiv);
	   }
  }
}