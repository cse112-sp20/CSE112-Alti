#!/bin/bash

if test -f "Local.env"; then
    echo "Coverage only runs on github" 
else
    codecov   
fi