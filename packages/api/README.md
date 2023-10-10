### api

This is a `trpc` package that contains the server implementation of our app using `nodejs` and `prisma`orm.

### database

In this package we are using prisma orm which is connected to a `postgres` database locally.

### cache

For caching we are using in memory database which is `redis`

### authentication

For authentication we are using `jwt` authentication strategy.

### mailing services

For mailing services we are using `nodemailer`

### starting the server

To start the server first you need to navigate to the `api` and run the following command:

```shell
# install packages
yarn

# starting the server

yarn start
```

> Note that you are required to have the following softwares in your computer and have the instance of `redis` and `postgres` running.
