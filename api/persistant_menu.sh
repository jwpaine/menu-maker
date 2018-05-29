#!/bin/bash

curl -X POST -H "Content-Type: application/json" -d '{ 
"get_started":{
    "payload":"GET_STARTED_PAYLOAD"
}
}' "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=EAAdVwf4ZAZC3IBAECfmGW2j4UU1J6fEi9cTRDnLYmuK80hnSUEnEWNSLS435xayGOrcZA2xrbAvnKYxVyvtMr5MrU9zCIEA8yH65exNNMo5LdpsKjyL49gNbz8HnW8YWRbVEmuxF9ZB0TN8QQuYuCwOovOd5vBZBOO8NPmqw85AZDZD"

curl -X POST -H "Content-Type: application/json" -d '{
"persistent_menu":[
    {
    "locale":"default",
    "composer_input_disabled":true,
    "call_to_actions": [
            {
            "title":"My Order",
            "type":"postback",
            "payload":"getorder"
            },
            {
            "title":"Find Restaurants",
            "type":"postback",
            "payload":"restaurant:getall"
            },
    ]
    },
    {
    "locale":"zh_CN",
    "composer_input_disabled":false
    }
]
}' "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=EAAdVwf4ZAZC3IBAECfmGW2j4UU1J6fEi9cTRDnLYmuK80hnSUEnEWNSLS435xayGOrcZA2xrbAvnKYxVyvtMr5MrU9zCIEA8yH65exNNMo5LdpsKjyL49gNbz8HnW8YWRbVEmuxF9ZB0TN8QQuYuCwOovOd5vBZBOO8NPmqw85AZDZD"