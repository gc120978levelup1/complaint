# complaint
Laravel + Vue3 + Docker
_________________________________________________________

## Setup Docker Container

### Check Containers Status in (Git Bash Terminal)

```sh

./ss check

```

## If there are indication of running containers instances, shut it all down using the command below.

```sh

docker ps -aq | xargs docker stop | xargs docker rm

```

## Launch Containers in  (Git Bash Terminal) (node + composer)

```sh

./ss up

```

## Launch Containers in  (Git Bash Terminal) (node + composer)

Setup the project environment

```sh

composer setup

```


## Run Developer Mode

```sh

composer dev

```

### Phpmyadmin
[http://127.0.0.1:8001]

### Webapp
[http://127.0.0.1:8000]
