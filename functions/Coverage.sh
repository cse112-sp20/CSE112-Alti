#!/bin/bash

if [ $OSTYPE == "linux-gnu" ]; then
    codecov
else
    echo "Coverage only runs on github"    
fi