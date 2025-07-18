@echo off

# remove previous build

docker build -t ai-detector-fe .

docker run --rm -p 80:80 ai-detector-fe
