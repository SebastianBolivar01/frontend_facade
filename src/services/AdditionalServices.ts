export interface ExtraService {
  id: string;
  name: string;
  pricePerDay: number;
}

export class AdditionalServices {
  private extras: ExtraService[] = [
    { id: 'SPA', name: 'Spa Access', pricePerDay: 50 },
    { id: 'DESAYUNO', name: 'Premium Breakfast', pricePerDay: 15 },
    { id: 'TRASLADO', name: 'Airport Transport', pricePerDay: 40 },
  ];

  async getAvailableExtras(): Promise<ExtraService[]> {
    return new Promise(resolve => setTimeout(() => resolve(this.extras), 200));
  }

  async calculateExtrasCost(selectedExtraIds: string[], days: number): Promise<number> {
    return new Promise(resolve => {
      setTimeout(() => {
        let total = 0;
        this.extras.forEach(extra => {
          if (selectedExtraIds.includes(extra.id)) {
            total += extra.pricePerDay * days;
          }
        });
        resolve(total);
      }, 150);
    });
  }
}

