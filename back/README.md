# Bizap - Backend

Este é o backend do projeto **Bizap**. Ele foi desenvolvido utilizando **Node.js**, **Fastify**, **TypeScript** e **Prisma ORM** com banco de dados **MySQL**.

## 📋 Pré-requisitos
Antes de começar, certifique-se de ter os seguintes itens instalados no seu sistema:

- [Node.js](https://nodejs.org/) (versão LTS recomendada: 18+ ou 20+)
- [npm](https://www.npmjs.com/) (já incluído no Node.js)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recomendado para rodar o MySQL localmente sem complicações) ou MySQL Server instalado nativamente.

## 🚀 Passo a passo de Instalação e Execução

Siga os passos abaixo para rodar o projeto localmente:

### 1. Clonar e acessar o repositório
Abra o seu terminal e navegue até a pasta do backend do projeto:
```bash
cd "/caminho/para/sua/pasta/Bizap/back"
```

### 2. Instalar dependências
Baixe os pacotes necessários:
```bash
npm install
```

### 3. Configurar as variáveis de ambiente (.env)
O projeto necessita de algumas chaves para funcionar, como a string de conexão com o banco de dados.
1. Crie um arquivo com o nome `.env` na raiz da pasta `back`.
2. Copie o conteúdo do `.env.example` e cole no seu novo arquivo `.env`.
3. Caso utilize a configuração de Docker sugerida abaixo, a variável `DATABASE_URL` deve ficar assim:
```env
PORT=3333
DATABASE_URL=mysql://root:password@localhost:3306/bizap
JWT_SECRET=umasenhamuitosecreta
# Preencha também as demais variáveis (Twilio, AWS) caso vá testar funções que as utilizem.
```

### 4. Subir o Banco de Dados (MySQL via Docker)
A maneira mais fácil de rodar o banco de dados é usando um container Docker. Rode o comando abaixo no seu terminal para criar e ligar um servidor MySQL persistente:
```bash
docker run --name bizap-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=bizap -p 3306:3306 -v bizap_db_data:/var/lib/mysql -d mysql:latest
```
*(Se no futuro você desligar o PC, basta abrir o Docker Desktop e dar "Start" no container `bizap-mysql` para ligar o banco de novo).*

### 5. Configurar o Prisma (Tabelas do Banco e Seed)
Com o banco de dados de pé, execute as migrações para que o Prisma crie as tabelas necessárias:
```bash
npx prisma migrate dev
```

Após isso, rode o script de _seed_ para abastecer o banco de dados com dados iniciais (ex: um usuário administrador padrão):
```bash
npx prisma db seed
```

### 6. Executar o servidor de Desenvolvimento
Agora, você já pode iniciar a API em modo de observação (hot-reload habilitado):
```bash
npm run dev
```
O console deverá mostrar que o servidor iniciou com sucesso. Por padrão, ele roda na porta **3333**.

---

## 📚 Documentação (Swagger)
O projeto conta com uma documentação gerada automaticamente para os Endpoints via Swagger UI. Se o seu servidor estiver rodando na porta 3333, acesse pelo navegador:
👉 **[http://localhost:3333/docs](http://localhost:3333/docs)**
