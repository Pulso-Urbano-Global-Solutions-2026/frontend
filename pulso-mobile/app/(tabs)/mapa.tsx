import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';
import { Logo } from '@/components/Logo/Logo';
import ErrorState from '@/components/ErrorState/ErrorState';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useMapa } from '@/hooks/useMapa';

// Dark-themed Leaflet map — popups, tiles and circles all follow the app palette.
// Zero-value zones render gray with "Dados em processamento" instead of misleading 0.00.
const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0e0f11; }
    #map { width: 100%; height: 100vh; }
    /* Dark popup */
    .leaflet-popup-content-wrapper {
      background: #161719; border: 1px solid #252729;
      border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.6);
    }
    .leaflet-popup-tip-container { display: none; }
    .leaflet-popup-content { margin: 10px 14px; }
    .popup-nome { font-weight: 700; font-size: 13px; color: #f0f0ed; margin-bottom: 3px;
                  font-family: -apple-system, sans-serif; }
    .popup-valor { font-size: 12px; color: #9b9ea6; font-family: -apple-system, sans-serif; }
    .popup-zero  { font-size: 11px; color: #5a5e68; font-style: italic;
                   font-family: -apple-system, sans-serif; }
    /* Darken tiles to match dark UI */
    .leaflet-tile { filter: brightness(0.55) saturate(0.5); }
    /* Hide Leaflet attribution (show in RN instead) */
    .leaflet-control-attribution { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map, layer;

    function getColor(val, max) {
      if (val === 0 || max === 0) return '#44474f'; // muted gray for zero / no-data
      var t = Math.min(1, Math.max(0, val / max));
      if (t < 0.5) {
        var s = t * 2;
        return 'rgb('+Math.round(61+(245-61)*s)+','+Math.round(220+(166-220)*s)+','+Math.round(132+(35-132)*s)+')';
      }
      var s = (t - 0.5) * 2;
      return 'rgb('+Math.round(245+(255-245)*s)+','+Math.round(166+(71-166)*s)+','+Math.round(35+(87-35)*s)+')';
    }

    function render(fc) {
      if (!fc || !fc.features || fc.features.length === 0) return;
      if (layer) { map.removeLayer(layer); layer = null; }

      var vals = fc.features.map(function(f) { return f.properties.valor || 0; });
      var max  = Math.max.apply(null, vals); // 0 when all zero → getColor returns gray

      layer = L.geoJSON(fc, {
        pointToLayer: function(f, latlng) {
          var val = f.properties.valor || 0;
          return L.circleMarker(latlng, {
            radius: 20,
            fillColor: getColor(val, max),
            color: val === 0 ? '#44474f' : 'rgba(0,0,0,0.4)',
            weight: 1,
            opacity: 0.7,
            fillOpacity: val === 0 ? 0.35 : 0.78,
          });
        },
        onEachFeature: function(f, l) {
          var p   = f.properties;
          var val = p.valor || 0;
          var valorHtml = val > 0
            ? '<div class="popup-valor">' + val.toFixed(2) + ' ' + p.unidade + '</div>'
            : '<div class="popup-zero">Dados em processamento</div>';
          l.bindPopup('<div class="popup-nome">' + p.zonaNome + '</div>' + valorHtml, {
            closeButton: false, maxWidth: 160,
          });
        },
      }).addTo(map);

      // Auto-fit to the returned points with generous padding
      try { map.fitBounds(layer.getBounds(), { padding: [36, 36], maxZoom: 12 }); }
      catch (_) {}
    }

    function handleMessage(e) {
      try {
        var msg = JSON.parse(e.data);
        if (msg.type === 'FeatureCollection') render(msg);
      } catch (_) {}
    }

    function waitForLeafletAndInit() {
      if (typeof L === 'undefined') { setTimeout(waitForLeafletAndInit, 100); return; }

      map = L.map('map', { zoomControl: true })
             .setView([-23.5505, -46.6333], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        errorTileUrl: '',
      }).addTo(map);

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'leaflet_ready' }));
      }

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
  const router = useRouter();
  const webviewRef = useRef<WebView>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  const sendData = useCallback(() => {
    if (data && leafletReady && webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify(data));
    }
  }, [data, leafletReady]);

  useEffect(() => { sendData(); }, [sendData]);

  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as { type: string };
      if (msg.type === 'leaflet_ready') setLeafletReady(true);
    } catch {}
  }, []);

  const handleLoadStart = useCallback(() => setLeafletReady(false), []);

  const allZero =
    data !== null &&
    data.features.length > 0 &&
    data.features.every((f) => (f.properties.valor ?? 0) === 0);

  // Format "2026-06-07" → "07/06/2026" without timezone shift
  const dtLabel = data
    ? data.dtCaptura.split('-').reverse().join('/')
    : null;

  return (
    <View style={styles.container}>
      {/* ── Header: toggle + fonte info ─────────────────── */}
      <View style={styles.header}>
        <View style={styles.toggle}>
          {(['no2', 'temperatura'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.toggleBtn, camada === t && styles.toggleActive]}
              onPress={toggleCamada}
              disabled={loading}
            >
              {camada === t && (
                <Ionicons name="checkmark" size={14} color={Colors.cyan} style={{ marginRight: 4 }} />
              )}
              <Text style={[styles.toggleText, camada === t && styles.toggleTextActive]}>
                {t === 'no2' ? 'NO₂' : 'Temperatura'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.vulnBtn}
          onPress={() => router.push('/vulnerabilidade')}
        >
          <Ionicons name="warning-outline" size={16} color={Colors.moderado} />
          <Text style={styles.vulnBtnText}>Ver urgência por bairro</Text>
        </TouchableOpacity>

        {data && (
          <Text style={styles.fonte}>
            {data.fonte} · {dtLabel}
          </Text>
        )}
      </View>

      {/* ── Banner: dados em processamento ──────────────── */}
      {allZero && !loading && (
        <View style={styles.zeroBanner}>
          <Ionicons name="time-outline" size={14} color={Colors.moderado} style={{ marginRight: 6 }} />
          <Text style={styles.zeroBannerText}>
            Dados do satélite em processamento — próxima passagem orbital pendente
          </Text>
          <TouchableOpacity onPress={() => router.push('/detalhes')} style={{ marginLeft: 8 }}>
            <Text style={styles.zeroBannerLink}>Saber mais</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Mapa ────────────────────────────────────────── */}
      {error ? (
        <ErrorState message={error} onRetry={refetch} style={styles.fill} />
      ) : (
        <View style={styles.fill}>
          <WebView
            ref={webviewRef}
            source={{ html: LEAFLET_HTML }}
            style={styles.fill}
            javaScriptEnabled
            originWhitelist={['*']}
            mixedContentMode="always"
            onMessage={handleWebViewMessage}
            onLoadStart={handleLoadStart}
          />
          {(loading || !leafletReady) && (
            <View style={styles.loadingOverlay}>
              <Logo animated size={48} />
              <Text style={styles.loadingText}>
                {!leafletReady ? 'Carregando mapa...' : 'Buscando dados...'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── Legenda ─────────────────────────────────────── */}
      <View style={styles.legend}>
        {allZero ? (
          <>
            <View style={[styles.legendDot, { backgroundColor: '#44474f' }]} />
            <Text style={styles.legendMuted}>Sem dados disponíveis</Text>
          </>
        ) : (
          <>
            {[
              { color: Colors.heatLow,  label: 'Baixo'  },
              { color: Colors.heatMid,  label: 'Médio'  },
              { color: Colors.heatHigh, label: 'Alto'   },
            ].map(({ color, label }) => (
              <View key={label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendText}>{label}</Text>
              </View>
            ))}
            <Text style={styles.legendUnit}>
              {camada === 'no2' ? '(ppb)' : '(°C)'}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  fill:      { flex: 1 },

  header: {
    backgroundColor: Colors.bg,
    paddingHorizontal: 8, paddingTop: 8, paddingBottom: 6,
    gap: 6,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  toggle:          { flexDirection: 'row', gap: 8 },
  toggleBtn:       {
    flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  toggleActive:    { backgroundColor: Colors.cyanDim, borderWidth: 1, borderColor: Colors.cyan },
  toggleText:      { fontFamily: Typography.font.body, color: Colors.textMuted, fontSize: Typography.size.sm },
  toggleTextActive:{ fontFamily: Typography.font.subheading, color: Colors.cyan },
  fonte:           { color: Colors.textDim, fontSize: Typography.size.xs, textAlign: 'center' },

  zeroBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1200',
    borderBottomWidth: 1, borderBottomColor: Colors.moderado,
    paddingVertical: 7, paddingHorizontal: 12,
  },
  zeroBannerText: {
    fontFamily: Typography.font.body,
    flex: 1, color: Colors.moderado, fontSize: Typography.size.xs, lineHeight: 18,
  },
  zeroBannerLink: {
    fontFamily: Typography.font.subheading,
    color: Colors.cyan, fontSize: Typography.size.xs,
  },

  loadingOverlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(14,15,17,0.82)',
    gap: 12,
  },
  loadingText: { fontFamily: Typography.font.mono, color: Colors.textMuted, fontSize: Typography.size.sm },

  legend: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: Colors.bg,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: Colors.textMuted, fontSize: Typography.size.xs },
  legendMuted:{ color: Colors.textDim,   fontSize: Typography.size.xs },
  legendUnit: { color: Colors.textDim,   fontSize: Typography.size.xs, marginLeft: 4 },
  vulnBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    margin: 8, marginTop: 0, padding: 10, borderRadius: 8,
    backgroundColor: Colors.moderadoDim,
    borderWidth: 1, borderColor: Colors.moderado,
  },
  vulnBtnText: {
    color: Colors.moderado, fontSize: Typography.size.sm, fontWeight: '600',
  },
});
