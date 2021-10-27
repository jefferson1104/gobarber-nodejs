<div align="center" style="margin-bottom: 20px;">
  <h1 align="center">BACK-END (API)</h1>
  <img alt="gobarber" src="https://github.com/jefferson1104/goBarber/raw/master/assets/images/goBarber-logo.svg" width="auto" heigth="auto"/>
  <p align="center" style="margin-top: 20px;">
    <img alt="technology" src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white">
    <img alt="technology" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
    <img alt="technology" src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white">
  </p>
</div>

# :barber: About this project
Back-end of the gobarber project made with nodejs using typescript, applying the set of principles and best practices SOLID, TDD and DDD.

# :rocket: Main technologies
- [TypeScript](https://www.typescriptlang.org/docs/)
- [NodeJS](https://nodejs.org/en/)
- [ExpressJS](https://expressjs.com/pt-br/)
- [Jest](https://jestjs.io/pt-BR/)
- [PostgresSQL](https://www.postgresql.org/)
- [MongoDB](https://www.mongodb.com/pt-br)
- [Redis](https://redis.io/)
- [NodeMailer](https://nodemailer.com/about/)

# :zap: How to run this project
Inside the project, there is already a _docker-compose.yml_ file that has 3 **Docker** containers, a container with **PostgresSQL** database, a container with **MongoDB** database and another container with **Redis** caching database, you just have the Docker installed on your machine.

To start the project backend (API):

```Bash
# Access the back-end directory
$ cd gobarber-nodejs

# Install all project dependencies
$ yarn

# Create containers with PostgresSQL, MongoDB and Redis (docker must be installed on the machine)
# The command below will start in the background and will not lock the shell
$ sudo docker-compose up -d

# Command to check if containers are running
$ sudo docker ps -a

# Run migrations for the database
$ yarn typeorm migration:run

# Launch goBarber back-end locally on port 3333
$ yarn dev:server
```

# :zap: How to deploy this project
I've separated a quick guide on how to deploy nodeJS applications on servers or linux vps, using ubuntu, the main point is to configure your project and leave it ready to deploy, and for that follow the [quick guide](./DEPLOY .md).

# 🎨 Imagens
<div align="center">
  <a href='./assets/images/screenshots/'>
    <img width=500 src="./assets/images/img-02.png">
  </a>

  <a href='./assets/images/screenshots/'>
    <img width=500 src="./assets/images/img-03.png">
  </a>

  <a href='./assets/images/screenshots/'>
    <img width=500 src="./assets/images/img-01.png">
  </a>
</div>
