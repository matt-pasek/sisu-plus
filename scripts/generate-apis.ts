import { $ } from 'bun';

const apis = ['Kori', 'Arto', 'Ilmo', 'Ori', 'Osuva'];
const sisuApiDocsOrigin = process.env.SISU_API_DOCS_ORIGIN ?? 'https://sisu.lut.fi';

await $`mkdir -p app/api/generated`;

for (const api of apis) {
  const pathName = api.toLowerCase();

  console.log(`Generating ${api}Api...`);

  await $`bunx swagger-typescript-api generate \
    --path ${sisuApiDocsOrigin}/${pathName}/v3/api-docs/internal \
    --name ${api}Api.ts \
    --api-class-name "${api}Api" \
    --output ./src/app/api/generated`;
}

console.log('All APIs generated successfully');
