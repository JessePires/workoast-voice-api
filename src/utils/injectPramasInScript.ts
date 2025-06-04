export const injectParamsInScript = (
  script: string,
  params: {
    companyName: string;
    jobDescription: string;
    candidateName: string;
    language: string;
  }
): string => {
  return script
    .replaceAll("COMPANY_NAME", params.companyName)
    .replaceAll("CANDIDATE_NAME", params.candidateName)
    .replaceAll("JOB_DESCRIPTION", params.jobDescription)
    .replaceAll("LANGUAGE", params.language);
};
