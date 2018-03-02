tag=1.0.2
docker build -t soichih/event ..
if [ ! $? -eq 0 ]; then
    echo "failed to build"
    exit
fi
docker tag soichih/event soichih/event:$tag
#docker push soichih/event #latest
docker push soichih/event:$tag
