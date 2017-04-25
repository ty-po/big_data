var Client = require('node-rest-client').Client;
 
var client = new Client();

console.log("Get /raw:")
client.get("http://cass-api:8080/raw/", (data, resp) => {
  console.log(data)
  console.log("Post Test Data:")
  push(Date.now(), "typo", "me", "this is number 2", () => {
    push(new Date("4/4/2001"), "typo", "me", "this is number 1", () => {
      push(new Date("4/4/2006"), "nottypo", "def not me", "this is number e", () => {
        push(new Date("10/1/2017"), "typo", "me", "this is number 3", () => {
          console.log("Get /raw:")
          client.get("http://cass-api:8080/raw/", (data, resp) => {
            console.log(data)
            console.log("Get /raw/null:")
            client.get("http://cass-api:8080/raw/null", (data, resp) => {
              console.log(data)
              console.log("Get /raw/latest/typo")
              client.get("http://cass-api:8080/raw/latest/typo", (data, resp) => {
                console.log(data)
                console.log("Get /raw/typo")
                client.get("http://cass-api:8080/raw/typo", (data, resp) => {
                  data.forEach((row) => {
                    console.log("Getting task " + row.task_id)
                    client.get("http://cass-api:8080/raw/typo/" + row.task_id, (data, resp) => {
                      console.log(data);
                      console.log("Getting /raw")
                      client.get("http://cass-api:8080/raw/", (data, resp) => {
                        //console.log(data)
                      });
                    });
                  })
                }) 
              }) 
            })
          })
        })
      })
    })
  })
})








function push(date, source, author, data, callback) {
  var args = { 
    data: { date: date, source: source, author: author, data: data },
    headers: { "Content-Type": "application/json" }
  }
  client.post("http://cass-api:8080/raw", args, (data, response) => {
    console.log(data)
    callback();
  })  
};
