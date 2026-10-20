import { fetchModuleDocumentStrict, fetchRuleOptionsStrict } from '@/app/api/dataPoints/structure/fetchRuleOptions';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import type { LocalizedText } from './buildOptionGroups';
import type { PlanOptionFetchers } from './walkPlanOptions';

export const defaultFetchers: PlanOptionFetchers = {
  fetchModuleDocument: fetchModuleDocumentStrict,
  fetchRuleOptions: fetchRuleOptionsStrict,
};

export const localizedPickText = (value: LocalizedText) => pickLabel(value as Parameters<typeof pickLabel>[0]);
