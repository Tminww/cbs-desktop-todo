// @renderer/api.ts
declare global {
  interface Window {
    backend: {
      sendPing: (arg: any) => Promise<string>;
      saveFile: (args: {
        content: string;
        date: string;
        doctor: string;
      }) => Promise<{
        message: string;
        status: string;
      }>;
      openFile: (args: { date: string; doctor?: string }) => Promise<{
        message: string;
        status: string;
        content?: string;
      }>;
      getDoctorsByDate: (args: { date: string }) => Promise<{
        message: string;
        status: string;
        doctors: string[];
      }>;
    };
  }
}

export const api = {
  sendPing: (arg: any) => window.backend.sendPing(arg),
  saveFile: (args: { content: string; date: string; doctor: string }) =>
    window.backend.saveFile(args),
  openFile: (args: { date: string; doctor?: string }) =>
    window.backend.openFile(args),
  getDoctorsByDate: (args: { date: string }) =>
    window.backend.getDoctorsByDate(args),
};
