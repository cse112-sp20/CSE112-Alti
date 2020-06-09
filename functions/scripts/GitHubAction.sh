#!/bin/bash

if [[ `pwd` == *"scripts"* ]]; then
    cd ..
fi

if [[ $OSTYPE == "darwin"* ]]; then
    ACT=`act --version`
    BREW=`brew --version`
    if [[ "$BREW" == *"brew: command not found"* ]]; then
        echo "homebrew not downloaded"
        exit
    elif [[ "$ACT" == *"act: command not found"* ]]; then
        brew install nektos/tap/act
    fi
fi
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    WINE=`wine`
    if [[ "$WINE" == *"wine: command not found"* ]]; then
        echo "wine not downloaded"
        exit
    fi
fi

DOCKER=`docker info`
if [[ "$DOCKER" == *"ERROR"* ]]; then
    echo "Docker not running"
    exit
elif [[ "$DOCKER" == *"Cannot connect"* ]]; then
    echo "Docker not running"
    exit
fi


RunTimeConfig=".runtimeconfig.json"
if test -f "$RunTimeConfig"; then
    echo "$RunTimeConfig exist"
else
    firebase functions:config:get slack_setup_token > .runtimeconfig.json
    if [[ $OSTYPE == "darwin"* ]]; then
        sed -i '' -E "1 s/[^{]*//" .runtimeconfig.json
    fi
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sed -i "1s/.*/{/" .runtimeconfig.json
    fi
    echo "$RunTimeConfig created"
fi
export RUNTIME_CONFIG=`cat .runtimeconfig.json`

ServiceAccountKey="serviceAccountKey.json"
if test -f "$ServiceAccountKey"; then
    echo "$ServiceAccountKey exist"
else
    firebase functions:config:get service_account_key > serviceAccountKey.json
    if [[ $OSTYPE == "darwin"* ]]; then
        sed -i '' -E "1 s/[^{]*//" serviceAccountKey.json
    fi
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sed -i "1s/.*/{/" serviceAccountKey.json
    fi
    echo "$ServiceAccountKey created"
fi
export SERVICE_ACCOUNT_KEY=`cat serviceAccountKey.json`

firebase functions:config:get github_actions.codecov > codecov.txt
if [[ $OSTYPE == "darwin"* ]]; then
    sed -i '' -E "1 s/[^\"]*//" codecov.txt
fi
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sed -i "1s/.*/{/" codecov.txt
fi
export CODECOV_TOKEN=`cat codecov.txt`

firebase functions:config:get github_actions.firebase_token > firebase_token.txt
if [[ $OSTYPE == "darwin"* ]]; then
    sed -i '' -E "1 s/[^\"]*//" firebase_token.txt
fi
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sed -i "1s/.*/{/" firebase_token.txt
fi
export FIREBASE_TOKEN=`cat firebase_token.txt`

echo "Local" > Local.env

if [[ $OSTYPE == "msys" ]]; then
    dos2unix ./scripts/RunTest.sh
    dos2unix ./scripts/Coverage.sh
fi

cd ..
if [[ $OSTYPE == "darwin"* ]]; then
    act -b -s RUNTIME_CONFIG -s SERVICE_ACCOUNT_KEY -s CODECOV_TOKEN -s FIREBASE_TOKEN -j $1
fi
if [[ $OSTYPE == "msys" ]]; then
    ./act -b -s RUNTIME_CONFIG -s SERVICE_ACCOUNT_KEY -s CODECOV_TOKEN -s FIREBASE_TOKEN -j $1
fi
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    wine act.exe -b -s RUNTIME_CONFIG -s SERVICE_ACCOUNT_KEY -s CODECOV_TOKEN -s FIREBASE_TOKEN -j $1
fi

cd ./functions
rm Local.env
rm codecov.txt firebase_token.txt