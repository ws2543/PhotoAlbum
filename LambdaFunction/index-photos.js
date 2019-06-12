
var AWS = require('aws-sdk');
AWS.region = "us-west-2";
var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27'});

var region = 'us-west-2'; // e.g. us-west-1
var domain = '<VPC-DOMIAN>'; // e.g. search-domain.region.es.amazonaws.com
var index = 'photos';
var type = 'Photo';


function IndexPhotos(document) {
	var endpoint = new AWS.Endpoint(domain);
	var request = new AWS.HttpRequest(endpoint, region);
	
	var id = new Date().getTime();

	request.method = 'PUT';
	request.path += index + '/' + type + '/' + id;
	request.body = JSON.stringify(document);
	request.headers['host'] = domain;
	request.headers['Content-Type'] = 'application/json';

	var credentials = new AWS.EnvironmentCredentials('AWS');
  	var signer = new AWS.Signers.V4(request, 'es');
  	signer.addAuthorization(credentials, new Date());

 	var client = new AWS.HttpClient();
 	//console.log(client);
 	client.handleRequest(request, null, function(response) {
 		console.log(response.statusCode + ' ' + response.statusMessage);
 		var responseBody = '';
 		response.on('data', function (chunk) {
 			responseBody += chunk;
 		});
 		response.on('end', function (chunk) {
 			console.log('Response boday: ' + responseBody);
 		});
 	}, function(error) {
 		console.log('Error: ' + error);
 	});
}

exports.handler = (event, callback) => {
	console.log(JSON.stringify(event));
	var params = {
		Image: {
			S3Object: {
				Bucket: event['Records'][0]['s3']['bucket']['name'],
				Name: event['Records'][0]['s3']['object']['key']
			}
		},
		MaxLabels: 10,
		MinConfidence: 75
	};
	//console.log(params);
	rekognition.detectLabels(params, function (err, data) {
		//console.log("I am here");
		if (err) {
			console.log(err, err.stack);
		}
		else {
			console.log(JSON.stringify(data));
			var labels = [];
			for (var i = 0; i< data.Labels.length; i++) {
				labels.push(data.Labels[i].Name.toLowerCase());
			}

			var response = {
				"objectKey" : params.Image.S3Object.Name,
				"bucket" : params.Image.S3Object.Bucket,
				"createdTimestamp":event['Records'][0]['eventTime'],
				"labels" : labels
			};

			IndexPhotos(response);
		}
	});
};
