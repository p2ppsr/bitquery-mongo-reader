#!/bin/sh
docker build -t us.gcr.io/computing-with-integrity/bitquery-mongo-reader .
docker push us.gcr.io/computing-with-integrity/bitquery-mongo-reader
