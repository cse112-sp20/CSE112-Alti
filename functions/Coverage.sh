#!/bin/bash

echo "this is local $LOCAL_ENV"

if [[ $LOCAL_ENV == "GitHub" ]]; then
    codecov    
else
    echo "Coverage only runs on github"   
fi