## Deploy del front

En el front deployaremos por S3, aquí es más facil que con el back ya que aws tiene su propio comando de consola para esto pero para esto necesitamos el aws cli. Pueden descargarlo de internet en la pagina de AWS para tener los comandos aws y confirmar con `aws --version`

Ahí meten: `aws configure`
Les aparecerá para poner sus credenciales de AWS, estas las encuentran en la parte de AWS Details en la consola que sale cuando iniciamos el lab

```
AWS Access Key ID [None]: En el AWS Details
AWS Secret Access Key [None]: Igual que arriba
AWS Session Token [None]: Igual que arriba
Default region name [None]: us-east-1
Default output format [None]: pasan nomas si quieren
```

Después de eso ya podrán usar la consola.

Hice un comando en el package.json para hacer deploy, solo hacen:

`npm run deploy`

Esto compila el proyecto usando `npm run build` y luego el comando de aws `aws s3 sync ./dist s3://unite.aedsen.com` donde unite.aedsen.com es el nombre del bucket donde se guarda

Y ya ;v desplegado