import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCars, createCar, deleteCar, decodeVin, type Car } from '../api/cars';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [vin, setVin] = useState('');
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState('');

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');

  useEffect(() => {
    loadCars();
  }, []);

  async function loadCars() {
    setLoading(true);
    const data = await getCars();
    setCars(data);
    setLoading(false);
  }

  async function handleDecodeVin() {
    if (vin.length !== 17) {
      setVinError('VIN musi mieć dokładnie 17 znaków');
      return;
    }
    setVinLoading(true);
    setVinError('');
    try {
      const decoded = await decodeVin(vin);
      setMake(decoded.make);
      setModel(decoded.model);
      if (decoded.year) setYear(String(decoded.year));
    } catch (err: any) {
      setVinError(err.response?.data?.message || 'Nie udało się rozpoznać auta po VIN');
    } finally {
      setVinLoading(false);
    }
  }

  async function handleAddCar(e: React.FormEvent) {
    e.preventDefault();
    await createCar({
      make,
      model,
      year: Number(year),
      currentMileage: Number(mileage),
      vin: vin || undefined,
    });
    setVin('');
    setMake('');
    setModel('');
    setYear('');
    setMileage('');
    setVinError('');
    setShowForm(false);
    loadCars();
  }

  async function handleDelete(id: string) {
    await deleteCar(id);
    loadCars();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Witaj, {user?.email}!</h1>
        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Wyloguj się
        </button>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {showForm ? 'Anuluj' : '+ Dodaj samochód'}
      </button>

      {showForm && (
        <form onSubmit={handleAddCar} className="bg-white p-6 rounded-lg shadow mb-6 max-w-md">
          <label className="text-sm text-gray-600">VIN (opcjonalnie — rozpozna auto automatycznie)</label>
          <div className="flex gap-2 mb-1">
            <input
              type="text"
              placeholder="17-znakowy numer VIN"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              maxLength={17}
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              type="button"
              onClick={handleDecodeVin}
              disabled={vinLoading}
              className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {vinLoading ? 'Sprawdzam...' : 'Rozpoznaj auto'}
            </button>
          </div>
          {vinError && <p className="text-red-500 text-sm mb-3">{vinError}</p>}
          {!vinError && <div className="mb-3" />}

          <input
            type="text" placeholder="Marka" value={make}
            onChange={(e) => setMake(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <input
            type="text" placeholder="Model" value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <input
            type="number" placeholder="Rok produkcji" value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <input
            type="number" placeholder="Aktualny przebieg (km)" value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Zapisz
          </button>
        </form>
      )}

      {loading ? (
        <p>Ładowanie...</p>
      ) : cars.length === 0 ? (
        <p className="text-gray-500">Nie masz jeszcze żadnego samochodu. Dodaj pierwszy!</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <div key={car.id} className="bg-white p-4 rounded-lg shadow">
              <Link to={`/cars/${car.id}`} className="font-bold text-lg text-blue-600 hover:underline">
                {car.make} {car.model}
              </Link>
              <p className="text-gray-600">Rok: {car.year}</p>
              <p className="text-gray-600">Przebieg: {car.currentMileage.toLocaleString()} km</p>
              <button
                onClick={() => handleDelete(car.id)}
                className="mt-3 text-red-500 text-sm hover:underline"
              >
                Usuń
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
