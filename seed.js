var mongoose=require("mongoose");
var Campground=require("./models/campground");
var Comment=require("./models/comment");
var data=[
  {name:"white elephant",
  image:"https://secure.i.telegraph.co.uk/multimedia/archive/03424/elephant-m_3424862b.jpg",
  description:"lalaLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. land"},
  {name:"red fort",
  image:"https://images.indianexpress.com/2018/06/red-fort-759-getty-images.jpg",
  description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."},
  {name:"red lion",
  image:"https://pbs.twimg.com/profile_images/626703689340854273/qaDUhz-V_400x400.jpg",
  description:"king's lion the Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.land"}
]
var seedDB=function(){
    Campground.remove({},function(err){
    if(err)
      console.log(err);

     
data.forEach(function(seed){
  Campground.create(seed,function(err,campground){
    if(err)
    console.log(err)
    else{
    console.log("added a campground");
    //CREATE COMMENTS
  Comment.create(
    {text:"this is a great picture",
    author:"junat"
  },function(err,comment){
    if(err)
       console.log(err);
       else{
    campground.comments.push(comment);
       campground.save();
       console.log(campground)
     console.log("created new comment");
       }
   })  
  }
  }) 
})

}) 


}
module.exports=seedDB;