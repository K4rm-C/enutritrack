echo "Esperando a que Couchbase esté listo..."
until curl -s -o /dev/null http://localhost:8091; do
    sleep 5
done

echo "Inicializando Couchbase..."

# Configurar memoria y servicios
curl -v -X POST http://localhost:8091/nodes/self/controller/settings \
  -d path=/opt/couchbase/var/lib/couchbase/data \
  -d index_path=/opt/couchbase/var/lib/couchbase/data

# Configurar servicios
curl -v -X POST http://localhost:8091/node/controller/setupServices \
  -d services=kv%2Cn1ql%2Cindex%2Cfts

# Configurar memoria
curl -v -X POST http://localhost:8091/pools/default \
  -d memoryQuota=512 \
  -d indexMemoryQuota=512

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