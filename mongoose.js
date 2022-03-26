const mongoose = require("mongoose");
const { MONGO_URL } = require("./config");

require("./users");

module.exports = async function() {
    try{
        await mongoose.connect(MONGO_URL);
    }catch(e){
        console.log("MONGOOSE CONNECTION FAILED..")
    }
}