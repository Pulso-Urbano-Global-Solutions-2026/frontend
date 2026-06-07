import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView from 'react-native-webview';
import ErrorState from '@/components/ErrorState/ErrorState';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useMapa } from '@/hooks/useMapa';

// HTML estático — sem interpolação de dados.
// Dados chegam depois via postMessage() do lado React Native.
const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
  <style>body{margin:0;padding:0}#map{width:100%;height:100vh}</style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([-23.5505, -46.6333], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    var layer = null;

    function getColor(val, max) {
      var t = Math.min(1, Math.max(0, val / max));
      if (t < 0.5) {
        var r = Math.round(61 + (245-61)*t*2), g = Math.round(220 + (166-220)*t*2), b = Math.round(132 + (35-132)*t*2);
      } else {
        var s = (t-0.5)*2;
        var r = Math.round(245 + (255-245)*s), g = Math.round(166 + (71-166)*s), b = Math.round(35 + (87-35)*s);
      }
      return 'rgb('+r+','+g+','+b+')';
    }

    function render(fc) {
      if (layer) map.removeLayer(layer);
      var vals = fc.features.map(function(f){ return f.properties.valor; });
      var max = Math.max.apply(null, vals) || 1;
      layer = L.geoJSON(fc, {
        pointToLayer: function(f, latlng) {
          return L.circleMarker(latlng, {
            radius: 14, fillColor: getColor(f.properties.valor, max),
            color: '#000', weight: 0.5, opacity: 0.8, fillOpacity: 0.75
          });
        },
        onEachFeature: function(f, l) {
          l.bindPopup(f.properties.zonaNome + '<br>' + f.properties.valor + ' ' + f.properties.unidade);
        }
      }).addTo(map);
    }

    document.addEventListener('message', function(e){ render(JSON.parse(e.data)); });
    window.addEventListener('message',   function(e){ render(JSON.parse(e.data)); });
  </script>
</body>
</html>
`;

export default function MapaScreen() {
  const { data, camada, loading, error, toggleCamada, refetch } = useMapa();
  const webviewRef = useRef<WebView>(null);

  const sendData = useCallback(() => {
    if (data && webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify(data));
    }
  }, [data]);

  useEffect(() => { sendData(); }, [sendData]);

  return (
    <View style={styles.container}>
      {/* Toggle */}
      <View style={styles.toggle}>
        {(['no2', 'temperatura'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.toggleBtn, camada === t && styles.toggleActive]}
            onPress={toggleCamada}
          >
            <Text style={[styles.toggleText, camada === t && styles.toggleTextActive]}>
              {t === 'no2' ? 'NO₂' : 'Temperatura'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mapa */}
      {error ? (
        <ErrorState message={error} onRetry={refetch} style={styles.fill} />
      ) : (
        <View style={styles.fill}>
          <WebView
            ref={webviewRef}
            source={{ html: LEAFLET_HTML }}
            onLoadEnd={sendData}
            style={styles.fill}
            javaScriptEnabled
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.bom} />
            </View>
          )}
        </View>
      )}

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: Colors.heatLow }]} />
        <Text style={styles.legendText}>Baixo</Text>
        <View style={[styles.legendDot, { backgroundColor: Colors.heatMid }]} />
        <Text style={styles.legendText}>Médio</Text>
        <View style={[styles.legendDot, { backgroundColor: Colors.heatHigh }]} />
        <Text style={styles.legendText}>Alto</Text>
        <Text style={styles.legendUnit}>{camada === 'no2' ? '(ppb)' : '(°C)'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  fill: { flex: 1 },
  toggle: { flexDirection: 'row', padding: 8, gap: 8, backgroundColor: Colors.bg },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: Colors.surface },
  toggleActive: { backgroundColor: Colors.surface2, borderWidth: 1, borderColor: Colors.border },
  toggleText: { color: Colors.textMuted, fontSize: Typography.size.sm },
  toggleTextActive: { color: Colors.text, fontWeight: '600' },
  loadingOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(14,15,17,0.6)' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: Colors.bg },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: Colors.textMuted, fontSize: Typography.size.xs },
  legendUnit: { color: Colors.textDim, fontSize: Typography.size.xs, marginLeft: 4 },
});
