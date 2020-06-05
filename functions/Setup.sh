#!/bin/bash

RunTimeConfig=".runtimeconfig.json"
ServiceAccountKey="serviceAccountKey.json"

npm install

if test -f "$RunTimeConfig"; then
    echo "$RunTimeConfig exist"
else
    firebase functions:config:get slack_setup_token > .runtimeconfig.json
    if [[ $OSTYPE == "darwin"* ]]; then
        sed -i '' -E "1 s/[^{]*//" .runtimeconfig.json
    fi
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        ed -i "1s/.*/{/" .runtimeconfig.json
    fi
    echo "$RunTimeConfig created"
fi
if test -f "$ServiceAccountKey"; then
    echo "$ServiceAccountKey exist"
else
    firebase functions:config:get service_account_key > serviceAccountKey.json
    if [[ $OSTYPE == "darwin"* ]]; then
        sed -i '' -E "1 s/[^{]*//" serviceAccountKey.json
    fi
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        ed -i "1s/.*/{/" serviceAccountKey.json
    fi
    echo "$ServiceAccountKey created"
fi