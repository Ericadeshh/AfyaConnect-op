import { generateKeyPair, exportPKCS8, exportJWK } from "jose";

async function main() {
  const { privateKey, publicKey } = await generateKeyPair("RS256", {
    extractable: true,
  });

  const privatePem = await exportPKCS8(privateKey);
  const jwks = {
    keys: [
      {
        ...(await exportJWK(publicKey)),
        use: "sig",
        alg: "RS256",
        kid: "convex-auth-key-1",
      },
    ],
  };

  console.log(`JWT_PRIVATE_KEY="${privatePem.trimEnd()}"`);
  console.log(`JWKS=${JSON.stringify(jwks)}`);
}

main().catch(console.error);
