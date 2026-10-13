import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

interface PeruMapProps {
  selectedDepartment?: string;
  onSelectDepartment?: (departmentName: string) => void;
}

// Helper para ignorar mayúsculas, tildes y espacios extras
const normalize = (text?: string) =>
  text
    ? text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
    : '';

export const PeruMap: React.FC<PeruMapProps> = ({ selectedDepartment, onSelectDepartment }) => {
  const selectedNormalized = normalize(selectedDepartment);
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch('/peru.json')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error('Error al cargar el mapa de Perú:', err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-between p-6 bg-slate-900/60 border border-slate-800 rounded-xl h-full min-h-[600px] w-full">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider self-center">
        Ubicación Geográfica
      </h4>

      {/* Contenedor del mapa */}
      <div className="flex-1 w-full flex items-center justify-center my-2 overflow-hidden">
        {geoData ? (
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1850, // Reducido de 2300 a 1850 para ajustar el tamaño del mapa
              center: [-75.2, -9.3],
            }}
            className="w-full h-full max-h-[480px]"
          >
            <Geographies geography={geoData}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo) => {
                  const deptName =
                    geo.properties.NOMBDEP ||
                    geo.properties.NAME_1 ||
                    geo.properties.name ||
                    '';
                  const deptNormalized = normalize(deptName);
                  const isSelected =
                    selectedNormalized !== '' && selectedNormalized === deptNormalized;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => onSelectDepartment?.(deptName)}
                      className={`cursor-pointer outline-none transition-all duration-300 stroke-[1.5] ${
                        isSelected
                          ? 'fill-[#00E5FF] stroke-[#00B8D4] drop-shadow-[0_0_20px_rgba(0,229,255,0.85)] z-20'
                          : 'fill-[#1E293B] stroke-[#0F172A] hover:fill-[#334155]'
                      }`}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-500">
            Cargando mapa real...
          </div>
        )}
      </div>

      <div className="text-center mt-2">
        {selectedDepartment ? (
          <span className="text-xs font-medium text-[#00E5FF] bg-cyan-950/80 border border-cyan-800/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-lg shadow-cyan-950/50">
            📍 {selectedDepartment}
          </span>
        ) : (
          <span className="text-xs text-slate-500">Haz clic en un cliente para ver su departamento</span>
        )}
      </div>
    </div>
  );
};