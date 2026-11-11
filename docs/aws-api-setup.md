# BurgerLab API setup through the AWS console

## Identify existing resources

In RDS → Databases → Connectivity & security, record the Region, endpoint, port, VPC ID, subnet IDs, and security groups. Record the exact Amplify origin including `https://` and excluding a trailing slash. Inspect the VPC route tables and endpoints for access to Secrets Manager. Use the RDS Region for all new resources.

## Create the database reader and secret

In Workbench, connect as an administrator. Replace the password locally with a generated password and run the following once. Keep the completed statement outside the repository. `REQUIRE SSL` enforces encryption for this account.

```sql
CREATE USER 'burgerlab_catalog_reader'@'%' IDENTIFIED BY 'REPLACE_LOCALLY_WITH_GENERATED_PASSWORD' REQUIRE SSL;
GRANT SELECT ON TheBurgerLab.MENU_ITEM TO 'burgerlab_catalog_reader'@'%';
GRANT SELECT ON TheBurgerLab.MENU_ITEM_VARIANT TO 'burgerlab_catalog_reader'@'%';
GRANT SELECT ON TheBurgerLab.INGREDIENT TO 'burgerlab_catalog_reader'@'%';
GRANT SELECT ON TheBurgerLab.RECIPE_INGREDIENT TO 'burgerlab_catalog_reader'@'%';
GRANT SELECT ON TheBurgerLab.MENU_ITEM_ALLOWED_MODIFICATION TO 'burgerlab_catalog_reader'@'%';
GRANT SELECT ON TheBurgerLab.IMAGE_ASSET TO 'burgerlab_catalog_reader'@'%';
GRANT SELECT ON TheBurgerLab.MENU_ITEM_IMAGE TO 'burgerlab_catalog_reader'@'%';
GRANT SELECT ON TheBurgerLab.UI_IMAGE_ASSIGNMENT TO 'burgerlab_catalog_reader'@'%';
GRANT SELECT ON TheBurgerLab.CATALOG_VERSION TO 'burgerlab_catalog_reader'@'%';
SHOW GRANTS FOR 'burgerlab_catalog_reader'@'%';
```

In Secrets Manager, store a new secret named `burgerlab/catalog-reader` using the default Secrets Manager encryption key. Include every key below, with actual values. Record the ARN and leave automatic rotation disabled for this initial setup. Password changes must update both MySQL and the secret. The backend refreshes credentials and its pool every five minutes and on the next request after a query failure.

```json
{
  "host": "YOUR_RDS_ENDPOINT",
  "port": 3306,
  "dbname": "TheBurgerLab",
  "username": "burgerlab_catalog_reader",
  "password": "YOUR_GENERATED_PASSWORD"
}
```

## Configure the network

Create security group `burgerlab-api` in the RDS VPC. Lambda requires no inbound rules. Allow outbound traffic to the database security group on its MySQL port. Add the corresponding inbound rule on RDS with source `burgerlab-api`. Coordinate any reduction of existing broad database access with teammates who use Workbench.

Choose two suitable Lambda subnets in different availability zones. Verify routes and network ACLs allow database and return traffic. Reuse an existing Secrets Manager interface endpoint or NAT route. If neither exists, review regional endpoint hourly and data charges, then create an interface endpoint for `com.amazonaws.REGION.secretsmanager`. Enable private DNS and VPC DNS support. Allow TCP 443 from `burgerlab-api` to the endpoint security group, including the corresponding Lambda outbound rule. One endpoint subnet is sufficient for the initial demo with reduced availability. A public subnet alone does not give Lambda internet access.

## Deploy Lambda

