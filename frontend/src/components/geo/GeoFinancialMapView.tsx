import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertTriangle, Building2, Globe, DollarSign, Info } from 'lucide-react';
import { CaseDetail } from '../../types';

// Custom Leaflet Markers
const bankIcon = L.divIcon({
  className: 'custom-bank-marker',
  html: '<div style="background-color:#10b981; width:16px; height:16px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 10px #10b981;"></div>',
  iconSize: [16, 16]
});

const ipIcon = L.divIcon({
  className: 'custom-ip-marker',
  html: '<div style="background-color:#ef4444; width:16px; height:16px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 10px #ef4444;"></div>',
  iconSize: [16, 16]
});

const MapRecenter: React.FC<{ lat1: number; lng1: number; lat2: number; lng2: number }> = ({ lat1, lng1, lat2, lng2 }) => {
  const map = useMap();
  useEffect(() => {
    if (lat1 && lng1 && lat2 && lng2) {
      const bounds = L.latLngBounds([[lat1, lng1], [lat2, lng2]]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }, [lat1, lng1, lat2, lng2, map]);
  return null;
};

interface GeoFinancialMapViewProps {
  caseDetail: CaseDetail;
}

export const GeoFinancialMapView: React.FC<GeoFinancialMapViewProps> = ({ caseDetail }) => {
  const geo = caseDetail.geo_financial;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <span>GEO-FINANCIAL FORENSIC INTELLIGENCE — PAYOUT & INFRASTRUCTURE MAP</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Extracts financial beneficiary names, bank IFSC branch coordinates, and contrasts with technical server IP geolocations.
        </p>
      </div>

      {!geo ? (
        <div className="forensic-card p-8 text-center text-slate-400 font-mono text-xs">
          No financial payout entities or bank account details extracted in current case ({caseDetail.case_id}).
        </div>
      ) : (
        <div className="space-y-6">
          {/* Explicit Uncertainty Disclaimer Banner */}
          <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-800 text-amber-200 font-mono text-xs flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-amber-300">FORENSIC UNCERTAINTY & ATTRIBUTION LIMIT</span>
              <p className="text-slate-300 mt-1 leading-relaxed">
                {geo.uncertainty_disclaimer}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Map (Left 2 columns) */}
            <div className="lg:col-span-2 forensic-card h-[480px] relative overflow-hidden rounded-lg">
              <MapContainer
                center={[geo.lat, geo.lng]}
                zoom={4}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={16}
                />
                
                <MapRecenter lat1={geo.lat} lng1={geo.lng} lat2={geo.ip_lat} lng2={geo.ip_lng} />

                {/* Bank Branch Marker (Green) */}
                <Marker position={[geo.lat, geo.lng]} icon={bankIcon}>
                  <Popup className="font-mono text-xs">
                    <div>
                      <strong>FINANCIAL DESTINATION ({caseDetail.case_id}):</strong><br />
                      Bank: {geo.bank_name}<br />
                      IFSC: {geo.ifsc_code}<br />
                      Branch: {geo.branch_city}, India
                    </div>
                  </Popup>
                </Marker>

                {/* Server IP Origin Marker (Red) */}
                <Marker position={[geo.ip_lat, geo.ip_lng]} icon={ipIcon}>
                  <Popup className="font-mono text-xs">
                    <div>
                      <strong>TECHNICAL ORIGIN IP ({caseDetail.case_id}):</strong><br />
                      Region: {geo.ip_geolocation}<br />
                      Coords: {geo.ip_lat}, {geo.ip_lng}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* Financial Entity Details (Right column) */}
            <div className="forensic-card p-6 space-y-4 font-mono text-xs">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>EXTRACTED FINANCIAL DETAILS</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 text-[11px]">BENEFICIARY NAME:</span>
                  <p className="text-slate-100 font-bold text-sm mt-0.5">{geo.beneficiary_name}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">BANK & IFSC BRANCH:</span>
                  <p className="text-cyan-300 font-semibold mt-0.5">{geo.bank_name}</p>
                  <p className="text-slate-300 text-[11px]">IFSC: <code className="text-emerald-400">{geo.ifsc_code}</code> ({geo.branch_name})</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">REQUESTED PAYOUT AMOUNT:</span>
                  <p className="text-emerald-400 font-bold text-base mt-0.5">{geo.amount_requested}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px]">MASKED ACCOUNT NUMBER:</span>
                  <p className="text-slate-200 mt-0.5">{geo.account_number_masked}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[11px]">LOCATION MISMATCH STATUS:</span>
                  <div className={`px-2.5 py-1 rounded border font-bold text-[10px] uppercase w-max tracking-wide ${
                    geo.location_mismatch
                      ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                      : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                  }`}>
                    {geo.location_mismatch
                      ? `CROSS-REGION MISMATCH (${geo.ip_geolocation.split(',')[0]} ➔ ${geo.branch_city || 'India'})`
                      : 'DOMESTIC ROUTING MATCH'}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Technical Origin: <span className="text-rose-400">{geo.ip_geolocation}</span> | Payout Branch: <span className="text-emerald-400">{geo.branch_city}, {geo.branch_state}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
