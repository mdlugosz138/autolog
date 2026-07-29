import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCar, type Car } from '../api/cars';
import {
  getRefuels, createRefuel, updateRefuel, deleteRefuel, getConsumptionStats,
  type Refuel, type ConsumptionStats,
} from '../api/refuels';
import {
  getRepairs, createRepair, updateRepair, deleteRepair, getRepairsTotal,
  type Repair, type RepairsTotal,
} from '../api/repairs';

export default function CarDetails() {
  const { carId } = useParams<{ carId: string }>();
  const [car, setCar] = useState<Car | null>(null);
  const [refuels, setRefuels] = useState<Refuel[]>([]);
  const [stats, setStats] = useState<ConsumptionStats | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [repairsTotal, setRepairsTotal] = useState<RepairsTotal | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState('');
  const [liters, setLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [mileage, setMileage] = useState('');
  const [fullTank, setFullTank] = useState(true);

  const [editingRefuelId, setEditingRefuelId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editLiters, setEditLiters] = useState('');
  const [editPricePerLiter, setEditPricePerLiter] = useState('');
  const [editMileage, setEditMileage] = useState('');
  const [editFullTank, setEditFullTank] = useState(true);

  const [showRepairForm, setShowRepairForm] = useState(false);
  const [repairType, setRepairType] = useState('');
  const [repairDate, setRepairDate] = useState('');
  const [repairMileage, setRepairMileage] = useState('');
  const [repairCost, setRepairCost] = useState('');
  const [repairNotes, setRepairNotes] = useState('');

  const [editingRepairId, setEditingRepairId] = useState<string | null>(null);
  const [editRepairType, setEditRepairType] = useState('');
  const [editRepairDate, setEditRepairDate] = useState('');
  const [editRepairMileage, setEditRepairMileage] = useState('');
  const [editRepairCost, setEditRepairCost] = useState('');
  const [editRepairNotes, setEditRepairNotes] = useState('');

  useEffect(() => {
    if (carId) loadAll();
  }, [carId]);

  async function loadAll() {
    if (!carId) return;
    setLoading(true);
    const [carData, refuelsData, statsData, repairsData, repairsTotalData] = await Promise.all([
      getCar(carId),
      getRefuels(carId),
      getConsumptionStats(carId),
      getRepairs(carId),
      getRepairsTotal(carId),
    ]);
    setCar(carData);
    setRefuels(refuelsData);
    setStats(statsData);
    setRepairs(repairsData);
    setRepairsTotal(repairsTotalData);
    setLoading(false);
  }

  async function handleAddRefuel(e: React.FormEvent) {
    e.preventDefault();
    if (!carId) return;
    await createRefuel(carId, {
      date,
      liters: Number(liters),
      pricePerLiter: Number(pricePerLiter),
      mileage: Number(mileage),
      fullTank,
    });
    setDate('');
    setLiters('');
    setPricePerLiter('');
    setMileage('');
    setShowForm(false);
    loadAll();
  }

  async function handleDeleteRefuel(id: string) {
    if (!carId) return;
    await deleteRefuel(carId, id);
    loadAll();
  }

  function startEditRefuel(r: Refuel) {
    setEditingRefuelId(r.id);
    setEditDate(r.date.slice(0, 10));
    setEditLiters(String(r.liters));
    setEditPricePerLiter(String(r.pricePerLiter));
    setEditMileage(String(r.mileage));
    setEditFullTank(r.fullTank);
  }

  function cancelEditRefuel() {
    setEditingRefuelId(null);
  }

  async function handleUpdateRefuel(e: React.FormEvent) {
    e.preventDefault();
    if (!carId || !editingRefuelId) return;
    await updateRefuel(carId, editingRefuelId, {
      date: editDate,
      liters: Number(editLiters),
      pricePerLiter: Number(editPricePerLiter),
      mileage: Number(editMileage),
      fullTank: editFullTank,
    });
    setEditingRefuelId(null);
    loadAll();
  }

  async function handleAddRepair(e: React.FormEvent) {
    e.preventDefault();
    if (!carId) return;
    await createRepair(carId, {
      type: repairType,
      date: repairDate,
      mileage: Number(repairMileage),
      cost: Number(repairCost),
      notes: repairNotes || undefined,
    });
    setRepairType('');
    setRepairDate('');
    setRepairMileage('');
    setRepairCost('');
    setRepairNotes('');
    setShowRepairForm(false);
    loadAll();
  }

  async function handleDeleteRepair(id: string) {
    if (!carId) return;
    await deleteRepair(carId, id);
    loadAll();
  }

  function startEditRepair(r: Repair) {
    setEditingRepairId(r.id);
    setEditRepairType(r.type);
    setEditRepairDate(r.date.slice(0, 10));
    setEditRepairMileage(String(r.mileage));
    setEditRepairCost(String(r.cost));
    setEditRepairNotes(r.notes ?? '');
  }

  function cancelEditRepair() {
    setEditingRepairId(null);
  }

  async function handleUpdateRepair(e: React.FormEvent) {
    e.preventDefault();
    if (!carId || !editingRepairId) return;
    await updateRepair(carId, editingRepairId, {
      type: editRepairType,
      date: editRepairDate,
      mileage: Number(editRepairMileage),
      cost: Number(editRepairCost),
      notes: editRepairNotes || undefined,
    });
    setEditingRepairId(null);
    loadAll();
  }

  if (loading) return <p className="p-8">Ładowanie...</p>;
  if (!car) return <p className="p-8">Nie znaleziono samochodu.</p>;

  const chartData = stats?.dataPoints.map((p) => ({
    date: new Date(p.date).toLocaleDateString('pl-PL'),
    spalanie: p.consumptionPer100km,
  })) ?? [];

  const totalFuelCost = refuels.reduce((sum, r) => sum + r.totalCost, 0);
  const overallTotal = totalFuelCost + (repairsTotal?.totalCost ?? 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link to="/dashboard" className="text-blue-600 hover:underline">&larr; Powrót do listy</Link>

      <h1 className="text-2xl font-bold mt-4 mb-2">{car.make} {car.model} ({car.year})</h1>
      <p className="text-gray-600 mb-6">Aktualny przebieg: {car.currentMileage.toLocaleString()} km</p>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-8">
        <div>
          <p className="text-sm text-gray-500">Średnie spalanie</p>
          <p className="text-2xl font-bold">
            {stats?.averageConsumption ? `${stats.averageConsumption} l/100km` : 'brak danych'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Koszt paliwa</p>
          <p className="text-2xl font-bold">{totalFuelCost.toFixed(2)} zł</p>
          <p className="text-xs text-gray-400">{refuels.length} tankowań</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Koszt napraw</p>
          <p className="text-2xl font-bold">
            {repairsTotal ? `${repairsTotal.totalCost.toFixed(2)} zł` : '0 zł'}
          </p>
          <p className="text-xs text-gray-400">{repairsTotal?.repairsCount ?? 0} napraw(y)</p>
        </div>
        <div className="border-l pl-8">
          <p className="text-sm text-gray-500">Łącznie wydane</p>
          <p className="text-2xl font-bold text-blue-600">{overallTotal.toFixed(2)} zł</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="font-semibold mb-4">Spalanie w czasie</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit=" l" />
              <Tooltip />
              <Line type="monotone" dataKey="spalanie" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Tankowania</h2>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {showForm ? 'Anuluj' : '+ Dodaj tankowanie'}
      </button>

      {showForm && (
        <form onSubmit={handleAddRefuel} className="bg-white p-6 rounded-lg shadow mb-6 max-w-md">
          <label className="text-sm text-gray-600">Data</label>
          <input
            type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <label className="text-sm text-gray-600">Litry</label>
          <input
            type="number" step="0.01" value={liters} onChange={(e) => setLiters(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <label className="text-sm text-gray-600">Cena za litr</label>
          <input
            type="number" step="0.01" value={pricePerLiter} onChange={(e) => setPricePerLiter(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <label className="text-sm text-gray-600">Przebieg (km)</label>
          <input
            type="number" value={mileage} onChange={(e) => setMileage(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <label className="flex items-center gap-2 mb-4">
            <input type="checkbox" checked={fullTank} onChange={(e) => setFullTank(e.target.checked)} />
            <span className="text-sm text-gray-600">Pełny bak</span>
          </label>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Zapisz
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden mb-10">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Litry</th>
              <th className="p-3">Cena/l</th>
              <th className="p-3">Koszt</th>
              <th className="p-3">Przebieg</th>
              <th className="p-3">Pełny bak</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {refuels.map((r) =>
              editingRefuelId === r.id ? (
                <tr key={r.id} className="border-t bg-blue-50">
                  <td className="p-2">
                    <input
                      type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number" step="0.01" value={editLiters} onChange={(e) => setEditLiters(e.target.value)}
                      className="w-20 border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number" step="0.01" value={editPricePerLiter}
                      onChange={(e) => setEditPricePerLiter(e.target.value)}
                      className="w-20 border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2 text-gray-400 text-sm">przeliczy się</td>
                  <td className="p-2">
                    <input
                      type="number" value={editMileage} onChange={(e) => setEditMileage(e.target.value)}
                      className="w-24 border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox" checked={editFullTank}
                      onChange={(e) => setEditFullTank(e.target.checked)}
                    />
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <button onClick={handleUpdateRefuel} className="text-green-600 text-sm hover:underline mr-3">
                      Zapisz
                    </button>
                    <button onClick={cancelEditRefuel} className="text-gray-500 text-sm hover:underline">
                      Anuluj
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{new Date(r.date).toLocaleDateString('pl-PL')}</td>
                  <td className="p-3">{r.liters} l</td>
                  <td className="p-3">{r.pricePerLiter} zł</td>
                  <td className="p-3">{r.totalCost} zł</td>
                  <td className="p-3">{r.mileage.toLocaleString()} km</td>
                  <td className="p-3">{r.fullTank ? '✅' : '—'}</td>
                  <td className="p-3 whitespace-nowrap">
                    <button onClick={() => startEditRefuel(r)} className="text-blue-600 text-sm hover:underline mr-3">
                      Edytuj
                    </button>
                    <button onClick={() => handleDeleteRefuel(r.id)} className="text-red-500 text-sm hover:underline">
                      Usuń
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-bold mb-4">Naprawy i serwisy</h2>

      <button
        onClick={() => setShowRepairForm(!showRepairForm)}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {showRepairForm ? 'Anuluj' : '+ Dodaj naprawę'}
      </button>

      {showRepairForm && (
        <form onSubmit={handleAddRepair} className="bg-white p-6 rounded-lg shadow mb-6 max-w-md">
          <label className="text-sm text-gray-600">Typ naprawy</label>
          <input
            type="text" placeholder="np. Wymiana oleju" value={repairType}
            onChange={(e) => setRepairType(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <label className="text-sm text-gray-600">Data</label>
          <input
            type="date" value={repairDate} onChange={(e) => setRepairDate(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <label className="text-sm text-gray-600">Przebieg (km)</label>
          <input
            type="number" value={repairMileage} onChange={(e) => setRepairMileage(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <label className="text-sm text-gray-600">Koszt (zł)</label>
          <input
            type="number" step="0.01" value={repairCost} onChange={(e) => setRepairCost(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3" required
          />
          <label className="text-sm text-gray-600">Notatki (opcjonalnie)</label>
          <input
            type="text" value={repairNotes} onChange={(e) => setRepairNotes(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            Zapisz
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="p-3">Typ</th>
              <th className="p-3">Data</th>
              <th className="p-3">Przebieg</th>
              <th className="p-3">Koszt</th>
              <th className="p-3">Notatki</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((r) =>
              editingRepairId === r.id ? (
                <tr key={r.id} className="border-t bg-blue-50">
                  <td className="p-2">
                    <input
                      type="text" value={editRepairType} onChange={(e) => setEditRepairType(e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="date" value={editRepairDate} onChange={(e) => setEditRepairDate(e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number" value={editRepairMileage} onChange={(e) => setEditRepairMileage(e.target.value)}
                      className="w-24 border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number" step="0.01" value={editRepairCost}
                      onChange={(e) => setEditRepairCost(e.target.value)}
                      className="w-20 border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text" value={editRepairNotes} onChange={(e) => setEditRepairNotes(e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    />
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <button onClick={handleUpdateRepair} className="text-green-600 text-sm hover:underline mr-3">
                      Zapisz
                    </button>
                    <button onClick={cancelEditRepair} className="text-gray-500 text-sm hover:underline">
                      Anuluj
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.type}</td>
                  <td className="p-3">{new Date(r.date).toLocaleDateString('pl-PL')}</td>
                  <td className="p-3">{r.mileage.toLocaleString()} km</td>
                  <td className="p-3">{r.cost.toFixed(2)} zł</td>
                  <td className="p-3 text-gray-500 text-sm">{r.notes || '—'}</td>
                  <td className="p-3 whitespace-nowrap">
                    <button onClick={() => startEditRepair(r)} className="text-blue-600 text-sm hover:underline mr-3">
                      Edytuj
                    </button>
                    <button onClick={() => handleDeleteRepair(r.id)} className="text-red-500 text-sm hover:underline">
                      Usuń
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
