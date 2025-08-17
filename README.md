# luminous-api
[![luminous-api Build & Test](https://github.com/baronparedes/luminous-api/actions/workflows/main_ci.yml/badge.svg)](https://github.com/baronparedes/luminous-api/actions/workflows/main_ci.yml)

## Deploying Docker Image to Azure

### 1. Build and Tag Your Docker Image
```
docker build -t <registry-name>.azurecr.io/<image-name>:<tag> .
```
Example:
```
docker build -t acr.azurecr.io/luminous-api:20250817.01 .
```

### 2. Login to Azure and Azure Container Registry
```
az login
az acr login --name <registry-name>
```
Example:
```
az acr login --name acr
```

### 3. Push the Image to Azure Container Registry
```
docker push <registry-name>.azurecr.io/<image-name>:<tag>
```
Example:
```
docker push acr.azurecr.io/luminous-api:20250817.01
```

### 4. Deploy to Azure Web App for Containers

#### Create the Web App (if needed)
```
az webapp create --resource-group <ResourceGroup> --plan <AppServicePlan> --name <WebAppName> --deployment-container-image-name <registry-name>.azurecr.io/<image-name>:<tag>
```

#### Configure the Web App to Use Your Image
```
az webapp config container set --name <WebAppName> --resource-group <ResourceGroup> \
  --docker-custom-image-name <registry-name>.azurecr.io/<image-name>:<tag> \
  --docker-registry-server-url https://<registry-name>.azurecr.io \
  --docker-registry-server-user <ACR_USERNAME> \
  --docker-registry-server-password <ACR_PASSWORD>
```

Get your ACR credentials with:
```
az acr credential show --name <registry-name>
```

#### (Optional) Set Environment Variables
```
az webapp config appsettings set --name <WebAppName> --resource-group <ResourceGroup> --settings KEY1=VALUE1 KEY2=VALUE2
```

### 5. Verify Deployment
- Visit your Web App URL in the Azure Portal.
- Check logs and health endpoints to confirm successful deployment.

---
Replace placeholders (e.g., `<registry-name>`, `<image-name>`, `<tag>`, `<ResourceGroup>`, `<AppServicePlan>`, `<WebAppName>`, `<ACR_USERNAME>`, `<ACR_PASSWORD>`) with your actual values.
