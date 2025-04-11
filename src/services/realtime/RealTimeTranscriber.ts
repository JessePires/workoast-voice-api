export interface RealtimeTranscriber {
  connect(): Promise<void>;
  sendAudioChunk(chunk: Buffer): void;
  close(): void;
  onTranscription(callback: (text: string, isFinal: boolean) => void): void;
}
