# JWT (JSON Web Tokens) Explained

## 1. What is JWT?
JWT is an open standard for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.

## 2. The Structure of a JWT
A JWT is a long string divided into three parts separated by dots (`.`):
1. **Header:** Contains the algorithm used to sign the token (e.g., HS256).
2. **Payload:** Contains the actual data (claims). In AuditIQ, we store the user's `email`, their internal database `id`, and their `role` (Auditor vs Org).
3. **Signature:** The most critical part. The server takes the Header, the Payload, and a secret key (stored in `application.properties`), and cryptographically hashes them together.

## 3. Why JWT is incredibly secure
If a hacker intercepts the token and tries to change their role from `ROLE_ORG` to `ROLE_AUDITOR`, the token will become invalid. Why? Because the hacker doesn't know our server's secret key. When the server receives the modified token, it recalculates the signature using the secret key, realizes it doesn't match the signature on the token, and instantly rejects it.

## 4. How we use it in AuditIQ
1. **Login:** User sends email/password. Server verifies them, generates a JWT signed with our secret, and sends it to the frontend.
2. **Requests:** Frontend attaches the JWT to the `Authorization: Bearer <token>` header of every API request.
3. **Validation (`JwtFilter.java`):** Before a request hits a controller, our custom `JwtFilter` intercepts it. It extracts the token, verifies the signature, and if valid, reads the user's email from the payload. It then tells Spring Security "This user is authenticated for this specific request."
