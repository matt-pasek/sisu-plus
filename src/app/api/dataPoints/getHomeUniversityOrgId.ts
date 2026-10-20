import { fetchEducationById } from '@/app/api/endpoints/educations';
import { fetchStudyRights } from '@/app/api/endpoints/studyRights';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';

export const getHomeUniversityOrgId = (): { orgId: string | undefined; isLoading: boolean } => {
  const studyRightsQuery = useSisuQuery(['study-rights'], fetchStudyRights);
  const studyRight = studyRightsQuery.data?.[0];

  const educationQuery = useSisuQuery(
    ['study-period-education', studyRight?.educationId],
    async () => fetchEducationById(studyRight!.educationId),
    { enabled: studyRight?.educationId != null },
  );

  return {
    orgId: educationQuery.data?.universityOrgIds[0] ?? studyRight?.organisationId,
    isLoading: studyRightsQuery.isLoading || educationQuery.isLoading,
  };
};
