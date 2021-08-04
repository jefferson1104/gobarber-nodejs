## DEPLOY INTERMEDIÁRIO DE UMA API (BACKEND) NODEJS COM TYPESCRIPT

Neste guia completo vou ensinar como fazer um deploy intermediário de uma aplicação feita com nodejs e typescript, trata-se de um deploy do backend (API) de um projeto, neste guia vamos utilizar um projeto como exemplo, antes de iniciar é importante você fazer uma cópia deste projeto e subir ele no seu gihub, então crie um repositório e faça um push com a aplicação que você deseja fazer deploy ou utilize a nossa aplicação.

### UTILIZAMOS AQUI

**Máquina pessoal**: Ubuntu desktop 20.04 LTS, Docker, Yarn, Node 14.x
**Servidor/VPS**: ubuntu server 20.04 LTS, Docker, Yarn, Node 14.x
**API NodeJS TypeScript**: [GOBARBER](https://github.com/jefferson1104/gobarber-nodejs)

> **OBSERVAÇÃO**: Caso sua aplicação seja construida com typescript, ES6 ou alguma versão mais moderna do javascript, vamos precisar da ferramenta **[babel](https://babeljs.io/)**, para fazer a transpilação de código javascript moderno para uma versão que os ambientee de execução seja ele o próprio **browser** (navegador) ou **Node**.

### BUILD DO PROJETO (MÀQUINA PESSOAL)

Vamos utilizar a ferramenta **babel** para fazer a conversão do nosso código typescript para javascript, para isso vamos instalar algumas bibliotecas como dependência de desenvolvimento, execute o código abaixo no terminal do seu projeto.

```bash
$ yarn add @babel/cli @babel/core @babel/node @babel/preset-env @babel/preset-typescript babel-plugin-module-resolver -D
```

![babel-install](./assets/tutorial/01_screenshot_babel_install.png)

Especificamente nesse projeto do gobarber estamos utilizando **decorators** em nosso código, devido a isso iremos instalar os plugins abaixo como dependência de desenvolvimento.

```bash
$ yarn add babel-plugin-transform-typescript-metadata @babel/plugin-proposal-decorators @babel/plugin-proposal-class-properties -D
```

No diretório raiz do projeto crie o arquivo de configuração do babel, seu nome será **babel.config.js**, dentro desse arquivo vamos inserir configurações do projeto, como nosso projeto foi construido com typescript, vamos utilizar o arquivo **tsconfig.json** como parâmetro, abaixo veja o resultado do conteudo que deve ter seu arquivo de configuração do babel.

**babel.config.js**

```bash
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current'} }],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['module-resolver', {
      alias: {
        "@modules": "./src/modules",
        "@config": "./src/config",
        "@shared": "./src/shared",
      }
    }],
    "babel-plugin-transform-typescript-metadata",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
  ],
}
```

Dentro do seu **package.json** na sessão de **"scripts"** crie ou ajuste o script de **build** do projeto, passando o babel como o transpilador de código para javascript.

```json
 "build": "babel src --extensions \".js,.ts\" --out-dir dist --copy-files"
```

![build-script](./assets/tutorial/02_screenshot_build_script.png)

Execute o comando de build que acabamos de configurar nos scripts do **package.json**, aṕós sua execução veremos que foi gerado um novo diretório chamado '**dist**', nele está todo o código convertido de typescript para javascript.

```bash
# Executando build do projeto
$ yarn build
```

![build-project](./assets/tutorial/03_screenshot_build_project.png)

## CONFIGURAÇÃO DO SERVIDOR/VPS

Para fazer o deploy do projeto vamos fazer uma série de configurações no servidor/vps, você pode contratar um servidor/vps nas mais conhecidas empresas do mercado, eu recomendo utilizar os produtos da [digital ocean](https://www.digitalocean.com/) ou [contabo](https://contabo.com/en/) mas você pode criar seu próprio servidor/vps ou contratar em qualquer outra empresa.

#### REQUISITOS

- Sistema Operacional Ubuntu desktop 20.04 LTS
- Docker
- NodeJS 14.x
- NPM
- Yarn

#### CONFIGURAÇÕES INICIAIS (SERVIDOR/VPS)

Por questões de boas práticas sobre segurança, recomendo que não utilize o usuário '**root**', vamos criar um usuário novo com nome '**deploy**' e colocá-lo no grudo dos **sudoers**, fazer uma atualização dos pacotes e dependencias do sistema operacional e criar um diretório '**.ssh**'

```bash
# Atualizando sistema operacional
$ sudo apt update
$ sudo apt upgrade

# Criando usuário deploy
$ adduser deploy

# Permissões de sudo para o usuário
$ usermod -aG sudo deploy

# Acessando a home do usuário deploy
$ cd /home/deploy/

# Criando diretório .ssh
$ mkdir .ssh

# Alterar dono do diretório .ssh
$ chown deploy:deploy .ssh/
```

Dentro do diretório '**.ssh**' você pode guardar as chaves ssh do seu servidor, para criar uma chave ssh você executa o comando a seguir, mas não dê nenhum nome para essa chave, como default ele mesmo vai nomear como '**id_rsa**' e '**id_rsa.pub**'.

```bash
# Criar chave ssh
$ ssh-keygen

```

Após as configurações iniciais, você deve desconectar do sevidor e fazer login novamente via ssh com seu usuário '**deploy**'.

#### CONFIGURANDO DOCKER (SERVIDOR/VPS)

Aapós fazer o login com o usuário deploy faça uma configuração de permissão do docker para este usuário, assim toda vez que voce executar algum comando do docker não será necessário utilizar o sudo antes do comando.

```bash
# Criando o grupo docker
$ sudo groupadd docker

# Adicionando seu usuário ao grupo docker
$ sudo usermod -aG docker $USER

# execute o comando abaixo para testar
$ docker ps -a
```

Caso você após executar o comando para teste e identificar que ainda não tem permissão, tente fazer logout e login novamente com o usuário, e se ainda persistir sem permissão recomendo reiniciar o seu servidor/vps.

#### INSTALAÇÂO DO NODEJS, NPM E YARN (SERVIDOR/VPS)

Por questões de boas práticas, segurança, estabilidade e compatibilidade vamos instalar sempre a versão **LTS** mais recente do **NodeJS**, também vamos instalar o gerenciador de pacotes **Yarn**.

Se desejar veja a [documentação de instalação do nodeJS](https://github.com/nodesource/distributions/blob/master/README.md).

```bash
# Baixando pacotes do node para a instalação
$ curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -

# Instalando nodejs
$ sudo apt-get install -y nodejs

# Verificar versão instalada do nodejs
$ node -v

# Verificar versão instalada do NPM
$ npm -v

# Baixar pacotes do repositório yarn
$ curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -

# Configurando repositório
$ echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

# Atualizando lista de repositórios linux
$ sudo apt update

# Instalando yarn
$ sudo apt install --no-install-recommends yarn

# Verificar versão instalada do Yarn
$ yarn -v
```

#### GITHUB CHAVES SSH (SERVIDOR/VPS)

Neste passo vamos fazer a configuração da chave ssh do seu servidor/vps no seu github, vamos acessar o diretório '**.ssh**' e copiar o conteúdo que existe dentro do arquivo '**id_rsa.pub**', o arquivo que criamos quando geramos nossa chave ssh no passo de '**configurações iniciais**'.

```bash
# Acessar pasta ssh do servidor/vps
$ cd ~/.ssh/

# Copie o conteúdo do arquivo 'id_rsa.pub'
$ cat id_rsa.pub
```

![ssh-server-key](./assets/tutorial/ssh-key-server.png 'ssh key')

No seu github acesse **settings** > **SSH and GPG keys** e clique no botão **New SSH key**, é aqui que você vai colar a chave ssh que você copiou do arquivo '**id_rsa.pub**' em seguida clique no botão **Add SSH key** para adicionar a chave.

![ssh-server-key](./assets/tutorial/ssh-key-github-02.png 'add ssh key on github')

![ssh-server-key](./assets/tutorial/ssh-key-github-01.png 'add ssh key on github')

#### CLONANDO O PROJETO (SERVIDOR/VPS)

Nesse passo vamos baixar nosso projeto para o servidor/vps, lembrando que tanto o projeto que estamos utilizando como exemplo neste guia ou o seu projeto pessoal, ambos devem estar em um reposistório no seu Github.

```bash
# Navegando para o diretório raiz do servidor/vps
$ cd

# Criando um diretório para o projeto
$ mkdir app

# Navegando para o diretório app
$ cd app/

# Clonando o projeto
$ git clone git@github.com:jefferson1104/gobarber-nodejs.git

```

![clone app](./assets/tutorial/clone-app.png 'clone app')

#### BAIXANDO AS DEPENDÊNCIAS E EXECUTANDO BUILD (SERVIDOR/VPS)

Agora acesse o diretório do projeto e faça download de todos os pacotes e dependências do projeto, após baixar todas as dependências vamos fazer build da aplicação.

```bash
# Acessando diretório do projeto
$ cd ~/app/gobarber-nodejs/

# Baixando todas as dependencias
$ yarn

# Build do projeto
$ yarn build
```

![build app](./assets/tutorial/build-project.png 'build app')

#### CRIANDO OS CONTAINERS DE BANCO DE DADOS (SERVIDOR/VPS)

Vamos utilizar imagens de containers de uma biblioteca chamada '**bitnami**' vamos utilizar as imagens do **postgresql**, **mongodb** e **redis**, para mais detalhes de cada uma dessas imagens de containers do bitnami abaixo fica alguns links.

- [bitnami-docker-postgresql](https://github.com/bitnami/bitnami-docker-postgresql)

- [bitnami-docker-mongodb](https://github.com/bitnami/bitnami-docker-mongodb)

- [bitnami-docker-redis](https://github.com/bitnami/bitnami-docker-redis)

##### POSTGRESQL

```bash
  # Comando para criar o container do banco de dados postgres
  $ docker run -d --name postgresql -e POSTGRESQL_PASSWORD=gobarber110494 -e POSTGRESQL_USERNAME=postgres -e POSTGRESQL_DATABASE=gobarber -p 35432:5432 bitnami/postgresql:latest

  # Comando para validar se o container está em execução
  $ docker ps -a
```

_Explicando o comando_:

- **docker run** : já cria e executa o container
- **-d** : executa o container em backgorund
- **--name** : nome que você dá ao container
- **-e POSTGRESQL_PASSWORD** : senha de acesso
- **-e POSTGRESQL_USERNAME** : nome de usuário para acesso
- **-e POSTGRESQL_DATABASE** : nome do banco de dados
- **-p** : porta do banco de dados
- **bitnami/postgresql:latest** : imagem que utilizamos para criar o container

> **IMPORTANTE**: no parâmetro "-p" onde fazemos o redirecionamento da porta do banco de dados, note que não utilizamos o padrão 5432 do postgres, nós colocamos a porta 35432, fizemos isso como boa prática e dificultar o ataque de hackers ao tentar acessar esse banco.

![postgresql container](./assets/tutorial/docker-container-postgresql-01.png 'postgresql container')

![postgresql container](./assets/tutorial/docker-container-postgresql-02.png 'postgresql container')

Agora vamos deixar configurado no nosso projeto o "**ormconfig**", siga o exemplo do arquivo "**ormconfig.example.deploy.json**", para isso acesse o diretorio raiz do projeto e crie um arquivo com o nome "**ormconfig.json**" dentro desse arquivo deixe igual o que temos abaixo de acordo com os dados que utilizamos para criar o container de banco de dados postgresql.

> **OBSERVAÇÃO**: Utilize o nano como editor de texto no seu servidor, para instalar: `$ sudo apt install nano`. Para abrir um arquivo e editar: `$ nano nomeDoArquivo`

**ormconfig.json**

```json
[
  {
    "name": "default",
    "type": "postgres",
    "host": "localhost",
    "port": 35432,
    "username": "postgres",
    "password": "gobarber110494",
    "database": "gobarber",
    "entities": ["./dist/modules/**/infra/typeorm/entities/*.js"],
    "migrations": ["./dist/shared/infra/typeorm/migrations/*.js"],
    "cli": {
      "migrationsDir": "./dist/shared/infra/typeorm/migrations"
    }
  }
]
```

Para testar se tudo esta correto:

```bash
# Confirme se o container estar em execução
$ docker ps -a

# Caso o container não esteja em execução, execute
$ docker start postgresql

# Para testar a conexão com o banco de dados
$ ./node_modules/.bin/typeorm migration:run
```

![migration run](./assets/tutorial/migration-run-command.png 'migration run')

##### MONGODB

```bash
 # Comando para criar o container do banco de dados MongoDB
 docker run -d --name mongodb -e MONGODB_USERNAME=gobarber -e MONGODB_PASSWORD=gobarber110494 -e MONGODB_DATABASE=gobarber -p 47017:27017 bitnami/mongodb:latest

 # Comando para validar se o container está em execução
 $ docker ps -a
```

_Explicando o comando:_

- **docker run** : já cria e executa o container
- **-d** : executa o container em backgorund
- **--name** : nome que você dá ao container
- **-e MONGODB_USERNAME** : nome de usuário para acesso
- **-e MONGODB_PASSWORD** : senha de acesso
- **-e MONGODB_DATABASE** : nome do banco de dados
- **-p** : porta do banco de dados
- **bitnami/mongodb:latest** : imagem que utilizamos para criar o container

> **IMPORTANTE**: no parâmetro "-p" onde fazemos o redirecionamento da porta do banco de dados, note que não utilizamos o padrão 27017 do postgres, nós colocamos a porta 47017, fizemos isso como boa prática e dificultar o ataque de hackers ao tentar acessar esse banco.

Da mesma maneira que fizemos na etapa anterior, quando configuramos o nosso **ormconfig.json** vamos adicionar o conteúdo do mongodb, deixe seu ormconfig igual como mostra abaixo ou siga ele como exemplo.

**ormconfig.json**

```json
[
  {
    "name": "default",
    "type": "postgres",
    "host": "localhost",
    "port": 35432,
    "username": "postgres",
    "password": "gobarber110494",
    "database": "gobarber",
    "entities": ["./dist/modules/**/infra/typeorm/entities/*.js"],
    "migrations": ["./dist/shared/infra/typeorm/migrations/*.js"],
    "cli": {
      "migrationsDir": "./dist/shared/infra/typeorm/migrations"
    }
  },
  {
    "name": "mongo",
    "type": "mongodb",
    "host": "localhost",
    "port": 47017,
    "username": "gobarber",
    "password": "gobarber110494",
    "database": "gobarber",
    "useUnifiedTopology": true,
    "entities": ["./dist/modules/**/infra/typeorm/schemas/*.js"]
  }
]
```

##### REDIS

```bash
 # Comando para criar o container do banco de dados MongoDB
 docker run -d --name redis -e REDIS_PASSWORD=gobarber110494 -p 56379:6379 bitnami/redis:latest

 # Comando para validar se o container está em execução
 $ docker ps -a
```

_Explicando o comando:_

- **docker run** : já cria e executa o container
- **-d** : executa o container em backgorund
- **--name** : nome que você dá ao container
- **-e REDIS_PASSWORD** : senha de acesso
- **-p** : porta do banco de dados
- **bitnami/redis:latest** : imagem que utilizamos para criar o container

> **IMPORTANTE**: no parâmetro "-p" onde fazemos o redirecionamento da porta do banco de dados, note que não utilizamos o padrão 6379 do postgres, nós colocamos a porta 56379, fizemos isso como boa prática e dificultar o ataque de hackers ao tentar acessar esse banco.

Agora vamos configurar o arquivo **.env** e para isso vamos utilizar o nosso **.env.example** como modelo, no diretório raiz do projeto vamos criar o arquivo com o seguinte conteúdo:

```bash
APP_SECRET=gobarber110494
APP_API_URL=http://localhost:3333
APP_WEB_URL=http://localhost:3000

# AWS IAM USER
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=

# STORAGE
STORAGE_DRIVER=disk

# EMAIL
MAIL_DRIVER=ethereal

# REDIS
REDIS_HOST=localhost
REDIS_PORT=56379
REDIS_PASS=gobarber110494
```

##### TESTANDO APLICAÇÃO

Vamos de forme simples validar que todas as configurações estão corretas, e também todas as conexões com os containers de banco de dados.

```bash
# Iniciando api (backend)
$ node dist/shared/infra/http/server.js
```

![Teste app](./assets/tutorial/test-api.png 'Teste app')

### NGINX E PROXY REVERSO

NGINX é um servidor web que também funciona como proxy de email, proxy reverso, e balanceador de carga. A estrutura do software é assíncrona e orientada a eventos, vamos agora instalar e configurar o **niginx** para que nosso projeto funcione como queremos com acessso externo na porta 80 e com proxy reverso.

```bash
# Instalando nginx
$ sudo apt install nginx

# Liberando acesso externo na porta 80
$ sudo ufw allow 80
```

Para testar acesse seu servidor pelo browser
![nginx](./assets/tutorial/nginx.png 'nginx')

#### CONFIGURANDO NGINX (SERVIDOR/VPS)

Vamos acessar o diretório **sites-available** e vamos começar a editar o arquivo **default** encontrado dentro deste diretório, claro vamos criar um arquivo para nosso projeto com o nome de **gobarber**.

```bash
# Acessando diretorio sites-available
$ cd /etc/nginx/sites-available

# Transformando-se em super usuario
$ sudo su

# Criando um arquivo utilizando o 'default' como modelo
$ cp default gobarber

# editando arquivo 'gobarber' com o nano
$ nano gobarber

# Conteúdo do arquivo 'gobarber'
server {
  listen 80 default_server;
  listen [::]:80 default_server;

  server_name _;

  location / {
    proxy_pass http://localhost:3333;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

# Agora acesse o diretório sites-enable
$ cd /etc/nginx/sites-enabled

# Vamos criar um link simbolico
$ ln -s /etc/nginx/sites-available/gobarber  gobarber

# Deletando o default
$ rm default
```

![nginx](./assets/tutorial/nginx-02.png 'nginx')

```bash
# Testando configuração
$ nginx -t

# Reiniciando serviço do nginx
$ service nginx restart

# Sair do modo super usuario
$ exit
```

![nginx](./assets/tutorial/nginx-03.png 'nginx')

```bash
# Voltando para o diretório raiz do projeto
$ cd ~/app/gobarber-nodejs/

# Iniciando API (Backend)
$ node dist/shared/infra/http/server.js
```

Acessamos o servidor via browser para testar, o esperado que é que seja igual a imagem abaixo:
![nginx](./assets/tutorial/nginx-04.png 'nginx')

### AJUSTANDO NGINX E AUTOMATIZANDO (SERVIDOR/VPS)

Agora vamos manter todos os seviços online, manter nossos containers docker em execução mesmo que nosso servidor seja reiniciado, e também utilizar o gerenciador de processos **PM2** para manter a aplicação sempre em execução.

#### CONTAINERS DOCKER

```bash
# Pegar a informação CONTAINER ID
$ docker ps -a

# Mantendo os containers docker em execução sempre
$ docker update --restart=unless-stopped <CONTAINER ID>

```

![docker-containers](./assets/tutorial/docker-containers.png 'docker-containers')

#### GERENCIADOR DE PROCESSOS PM2

```bash
# Instalando PM2
$ sudo npm install -g pm2

# Configurando PM2 para a aplicaçao
$ pm2 start dist/shared/infra/http/server.js --name gobarber-api

# Acompanhar as aplicacoes em execução
$ pm2 list

# Verificar logs
$ pm2 logs

# Monitorar aplicações
$ pm2 monit
```

![pm2-gobarber-api](./assets/tutorial/pm2-gobarber-api.png 'pm2-gobarber-api')

Para finalizar, vamos configurar o pm2 para inicializar toda vez que o servidor for iniciado ou reiniciado, para isso vamos executar um comando que gera um script, vamos copiar esse script e em seguida executar esse script.

```bash
# Comando para gerar o script
$ pm2 startup systemd
```

![pm2-startup-config-01](./assets/tutorial/pm2-startup-config-01.png 'pm2-startup-config-01')

![pm2-startup-config-02](./assets/tutorial/pm2-startup-config-02.png 'pm2-startup-config-02')

> **IMPORTANTE**: caso voce for executar mais de um projeto node no mesmo servidor, é importante toda vez que adicionar uma nova aplicação na lista do pm2 executar tambem o comando `pm2 save`

### CONFIGURANDO SSL E DOMINIO (SERVIDOR/VPS)

Antes de iniciar essa etapa, é necessário você ter um **dominío** e também já ter feito o seu **apontamento** para o servidor/vps que contém sua aplicação.

##### CONFIGURANDO DOMINIO

```bash
# Acesse novamente o diretorio sites-available
$ cd /etc/nginx/sites-available/

# Edite o arquivo referente a sua aplicação
$ nano gobarber

# Procure pela linha onde contem "server_name"

# Deixe essa linha com seu dominio como no ex abaixo:
server_name meudominio.com;

# Salve a alteração e teste com o comando
$ ngix -t

# reinicie o nginx
$ service nginx restart
```

##### CONFIGURANDO CERTIFICADO SSL

Utilizando o lets-encript vamos fazer nosso certificado ssl gratuito, para isso siga as instruções abaixo, se você quiser saber mais sobre acesse o site do [certbot](https://certbot.eff.org/lets-encrypt/ubuntufocal-nginx).

```bash
# Removendo qualquer configuração ou instalação inicial
$ sudo apt-get remove certbot

# Instalando certbot
$ sudo snap install --classic certbot

# Preparando comando do certbot
$ sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Inicia a configuração do certificado
$ sudo certbot --nginx

# No fim quando acabar a configuração do certificado ssl, vamos liberar a porta 443
$ sudo ufw allow 443
```

### CI/CD GITHUB (INTEGRAÇÃO E DEPLOY CONTINUO)

Utilizando o **github actions** podemos fazer a integração e deploy contínuo do projeto, ou seja toda vez que houver um commit na branch master(main) da aplicação, automaticamente essa alteração vai para produção, o servidor é reiniciado, novamente é executado as migrations do typeORM, instalações de dependencias do projeto e etc.

##### CRIANDO VARIAVEIS

Acesse o repositório do projeto, vá até a opção '**settings**', clique na opção '**secrets**', e em seguida no botão '**New repository secret**'.

![github-actions](./assets/tutorial/github-actions-01.png 'github-actions')
![github-actions](./assets/tutorial/github-actions-02.png 'github-actions')

Vamos gerar uma chave ssh exclusivamente para o github actions **na sua máquina pessoal**.

```bash
# Criar chave ssh e dar o nome dela de 'github_actions'
$ ssh-keygen

# Copie o conteúdo de dentro dessa chave
$ cat github_actions.pub
```

Após copiar a chave ssh do seu github_actions, acesse novamente o servidor/vps e vamos salvar a chave.

```bash
# Acessar a pasta ssh
$ cd .ssh/

# Criar o arquivo authorized_keys
$ nano authorized_keys

#Colar o conteudo da chave ssh github_actions no arquivo 'authorized_keys'.
```

![github-actions](./assets/tutorial/github-actions-03.png 'github-actions')
![github-actions](./assets/tutorial/github-actions-04.png 'github-actions')

Vamos criar algumas variáveis de acordo com a lista abaixo insira os dados '**Name**' e '**Value**'.

```bash
# Ip do servidor/vps
Name: SSH_HOST
Value: 192.168.1.44

# Usuário do servidor/vps
Name: SSH_USER
Value: deploy

# Porta ssh do servidor/vps
Name: SSH_PORT
Value: 22

## Na sua maquina pessoal, copie agora o conteúdo do arquivo 'github_actions'
$ cd .ssh/

$ nano github_actions

# apos copiar esse conteudo da sua maquina pessoal, cria a variavel
Name: SSH_KEY
Value: conteudo que voce copiou da chave ssh github_actions da sua maquina pessoal
```

![github-actions](./assets/tutorial/github-actions-05.png 'github-actions')
![github-actions](./assets/tutorial/github-actions-06.png 'github-actions')

##### CRIANDO UM WORKFLOW

Acesse o repositório do projeto, vá até a opção '**Actions**', clique no link '**set up a workflow yourself**'
![github-actions](./assets/tutorial/github-actions-07.png 'github-actions')

Dentro vamos criar um workflow como mostra no modelo abaixo:

```bash
name: CI

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js environment
        uses: actions/setup-node@v1.4.5
        with:
          node-version: 14.x

      # Instalar as dependências do projeto
      - name: Install dependecies
        run: yarn

      # Executar a build do projeto
      - name: Run build
        run: yarn build

      # Copiar código novo para dentro do servidor/vps
      - name: Copy files to server/vps
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          port: ${{ secrets.SSH_PORT }}
          key: ${{ secrets.SSH_KEY }}
          source: ".,!node_modules"
          target: "~/app/gobarber-nodejs"

      # Executar 'yarn' no servidor/vps
      # Executar as migrations do typeORM
      # Reiniciar servidor node.js
      - name: Run production scripts
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          port: ${{ secrets.SSH_PORT }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd ~/app/gobarber-nodejs
            yarn
            ./node_modules/.bin/typeorm migration:run
            pm2 restart gobarber-api


```

![github-actions](./assets/tutorial/github-actions-08.png 'github-actions')
![github-actions](./assets/tutorial/github-actions-09.png 'github-actions')

# FIM

Espero que com este guia eu possa ter ajudado muitas pessoas que tem dificuldades de fazer um deploy intermediário de uma aplicação nodeJS,
