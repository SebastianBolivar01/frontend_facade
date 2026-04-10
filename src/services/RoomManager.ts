export interface Room {
  id: string;
  name: string;
  type: 'Standard' | 'Deluxe' | 'Suite';
  basePrice: number;
  available: boolean;
  image: string;
  description: string;
}

export class RoomManager {
  private rooms: Room[] = [
    { 
      id: '101', 
      name: 'Ocean View Standard', 
      type: 'Standard', 
      basePrice: 150, 
      available: true, 
      image: '/standard_room.png',
      description: 'Cozy and luxurious standard room with direct ocean view and premium amenities.'
    },
    { 
      id: '201', 
      name: 'City Skyline Deluxe', 
      type: 'Deluxe', 
      basePrice: 280, 
      available: true, 
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      description: 'Spacious deluxe room featuring a breathtaking view of the city skyline, decorated in rich gold.'
    },
    { 
      id: '301', 
      name: 'Presidential Suite', 
      type: 'Suite', 
      basePrice: 650, 
      available: true, 
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      description: 'The ultimate luxury experience. A massive suite with panoramic views and private concierge.'
    },
  ];

  async getAvailableRooms(_checkIn: Date, _checkOut: Date): Promise<Room[]> {
    return new Promise(resolve => {
      // Simulate network delay and logic
      setTimeout(() => {
        // Just return all available rooms for this prototype
        resolve(this.rooms.filter(r => r.available));
      }, 600);
    });
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    return this.rooms.find(r => r.id === id);
  }

  async bookRoom(id: string): Promise<boolean> {
    const roomIndex = this.rooms.findIndex(r => r.id === id);
    if (roomIndex !== -1) {
      this.rooms[roomIndex].available = false;
      return true;
    }
    return false;
  }
}

