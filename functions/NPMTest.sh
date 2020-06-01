#!/bin/bash
Count=0
Range=2 #Change how many times to run npm test

while [ $Count -lt $Range ]
do
    npm test | tee TestOutput.txt
    if grep -q passing "TestOutput.txt"; 
    then
        Count=$((Count+1))
        echo "Test $Count Passed!!"        
    else
        echo "Test $Count Failed!!"
        break;
    fi
done

if [ $Count -eq $Range ]
then    
    echo "All $Count Tests Passed!!"
else
    echo "A Test Failed!!"
fi