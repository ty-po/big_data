var idb = require('tt-idb')

console.log("running")
idb.push(Date.now(),"deleteme","nue","stufe")

idb.getQueue('raw', false, (res) => {
  console.log(res)
  console.log("###############################")
  idb.getQueue('raw', 'techcrunch', (res) => {
    console.log(res)
    console.log("###############################")
    idb.getLatest('raw', 'techcrunch', (res) => {
      console.log(res)
    })
  })
})
