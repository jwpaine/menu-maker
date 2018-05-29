
const uuidv1 = require('uuid/v1');
var aws = require('aws-sdk')



var AWS_ACCESS_KEY = 'AKIAJXQQLAUN2GBT7ITQ'
var AWS_SECRET_KEY = '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'
var S3_BUCKET = 'takeout.photos'

fs = require ('fs');

function upload(path, cb) {
  aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY, region:'us-east-1'});
  var readStream = fs.readFileSync(path);
  var s3 = new aws.S3()
 
  var options = {
  Bucket: S3_BUCKET,
  Key: "test" + "." + "jpeg",
  Body : readStream,
  ContentType: "image/jpeg",
  ACL: 'public-read'
  }
  s3.putObject(options, function(err, data) {
    console.log("Uploading3")
      if(err) { 
          console.log(err);
          return;
      }
      console.log("Uploading4")
      //unlink file 
      fs.unlinkSync(path);
      // successfully uploaded image, now create item with proper fields
      var url = 'https://s3.amazonaws.com/' + S3_BUCKET + '/' + options.Key;
      console.log("Uploading5")
});


}

upload("./coke.jpg", function(cb) {

})