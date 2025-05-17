export const injectParamsInScript = (
  script: string,
  params: { companyName: string; jobDescription: string; candidateName: string }
): string => {
  return script
    .replace("COMPANY_NAME", params.companyName)
    .replace("CANDIDATE_NAME", params.candidateName)
    .replace("JOB_DESCRIPTION", params.jobDescription);
};
