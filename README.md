# Grafana en Kubernetes: Deployment y ReplicaSet

Proyecto académico que despliega **Grafana** con dos Pods administrados por un Deployment. Kubernetes crea automáticamente el ReplicaSet; el Service `NodePort` expone la interfaz en el puerto `30030` del nodo. También se puede usar `port-forward` para acceder desde `localhost:3000`.

## Requisitos

- Un clúster Kubernetes con al menos 1 GiB de memoria disponible para los dos Pods.
- `kubectl` configurado contra ese clúster.
- Acceso a Internet del clúster para descargar `grafana/grafana:12.1.0`.

## Desplegar

```powershell
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get deployment,replicaset,pods,service
```

El resultado esperado es `2/2` Pods listos, un ReplicaSet con `DESIRED=2`, y el Service con `3000:30030/TCP`.

## Abrir Grafana

En Docker Desktop con Kubernetes, probar `http://localhost:30030`. Si el NodePort no se publica en el equipo, usar:

```powershell
kubectl port-forward service/grafana 3000:3000
```

Luego abrir `http://localhost:3000`. La configuración permite ver Grafana sin contraseña, con acceso de solo lectura para esta práctica.

## Comprobar el ReplicaSet

```powershell
kubectl get deployment grafana
kubectl get replicasets -l app=grafana
kubectl get pods -l app=grafana
```

El Deployment indica que deben existir dos Pods. Kubernetes crea el ReplicaSet y este mantiene esa cantidad. Para demostrarlo, se puede cambiar temporalmente a tres Pods:

```powershell
kubectl scale deployment/grafana --replicas=3
kubectl get deployment,replicaset,pods
kubectl scale deployment/grafana --replicas=2
```

## Evidencias e informe

Ver [INFORME.md](INFORME.md) y las [evidencias](evidencias/). El flujo de GitHub Actions ejecuta el despliegue en un clúster temporal, comprueba la respuesta HTTP y guarda capturas de la interfaz y de las salidas reales de `kubectl`. Para repetir la comprobación en un equipo Windows, el script [capturar-evidencias.ps1](scripts/capturar-evidencias.ps1) genera archivos de texto con el estado del clúster y la respuesta HTTP.

## Alcance

Es una práctica de clase. Grafana guarda sus datos dentro de cada Pod, así que los paneles creados manualmente pueden perderse al reiniciarlo. Utiliza el acceso sin contraseña solo para la demostración local.

Referencias: [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), [ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/), [Grafana en Docker](https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/).
