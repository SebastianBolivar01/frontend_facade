export interface Invoice {
  roomTotal: number;
  extrasTotal: number;
  taxes: number;
  grandTotal: number;
  seasonText: string;
}

export class BillingService {
  async generateBilling(roomTotal: number, extrasTotal: number, seasonText: string): Promise<Invoice> {
    return new Promise(resolve => {
      setTimeout(() => {
        const subtotal = roomTotal + extrasTotal;
        const taxes = subtotal * 0.16; // 16% tax
        const grandTotal = subtotal + taxes;
        resolve({
          roomTotal,
          extrasTotal,
          taxes,
          grandTotal,
          seasonText
        });
      }, 300);
    });
  }
}
