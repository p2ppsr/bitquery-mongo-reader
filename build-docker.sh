#!/bin/sh
docker build -t us.gcr.io/computing-with-integrity/ump-reader .
docker push us.gcr.io/computing-with-integrity/ump-reader
