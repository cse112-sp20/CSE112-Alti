#!/bin/bash

export RUNTIME_CONFIG=`firebase functions:config:get slack_setup_token`
export SERVICE_ACCOUNT_KEY=`firebase functions:config:get service_account_key`
export FIREBASE_TOKEN=`firebase functions:config:get github_actions.firebase_token`
export CODECOV_TOKEN=`firebase functions:config:get github_actions.codecov`

echo "Local" > Local.env

cd ..

./act -b -s RUNTIME_CONFIG -s SERVICE_ACCOUNT_KEY -s FIREBASE_TOKEN -s CODECOV_TOKEN -j $1

cd ./functions

rm Local.env