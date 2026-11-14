# Informe: despliegue de Grafana con Deployment y ReplicaSet

**Repositorio público:** https://github.com/ericmullo/ProcesosPOD

## 1. Objetivo

Desplegar una plataforma distinta de la utilizada en clase, aplicar los conceptos de Deployment y ReplicaSet, y mostrar cómo se expone el servicio. La plataforma elegida es **Grafana**, una interfaz para visualizar métricas, registros y otros datos operativos mediante paneles.

## 2. Componentes configurados

| Recurso | Archivo | Función |
| --- | --- | --- |
| Deployment `grafana` | `k8s/deployment.yaml` | Indica la imagen de Grafana y que deben existir dos Pods. |
| ReplicaSet | Creado por Kubernetes | Mantiene en ejecución los dos Pods deseados. Su nombre incluye un hash y varía por despliegue. |
| Service `grafana` | `k8s/service.yaml` | Reparte tráfico entre los Pods y expone el puerto 30030 del nodo. |

El Deployment usa `grafana/grafana:12.1.0` y pide dos réplicas. El acceso a la interfaz es de solo lectura y no requiere contraseña durante la práctica.

## 3. Procedimiento de despliegue

```powershell
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl get deployment,replicaset,pods,service
```

Para acceder a la plataforma, abrir `http://localhost:30030` en Docker Desktop con Kubernetes. Como alternativa compatible con otros clústeres:

```powershell
kubectl port-forward service/grafana 3000:3000
```

Abrir `http://localhost:3000` para ver la pantalla principal de Grafana.

## 4. Aplicación de los conceptos

Un **Pod** ejecuta Grafana. El **ReplicaSet** mantiene los dos Pods solicitados. El **Deployment** crea y controla ese ReplicaSet. Por eso no hace falta escribir un archivo separado para el ReplicaSet.

El **Service** proporciona un punto de acceso estable aunque se reemplace un Pod. `NodePort` expone la aplicación mediante el puerto 30030; `port-forward` permite exponerla temporalmente en el equipo local.

Para demostrar el escalado de 2 a 3 réplicas y volver al estado original:

```powershell
kubectl scale deployment/grafana --replicas=3
kubectl get deployment,replicaset,pods
kubectl scale deployment/grafana --replicas=2
```

## 5. Usos de Grafana

- Visualizar métricas de servidores, aplicaciones y bases de datos en paneles.
- Consultar y correlacionar datos de observabilidad mediante fuentes conectadas.
- Monitorear disponibilidad, latencia y consumo de recursos.
- Construir alertas operativas cuando se conecte una fuente de datos adecuada.

Este ejercicio muestra la interfaz de Grafana. Para visualizar métricas reales hace falta configurar una fuente de datos, por ejemplo Prometheus; no se incluye en este despliegue.

## 6. Evidencias de ejecución

**Ejecución verificada:** el [flujo de GitHub Actions](https://github.com/ericmullo/ProcesosPOD/actions) creó un clúster temporal con kind, desplegó Grafana, comprobó dos réplicas listas, obtuvo una respuesta válida de `/api/health`, abrió la interfaz y escaló a tres réplicas. Los archivos de evidencia se guardaron en el repositorio. El clúster de CI es temporal; la dirección `localhost` solo es accesible mientras se ejecuta en el equipo o en el runner.

| Comprobación | Resultado observado | Evidencia |
| --- | --- | --- |
| Deployment y ReplicaSet | `2/2` Pods listos; ReplicaSet `DESIRED=2`, `READY=2` | [recursos.txt](evidencias/recursos.txt) |
| Exposición de Grafana | Service `NodePort` `3000:30030/TCP`; `/api/health` devolvió `database: ok` | [salud-http.json](evidencias/salud-http.json) |
| Escalado | Deployment y ReplicaSet `3/3` | [escalado.txt](evidencias/escalado.txt) |

Capturas guardadas en `evidencias/`:

1. [01-recursos.png](evidencias/01-recursos.png): imagen de la salida real de `kubectl` con `2/2`, ReplicaSet y NodePort.
2. [02-grafana.png](evidencias/02-grafana.png): captura real de la interfaz de Grafana abierta en el navegador del runner.
3. [03-escalado.png](evidencias/03-escalado.png): imagen de la salida real de `kubectl` con tres Pods listos.

![Interfaz de Grafana desplegada y expuesta mediante el Service](evidencias/02-grafana.png)

Las imágenes 01 y 03 presentan las salidas reales de `kubectl` en un formato legible. Si se requiere una captura literal de una terminal local, los comandos de las secciones 3 y 4 permiten obtenerla en el propio equipo.

El script `scripts/capturar-evidencias.ps1` guarda también la salida de Kubernetes y la comprobación HTTP en archivos de texto. Ejecutarlo desde la raíz del repositorio:

```powershell
./scripts/capturar-evidencias.ps1
```

## 7. Conclusión y límites

La práctica muestra dos Pods de Grafana administrados por un Deployment y un ReplicaSet. El Service permite abrir la interfaz. Como los datos se guardan dentro de cada Pod, esta configuración se usa solo para la demostración.

## Fuentes

- [Documentación oficial de Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Documentación oficial de ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/)
- [Documentación oficial de Grafana en Docker](https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/)
