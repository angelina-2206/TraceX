import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertTriangle, Building2, Globe, DollarSign, Info, ShieldAlert, ArrowRight } from 'lucide-react';
import { CaseDetail } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { useTheme } from '../../context/ThemeContext';

// Custom Leaflet Markers with pulse rings and crisp contrast
const bankIcon = L.divIcon({
  className: 'custom-bank-marker',
  html: '<div style="background-color:#0D9488; width:18px; height:18px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 12px rgba(13,148,136,0.8); display:flex; align-items:center; justify-content:center;"><div style="width:6px; height:6px; background:#ffffff; border-radius:50%;"></div></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const ipIcon = L.divIcon({
  className: 'custom-ip-marker',
  html: '<div style="background-color:#DC2626; width:18px; height:18px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 12px rgba(220,38,38,0.8); display:flex; align-items:center; justify-content:center;"><div style="width:6px; height:6px; background:#ffffff; border-radius:50%;"></div></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
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
  const { theme } = useTheme();
  const geo = caseDetail.geo_financial;

  const tileUrl = theme === 'dark'
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── Page Header ── */}
      <PageHeader
        breadcrumbs={['ANVESHAK', caseDetail.case_id, 'Threat Intelligence', 'Geo & Financial Map']}
        title="Geo-Financial Intelligence & Infrastructure Map"
        description="Extracts financial beneficiary entities, bank IFSC branch geolocations, and contrasts with origin server IP coordinates."
        metadata={
          <>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--border)] font-medium text-[var(--text-secondary)]">
              Case {caseDetail.case_id}
            </span>
            {geo && (
              <span className="px-2.5 py-0.5 rounded-full badge-critical flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                Cross-Border Discrepancy Flagged
              </span>
            )}
          </>
        }
      />

      {!geo ? (
        <div className="tracex-card p-10 text-center text-[var(--text-muted)] text-xs">
          No financial payout entities or bank account details extracted in current case ({caseDetail.case_id}).
        </div>
      ) : (
        <div className="space-y-6">
          {/* Explicit Uncertainty Disclaimer Banner */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[var(--text-primary)] text-xs flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                FORENSIC UNCERTAINTY & ATTRIBUTION LIMIT
              </span>
              <p className="text-[var(--text-secondary)] mt-1 leading-relaxed">
                {geo.uncertainty_disclaimer}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Map (Left 2 columns) */}
            <div className="lg:col-span-2 tracex-card h-[500px] relative overflow-hidden p-0 rounded-lg border border-[var(--border)]">
              <MapContainer
                center={[geo.lat, geo.lng]}
                zoom={4}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors / Esri'
                  url={tileUrl}
                  maxZoom={16}
                />
                
                <MapRecenter lat1={geo.lat} lng1={geo.lng} lat2={geo.ip_lat} lng2={geo.ip_lng} />

                {/* Bank Branch Marker (Teal) */}
                <Marker position={[geo.lat, geo.lng]} icon={bankIcon}>
                  <Popup className="text-xs">
                    <div className="space-y-1">
                      <strong className="text-teal-700 font-bold">FINANCIAL PAYOUT DESTINATION:</strong><br />
                      <strong>Bank:</strong> {geo.bank_name}<br />
                      <strong>IFSC:</strong> {geo.ifsc_code}<br />
                      <strong>Branch:</strong> {geo.branch_city}, India
                    </div>
                  </Popup>
                </Marker>

                {/* Server IP Origin Marker (Red) */}
                <Marker position={[geo.ip_lat, geo.ip_lng]} icon={ipIcon}>
                  <Popup className="text-xs">
                    <div className="space-y-1">
                      <strong className="text-red-700 font-bold">TECHNICAL ORIGIN SERVER:</strong><br />
                      <strong>Region:</strong> {geo.ip_geolocation}<br />
                      <strong>Coords:</strong> {geo.ip_lat}, {geo.ip_lng}
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>

              {/* Map Legend Overlay */}
              <div className="absolute bottom-4 left-4 z-[400] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] rounded-md px-3 py-2 text-xs shadow-md space-y-1.5 pointer-events-auto">
                <div className="font-semibold text-[10px] uppercase text-[var(--text-muted)] tracking-wider">Map Legend</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600 border border-white shrink-0" />
                  <span className="text-[var(--text-primary)] font-medium">Origin IP: {geo.ip_geolocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-600 border border-white shrink-0" />
                  <span className="text-[var(--text-primary)] font-medium">Payout Bank: {geo.branch_city}, India</span>
                </div>
              </div>
            </div>

            {/* Financial Entity Details (Right column) */}
            <div className="tracex-card p-6 space-y-4 text-xs flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border)] pb-3">
                  <span>EXTRACTED FINANCIAL DETAILS</span>
                </h3>

                <div className="space-y-3.5">
                  <div className="p-3 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] text-[10px] font-semibold uppercase block">BENEFICIARY NAME</span>
                    <p className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{geo.beneficiary_name}</p>
                  </div>

                  <div className="p-3 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] text-[10px] font-semibold uppercase block">BANK & IFSC BRANCH</span>
                    <p className="text-[var(--blue-primary)] font-semibold mt-0.5">{geo.bank_name}</p>
                    <p className="text-[var(--text-secondary)] text-xs mt-0.5 font-mono">
                      IFSC: <code className="text-teal-600 dark:text-teal-400 font-bold">{geo.ifsc_code}</code> ({geo.branch_name})
                    </p>
                  </div>

                  <div className="p-3 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] text-[10px] font-semibold uppercase block">REQUESTED PAYOUT AMOUNT</span>
                    <p className="text-rose-600 dark:text-rose-400 font-bold text-base mt-0.5 code-mono">{geo.amount_requested}</p>
                  </div>

                  <div className="p-3 rounded-md bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[var(--text-muted)] text-[10px] font-semibold uppercase block">MASKED ACCOUNT NUMBER</span>
                    <p className="text-[var(--text-primary)] code-mono font-medium mt-0.5">{geo.account_number_masked}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] space-y-1 bg-red-500/5 p-3 rounded-md border-red-500/20">
                <div className="text-red-600 dark:text-red-400 font-semibold text-[10px] uppercase flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>GEOGRAPHIC DISTANCE DISCREPANCY</span>
                </div>
                <div className="text-[var(--text-secondary)] text-xs leading-relaxed">
                  Server IP location is in <strong className="text-[var(--text-primary)]">{geo.ip_geolocation}</strong>, while payout bank is in <strong className="text-[var(--text-primary)]">{geo.branch_city}, India</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
