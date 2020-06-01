#!/bin/bash
Count=0
Range=2 #Change how many times to run npm test

while [ $Count -lt $Range ]
do
    npm test | tee TestOutput.txt
    if grep -q failing "TestOutput.txt"; 
    then
        echo "Test $Count Failed!!"
        break;  
    else
        Count=$((Count+1))
        echo "Test $Count Passed!!"
    fi
done

if [ $Count -eq $Range ]
then    
    echo "All $Count Tests Passed!!"
else
    echo "A Test Failed!!"
fi