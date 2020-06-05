#!/bin/bash

RunTimeConfig=".runtimeconfig.json"
ServiceAccountKey="serviceAccountKey.json"

if test -f "$RunTimeConfig"; then
    echo "$RunTimeConfig exist"
else
    firebase functions:config:get slack_setup_token > .runtimeconfig.json
    if [[ $OSTYPE == "darwin"* ]]; then
        sed -i '' -E "1 s/[^{]*//" .runtimeconfig.json
    fi
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sed -i '' -E "1 s/[^{]*//" .runtimeconfig.json
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
        sed -i '' -E "1 s/[^{]*//" .runtimeconfig.json
    fi
    echo "$ServiceAccountKey created"
fi

if [[ $OSTYPE == "msys" ]]; then
    CurrPath=`pwd`
    ServiceAccountKeyPath="$CurrPath\\$ServiceAccountKey"
    export GOOGLE_APPLICATION_CREDENTIALS="$ServiceAccountKeyPath"
fi

if [[ $OSTYPE == "darwin"* ]]; then
    CurrPath=`pwd`
    ServiceAccountKeyPath="$CurrPath/$ServiceAccountKey"
    export GOOGLE_APPLICATION_CREDENTIALS="$ServiceAccountKeyPath"
fi

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CurrPath=`pwd`
    ServiceAccountKeyPath="$CurrPath/$ServiceAccountKey"
    export GOOGLE_APPLICATION_CREDENTIALS="$ServiceAccountKeyPath"
fi

nyc --reporter=lcov --reporter=text --reporter=text-summary mocha