# complaint
Laravel + Vue3 + Docker
_________________________________________________________

## Setup the project environment

```sh
composer setup
```

## Setup Docker Container

## Open Your LARAVEL Project Folder using [VSCode](https://code.visualstudio.com/)
### From VSCode, launch Git Bash Terminal
### (use Git Bash Terminal) Download this ss_LAMP_DOCKER folder INSIDE YOUR PROJECT and wait until done downloading (use Git Bash Terminal)

```sh
git clone --recursive https://github.com/gc120978levelup1/ss_LAMP_Docker.git
```

### Go inside this ss_LAMP_DOCKER folder (Git Bash Terminal)

```sh
cd ss_LAMP_DOCKER
```

### Merge to main file (Git Bash Terminal)

```sh
./ss merge
```

### Come out of ss_LAMP_DOCKER folder (Git Bash Terminal)

```sh
cd ..
```

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

### Launch Initial Data Migration in  (Git Bash Terminal)

```sh
php artisan key:generate
./ss migrate
```

## Run Developer Mode

```sh
composer dev
```

### Phpmyadmin
[http://127.0.0.1:8001]

### Webapp
[http://127.0.0.1:8000]
