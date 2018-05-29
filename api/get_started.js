var request = require('request');
const token = "EAAXZCvuosbrIBAPB9daEyeWKGNyeWbGq39tZBvegXWTnmPG90CqlmCIzhks9GdMLqusH9wDXbZCOtlMUZB9QiMFgg0gB7FNE1ZCCCfBgoPuNgb9uIZBaidrRwflQRmIefaeQbyfXxys2bCaIUxCsJFtJEwkCAZBujMWFIhx1UnARwZDZD"

var persistant_menu = {
    "persistent_menu":[
        {
        "locale":"default",
        "composer_input_disabled":true,
        "call_to_actions":[
            {
            "title":"Info",
            "type":"nested",
            "call_to_actions":[
                {
                "title":"Help",
                "type":"postback",
                "payload":"HELP_PAYLOAD"
                },
                {
                "title":"Contact Me",
                "type":"postback",
                "payload":"CONTACT_INFO_PAYLOAD"
                }
            ]
            },
            {
            "type":"web_url",
            "title":"Visit website ",
            "url":"http://www.techiediaries.com",
            "webview_height_ratio":"full"
            }
        ]
        },
        {
        "locale":"zh_CN",
        "composer_input_disabled":false
        }
    ]
}
var options = {
  uri: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token=' + token,
  method: 'POST',
  json: persistant_menu,
  json:true,
  headers : {
      "Content-Type": "application/json"
  }
};

request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Print the shortened url.
  } else {
     // console.log(error)
     console.log(body)
  }
});