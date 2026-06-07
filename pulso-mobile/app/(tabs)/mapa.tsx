import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';
import ErrorState from '@/components/ErrorState/ErrorState';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useMapa } from '@/hooks/useMapa';

// O HTML do Leaflet avisa o React Native quando está pronto via postMessage({type:'ready'}).
// Só então o RN envia os dados do GeoJSON. Resolve a race condition com o CDN.
const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
  <style>
    body { margin:0; padding:0; background:#0e0f11; }
    #map { width:100%; height:100vh; }
    #offline { display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
                color:#9b9ea6; font-family:sans-serif; font-size:14px; text-align:center; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="offline">Sem conexão com os tiles do mapa.<br>Os dados ainda são exibidos.</div>
  <script>
    var map, layer, pendingData = null;

    function getColor(val, max) {
      var t = Math.min(1, Math.max(0, val / (max || 1)));
      if (t < 0.5) {
        var s = t * 2;
        return 'rgb('+Math.round(61+(245-61)*s)+','+Math.round(220+(166-220)*s)+','+Math.round(132+(35-132)*s)+')';
      }
      var s = (t - 0.5) * 2;
      return 'rgb('+Math.round(245+(255-245)*s)+','+Math.round(166+(71-166)*s)+','+Math.round(35+(87-35)*s)+')';
    }

    function render(fc) {
      if (!fc || !fc.features || fc.features.length === 0) return;
      if (layer) map.removeLayer(layer);
      var vals = fc.features.map(function(f){ return f.properties.valor; });
      var max = Math.max.apply(null, vals) || 1;
      layer = L.geoJSON(fc, {
        pointToLayer: function(f, latlng) {
          return L.circleMarker(latlng, {
            radius: 18, fillColor: getColor(f.properties.valor, max),
            color: '#000', weight: 0.5, opacity: 0.7, fillOpacity: 0.78
          });
        },
        onEachFeature: function(f, l) {
          var p = f.properties;
          l.bindPopup(
            '<b>' + p.zonaNome + '</b><br>' +
            p.valor.toFixed(2) + ' ' + p.unidade
          );
        }
      }).addTo(map);
    }

    function handleMessage(e) {
      try {
        var msg = JSON.parse(e.data);
        // Dado GeoJSON real: tem campo "type" === "FeatureCollection"
        if (msg.type === 'FeatureCollection') {
          render(msg);
        }
      } catch(_) {}
    }

    // Aguarda o Leaflet carregar do CDN antes de avisar o React Native
    function waitForLeafletAndInit() {
      if (typeof L === 'undefined') {
        setTimeout(waitForLeafletAndInit, 100);
        return;
      }
      map = L.map('map', { zoomControl: true }).setView([-23.5505, -46.6333], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM',
        errorTileUrl: ''  // tile offline não quebra o mapa
      }).addTo(map);

      // Avisa o React Native que está pronto para receber dados
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'leaflet_ready' }));
      }

      // Se já havia dado esperando, renderiza agora
      if (pendingData) { render(pendingData); pendingData = null; }

      // Ouve mensagens do React Native
      document.addEventListener('message', handleMessage);
      window.addEventListener('message', handleMessage);
    }

    waitForLeafletAndInit();
  </script>
</body>
</html>
`;

export default function MapaScreen() {
  const { data, camada, loading, error, toggleCamada, refetch } = useMapa();
  const webviewRef = useRef<WebView>(null);
  // Controla se o Leaflet já inicializou dentro do WebView
  const [leafletReady, setLeafletReady] = useState(false);

  // Envia GeoJSON para o WebView — só quando os dois estão prontos
  const sendData = useCallback(() => {
    if (data && leafletReady && webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify(data));
    }
  }, [data, leafletReady]);

  // Re-envia sempre que dados ou prontidão do Leaflet mudarem
  useEffect(() => { sendData(); }, [sendData]);

  // Recebe mensagem de "leaflet_ready" do WebView
  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as { type: string };
      if (msg.type === 'leaflet_ready') setLeafletReady(true);
    } catch {}
  }, []);

  // Reset da prontidão quando o WebView recarrega (ex: mudança de camada)
  const handleLoadStart = useCallback(() => setLeafletReady(false), []);

  return (
    <View style={styles.container}>
      {/* Toggle de camada */}
      <View style={styles.toggle}>
        {(['no2', 'temperatura'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.toggleBtn, camada === t && styles.toggleActive]}
            onPress={toggleCamada}
            disabled={loading}
          >
            <Text style={[styles.toggleText, camada === t && styles.toggleTextActive]}>
              {t === 'no2' ? 'NO₂' : 'Temperatura'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? (
        <ErrorState message={error} onRetry={refetch} style={styles.fill} />
      ) : (
        <View style={styles.fill}>
          <WebView
            ref={webviewRef}
            source={{ html: LEAFLET_HTML }}
            style={styles.fill}
            javaScriptEnabled
            // Essencial para postMessage funcionar no Android
            originWhitelist={['*']}
            // Permite HTTP tiles no Android (OpenStreetMap)
            mixedContentMode="always"
            onMessage={handleWebViewMessage}
            onLoadStart={handleLoadStart}
          />
          {/* Loading overlay — aparece enquanto dados ou Leaflet não estão prontos */}
          {(loading || !leafletReady) && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.bom} />
              {!leafletReady && (
                <Text style={styles.loadingText}>Carregando mapa...</Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Legenda */}
      <View style={styles.legend}>
        {[
          { color: Colors.heatLow, label: 'Baixo' },
          { color: Colors.heatMid, label: 'Médio' },
          { color: Colors.heatHigh, label: 'Alto' },
        ].map(({ color, label }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
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
  loadingOverlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(14,15,17,0.72)',
    gap: 10,
  },
  loadingText: { color: Colors.textMuted, fontSize: Typography.size.sm },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: Colors.bg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: Colors.textMuted, fontSize: Typography.size.xs },
  legendUnit: { color: Colors.textDim, fontSize: Typography.size.xs, marginLeft: 4 },
});
