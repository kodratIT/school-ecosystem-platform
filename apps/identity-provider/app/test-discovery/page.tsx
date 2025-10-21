import { getDiscoveryDocument, getJWKS } from '@/lib/oidc/discovery';

export default async function TestDiscoveryPage() {
  const discovery = await getDiscoveryDocument();
  const jwks = await getJWKS();

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">OIDC Discovery Test</h1>

      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-xl font-semibold">Discovery Document</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4">
            {JSON.stringify(discovery, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold">JWKS</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4">
            {JSON.stringify(jwks, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold">Quick Links</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <a
                href="/.well-known/openid-configuration"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Discovery Document
              </a>
            </li>
            <li>
              <a
                href="/.well-known/jwks.json"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                JWKS
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
