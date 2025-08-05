# Build the Docker image
docker build -t ai-detector-fe .

# Run the Docker container
docker run --rm -p 80:80 ai-detector-fe

