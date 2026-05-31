import React, { useState } from 'react';
import { fetchCodes } from '@/app/api/endpoints/codebooks';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { fetchEducationById } from '@/app/api/endpoints/educations';
import { fetchModulesByGroupIds } from '@/app/api/endpoints/modules';
import { fetchOrganisations } from '@/app/api/endpoints/organisations';
import { fetchPublicPersons } from '@/app/api/endpoints/people';
import { fetchStudyRights } from '@/app/api/endpoints/studyRights';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { useCourseUnit } from '@/app/views/structure/hooks/useCourseUnit';
import { formatCourseVersion } from '@/app/views/structure/components/CourseDetailsDialog.comp';
import {
  formatCodeLabel,
  formatGradeAverage,
  formatLocalizedLabel,
  formatPersonDisplayName,
  formatStudyRightLabel,
  getStudyRightSelectionGroupIds,
  resolveOrganisationRoleLabels,
  resolveOrganisationRoleNames,
} from '@/app/views/structure/utils/dialogData';
import { DialogShell, DialogCloseButton } from './DialogShell.comp';
import type { CourseEntry } from '@/app/views/structure/structureTypes';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';

interface Props {
  course: CourseEntry;
  onClose: () => void;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '–';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

function formatLanguage(urn: string): string {
  const code = urn.split(':').at(-1) ?? urn;
  const names: Record<string, string> = {
    en: 'English',
    fi: 'Finnish',
    sv: 'Swedish',
    de: 'German',
    fr: 'French',
  };
  return names[code] ?? code.toUpperCase();
}

function getGradeWord(grade: string | null): string | null {
  const words: Record<string, string> = {
    '1': 'Satisfactory',
    '2': 'Satisfactory',
    '3': 'Good',
    '4': 'Very good',
    '5': 'Excellent',
    HYV: 'Passed',
    HYL: 'Failed',
  };
  return grade ? (words[grade] ?? null) : null;
}

function isNumericGrade(grade: string | null): boolean {
  return grade !== null && /^[0-5]$/.test(grade);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

type LangTab = 'fi' | 'sv' | 'en';

export const AttainmentDialog: React.FC<Props> = ({ course, onClose }) => {
  const { t } = useTranslationWithPrefix('views.structure.dialogs');
  const { data: allAttainments, isLoading } = useSisuQuery(['attainments'], fetchAttainments);
  const { data: unit, isLoading: unitLoading } = useCourseUnit(course.courseUnitId);
  const [langTab, setLangTab] = useState<LangTab>('en');

  const attainment =
    allAttainments?.find(
      (a): a is CourseUnitAttainmentRestricted =>
        'courseUnitId' in a && a.courseUnitId === course.courseUnitId && a.primary,
    ) ??
    allAttainments?.find(
      (a): a is CourseUnitAttainmentRestricted => 'courseUnitId' in a && a.courseUnitId === course.courseUnitId,
    );

  const approverPersonIds =
    attainment?.acceptorPersons
      ?.map((person) => person.personId)
      .filter((personId): personId is string => Boolean(personId)) ?? [];
  const studyRightQuery = useSisuQuery(['study-rights'], fetchStudyRights);
  const studyRight = studyRightQuery.data?.find((candidate) => candidate.id === attainment?.studyRightId);
  const { data: education, isLoading: educationLoading } = useSisuQuery(
    ['attainment-education', studyRight?.educationId],
    () => fetchEducationById(studyRight!.educationId),
    { enabled: studyRight?.educationId != null },
  );
  const studyRightModuleGroupIds = getStudyRightSelectionGroupIds(studyRight, education);
  const universityId = education?.universityOrgIds?.[0];
  const { data: studyRightModules = [], isLoading: studyRightModulesLoading } = useSisuQuery(
    ['study-right-modules', studyRightModuleGroupIds, universityId],
    () => fetchModulesByGroupIds(studyRightModuleGroupIds, universityId),
    { enabled: studyRightModuleGroupIds.length > 0 },
  );
  const organisationIds = [
    ...(attainment?.organisations ?? []).map((organisation) => organisation.organisationId),
    ...(unit?.organisations ?? []).map((organisation) => organisation.organisationId),
    studyRight?.organisationId,
  ].filter((organisationId): organisationId is string => Boolean(organisationId));
  const { data: organisations = [] } = useSisuQuery(
    ['organisations', organisationIds],
    () => fetchOrganisations(organisationIds),
    { enabled: organisationIds.length > 0 },
  );
  const { data: approverPersons = [] } = useSisuQuery(
    ['public-persons', approverPersonIds],
    () => fetchPublicPersons(approverPersonIds),
    { enabled: approverPersonIds.length > 0 },
  );
  const fieldOfStudyUrn = attainment?.studyFieldUrn ?? unit?.studyFields?.[0];
  const codeUrns = [unit?.courseUnitType, fieldOfStudyUrn].filter((urn): urn is string => Boolean(urn));
  const { data: codes = [] } = useSisuQuery(['codes', codeUrns], () => fetchCodes(codeUrns), {
    enabled: codeUrns.length > 0,
  });

  const approver =
    attainment?.acceptorPersons?.find((p) => p.roleUrn === 'urn:code:attainment-acceptor-type:approved-by') ??
    attainment?.acceptorPersons?.[0];
  const approverPerson = approver?.personId
    ? approverPersons.find((person) => person.id === approver.personId)
    : undefined;
  const approverText = formatLocalizedLabel(approver?.text as Record<string, string> | undefined);
  const approverName = formatPersonDisplayName(approverText, approverPerson, { lastNameFirst: true }) ?? '–';

  const stateLabel = attainment
    ? ({
        ATTAINED: t('attainment.stateAttained'),
        INCLUDED: t('attainment.stateIncluded'),
        SUBSTITUTED: t('attainment.stateSubstituted'),
        FAILED: t('attainment.stateFailed'),
      }[attainment.state] ?? attainment.state)
    : '–';

  const stateDotColor =
    attainment?.state === 'ATTAINED' || attainment?.state === 'INCLUDED'
      ? 'text-lighterGreen bg-lighterGreen/12'
      : attainment?.state === 'FAILED'
        ? 'text-danger bg-danger/12'
        : 'text-warn bg-warn/12';

  const grade = course.grade ?? '–';
  const gradeWord = getGradeWord(course.grade);
  const creditsVal = attainment ? String(attainment.credits) : course.credits != null ? String(course.credits) : '–';

  const additionalInfo = attainment?.additionalInfo as Record<string, string> | undefined;
  const additionalInfoText = additionalInfo?.[langTab] ?? null;
  const organisationMap = new Map(
    organisations
      .map((organisation) => (organisation.id ? ([organisation.id, organisation] as const) : null))
      .filter((entry): entry is readonly [string, (typeof organisations)[number]] => entry != null),
  );
  const studyRightModuleMap = new Map(
    studyRightModules
      .map((module) => (module.groupId ? ([module.groupId, module] as const) : null))
      .filter((entry): entry is readonly [string, (typeof studyRightModules)[number]] => entry != null),
  );
  const codeByUrn = new Map(codes.map((code) => [code.urn, code]));
  const courseOrganisations = unit?.organisations ?? [];
  const attainmentOrganisations = attainment?.organisations ?? [];
  const fieldOfStudy = formatCodeLabel(fieldOfStudyUrn, fieldOfStudyUrn ? codeByUrn.get(fieldOfStudyUrn) : undefined);
  const typeOfStudies = formatCodeLabel(
    unit?.courseUnitType,
    unit?.courseUnitType ? codeByUrn.get(unit.courseUnitType) : undefined,
    {
      suffix: 'course unit',
    },
  );
  const responsibleOrganisation = resolveOrganisationRoleLabels(
    attainmentOrganisations.length > 0 ? attainmentOrganisations : courseOrganisations,
    organisationMap,
    ['responsible'],
    { fallbackToAny: true, includeShare: true },
  );
  const coordinatingOrganisation = resolveOrganisationRoleNames(attainmentOrganisations, organisationMap, [
    'coordinating',
  ]);
  const studyRightLabel = formatStudyRightLabel(studyRight, organisationMap, education, studyRightModuleMap);

  const courseName = course.name ?? course.code ?? course.courseUnitId;
  const courseCode = course.code ?? course.courseUnitId;
  const registrationDate = formatDate(attainment?.registrationDate);
  const detailsLoading =
    isLoading || unitLoading || studyRightQuery.isLoading || educationLoading || studyRightModulesLoading;

  return (
    <DialogShell labelId="attainment-dialog-title" onClose={onClose} maxWidth="max-w-[840px]">
      <div className="flex shrink-0 items-start gap-4 border-b border-border px-6.5 py-5.5">
        <div className="flex size-10.5 shrink-0 items-center justify-center rounded-xl border border-accent/45 bg-accent/13 text-accent">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 8.5L12 4l9 4.5-9 4.5-9-4.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path
              d="M7 10.5V15c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M21 8.5V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div className="min-w-0 flex-1 pt-px">
          <p className="mb-1.25 text-[11px] font-semibold tracking-[.07em] text-lightGrey uppercase">
            {t('attainment.title')}
          </p>
          <h2
            id="attainment-dialog-title"
            className="flex flex-wrap items-baseline gap-2.75 text-[20px] leading-tight font-semibold tracking-[-0.4px] text-offwhite"
          >
            {courseName}
            {courseCode !== courseName && (
              <span className="-translate-y-0.5 rounded-[7px] border border-accent/40 bg-accent/13 px-2.25 py-0.75 font-mono text-[12px] font-medium tracking-[.02em] text-accent">
                {courseCode}
              </span>
            )}
          </h2>
        </div>
        <DialogCloseButton label={t('close')} onClose={onClose} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6.5 pt-5 pb-6.5">
        {detailsLoading ? (
          <div className="flex h-40 items-center justify-center">
            <span className="text-xs text-lightGrey">{t('courseDetails.loading')}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4.5">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-border2 bg-border md:grid-cols-[1.3fr_1fr_1fr_1fr]">
              <div className="flex min-h-24 flex-col justify-center gap-1.75 bg-accent/13 px-4.5 py-4">
                <span className="text-[10.5px] font-semibold tracking-[.07em] text-lightGrey uppercase">
                  {t('attainment.gradeLabel')}
                </span>
                <div className="flex items-baseline gap-0.75">
                  <span className="text-[34px] leading-[.9] font-semibold tracking-[-1px] text-accent">{grade}</span>
                  {isNumericGrade(course.grade) && <span className="text-[15px] font-medium text-accent/65">/ 5</span>}
                  {gradeWord && (
                    <span className="ml-1 self-center text-[12px] font-semibold text-accent">{gradeWord}</span>
                  )}
                </div>
              </div>

              <div className="flex min-h-24 flex-col justify-center gap-1.75 bg-container2 px-4.5 py-4">
                <span className="text-[10.5px] font-semibold tracking-[.07em] text-lightGrey uppercase">
                  {t('attainment.stateLabel')}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`flex size-5.5 shrink-0 items-center justify-center rounded-full ${stateDotColor}`}>
                    {attainment?.state === 'FAILED' ? (
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M2 7.5l3 3L12 3.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="text-[16px] font-semibold text-offwhite">{stateLabel}</span>
                </div>
              </div>

              <div className="flex min-h-24 flex-col justify-center gap-1.75 bg-container2 px-4.5 py-4">
                <span className="text-[10.5px] font-semibold tracking-[.07em] text-lightGrey uppercase">
                  {t('attainment.creditsLabel')}
                </span>
                <div className="text-[24px] font-semibold tracking-[-0.4px] text-offwhite">
                  {creditsVal}
                  <span className="ml-0.75 text-[13px] font-medium text-lightGrey">cr</span>
                </div>
              </div>

              <div className="flex min-h-24 flex-col justify-center gap-1.75 bg-container2 px-4.5 py-4">
                <span className="text-[10.5px] font-semibold tracking-[.07em] text-lightGrey uppercase">
                  {t('attainment.dateLabel')}
                </span>
                <span className="font-mono text-[18px] font-medium tracking-[-0.2px] text-offwhite">
                  {formatDate(attainment?.attainmentDate)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <ATCard
                icon={
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="2.5" y="2" width="11" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M5 5.5h6M5 8h6M5 10.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                }
                title={t('attainment.courseCardTitle')}
              >
                <ATField label={t('attainment.languageLabel')}>
                  {attainment?.attainmentLanguageUrn ? formatLanguage(attainment.attainmentLanguageUrn) : '–'}
                </ATField>
                <ATField label={t('attainment.typeOfStudiesLabel')}>{typeOfStudies}</ATField>
                <ATField label={t('attainment.versionLabel')} mono>
                  {formatCourseVersion(unit)}
                </ATField>
                <ATField label={t('attainment.fieldOfStudyLabel')} stack last>
                  {fieldOfStudy}
                </ATField>
              </ATCard>

              <ATCard
                icon={
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <rect x="2.5" y="3" width="11" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                    <path
                      d="M2.5 6h11M5.5 1.8v2.4M10.5 1.8v2.4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                }
                title={t('attainment.validityCardTitle')}
              >
                <ATField label={t('attainment.registrationDateLabel')} mono>
                  {registrationDate}
                </ATField>
                <ATField label={t('attainment.expiryLabel')} muted={!attainment?.expiryDate}>
                  {attainment?.expiryDate ? formatDate(attainment.expiryDate) : t('attainment.noExpiry')}
                </ATField>
                <ATField label={t('attainment.studyRightLabel')} stack>
                  {studyRightLabel}
                </ATField>
                <ATField label={t('attainment.averageGradeLabel')} muted last>
                  {formatGradeAverage(attainment?.gradeAverage)}
                </ATField>
              </ATCard>

              <ATCard
                full
                icon={
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2.5 13.5h11M4 13.5V6m3 7.5V6m2.5 7.5V6m3 7.5V6M2 6l6-4 6 4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                title={t('attainment.adminCardTitle')}
              >
                <div className="grid grid-cols-1 gap-x-7 sm:grid-cols-2">
                  <ATField label={t('attainment.approvedByLabel')}>
                    {approverName !== '–' ? (
                      <span className="flex items-center justify-start gap-2.25 sm:justify-end">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-400 to-purple-500 text-[10px] font-bold text-white">
                          {getInitials(approverName)}
                        </span>
                        <span className="text-[13.5px] font-medium text-offwhite">{approverName}</span>
                      </span>
                    ) : (
                      '–'
                    )}
                  </ATField>
                  <ATField label={t('attainment.coordinatingOrgLabel')} muted>
                    {coordinatingOrganisation}
                  </ATField>
                  <ATField label={t('attainment.responsibleOrgLabel')} last>
                    {responsibleOrganisation}
                  </ATField>
                  <ATField label={t('attainment.approvedDateLabel')} mono last>
                    {formatDate(attainment?.attainmentDate)}
                  </ATField>
                </div>
              </ATCard>

              <ATCard
                full
                icon={
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M8 7.2v3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="5.2" r=".9" fill="currentColor" />
                  </svg>
                }
                title={t('attainment.additionalInfoCardTitle')}
                headerEnd={
                  <div className="flex gap-1.5">
                    {(['fi', 'sv', 'en'] as LangTab[]).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLangTab(lang)}
                        className={`flex h-6 w-7.5 cursor-pointer items-center justify-center rounded-[7px] border text-[10.5px] font-semibold tracking-[.04em] uppercase transition-[color,background-color,border-color] duration-150 ${
                          langTab === lang
                            ? 'border-accent/40 bg-accent/13 text-accent'
                            : 'border-border bg-container text-darkishGrey hover:text-lightGrey'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                }
                bodyClassName="min-h-[54px] px-[16px] py-[14px] text-[13px] leading-[1.55]"
              >
                {additionalInfoText ? (
                  <span className="text-lightGrey">{additionalInfoText}</span>
                ) : (
                  <span className="text-darkishGrey italic">{t('attainment.noAdditionalInfo')}</span>
                )}
              </ATCard>
            </div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-border bg-container px-6.5 py-3.75">
        <div className="flex items-center gap-2 text-[12px] text-darkishGrey">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M7 4v3.3l2 1.3"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {attainment?.registrationDate && (
            <span>
              {t('attainment.recordedLabel')} {registrationDate}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-[9px] border border-border2 bg-container2 px-5.5 py-2.25 text-[13px] font-semibold tracking-[.03em] text-offwhite transition-[background-color] duration-150 hover:bg-container"
        >
          {t('close')}
        </button>
      </div>
    </DialogShell>
  );
};

interface ATCardProps {
  icon: React.ReactNode;
  title: string;
  full?: boolean;
  headerEnd?: React.ReactNode;
  bodyClassName?: string;
  children: React.ReactNode;
}

const ATCard: React.FC<ATCardProps> = ({ icon, title, full, headerEnd, bodyClassName, children }) => (
  <div
    className={`flex flex-col overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.075)] bg-container2 ${
      full ? 'sm:col-span-2' : ''
    }`}
  >
    <div className="flex items-center gap-2.25 border-b border-[rgba(255,255,255,0.075)] px-4 pt-3.25 pb-2.75">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-container text-lightGrey">
        {icon}
      </span>
      <h3 className="text-[12px] font-semibold tracking-[.03em] text-offwhite">{title}</h3>
      {headerEnd && <div className="ml-auto">{headerEnd}</div>}
    </div>
    <div className={bodyClassName ?? 'flex flex-col px-4 pt-1.25 pb-2.25'}>{children}</div>
  </div>
);

interface ATFieldProps {
  label: string;
  mono?: boolean;
  muted?: boolean;
  stack?: boolean;
  last?: boolean;
  children: React.ReactNode;
}

const ATField: React.FC<ATFieldProps> = ({ label, mono, muted, stack, last, children }) => (
  <div
    className={`flex ${
      stack
        ? 'flex-col items-stretch gap-1 py-1.75'
        : 'flex-col items-stretch gap-1 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4.5'
    } ${last ? '' : 'border-b border-[rgba(255,255,255,0.075)]'}`}
  >
    <span
      className={`shrink-0 text-[11px] font-semibold tracking-wider text-lightGrey uppercase ${
        stack ? 'leading-tight' : 'pt-px leading-[1.4]'
      }`}
    >
      {label}
    </span>
    <span
      className={`${stack ? 'text-left leading-[1.32]' : 'text-left leading-[1.45] sm:text-right'} ${mono ? 'font-mono text-[12.5px] tracking-[.02em]' : 'text-[13.5px]'} ${muted ? 'font-normal text-darkishGrey' : 'font-medium text-offwhite'}`}
    >
      {children}
    </span>
  </div>
);
