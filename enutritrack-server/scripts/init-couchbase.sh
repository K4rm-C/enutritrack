echo "Esperando a que Couchbase esté listo..."
until curl -s -o /dev/null http://localhost:8091; do
    sleep 5
done

echo "Inicializando Couchbase..."
# Configurar credenciales administrativas
curl -v -X POST http://localhost:8091/settings/web \
  -d port=8091 \
  -d username=Alfredo \
  -d password=alfredo124$$

# Esperar que las credenciales estén activas
sleep 10

# Crear bucket
curl -v -X POST http://localhost:8091/pools/default/buckets \
  -u Alfredo:alfredo124$$ \
  -d name=enutritrack \
  -d ramQuotaMB=128 \
  -d authType=none \
  -d bucketType=couchbase

echo "Couchbase inicializado correctamente"