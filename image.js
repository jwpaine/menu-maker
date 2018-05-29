var fs = require('fs');
var request = require('request');
const uuidv1 = require('uuid/v1');
var aws = require('aws-sdk')

var Uploader = require('s3-image-uploader');


    var awsconfig = {
        AWS_ACCESS_KEY : "",
        AWS_SECRET_KEY : "",
        S3_BUCKET : "takeout.photos",
        S3_REGION : 'us-east-2',
    }
exports.endpoint = function() {
    return "https://s3." + awsconfig.S3_REGION + ".amazonaws.com/" + awsconfig.S3_BUCKET + "/"
}
exports.fetch = function(uri, callback){
  filename = uuidv1() + ".jpg"
  request.head(uri, function(err, res, body){
    try {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    } catch(e) {
      
        callback(e, null)
        return
    }

    request(uri).pipe(fs.createWriteStream(filename).on('close', function() {
        console.log("image written!")

        // upload image
        aws.config.update({accessKeyId: awsconfig.AWS_ACCESS_KEY, secretAccessKey: awsconfig.AWS_SECRET_KEY, region: awsconfig.S3_REGION});
        var readStream = fs.createReadStream(filename);
        var s3 = new aws.S3()
        
       
        var options = {
            Bucket: awsconfig.S3_BUCKET,
            Key: filename,
            Body : readStream,
            ContentType: res.headers['content-type'],
            ACL: 'public-read'
        }

        s3.putObject(options, function(err, data) {
            console.log("here!")
            if(err) { 
                console.log("error putting to s3")
                console.log(err);
                callback(err, null)
                return;
            }
            //unlink file 
            fs.unlinkSync(filename);
            // successfully uploaded image, now create item with proper fields
            var url = 'https://s3.amazonaws.com/' + awsconfig.S3_BUCKET + '/' + options.Key;

           // console.log("success: " + url);
           callback(null, filename)
        });



    }));
    
});
 
};

