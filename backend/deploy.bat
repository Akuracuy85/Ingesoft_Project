@echo off
:: =====================================
:: 🚀 DEPLOY EXPRESS BACKEND TO AWS EC2
:: =====================================

:: CONFIGURACIÓN ----------------------
set IMAGE_NAME=express-backend
set IMAGE_TAG=v1
set TAR_NAME=%IMAGE_NAME%-%IMAGE_TAG%.tar

:: Cambiar estos valores por los de ustedes si quieren
set PEM_PATH=C:\Users\user\Desktop\Cursos\PUCP\Ingesoft\TA\unite-ec2.pem
set EC2_USER=ubuntu
set EC2_HOST=ec2-23-23-208-215.compute-1.amazonaws.com
set EC2_DIR=/home/ubuntu/ingesoft

:: -----------------------------------
echo.
echo =====================================
echo [0/7] Limpiando archivos TAR locales...
echo =====================================
for %%f in (*.tar) do (
    echo Eliminando .tar creados antes %%f
    del "%%f"
)

:: -----------------------------------
echo.
echo =====================================
echo [1/7] Construyendo imagen Docker...
echo =====================================
docker build -t %IMAGE_NAME%:%IMAGE_TAG% .

if %errorlevel% neq 0 (
    echo Error al construir la imagen.
    exit /b
)

echo.
echo =====================================
echo [2/7] Guardando imagen en TAR...
echo =====================================
docker save -o %TAR_NAME% %IMAGE_NAME%:%IMAGE_TAG%

if %errorlevel% neq 0 (
    echo Error al guardar la imagen.
    exit /b
)

echo.
echo =====================================
echo [3/7] Subiendo TAR a EC2...
echo =====================================
scp -i "%PEM_PATH%" %TAR_NAME% %EC2_USER%@%EC2_HOST%:%EC2_DIR%/

if %errorlevel% neq 0 (
    echo Error al subir el archivo TAR a EC2.
    exit /b
)

echo.
echo =====================================
echo [4/7] Cargando imagen en EC2...
echo =====================================
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_HOST% "sudo docker load -i %EC2_DIR%/%TAR_NAME%"

echo.
echo =====================================
echo [5/7] Eliminando contenedor viejo (si existe)...
echo =====================================
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_HOST% "sudo docker rm -f %IMAGE_NAME% || true"

echo.
echo =====================================
echo [6/7] Corriendo nuevo contenedor...
echo =====================================
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_HOST% "sudo docker run -d -p 3000:3000 --name %IMAGE_NAME% %IMAGE_NAME%:%IMAGE_TAG%"

echo.
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

echo.
echo  DEPLOY COMPLETADO con exito ;v (o al menos se subio bien y se mando el comando de correr asi q revisa la EC2)!
echo prueba entrando a http://%EC2_HOST%/api/sas desde tu navegador
echo pero si ya está el dominio entra a https://uniteapps.com/api/sas