Usuario (email): user@user.com
Contraseña: alal1010

Si es un Cliente creado automáticamente:
El sistema genera una contraseña basada en el CUIT (solo los números, sin guiones).
Ejemplo: Si el CUIT es 20-20202020-0, la contraseña será 20202020200.
(Visto en: add-update-client.command.ts:127)

Si es el Usuario Administrador por defecto:
En los scripts de inicialización y documentación, el admin es:

Email: user@user.com
Contraseña: alal1010
(Visto en: USER.md:2 y create-admin-user.ts:20)
Si lo creaste manualmente por API (/users/singup):
No se asigna ninguna contraseña automática; el sistema usa exactamente la que hayas enviado en el campo password del JSON de la petición.

Si usaste el script de seed (auth-seed.ts):
Para el usuario cliente@fenix.com, la contraseña
