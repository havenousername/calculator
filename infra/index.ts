import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import {SubnetType} from "@pulumi/awsx/ec2";

const config = new pulumi.Config();
const clusterName = config.require("clusterName");

const eksVpc = new awsx.ec2.Vpc("eks-auto-mode", {
    enableDnsHostnames: true,
    cidrBlock: '10.0.0.0/16',
    subnetSpecs: [
        // Necessary tags for EKS Auto Mode to identify the subnets for the load balancers.
        // See: https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.1/deploy/subnet_discovery/
        {type: SubnetType.Public, tags: {[`kubernetes.io/cluster/${clusterName}`]: "shared", "kubernetes.io/role/elb": "1"}},
        {type: SubnetType.Private, tags: {[`kubernetes.io/cluster/${clusterName}`]: "shared", "kubernetes.io/role/internal-elb": "1"}},
    ],
    subnetStrategy: "Auto"
})

/**
 * EKS cluster provider initialization
 */
const cluster = new eks.Cluster("calculator-backend-cluster", {
    name: clusterName,

    autoMode: {
        createNodeRole: true,
        enabled: true,
    },
    authenticationMode: eks.AuthenticationMode.Api,
    vpcId: eksVpc.vpcId,
    publicSubnetIds: eksVpc.publicSubnetIds,
    privateSubnetIds: eksVpc.privateSubnetIds,
});

const provider = cluster.provider;

/**
 * Constants
 */
const IMAGE = "ghcr.io/havenousername/calculator-backend:latest" as const;
const PORT = 8080 as const;
const appLabels = {
    podLabel: 'calculator-backend-pod',
    main: 'calculator-backend',
} as const;

/**
 * Kubernetes details
 */

const configMap = new k8s.core.v1.ConfigMap(`${appLabels.main}-config`, {
    immutable: true,
    metadata: {
        name: `${appLabels.main}-config`
    },
    data: {
        MESSAGE: 'Healthy!'
    }
}, {provider});

const secretMap = new k8s.core.v1.Secret(`${appLabels.main}-secret`, {
    immutable: true,
    metadata: {
        name: `${appLabels.main}-secrets`
    },
    type: 'Opaque',
    data: {
        API_KEY: 'Tk9fS0VZX1lFVA=='
    }
}, {provider});

const service = new k8s.core.v1.Service(`${appLabels.main}-service`, {
    metadata: {
        annotations: {
            'service.beta.kubernetes.io/aws-load-balancer-type': "alb",
            'service.beta.kubernetes.io/aws-load-balancer-scheme': "internet-facing",
        }
    },
    spec: {
        selector: {
            app: appLabels.podLabel
        },
        ports: [
            {
                port: 80,
                targetPort: PORT
            }
        ],
        type: 'LoadBalancer'
    }
}, {provider});


const deployment = new k8s.apps.v1.Deployment(appLabels.main, {
    spec: {
        selector: {
            matchLabels: {app: appLabels.podLabel}
        },
        replicas: 2,
        template: {
            metadata: {
                labels: {app: appLabels.podLabel}
            },
            spec: {
                containers: [{
                    name: "calculator-backend-container",
                    image: IMAGE,
                    ports: [{
                        containerPort: PORT
                    }],
                    resources: {
                        requests: {cpu: '100m', memory: '128Mi'},
                        limits: {cpu: "500m", memory: "512Mi"},
                    },
                    livenessProbe: {
                        httpGet: {path: '/api/health', port: PORT},
                        initialDelaySeconds: 30,
                        periodSeconds: 10,
                    },
                    env: [
                        {
                            name: 'MESSAGE',
                            valueFrom: {
                                configMapKeyRef: {
                                    name: configMap.metadata.name,
                                    key: 'MESSAGE',
                                }
                            }
                        },
                        {
                            name: 'API_KEY',
                            valueFrom: {
                                secretKeyRef: {
                                    name: secretMap.metadata.name,
                                    key: 'API_KEY',
                                }
                            }
                        }
                    ]
                }]
            }
        }
    }
}, {provider});

export const kubeconfig = cluster.kubeconfig;
export const serviceEndpoint = service.status.apply(s => s.loadBalancer.ingress[0].hostname);
