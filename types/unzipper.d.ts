declare module 'unzipper' {
  export interface DirectoryEntry {
    path: string;
    type: string;
    buffer(): Promise<Buffer>;
  }

  export interface Directory {
    files: DirectoryEntry[];
  }

  export const unzip: {
    Open: {
      buffer(buffer: Buffer): Promise<Directory>;
    };
  };
}