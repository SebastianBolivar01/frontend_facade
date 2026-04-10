export class AccessControl {
  async generateDigitalKey(roomId: string, customerName: string): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simple hash generation for the simulated token
        const cleanName = customerName.replace(/[^a-zA-Z]/g, '').substring(0, 4);
        const randomString = Math.random().toString(36).substring(2, 6);
        const token = `${roomId}-${cleanName}-${randomString}`.toUpperCase();
        resolve(token);
      }, 400);
    });
  }
}
