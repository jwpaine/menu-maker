#!/bin/bash

curl -X POST -H "Content-Type: application/json" -d '{
  "payment_settings" : {"privacy_url" : "https://yabucks.com/privacy"}
  }' "https://graph.facebook.com/v2.6/me/messenger_profile?access_token=EAAXZCvuosbrIBAPB9daEyeWKGNyeWbGq39tZBvegXWTnmPG90CqlmCIzhks9GdMLqusH9wDXbZCOtlMUZB9QiMFgg0gB7FNE1ZCCCfBgoPuNgb9uIZBaidrRwflQRmIefaeQbyfXxys2bCaIUxCsJFtJEwkCAZBujMWFIhx1UnARwZDZD"