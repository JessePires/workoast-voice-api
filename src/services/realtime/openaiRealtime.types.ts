export type RealtimeOptions = {
  onOpen: () => void;
  onMessage: (data: string) => void;
  // onAudio: (chunk: Buffer) => void;
  onClose: () => void;
  onError: (err: any) => void;
};

export type ScriptParams = {
  jobDescription?: string;
  candidateName?: string;
  companyName?: string;
};
