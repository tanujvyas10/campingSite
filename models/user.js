var mongoose=require("mongoose")
var passportLocalMongoose=require("passport-local-mongoose")
var UserSchema=new mongoose.Schema({
    username:String,
    password:String
})
UserSchema.plugin(passportLocalMongoose);//start adding some wheels to the user

module.exports=mongoose.model("User",UserSchema)