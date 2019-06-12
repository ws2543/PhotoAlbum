exports.handler = async (event) => {

    console.log('Loading function');
    var AWS = require('aws-sdk');
    var connectionClass = require('http-aws-es');
    var elasticsearch = require('elasticsearch');
    AWS.config.update({region: 'us-west-2'});
    
    var lexruntime = new AWS.LexRuntime({apiVersion: '2016-11-28'});
    //console.log(event.queryStringParameters.q);
    

    var lexChatbotParams = {
        botAlias: 'BETA',
        botName: 'HandleQueries',
        inputText: event.queryStringParameters.q,
        userId: "12345"
    };
    
    
    function MyLex() {

        return lexruntime.postText(lexChatbotParams).promise()
        .then((data) =>{
            
            console.log(data);
        
            var mylabels = data.slots.Keyword_one.split(" ");
            var Keyword_two = data.slots.Keyword_two;
            if (Keyword_two != null) {mylabels.push(Keyword_two);}
            return mylabels;
    
        })
        .catch((err) =>{
            console.log(err);
        });
    };
    
    var labels = await MyLex();
    console.log(labels);
  
    var elasticClient = new elasticsearch.Client({
            host: '<VPC-DOMAIN>',
            log: 'error',
            connectionClass: connectionClass,
            amazonES: {
                credentials: new AWS.EnvironmentCredentials('AWS')
            }
        });
    
    elasticClient.ping({
        // ping usually has a 3000ms timeout
        requestTimeout: 1000
    }, function (error) {
        if (error) {
            console.trace('elasticsearch cluster is down!');
        } else {
            console.log('All is well');
        }
    });
    
    try {
        const response = await elasticClient.search({
            index: 'photos',
            type: "Photo",
            body: {
                "query": {
                    "terms": {
                        "labels": labels
                    }
                }
            }
        });
        //console.log("response:"+response.hits);
        var results = [];
        var hits = response.hits.hits;
        //console.log(hits);
        hits.forEach(hit => {
            var objectKey = hit._source.objectKey;
            console.log("hit:"+hit);
            console.log("objectKey:"+objectKey);
            var result = '<S3-BUCKET_URL>'+ objectKey;
            results.push(result);
        });
        //console.log(results);
        var res = {"results": results};
        
        var resp = {
            headers: {
                "Access-Control-Allow-Origin" : "*",
                "Content-Type": "application/json"
            },
            statusCode: 200,
            body: JSON.stringify(res)
        };
    
        return resp;
        
        
        } catch (error) {
        console.trace(error.message);
    };
        
};