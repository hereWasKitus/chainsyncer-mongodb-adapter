#!/bin/bash

sudo docker stop mongodb_adapter_tester
sudo rm -rf .db
sudo docker build --tag mongodb_adapter_tester --file test.dockerfile .
sudo docker run --name mongodb_adapter_tester -d --rm mongodb_adapter_tester

if [[ "$1" == "full" ]]; then
  docker exec -t mongodb_adapter_tester /wait
  docker exec -t mongodb_adapter_tester npm run test
fi

exit 0