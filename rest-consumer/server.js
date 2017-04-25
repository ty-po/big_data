var Client = require('node-rest-client').Client;
 
var client = new Client();
 
// direct way 
client.get("http://cass-api:8080/raw", function (data, response) {
    // parsed response body as js object 
    console.log(data);
});
