---
title: Locate deprecated API clients in GKE
tags:
  - gke
---
Google Cloud takes infrastructure security seriously, and this is the reason why GKE control plane upgrades are applied periodically, and why [there is no option to disable this](https://cloud.google.com/kubernetes-engine/upgrades#automatic_cp_upgrades). In my experience, in most cases this happened without any issues. But after a recent upgrade of one of GKE clusters, I started seeing the following warnings in the Google Cloud console. 

![](Assets/20240520145711.png)

These warnings caused by some clients that still is trying to use the `autoscaling/v2beta2` API version of the Horizontal Pod Autoscaler, which was officially [deprecated in 1.26](https://kubernetes.io/docs/reference/using-api/deprecation-guide/#horizontalpodautoscaler-v126). A quick update of the HPA manifests to use the current `autoscaling/v2` API version didn't solve the problem - the Google Cloud console still shows that the deprecated calls are happening.

So, I started reviewing the GKE audit logs to see if I could determine which client was making these calls. But, all I found was that the logs only captured my own attempts to update the HPA. It turns out that [GKE audit logs, by default, include only the "Admin Write" operations](https://cloud.google.com/kubernetes-engine/docs/how-to/audit-logging#available-logs) that write metadata or configuration information.

![](Assets/20240520230903.png)

In order to review the operations for reading metadata or configuration information/user-provided data, I need to [explicitly enable](https://cloud.google.com/logging/docs/audit/configure-data-access#config-console-enable) the "Admin Read" and "Data Read" audit log types for the Kubernetes Engine API.

![](Assets/20240520154941.png)

I turned on these logs for a short time (since it adds extra logging costs) and found out that the warnings came from the [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) agent, which was part of the [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) Helm chart we installed.

![](Assets/20240520172917.png)

Updating the agent as recommended in the [compatibility matrix](https://github.com/kubernetes/kube-state-metrics?tab=readme-ov-file#compatibility-matrix) resolved the issue and got rid of the warnings about using deprecated API calls.

Even though we didn't face any major problems this time, having a similar situation in another GKE cluster with an outdated KEDA that scales our production workloads shows why [it's important to keep an eye on Kubernetes cluster, even in managed environments like GKE](Notes/Managed%20does%20not%20mean%20maintenance-free.md), and proactively [update Kubernetes versions](https://kubernetes.io/docs/reference/using-api/deprecation-guide/) to avoid potential problems that might be caused by deprecated API calls.