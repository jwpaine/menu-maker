
var amazon = require('amazon-product-api');


var client = amazon.createClient({
  awsId: 'AKIAJOZXUPIZSYYZWLCA',
  awsSecret: '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',
  awsTag: "menufuel-20"
});

exports.price = function(asin, cb) {
  client.itemLookup({
    idType: 'ASIN',
    itemId: asin,
   
    responseGroup: 'ItemAttributes,Offers,Images'
  }, function(err, results, response) {
    if (err) {
      cb(err, null)
    } else {
      cb(null, results[0].OfferSummary[0].LowestNewPrice[0].FormattedPrice[0].split('$')[1]);
    }
  });

}
