
## Deploy del Back
Metanle esto para que este fino su EC2 antes de meterle el `deplot.bat` xq necesita docker y el nginx con certbot para el https:

``` shell
sudo apt update
sudo apt upgrade -y
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo apt install -y nginx certbot python3-certbot-nginx
```

Luego le crean esta carpeta para que esté ordenado
```
mkdir ingesoft
```

Y ya, pueden correr el `deploy.bat` ;v

**OJO:** Para esto ustedes necesitan Docker obviamente así que necesitan usar Docker Desktop en windows

## Otras consideraciones

* Al acabar la sesion del AWS de 4 horas que nos dan probablemente cambie la ip, ahora voy a probar con una ip elastica creada manualmente pero igual hay que tenerlo en cuenta

* Si se acaba la sesion de 4 horas la instancia dejará de correr. Por lo que no habrá back

Si les importa como funciona tonces acá les explico que hace el `deploy.bat`, sino pueden dejarlo acá


### 0. Borrar archivos .tar

Los .tar son imagenes de docker que se pueden ejecutar, piensenlo como nuestro codigo en un momento del tiempo junto con todas las dependencias que necesita como node en nuestro caso 

``` bash
echo =====================================
echo [0/6] Limpiando archivos TAR locales...
echo =====================================
for %%f in (*.tar) do (
    echo Eliminando .tar creados antes %%f
    del "%%f"
)
```

### 1. Se contruye la imagen de docker

Bueno, es bien descriptivo el titulo, pero basicamente la imagen es creada

```bash
echo =====================================
echo [1/6] Construyendo imagen Docker...
echo =====================================
docker build -t %IMAGE_NAME%:%IMAGE_TAG% .

if %errorlevel% neq 0 (
    echo Error al construir la imagen.
    exit /b
)

```

### 2. Guardar la imagen en un archivo TAR
La imagen se crea en el ambiente de docker pero para hacerla un archivo TAR se guarda, esto ya que lo subiremos al EC2 luego

``` bash
echo =====================================
echo [2/6] Guardando imagen en TAR...
echo =====================================
docker save -o %TAR_NAME% %IMAGE_NAME%:%IMAGE_TAG%

if %errorlevel% neq 0 (
    echo Error al guardar la imagen.
    exit /b
)
```

### 3. Subir al EC2

Con el .pem y la direccion del EC2 con su ip publica podemos subir el archivo

```bash
echo =====================================
echo [3/6] Subiendo TAR a EC2...
echo =====================================
scp -i "%PEM_PATH%" %TAR_NAME% %EC2_USER%@%EC2_HOST%:%EC2_DIR%/

if %errorlevel% neq 0 (
    echo Error al subir el archivo TAR a EC2.
    exit /b
)
```

### 4. Cargar la imagen al docker del EC2

Se entra a la consola del EC2 con ssh y se carga la imagen en el docker que tiene la instancia

``` bash
echo =====================================
echo [4/6] Cargando imagen en EC2...
echo =====================================
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_HOST% "sudo docker load -i %EC2_DIR%/%TAR_NAME%"

echo.
echo =====================================
```

### 5.Eliminar contenedor viejo

Probablemente lo haremos varias veces así que si ya tiene un contenedor corriendo del back lo borra para correr el que acabamos de subir

``` bash
echo =====================================
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_HOST% "sudo docker rm -f %IMAGE_NAME% || true"

echo.
echo =====================================
```

### 6. Correr el contenedor creado

Se pone a correr el contenedor

``` bash
echo =====================================
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_HOST% "sudo docker run -d -p 80:3000 --name %IMAGE_NAME% %IMAGE_NAME%:%IMAGE_TAG%"
echo =====================================
```

### 7. Subir configuracion de nginx y sacar certificado https

Si por alguna razon cambiamos de contenedor, de puerto donde corre el docker, o de ruta del front, se debe subir el nginx de nuevo y para eso se escoge 's' acá.

``` bash
echo =====================================
echo [7/7] (Opcional) Configurar HTTPS con Let's Encrypt...
echo =====================================
set /p RUN_CERTBOT=¿Quieres subir y ejecutar setup-https.sh para configurar HTTPS? (s/n): 

if /I "%RUN_CERTBOT%"=="s" (
    echo Subiendo script setup-https.sh a EC2...
    scp -i "%PEM_PATH%" setup-https.sh %EC2_USER%@%EC2_HOST%:%EC2_DIR%/
    
    echo Dando permisos y ejecutando script en EC2...
    ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_HOST% "chmod +x %EC2_DIR%/setup-https.sh && sudo %EC2_DIR%/setup-https.sh"
) else (
    echo Saltando configuración HTTPS...
)
```

Con esto se subirá el archivo `setup-https.sh` y se ejecutará.

Esto luego dentro te dará otra opcion, generar un nuevo certificado https, esto solo hagando si cambiamos de dominio, que no creo, o si va a expirar el nuestro, pero expira en como 1 mes así que no hace falta, para ver que hace el 

Y ya, si hay algun error de ejecucion al final no nos avisará así que es importante verificar.