1. Create `burgerlab-catalog-api` with Node.js 24, x86_64, and an execution role with basic Lambda logging permissions.
2. Add `AWSLambdaVPCAccessExecutionRole` to that role, plus the inline policy below with the actual secret ARN. A customer-managed encryption key also requires appropriate `kms:Decrypt` permission and key policy.
3. Configure Lambda with the RDS VPC, selected subnets, and `burgerlab-api` security group.
4. Set memory to 256 MB, timeout to 20 seconds, and reserved concurrency to 2. If the account quota prevents reservation, resolve the quota before opening the endpoint for testing.
5. Set `DB_SECRET_ARN` to the secret ARN, `DB_SSL_CA_PATH=certs/global-bundle.pem`, and `ALLOWED_ORIGINS=http://localhost:5173,https://YOUR_AMPLIFY_HOST`. Lambda supplies its AWS Region automatically.
6. Locally run `npm run download-ca --workspace backend`, then `npm run package:backend`. Upload `backend/dist/burgerlab-api.zip` through Upload from → .zip file.
7. Set the runtime handler to `lambda.handler`. The ZIP contains `lambda.cjs` at its root.
8. After the first invocation creates CloudWatch log group `/aws/lambda/burgerlab-catalog-api`, set its retention to seven days.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "secretsmanager:GetSecretValue",
    "Resource": "REPLACE_WITH_SECRET_ARN"
  }]
}
```

## Configure API Gateway and the frontend

Create an API Gateway HTTP API named `burgerlab-catalog` with a Lambda integration for the function, using payload version 2.0. Create explicit routes `GET /api/health` and `GET /api/catalog/connection-test`. Use the `$default` stage with automatic deployment and ensure API Gateway has permission to invoke Lambda.

Configure CORS with exact Amplify and local Vite origins, methods GET and OPTIONS, and credentials disabled. No custom request headers are needed. Keep origins synchronized with Lambda's `ALLOWED_ORIGINS`. Set stage throttling to 2 requests/second and burst 2. Excess traffic may receive HTTP 429.

Set `VITE_API_BASE_URL` to the API invoke URL without a trailing slash in local frontend configuration and Amplify build environment variables. Set `VITE_SHOW_CONNECTION_TEST=true`. Restart local Vite and redeploy Amplify to apply build-time configuration. Amplify keeps its existing frontend build and `frontend/dist` output path.

## Verify

- Request `/api/health` and expect HTTP 200 with `status: "ok"`.
- Request `/api/catalog/connection-test` and expect HTTP 200 with a product or connected empty-data result. Use the returned request ID to locate failures in Lambda logs.
- Open `/#/menu` locally and on Amplify. Check the panel, Retry, API origin, and response caching in browser developer tools.
- Compare the displayed product and version with these Workbench queries. Seed values are expected only if the catalog is unchanged.

```sql
SELECT m.MenuItemID, m.Name, v.VariantID, v.VariantName, v.Price
FROM TheBurgerLab.MENU_ITEM AS m
JOIN TheBurgerLab.MENU_ITEM_VARIANT AS v ON v.MenuItemID = m.MenuItemID
WHERE m.Status = 'Active' AND v.IsAvailable = 1
ORDER BY m.MenuItemID, v.DisplayOrder, v.VariantID
LIMIT 1;
SELECT CatalogKey, Version FROM TheBurgerLab.CATALOG_VERSION WHERE CatalogKey = 'public_catalog';
```

Use automated tests or browser response interception for empty-data and failure scenarios. Avoid modifying shared RDS data to trigger them. `ER_ACCESS_DENIED_ERROR` points to credentials or grants, `ER_NO_SUCH_TABLE` to schema names, and `ENOTFOUND` to DNS. For timeouts, check security groups, routes, ACLs, and Secrets Manager access. Generic failures can also mean invalid secret keys or a missing CA bundle. Inspect configuration without logging passwords.

Set `VITE_SHOW_CONNECTION_TEST=false` and rebuild to hide the panel after testing.

## References

- [Lambda and RDS](https://docs.aws.amazon.com/lambda/latest/dg/services-rds.html)
- [Secrets Manager private endpoints](https://docs.aws.amazon.com/secretsmanager/latest/userguide/vpc-endpoint-overview.html)
- [API Gateway HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop.html)
- [RDS TLS certificates](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html)
