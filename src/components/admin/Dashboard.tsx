import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { AdminData } from "../../types/admin";

interface DashboardProps {
  data: AdminData;
}

export default function Dashboard({ data }: DashboardProps) {
  const [counts, setCounts] = useState({
    websites: data.websites?.length || 0,
    mobileApps: data.mobileApps?.length || 0,
    software: data.software?.length || 0,
    digitalCards: data.digitalCards?.length || 0,
    marketingClients: data.marketingClients?.length || 0,
    figma: 0,
  });
  const [websitesByType, setWebsitesByType] = useState<Record<string, number>>(
    {},
  );
  const [figmaByType, setFigmaByType] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    const fetchCounts = async () => {
      try {
        const [
          websitesRes,
          appsRes,
          softwareRes,
          cardsRes,
          clientsRes,
          figmaRes,
        ] = await Promise.all([
          api.get("/projects"),
          api.get("/mobile-apps"),
          api.get("/software"),
          api.get("/digital-cards"),
          api.get("/marketing-clients"),
          api.get("/figma-designs"),
        ]);

        const toCount = (res: any) => {
          if (Array.isArray(res.data)) return res.data.length;
          if (Array.isArray(res.data?.data)) return res.data.data.length;
          if (Array.isArray(res.data?.items)) return res.data.items.length;
          return 0;
        };
        const toList = (res: any) => {
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res.data?.data)) return res.data.data;
          if (Array.isArray(res.data?.items)) return res.data.items;
          return [];
        };
        const groupBy = (arr: any[], picker: (x: any) => string) => {
          const map: Record<string, number> = {};
          for (const item of arr) {
            const key = picker(item) || "Unknown";
            map[key] = (map[key] || 0) + 1;
          }
          return map;
        };

        if (mounted) {
          setCounts({
            websites: toCount(websitesRes),
            mobileApps: toCount(appsRes),
            software: toCount(softwareRes),
            digitalCards: toCount(cardsRes),
            marketingClients: toCount(clientsRes),
            figma: toCount(figmaRes),
          });
          const websiteList = toList(websitesRes);
          const figmaList = toList(figmaRes);
          setWebsitesByType(
            groupBy(websiteList, (x) => x.type || x.language || "Unknown"),
          );
          setFigmaByType(
            groupBy(figmaList, (x) =>
              (x.type || "application").replace(
                "saas-dashboard",
                "SaaS Dashboard",
              ),
            ),
          );
        }
      } catch {
        if (mounted) {
          setCounts({
            websites: data.websites?.length || 0,
            mobileApps: data.mobileApps?.length || 0,
            software: data.software?.length || 0,
            digitalCards: data.digitalCards?.length || 0,
            marketingClients: data.marketingClients?.length || 0,
            figma: 0,
          });
          const wb: Record<string, number> = {};
          for (const w of data.websites || []) {
            const key = (w as any).type || w.language || "Unknown";
            wb[key] = (wb[key] || 0) + 1;
          }
          setWebsitesByType(wb);
          setFigmaByType({});
        }
      }
    };
    fetchCounts();
    return () => {
      mounted = false;
    };
  }, [data]);

return (
  <div className="p-8 bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">

    {/* Header */}
    <div className="mb-10 flex justify-between items-center">

      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Admin Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Overview of all projects
        </p>
      </div>

      <div className="bg-white px-5 py-3 rounded-xl shadow">
        Total Projects

        <div className="text-2xl font-bold text-blue-600">
          {counts.websites +
            counts.mobileApps +
            counts.software +
            counts.digitalCards +
            counts.marketingClients +
            counts.figma}
        </div>
      </div>

    </div>



    {/* Big Stats */}
    <div className="grid md:grid-cols-3 gap-6 mb-10">

      <div className="bg-white/70 backdrop-blur-lg border border-white rounded-3xl p-7 shadow-lg">

        <p className="text-gray-500">
          Websites
        </p>

        <div className="text-5xl font-bold mt-3 text-blue-600">
          {counts.websites}
        </div>

      </div>



      <div className="bg-white/70 backdrop-blur-lg border border-white rounded-3xl p-7 shadow-lg">

        <p className="text-gray-500">
          Mobile Apps
        </p>

        <div className="text-5xl font-bold mt-3 text-purple-600">
          {counts.mobileApps}
        </div>

      </div>



      <div className="bg-white/70 backdrop-blur-lg border border-white rounded-3xl p-7 shadow-lg">

        <p className="text-gray-500">
          Software
        </p>

        <div className="text-5xl font-bold mt-3 text-green-600">
          {counts.software}
        </div>

      </div>

    </div>



    {/* Second Row */}
    <div className="grid md:grid-cols-3 gap-6 mb-10">


      <div className="bg-white rounded-3xl p-6 shadow-lg">

        <h2 className="font-semibold mb-4 text-gray-700">
          Digital Cards
        </h2>

        <div className="text-4xl font-bold text-orange-500">
          {counts.digitalCards}
        </div>

      </div>


      <div className="bg-white rounded-3xl p-6 shadow-lg">

        <h2 className="font-semibold mb-4 text-gray-700">
          Marketing Clients
        </h2>

        <div className="text-4xl font-bold text-pink-500">
          {counts.marketingClients}
        </div>

      </div>


      <div className="bg-white rounded-3xl p-6 shadow-lg">

        <h2 className="font-semibold mb-4 text-gray-700">
          Figma Designs
        </h2>

        <div className="text-4xl font-bold text-indigo-600">
          {counts.figma}
        </div>

      </div>

    </div>



    {/* Tables */}
    <div className="grid lg:grid-cols-2 gap-6">


      {/* Website Types */}
      <div className="bg-white rounded-3xl shadow-lg p-6">

        <h2 className="text-xl font-semibold mb-6">
          Website Categories
        </h2>

        {Object.entries(websitesByType).length === 0 ? (
          <p className="text-gray-500">
            No Data
          </p>
        ) : (
          Object.entries(websitesByType)
            .sort((a, b) => b[1] - a[1])
            .map(([key, val]) => (

              <div
                key={key}
                className="flex justify-between mb-3"
              >

                <span>
                  {key}
                </span>

                <span className="font-bold text-blue-600">
                  {val}
                </span>

              </div>

            ))
        )}

      </div>



      {/* Figma Types */}
      <div className="bg-white rounded-3xl shadow-lg p-6">

        <h2 className="text-xl font-semibold mb-6">
          Figma Categories
        </h2>

        {Object.entries(figmaByType).length === 0 ? (
          <p className="text-gray-500">
            No Data
          </p>
        ) : (
          Object.entries(figmaByType)
            .sort((a, b) => b[1] - a[1])
            .map(([key, val]) => (

              <div
                key={key}
                className="flex justify-between mb-3"
              >

                <span>
                  {key}
                </span>

                <span className="font-bold text-indigo-600">
                  {val}
                </span>

              </div>

            ))
        )}

      </div>

    </div>

  </div>
);
}
