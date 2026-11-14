# Grafana en Kubernetes: Deployment y ReplicaSet

Proyecto académico que despliega **Grafana** con dos Pods administrados por un Deployment. Kubernetes crea automáticamente el ReplicaSet; el Service `NodePort` expone la interfaz en el puerto `30030` del nodo. También se puede usar `port-forward` para acceder desde `localhost:3000`.

## Requisitos

- Un clúster Kubernetes con al menos 1 GiB de memoria disponible para los dos Pods.
- `kubectl` configurado contra ese clúster.
- Acceso a Internet del clúster para descargar `grafana/grafana:12.1.0`.

## Desplegar

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl -n grafana-demo rollout status deployment/grafana --timeout=300s
kubectl -n grafana-demo get deployment,replicaset,pods,service -o wide
```

El resultado esperado es `2/2` Pods listos, un ReplicaSet con `DESIRED=2`, y el Service con `3000:30030/TCP`.

## Abrir Grafana

En Docker Desktop con Kubernetes, probar `http://localhost:30030`. Si el NodePort no se publica en el equipo, usar:

```powershell
kubectl -n grafana-demo port-forward service/grafana 3000:3000
```

Luego abrir `http://localhost:3000`. La configuración permite acceso anónimo **solo como Viewer** para facilitar la demostración. Usar el endpoint `http://localhost:3000/api/health` para comprobar la respuesta de la aplicación.

## Comprobar el ReplicaSet

```powershell
kubectl -n grafana-demo get deployment grafana
kubectl -n grafana-demo get replicasets -l app=grafana
kubectl -n grafana-demo get pods -l app=grafana -o wide
kubectl -n grafana-demo describe deployment grafana
```

El Deployment declara el estado deseado (`replicas: 2`), crea y actualiza el ReplicaSet y este mantiene los Pods. Para demostrar escalado:

```powershell
kubectl -n grafana-demo scale deployment/grafana --replicas=3
kubectl -n grafana-demo rollout status deployment/grafana --timeout=300s
kubectl -n grafana-demo get deployment,replicaset,pods
kubectl -n grafana-demo scale deployment/grafana --replicas=2
kubectl -n grafana-demo rollout status deployment/grafana --timeout=300s
```

## Evidencias e informe

Ver [INFORME.md](INFORME.md). Guardar capturas reales de la consola y del navegador en `evidencias/` después de ejecutar los comandos. El script [capturar-evidencias.ps1](scripts/capturar-evidencias.ps1) genera archivos de texto con el estado real del clúster y verifica la respuesta HTTP. No sustituye las capturas de pantalla.

## Alcance

Es una demostración local. Cada réplica usa su propia base SQLite efímera; los dashboards creados manualmente no se comparten entre Pods ni sobreviven a su reemplazo. Para producción, se requiere una base compartida, almacenamiento persistente y autenticación. El NodePort con acceso anónimo debe mantenerse en un entorno de laboratorio.

Referencias: [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), [ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/), [Grafana en Docker](https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/).
