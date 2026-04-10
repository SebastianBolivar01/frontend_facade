export interface ExtraService {
  id: string;
  name: string;
  pricePerDay: number;
}

export class AdditionalServices {
  private extras: ExtraService[] = [
    { id: 'spa', name: 'Spa Access', pricePerDay: 50 },
    { id: 'restaurant', name: 'Premium Dining Plan', pricePerDay: 120 },
    { id: 'transport', name: 'Airport Transport (Daily)', pricePerDay: 40 },
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
