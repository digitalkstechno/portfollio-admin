import { AdminData } from '../../types/admin';

interface DashboardProps {
  data: AdminData;
}

export default function Dashboard({ data }: DashboardProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Websites</h2>
          <p className="text-3xl font-bold text-blue-600">
            {data.websites?.length || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Mobile Apps</h2>
          <p className="text-3xl font-bold text-blue-600">
            {data.mobileApps?.length || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Software</h2>
          <p className="text-3xl font-bold text-blue-600">
            {data.software?.length || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Digital Cards</h2>
          <p className="text-3xl font-bold text-blue-600">
            {data.digitalCards?.length || 0}
          </p>
        </div>
 
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Marketing Clients</h2>
          <p className="text-3xl font-bold text-blue-600">
            {data.marketingClients?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
