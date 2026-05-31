import { koriApi } from '@/app/api/client';
import type { Code, CompetencyCode, CountryCode } from '@/app/api/generated/KoriApi';

export type CodebookCode = Code | CompetencyCode | CountryCode;

export async function fetchCodes(codeUrns: string[]): Promise<CodebookCode[]> {
  const uniqueUrns = [...new Set(codeUrns)].filter(Boolean);
  if (uniqueUrns.length === 0) return [];

  try {
    const response = await koriApi.api.getCodesCached({ urn: uniqueUrns });
    return response.data;
  } catch {
    return [];
  }
}
