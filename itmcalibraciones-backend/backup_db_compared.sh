#!/bin/bash

# Definir el nombre del directorio de backup actual
backup_name=db_backups/`date +%Y-%m-%d`

# Realizar el mongodump
mongodump -h localhost:27018 -u camila -p tomillo0054 -d itm -o $backup_name

# Comprimir el backup
tar -cvzf $backup_name.tar.gz $backup_name

# Obtener el tamaño del backup actual
backup_size_current=$(stat -c %s "$backup_name.tar.gz")

# Obtener el tamaño del backup anterior si existe
if [[ -f "backup_size_prev.txt" ]]; then
    backup_size_prev=$(<backup_size_prev.txt)
else
    backup_size_prev=0
fi

# Comprobar si el backup actual tiene el mismo tamaño que el anterior
if [[ $backup_size_current -eq $backup_size_prev ]]; then
    echo "El backup actual tiene el mismo tamaño que el anterior. No se realizará ninguna acción."
    exit 0
fi

# Calcular la diferencia en tamaño en porcentaje
percentage_difference=$(echo "scale=10; (($backup_size_prev - $backup_size_current) / $backup_size_prev) * 100" | bc)
percentage_difference=${percentage_difference#-}

echo "Hay $percentage_difference de diferencia y es < 0.01 $backup_size_prev y $backup_size_current"
# Comprobar si la diferencia es menor al 0.01%
if (( $(echo "$percentage_difference < 0.01" | bc -l) )); then
    echo "El backup actual tiene menos del 0.01% de diferencia en tamaño con el anterior. No se subirá a S3."
    exit 0
fi

# Subir el backup a S3
aws s3 cp $backup_name.tar.gz s3://backup.db.itmcalibraciones.com

# Guardar el tamaño del backup actual para usarlo en la próxima ejecución
echo $backup_size_current > backup_size_prev.txt

# Limpiar archivos temporales
rm $backup_name.tar.gz
rm -r $backup_name