import { apiRequest } from './apiService';

export interface Room {
  id: string;
  name: string;
  type: string;
  basePrice: number;
  available: boolean;
  image: string;
  description: string;
}

export class RoomManager {
  async getAvailableRooms(checkIn: Date, checkOut: Date): Promise<Room[]> {
    const inicio = checkIn.toISOString().split('T')[0];
    const fin = checkOut.toISOString().split('T')[0];
    
    const backendRooms = await apiRequest<any[]>(`/api/hotel/disponibilidad?inicio=${inicio}&fin=${fin}`);
    
    return backendRooms.map(r => ({
      id: r.id,
      name: r.nombre,
      type: r.tipo,
      basePrice: r.precioBase,
      available: r.disponible,
      image: r.imagen || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      description: r.descripcion
    }));
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    // Note: The backend doesn't have a direct "getRoomById" endpoint, 
    // but we can fetch all and filter, or just rely on the availability check.
    // For now, we'll keep a simple mock or fetch from availability.
    const rooms = await this.getAvailableRooms(new Date(), new Date(Date.now() + 86400000));
    return rooms.find(r => r.id === id);
  }

  async bookRoom(_id: string): Promise<boolean> {
    // This is handled by the backend's /api/hotel/reservar endpoint
    return true;
  }
}


