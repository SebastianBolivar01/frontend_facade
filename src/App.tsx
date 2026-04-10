import { useState, useEffect, useMemo } from 'react';
import { HotelFacade, type ReservationResult, type ReservationRequest } from './facade/HotelFacade';
import type { Room } from './services/RoomManager';
import type { ExtraService } from './services/AdditionalServices';
import { Calendar, User, ArrowRight, CheckCircle, Key, Plus, Star } from 'lucide-react';

// Initialize the Facade outside to mimic a singleton or service locator
const facade = new HotelFacade();

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [availableExtras, setAvailableExtras] = useState<ExtraService[]>([]);
  const [reservationResult, setReservationResult] = useState<ReservationResult | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  
  // Initialize with today and tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [checkIn, setCheckIn] = useState<string>(today.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState<string>(tomorrow.toISOString().split('T')[0]);
  
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);

  // Derived state to check high season warning
  const isHighSeason = useMemo(() => {
    const d = new Date(checkIn);
    const month = d.getMonth();
    return month === 5 || month === 6 || month === 7 || month === 11;
  }, [checkIn]);

  useEffect(() => {
    // Pre-fetch extras
    facade.fetchAvailableExtras().then(extras => setAvailableExtras(extras));
  }, []);

  const handleSearchRooms = async () => {
    if (!customerName || !checkIn || !checkOut) return alert('Completa todos los campos');
    setLoading(true);
    try {
       const rooms = await facade.fetchAvailableRooms(new Date(checkIn), new Date(checkOut));
       setAvailableRooms(rooms);
       setStep(2);
    } finally {
       setLoading(false);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setStep(3);
  };

  const handleToggleExtra = (id: string) => {
    setSelectedExtraIds(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleConfirmReservation = async () => {
    if (!selectedRoomId) return;
    setLoading(true);
    
    const request: ReservationRequest = {
      customerName,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      roomId: selectedRoomId,
      selectedExtraIds
    };

    const result = await facade.processReservation(request);
    setReservationResult(result);
    setStep(4);
    setLoading(false);
  };

  const getExtraIcon = (id: string) => {
    switch(id) {
      case 'spa': return <Star className="text-pink-400" size={24}/>;
      case 'restaurant': return <Star className="text-yellow-400" size={24}/>;
      case 'transport': return <Star className="text-blue-400" size={24}/>;
      default: return <Plus size={24} />;
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header className="text-center mt-8 mb-4 animate-fade-in">
        <h1 className="title">Aurora Luxury Hotel</h1>
        <p className="subtitle">Experimenta la excelencia en cada detalle</p>
      </header>

      {/* Progress Indicator */}
      <div className="flex justify-center mb-8 gap-4 animate-fade-in">
        {[1, 2, 3, 4].map(num => (
          <div key={num} style={{
             width: '40px', height: '40px', borderRadius: '50%',
             display: 'flex', alignItems: 'center', justifyContent: 'center',
             background: step >= num ? 'var(--accent)' : 'var(--glass-bg)',
             color: step >= num ? '#000' : 'var(--text-muted)',
             fontWeight: 'bold',
             transition: 'all 0.3s ease'
          }}>
            {num}
          </div>
        ))}
      </div>

      <main>
        {/* STEP 1: Details & Dates */}
        {step === 1 && (
          <div className="glass-card animate-fade-in mx-auto" style={{ maxWidth: '600px' }}>
            <h2 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 600 }}>Tus Detalles</h2>
            <div className="form-group">
              <label className="form-label"><User size={16} style={{display:'inline', marginRight: '8px'}}/>Nombre del Huésped</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ej. Juan Pérez"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label"><Calendar size={16} style={{display:'inline', marginRight: '8px'}}/>Check-in</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label"><Calendar size={16} style={{display:'inline', marginRight: '8px'}}/>Check-out</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            {isHighSeason && (
               <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', marginTop: '1rem', borderRadius: '4px' }}>
                  <p style={{color: '#fca5a5', fontSize: '0.9rem'}}><strong>Nota:</strong> Las fechas seleccionadas corresponden a Temporada Alta. Las tarifas dinámicas aplicarán un recargo del 50%.</p>
               </div>
            )}

            <button 
              className="btn-primary mt-8" 
              onClick={handleSearchRooms}
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar Habitaciones'} <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: Room Selection */}
        {step === 2 && (
          <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-4">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Selecciona tu Habitación</h2>
                <button onClick={() => setStep(1)} style={{background:'transparent', color:'var(--text-muted)', border:'none', cursor:'pointer', textDecoration:'underline'}}>Volver</button>
             </div>
             
             <div className="grid-center gap-6">
                {availableRooms.map(room => (
                  <div key={room.id} className="glass-card flex flex-col" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ height: '200px', width: '100%', backgroundImage: `url(${room.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                       <div className="flex justify-between items-center mb-4">
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{room.name}</h3>
                       </div>
                       <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>{room.description}</p>
                       <div className="flex justify-between items-center">
                          <div>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>${room.basePrice}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / noche base</span>
                          </div>
                          <button className="btn-primary" onClick={() => handleSelectRoom(room.id)}>
                            Seleccionar
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* STEP 3: Extras Selection */}
        {step === 3 && (
          <div className="animate-fade-in mx-auto" style={{ maxWidth: '800px' }}>
            <h2 className="mb-4 text-center" style={{ fontSize: '1.8rem', fontWeight: 600 }}>Personaliza tu estadía</h2>
            <p className="text-center subtitle">Mejora tu experiencia con nuestros servicios premium.</p>

            <div className="grid-center gap-6 mb-8 mt-8">
              {availableExtras.map(extra => {
                 const isSelected = selectedExtraIds.includes(extra.id);
                 return (
                   <div 
                      key={extra.id} 
                      className="glass-card"
                      style={{ 
                        cursor: 'pointer',
                        borderColor: isSelected ? 'var(--accent)' : 'var(--glass-border)',
                        background: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'var(--glass-bg)',
                        transform: isSelected ? 'translateY(-5px)' : 'none'
                      }}
                      onClick={() => handleToggleExtra(extra.id)}
                   >
                     <div className="flex flex-col items-center text-center gap-4">
                        {getExtraIcon(extra.id)}
                        <h4 style={{fontSize: '1.2rem', fontWeight: '600'}}>{extra.name}</h4>
                        <p style={{color: 'var(--accent)', fontWeight: 'bold'}}>${extra.pricePerDay} <span style={{fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:'normal'}}>/ día</span></p>
                     </div>
                   </div>
                 );
              })}
            </div>

            <div className="flex justify-between mt-8">
              <button 
                  className="btn-primary" 
                  onClick={() => setStep(2)}
                  style={{ background: 'var(--glass-bg)', color: '#fff', border: '1px solid var(--border-color)' }}
                >
                  Volver
              </button>
              <button 
                className="btn-primary" 
                onClick={handleConfirmReservation}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Confirmar y Pagar'} <CheckCircle size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Summary & Key */}
        {step === 4 && reservationResult && reservationResult.success && reservationResult.invoice && (
          <div className="animate-fade-in mx-auto" style={{ maxWidth: '600px' }}>
             
             {/* Key Animation Card */}
             <div className="glass-card text-center mb-8" style={{ border: '1px solid var(--success)', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(21,28,44,0.6) 100%)' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <Key size={40} className="text-green-400" />
               </div>
               <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Reserva Confirmada</h2>
               <p style={{ color: 'var(--text-muted)' }}>Bienvenido, {customerName}. Tu llave digital ha sido generada.</p>
               
               <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem', fontFamily: 'monospace', fontSize: '1.5rem', letterSpacing: '4px', color: 'var(--success)' }}>
                  {reservationResult.digitalKey}
               </div>
               <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Utiliza este código para acceder a la habitación {reservationResult.room?.name}.</p>
             </div>

             {/* Billing Summary */}
             <div className="glass-card">
               <h3 style={{ fontSize: '1.3rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>Resumen de Facturación</h3>
               
               <div className="flex justify-between mb-2">
                 <span style={{ color: 'var(--text-muted)' }}>Habitación ({reservationResult.invoice.seasonText})</span>
                 <span>${reservationResult.invoice.roomTotal.toFixed(2)}</span>
               </div>
               {reservationResult.invoice.extrasTotal > 0 && (
                 <div className="flex justify-between mb-2">
                   <span style={{ color: 'var(--text-muted)' }}>Servicios Extras</span>
                   <span>${reservationResult.invoice.extrasTotal.toFixed(2)}</span>
                 </div>
               )}
               <div className="flex justify-between mb-4">
                 <span style={{ color: 'var(--text-muted)' }}>Impuestos (16%)</span>
                 <span>${reservationResult.invoice.taxes.toFixed(2)}</span>
               </div>
               
               <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                 <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Total Pagado</span>
                 <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>${reservationResult.invoice.grandTotal.toFixed(2)}</span>
               </div>
             </div>

             <div className="text-center mt-8">
               <button onClick={() => { setStep(1); setCustomerName(''); setSelectedExtraIds([]); setSelectedRoomId(null); setReservationResult(null); }} style={{background:'transparent', color:'var(--text-muted)', border:'none', cursor:'pointer', textDecoration:'underline'}}>
                 Hacer nueva reserva
               </button>
             </div>
          </div>
        )}

        {step === 4 && reservationResult && !reservationResult.success && (
          <div className="glass-card text-center text-red-500 max-w-md mx-auto">
             <h2>Error al procesar la reserva</h2>
             <p>{reservationResult.error}</p>
             <button className="btn-primary mt-4" onClick={() => setStep(1)}>Volver a intentar</button>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
