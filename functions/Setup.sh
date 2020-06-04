#!/bin/bash

RunTimeConfig=".runtimeconfig.json"
ServiceAccountKey="serviceAccountKey.json"

npm install

if test -f "$RunTimeConfig"; then
    echo "$RunTimeConfig exist"
else
    firebase functions:config:get slack_setup_token > .runtimeconfig.json
fi
if test -f "$ServiceAccountKey"; then
    echo "$ServiceAccountKey exist"
else
    firebase functions:config:get service_account_key > serviceAccountKey.json
fi



