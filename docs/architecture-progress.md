# BurgerLab architecture progress

Updated November 25, 2026

## Executive summary

BurgerLab began this phase with a React, TypeScript, and Vite frontend hosted through AWS Amplify and a MySQL database hosted on AWS RDS. The database had been seeded with catalog information derived from the prototype, while the frontend continued to display sample data. The original architecture called for a backend API and left its AWS hosting service open.

The team subsequently approved API Gateway, Lambda, and Secrets Manager for the first database integration. The immediate objective is to display one real database product in a temporary menu-page panel, proving that the browser can request data through the backend. Work has progressed through local implementation, credential storage, and creation of a private Secrets Manager endpoint. Deployment and a successful live database read are the next milestones.

## Architecture and reasons for the choices

| Component | Purpose and justification |
| --- | --- |
| Amplify Hosting | Continue hosting the existing frontend and static images using the established GitHub workflow. |
| API Gateway HTTP API | Give the frontend HTTPS endpoints that invoke backend code. |
| Lambda with TypeScript | Run the API without administering a server and reuse the team's TypeScript development approach. |
| Existing RDS MySQL database | Preserve the deployed `TheBurgerLab` schema and seeded catalog as the integration baseline. |
| MySQL catalog reader account | Limit initial API database permissions to reading the nine catalog-related tables. |
| Secrets Manager | Store the reader's credentials centrally and let Lambda retrieve them through its execution role. |
| Existing VPC and security groups | Connect Lambda to RDS through controlled network rules within the existing AWS network. |
| Secrets Manager interface endpoint | Provide private HTTPS access to Secrets Manager from the VPC. |

The intended request flow is browser → API Gateway → Lambda → RDS. Lambda also retrieves database credentials from Secrets Manager. Customer browsers receive public API responses. Customer and employee sign-in remains a separate future feature; Cognito was discussed as an option.

## Steps completed and decisions made

### 1. Establish the integration baseline

Reviewed the project outline, ERD rationale, deployed schema snapshot, and November 10 catalog seed. The seed defines six products, ten variants, ingredients, recipes, customization rules, image references, and the `public_catalog` version entry. Post-seed row contents still require live verification.

Chose a connection-test milestone before converting the whole menu. Returning a product name, variant, and price will demonstrate actual database access beyond simple API availability.

### 2. Implement and isolate the code

Created a TypeScript backend with shared local and Lambda request handling, using `mysql2` and the AWS Secrets Manager SDK. Added `GET /api/health` and `GET /api/catalog/connection-test`, plus an optional menu-page panel with loading, connected, empty-data, unavailable, and Retry behavior.

Enabled database TLS certificate-chain and hostname verification. Prices and catalog versions are returned as strings to preserve precision. Database errors return a generic message and request ID, with sanitized diagnostics in backend logs.

Added `.env.example` files for configuration guidance. Private `.env` files and generated build artifacts are ignored by Git. Packaged the Lambda handler with the public RDS CA bundle.

Committed and pushed the implementation to `database-implementation` as `02cdd3b`, keeping development isolated from the `main` branch used for the existing site. Local checks passed for builds, lint, six API tests, package loading, and browser behavior. Successful-data browser tests used intercepted responses; the failure test exercised a refused MySQL connection.

### 3. Store database credentials

Provided SQL to create `burgerlab_catalog_reader` with encrypted connections and `SELECT` access to the nine catalog tables. The user created the Secrets Manager secret `burgerlab/catalog-reader`, confirmed in the console screenshot.

The secret must contain `host`, `port`, `dbname`, `username`, and `password`. Its values must match the MySQL account. Saving the secret records credentials; successful authentication and the account's actual grants still require verification.

### 4. Configure network permissions

Used the existing Ohio Region (`us-east-2`) VPC `vpc-0541bf8e0b18f0f1d` and database port 3306. The database security group shown in the console was `sg-0558ca3caff7069ca`.

The guided configuration established these intended rules:

| Security group | Direction | Rule |
| --- | --- | --- |
| `burgerlab-api` | Outbound | TCP 3306 to the database security group |
| Database security group | Inbound | TCP 3306 from `burgerlab-api` |
| `burgerlab-api` | Outbound | TCP 443 to `burgerlab-secrets-endpoint` |
| `burgerlab-secrets-endpoint` | Inbound | TCP 443 from `burgerlab-api` |

Lambda initiates the database connection. Security groups allow response traffic for accepted connections, so this workflow did not require an additional database outbound rule. The database screenshot also showed broad inbound access from `0.0.0.0/0`; its ports and any later restrictions need review with the team to preserve required Workbench access.

### 5. Create the Secrets Manager endpoint

The user found an empty endpoint list and subsequently reported completing endpoint creation. The selected service was guided as `com.amazonaws.us-east-2.secretsmanager`, using an interface endpoint in the existing VPC.

The configuration screenshot showed IPv4, private DNS enabled, and one selected subnet in `us-east-2a`. Automatic private IP assignment was chosen. A single-zone endpoint limits the initial hourly cost and is suitable for the class demo, with reduced availability if that zone becomes unavailable. Interface endpoints incur charges while provisioned, including periods without API traffic.

Private DNS lets the backend use the standard Secrets Manager service hostname while reaching the endpoint privately. Lambda can access the endpoint from other subnets in the VPC when security groups, routes, and network ACLs permit. Endpoint creation can precede Lambda creation.

## Current status and next steps

The endpoint has been created according to the user. Lambda had not yet been created at the latest confirmed checkpoint. Endpoint availability, exact deployed security-group rules, secret contents, and live database connectivity have not been independently verified.

1. Verify the endpoint is Available, record its ID and selected subnet, and confirm private DNS and the TCP 443 rules. Verify the secret's required keys and MySQL reader grants privately.
2. Create `burgerlab-catalog-api` in Ohio using Node.js 24. Configure its VPC, suitable subnets, security group, logging, and permission to read the specific secret. Upload the prepared package and set the handler to `lambda.handler`.
3. Create API Gateway routes for the health and catalog tests. Configure CORS, throttling, and the approved Lambda runtime settings. Use CloudWatch request IDs to diagnose failures.
4. Test the API against RDS and compare its product and catalog-version response with Workbench results.
5. Enable the frontend test panel locally, then deploy `database-implementation` as a separate Amplify branch with branch-specific API configuration. Add that branch's actual origin to the API's allowed origins.
6. After the connection succeeds, implement full catalog loading and customization using database data. Coordinate public image paths with deployed assets.

## References

- [Repository AWS setup walkthrough](aws-api-setup.md)
- [Backend configuration and verification](../backend/README.md)
- [AWS Lambda connections to RDS](https://docs.aws.amazon.com/lambda/latest/dg/services-rds.html)
- [Secrets Manager VPC endpoints](https://docs.aws.amazon.com/secretsmanager/latest/userguide/vpc-endpoint-overview.html)
- [Interface endpoint subnet configuration](https://docs.aws.amazon.com/vpc/latest/privatelink/interface-endpoints.html)
- [AWS PrivateLink pricing](https://aws.amazon.com/privatelink/pricing/)
