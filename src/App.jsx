import { useState, useEffect } from "react";

// ─── AJUSTE 1: q2 reemplazada por rentabilidad (ya no duplica liquidez)
// ─── AJUSTE 2: pesos globales balanceados (tal/tec suben, fin baja)
// ─── AJUSTE 3: hallazgos específicos por pregunta más baja, no genéricos
// ─── AJUSTE 4: CTA personalizado por paquete
// ─── AJUSTE 5: insight sectorial en resultado

const PREGUNTAS = [
  {
    id: "q1",
    numero: "01",
    dim: "fin",
    pregunta: "Cuando termina el mes, ¿sabes exactamente cuánto dinero te queda después de pagar todo?",
    subtexto: "Sin adivinar. Sin revisar el banco a ver qué hay.",
    opciones: [
      { texto: "Sí, lo tengo claro con días de anticipación", valor: 4, dims: { fin: 4 } },
      { texto: "Más o menos, reviso el banco cada semana", valor: 2, dims: { fin: 2 } },
      { texto: "Generalmente me sorprende lo que queda", valor: 1, dims: { fin: 1 } },
      { texto: "Casi siempre hay faltante o pido prestado para cerrar", valor: 0, dims: { fin: 0, crisis: true } },
    ],
    hallazgos: {
      0: "Tu empresa tiene una hemorragia de efectivo activa. Estás cerrando meses con faltante y recurriendo a deuda para operar — eso es la señal más clara de que el problema financiero necesita atención esta semana, no el próximo mes.",
      1: "No sabes cuánto dinero tienes hasta que ya no lo tienes. Sin visibilidad de tu flujo de caja, cada decisión de gasto es una apuesta.",
      2: "Tienes control básico, pero reaccionar cuando ya hay déficit es 30 días tarde. La meta es anticiparte, no perseguir el problema.",
      4: null,
    }
  },
  // ── AJUSTE: q2 ahora mide rentabilidad, no cartera (era duplicado de liquidez)
  {
    id: "q2",
    numero: "02",
    dim: "fin",
    pregunta: "Al final del mes, ¿tu empresa genera utilidades reales después de pagarte a ti y a todos los gastos?",
    subtexto: "No ventas, no ingresos. Utilidad neta: lo que queda cuando ya pagaste todo.",
    opciones: [
      { texto: "Sí, hay utilidad consistente mes a mes", valor: 4, dims: { fin: 4 } },
      { texto: "Algunos meses sí, otros meses no — es irregular", valor: 2, dims: { fin: 2 } },
      { texto: "Casi nunca quedan utilidades, el negocio 'se gasta solo'", valor: 1, dims: { fin: 1 } },
      { texto: "Estoy operando a pérdida o sin saber si gano o pierdo", valor: 0, dims: { fin: 0, crisis: true } },
    ],
    hallazgos: {
      0: "Tu empresa está operando a pérdida o sin saber si gana o pierde. Vender más sin saber tu margen real solo agranda el hoyo.",
      1: "Tu negocio genera movimiento de dinero pero no riqueza. La diferencia entre ventas y utilidades es donde se esconden los problemas de costos.",
      2: "Rentabilidad irregular significa que algo en tus costos o en tu mezcla de productos está fuera de control. Necesitas saber qué meses pierdes y por qué.",
      4: null,
    }
  },
  {
    id: "q3",
    numero: "03",
    dim: "mkt",
    pregunta: "Si hoy pierdes a tu cliente más grande, ¿cuánto tiempo sobrevive tu empresa sin él?",
    subtexto: "Sé honesto. Esta respuesta es solo para ti.",
    opciones: [
      { texto: "Más de 6 meses, tengo cartera diversificada", valor: 4, dims: { mkt: 4, fin: 3 } },
      { texto: "Entre 3 y 6 meses, me afecta pero no me mata", valor: 3, dims: { mkt: 3, fin: 2 } },
      { texto: "Menos de 3 meses, sería un golpe muy serio", valor: 1, dims: { mkt: 1, fin: 1 } },
      { texto: "No sobrevivo — representa más del 60% de mis ventas", valor: 0, dims: { mkt: 0, fin: 0, crisis: true } },
    ],
    hallazgos: {
      0: "Un solo cliente tiene más poder sobre tu empresa que tú mismo. Eso no es una relación comercial, es una dependencia existencial. El día que ese cliente cambie de proveedor, de giro o simplemente pague tarde, tu empresa entra en crisis.",
      1: "Sobrevivirías, pero un golpe de 3 meses en una MiPyme deja cicatrices profundas. Diversificar tu cartera de clientes es la prioridad de mercado más rentable que puedes tener.",
      2: null,
      4: null,
    }
  },
  {
    id: "q4",
    numero: "04",
    dim: "ops",
    pregunta: "¿Tus procesos clave están documentados y los puede ejecutar alguien que no seas tú?",
    subtexto: "Ventas, producción, atención al cliente — lo que hace funcionar el negocio diario.",
    opciones: [
      { texto: "Sí, tengo manuales y el equipo los sigue", valor: 4, dims: { ops: 4 } },
      { texto: "Algunos están escritos, pero dependen de ciertas personas", valor: 2, dims: { ops: 2 } },
      { texto: "Están en la cabeza de la gente, no en papel", valor: 1, dims: { ops: 1 } },
      { texto: "Si yo o alguien clave falta, la operación se para", valor: 0, dims: { ops: 0, crisis: true } },
    ],
    hallazgos: {
      0: "Tu empresa no tiene procesos — tiene personas insustituibles. Cuando una de ellas se enferma, renuncia o simplemente tiene un mal día, el negocio lo siente. Eso es fragilidad operativa pura.",
      1: "Los procesos en la cabeza de la gente son los más caros: se van con ellos. Sin documentación, cada contratación nueva empieza desde cero.",
      2: "Tienes algo documentado, pero la dependencia en personas clave sigue siendo tu talón de Aquiles. Un proceso a medias es mejor que ninguno, pero no es suficiente.",
      4: null,
    }
  },
  {
    id: "q5",
    numero: "05",
    dim: "mkt",
    pregunta: "En los últimos 12 meses, ¿tus ventas crecieron?",
    subtexto: "Compara contra el año anterior. En unidades o clientes reales, sin contar inflación.",
    opciones: [
      { texto: "Más del 15% — crecimos con fuerza", valor: 4, dims: { mkt: 4 } },
      { texto: "Entre 5% y 15% — crecimiento moderado", valor: 3, dims: { mkt: 3 } },
      { texto: "Igual o menos del 5% — prácticamente planas", valor: 1, dims: { mkt: 1 } },
      { texto: "Bajaron — este año vendí menos que el anterior", valor: 0, dims: { mkt: 0, crisis: true } },
    ],
    hallazgos: {
      0: "Tus ventas están cayendo. En un mercado con inflación, vender menos en pesos constantes significa que estás perdiendo clientes, participación de mercado o ambas.",
      1: "Ventas planas en un mercado que crece significa que estás retrocediendo relativamente. No estás perdiendo clientes visibles, pero sí estás perdiendo terreno.",
      2: null,
      4: null,
    }
  },
  {
    id: "q6",
    numero: "06",
    dim: "tal",
    pregunta: "¿Cómo está el compromiso y desempeño de tu equipo hoy?",
    subtexto: "Piensa en los primeros 3 colaboradores que se te vienen a la mente.",
    opciones: [
      { texto: "Alto — entregan resultados y se ponen la camiseta", valor: 4, dims: { tal: 4 } },
      { texto: "Regular — cumplen pero no dan más de lo pedido", valor: 2, dims: { tal: 2 } },
      { texto: "Bajo — hay rotación frecuente y poca motivación", valor: 1, dims: { tal: 1 } },
      { texto: "Tengo conflictos activos o gente que genera más problemas que soluciones", valor: 0, dims: { tal: 0 } },
    ],
    hallazgos: {
      0: "Tienes conflictos activos en el equipo. Eso no solo afecta el clima laboral — drena tu energía como líder, contamina al resto del equipo y le cuesta dinero real a la empresa en productividad perdida.",
      1: "Alta rotación es el síntoma más caro del talento mal gestionado. Cada salida tiene un costo de reemplazo de entre 1 y 3 meses de salario, más el tiempo de curva de aprendizaje.",
      2: "Un equipo que solo cumple lo mínimo no es un problema de personas — es un problema de liderazgo y sistema. La mediocridad colectiva se gestiona, no se tolera.",
      4: null,
    }
  },
  {
    id: "q7",
    numero: "07",
    dim: "tec",
    pregunta: "¿Con qué base tomas las decisiones importantes de tu negocio?",
    subtexto: "Precios, contrataciones, qué producir más, dónde invertir.",
    opciones: [
      { texto: "Con datos — tengo indicadores que reviso regularmente", valor: 4, dims: { tec: 4 } },
      { texto: "Mezclo datos con experiencia e intuición", valor: 2, dims: { tec: 2 } },
      { texto: "Principalmente con experiencia e intuición", valor: 1, dims: { tec: 1 } },
      { texto: "Sobre la marcha — no tengo información organizada", valor: 0, dims: { tec: 0 } },
    ],
    hallazgos: {
      0: "Estás tomando decisiones de negocio con los ojos cerrados. Sin información organizada, cada decisión importante es una apuesta — y algunas de esas apuestas tienen consecuencias que no se pueden revertir.",
      1: "La intuición funcionó para llegar hasta aquí. El problema es que a partir de cierto tamaño, la intuición sola ya no alcanza. Las decisiones se vuelven demasiado complejas para no tener datos.",
      2: null,
      4: null,
    }
  },
];

// ─── INSIGHTS SECTORIALES (AJUSTE 5) ─────────────────────────────────────────
const INSIGHTS_SECTOR = {
  "Manufactura": {
    rescate:      "El 58% de MiPymes manufactureras en Latam entran en crisis por costos de producción descontrolados, no por falta de ventas.",
    estructura:   "Las manufactureras que implementan control de OEE en 90 días reducen desperdicio entre 12% y 18% en promedio.",
    escala:       "La brecha más común en manufactura MiPyme es el OEE: el sector opera en promedio al 52% cuando el benchmark saludable es 65%.",
    inteligencia: "Las manufactureras que adoptan BI para control de inventario reducen capital inmovilizado hasta un 22%.",
  },
  "Retail": {
    rescate:      "El 61% de los cierres de retail MiPyme en Latam ocurren por exceso de inventario inmovilizado, no por bajas ventas.",
    estructura:   "Implementar un sistema ABC de inventario tarda menos de 30 días y reduce rupturas de stock hasta un 40%.",
    escala:       "La rotación de inventario promedio en retail MiPyme Latam es 3.1x — el benchmark saludable para tu sector es 5x.",
    inteligencia: "Los retailers que miden conversión por canal incrementan su ticket promedio entre 8% y 15% en el primer trimestre.",
  },
  "Consultoría": {
    rescate:      "En consultoría MiPyme, la cartera vencida mayor a 60 días es la causa #1 de crisis de liquidez — no la falta de proyectos.",
    estructura:   "Las firmas consultoras que implementan pipeline tracking duplican su tasa de cierre en 6 meses.",
    escala:       "La utilización billable promedio en consultoría MiPyme Latam es del 52% — hay casi 20 puntos de eficiencia sin explotar.",
    inteligencia: "Las firmas con NPS medido sistemáticamente retienen el 78% de sus clientes vs 54% de las que no lo miden.",
  },
  "SaaS": {
    rescate:      "Un churn mensual mayor al 7% significa que estás perdiendo tu base de clientes completa cada 14 meses.",
    estructura:   "El 70% de los SaaS que escalan primero documentan su proceso de onboarding — eso sube la activación hasta un 35%.",
    escala:       "El LTV/CAC promedio en SaaS MiPyme Latam es 1.8x — el benchmark saludable para escalar con capital es 3x.",
    inteligencia: "Los SaaS que implementan NRR tracking identifican expansión revenue 3 meses antes de que se haga visible en ARR.",
  },
  "Agroindustria": {
    rescate:      "Las pérdidas post-cosecha no identificadas representan en promedio el 11% del costo total en agroindustria MiPyme.",
    estructura:   "Implementar trazabilidad básica por lote reduce no conformidades de inocuidad hasta en un 60% en el primer ciclo.",
    escala:       "La variabilidad del ciclo productivo en agro MiPyme Latam es 2.3x mayor a la de empresas con planificación formal.",
    inteligencia: "Las agroindustriales con modelo predictivo de demanda reducen inventario de perecederos hasta un 28%.",
  },
  "Turismo": {
    rescate:      "El 55% de los hoteles boutique y hostales MiPyme en Latam operan con una dependencia de OTAs mayor al 70% — eso destruye margen.",
    estructura:   "Migrar aunque sea el 20% de reservas al canal directo incrementa el margen por habitación entre 15% y 22%.",
    escala:       "El RevPAR promedio en turismo MiPyme Latam está 31% por debajo del benchmark de establecimientos con gestión activa de revenue.",
    inteligencia: "Los establecimientos que miden NPS post-estancia mejoran su ranking en plataformas digitales en promedio 0.4 estrellas en 90 días.",
  },
};

// ─── LÓGICA DE DIAGNÓSTICO ────────────────────────────────────────────────────
function calcularDiagnostico(respuestas, sector) {
  const dims = { fin: 0, ops: 0, mkt: 0, tal: 0, tec: 0 };
  let crisisFlags = 0;
  let peorPreguntaScore = 999;
  let peorPreguntaIdx = 0;

  PREGUNTAS.forEach((p, i) => {
    const r = respuestas[i];
    if (r === null || r === undefined) return;
    const op = p.opciones[r];
    Object.entries(op.dims).forEach(([k, v]) => {
      if (k === "crisis") { crisisFlags++; return; }
      dims[k] = (dims[k] || 0) + v;
    });
    // Track peor respuesta para hallazgo específico
    if (op.valor < peorPreguntaScore) {
      peorPreguntaScore = op.valor;
      peorPreguntaIdx = i;
    }
  });

  // Normalize dims 0-100 por máximo posible real de cada dim
  const maxPosible = { fin: 8, ops: 4, mkt: 8, tal: 4, tec: 4 };
  const scores = {};
  Object.keys(dims).forEach(k => {
    scores[k] = Math.round(Math.min(100, (dims[k] / (maxPosible[k] || 1)) * 100));
  });

  // ─── AJUSTE 2: pesos balanceados (tal/tec aumentaron, fin bajó)
  const global = Math.round(
    scores.fin * 0.28 +
    scores.ops * 0.22 +
    scores.mkt * 0.22 +
    scores.tal * 0.15 +   // era 0.10
    scores.tec * 0.13     // era 0.10
  );

  // Dimensión con score más bajo = dolor principal
  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  const dolorPrincipal = sorted[0][0];
  const dolorSecundario = sorted[1][0];

  // Paquete
  let paquete;
  if (crisisFlags >= 2 || global <= 35) paquete = "rescate";
  else if (global <= 55) paquete = "estructura";
  else if (global <= 74) paquete = "escala";
  else paquete = "inteligencia";

  // ─── AJUSTE 3: hallazgo específico desde la pregunta más baja respondida
  const peorPregunta = PREGUNTAS[peorPreguntaIdx];
  const respIdx = respuestas[peorPreguntaIdx];
  const valorRespuesta = peorPregunta.opciones[respIdx].valor;
  const hallazgoEspecifico =
    peorPregunta.hallazgos[valorRespuesta] ||
    peorPregunta.hallazgos[Math.max(0, valorRespuesta - 1)] ||
    "Tu empresa tiene oportunidades de mejora significativas en múltiples frentes.";

  // Insight sectorial
  const insightSect = sector && INSIGHTS_SECTOR[sector]
    ? INSIGHTS_SECTOR[sector][paquete]
    : null;

  // ─── AJUSTE 4: CTA personalizado por paquete
  const ctasPorPaquete = {
    rescate:      { titulo: "Necesito una sesión de emergencia", sub: "Sin costo. 45 minutos. Esta semana." },
    estructura:   { titulo: "Quiero ordenar mi empresa", sub: "Diagnóstico completo en 5 días hábiles." },
    escala:       { titulo: "Quiero crecer con metodología", sub: "Benchmark sectorial incluido." },
    inteligencia: { titulo: "Quiero decidir con datos", sub: "Modelos predictivos aplicados a tu sector." },
  };

  return {
    scores, global, dolorPrincipal, dolorSecundario,
    hallazgo: hallazgoEspecifico,
    paquete, crisisFlags,
    insightSect,
    cta: ctasPorPaquete[paquete],
  };
}

// ─── METADATA ────────────────────────────────────────────────────────────────
const DIM_META = {
  fin: { label: "Financiero",  icon: "◆", color: "#2563EB" },
  ops: { label: "Operaciones", icon: "⚙", color: "#0D9488" },
  mkt: { label: "Mercado",     icon: "◈", color: "#7C3AED" },
  tal: { label: "Talento",     icon: "●", color: "#D97706" },
  tec: { label: "Tecnología",  icon: "⬡", color: "#DC2626" },
};

const PAQUETE_INFO = {
  rescate: {
    nombre: "RESCATE", emoji: "🔴", urgencia: "URGENTE",
    color: "#DC2626",
    bg: "linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)",
    tagline: "Intervención inmediata. Antes de crecer, hay que sobrevivir.",
  },
  estructura: {
    nombre: "ESTRUCTURA", emoji: "🟡", urgencia: "PRIORITARIO",
    color: "#D97706",
    bg: "linear-gradient(135deg, #78350F 0%, #92400E 100%)",
    tagline: "Tu empresa funciona, pero aún no trabaja para ti.",
  },
  escala: {
    nombre: "ESCALA", emoji: "🔵", urgencia: "ESTRATÉGICO",
    color: "#2563EB",
    bg: "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)",
    tagline: "Tienes una empresa sana. ¿Está creciendo al ritmo de su sector?",
  },
  inteligencia: {
    nombre: "INTELIGENCIA", emoji: "🟢", urgencia: "OPORTUNIDAD",
    color: "#0D9488",
    bg: "linear-gradient(135deg, #134E4A 0%, #0F766E 100%)",
    tagline: "Tienes bases sólidas. Ahora el crecimiento viene de decidir mejor.",
  },
};

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function ProgressDots({ total, current }) {
  return (
    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 24 : 8, height: 8, borderRadius: 4,
          background: i < current ? "#1B2A4A" : i === current ? "#2563EB" : "#E2E8F0",
          transition: "all 0.3s ease"
        }} />
      ))}
    </div>
  );
}

function RadarBar({ label, value, color, icon, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay + 300);
    return () => clearTimeout(t);
  }, [value, delay]);
  const barColor = value < 35 ? "#DC2626" : value < 60 ? "#D97706" : "#16A34A";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color }}>{icon}</span>{label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: barColor }}>{value}</span>
      </div>
      <div style={{ height: 10, background: "#F1F5F9", borderRadius: 5, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, background: barColor, borderRadius: 5,
          transition: "width 0.9s cubic-bezier(0.34, 1.2, 0.64, 1)" }} />
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function DiagnosticoExpress() {
  const [fase, setFase] = useState("intro");
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState(Array(7).fill(null));
  const [seleccionada, setSeleccionada] = useState(null);
  const [visible, setVisible] = useState(true);
  const [empresa, setEmpresa] = useState("");
  const [sector, setSector] = useState("");

  const resultado = fase === "resultado" ? calcularDiagnostico(respuestas, sector) : null;
  const paqueteInfo = resultado ? PAQUETE_INFO[resultado.paquete] : null;

  const avanzar = () => {
    if (seleccionada === null) return;
    const nuevas = [...respuestas];
    nuevas[preguntaActual] = seleccionada;
    setRespuestas(nuevas);
    if (preguntaActual < PREGUNTAS.length - 1) {
      setVisible(false);
      setTimeout(() => { setPreguntaActual(p => p + 1); setSeleccionada(null); setVisible(true); }, 220);
    } else {
      setFase("resultado");
    }
  };

  const retroceder = () => {
    if (preguntaActual === 0) { setFase("intro"); return; }
    setVisible(false);
    setTimeout(() => { setPreguntaActual(p => p - 1); setSeleccionada(respuestas[preguntaActual - 1]); setVisible(true); }, 200);
  };

  const reiniciar = () => {
    setFase("intro"); setPreguntaActual(0);
    setRespuestas(Array(7).fill(null)); setSeleccionada(null);
    setEmpresa(""); setSector("");
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (fase === "intro") return (
    <div style={{ minHeight: "100vh", background: "#FFFBF5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: 480, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#94A3B8", textTransform: "uppercase", marginBottom: 14 }}>Despacho de Consultoría MiPyme</div>
          <h1 style={{ fontSize: 40, fontWeight: 700, color: "#1B2A4A", margin: "0 0 12px", lineHeight: 1.15 }}>
            Diagnóstico<br /><span style={{ color: "#2563EB" }}>Express</span>
          </h1>
          <p style={{ fontSize: 16, color: "#64748B", margin: 0, lineHeight: 1.7 }}>
            7 preguntas · 4 minutos<br />
            <strong style={{ color: "#1B2A4A" }}>El dolor principal de tu empresa, identificado.</strong>
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: "24px", marginBottom: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Nombre de tu empresa
          </label>
          <input value={empresa} onChange={e => setEmpresa(e.target.value)}
            placeholder="Ej. Distribuidora Central SA"
            style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 15,
              fontFamily: "Georgia", color: "#1E293B", background: "#FAFAFA", outline: "none", boxSizing: "border-box" }} />

          <label style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8, marginTop: 18 }}>
            Sector (opcional — mejora la precisión del resultado)
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["Manufactura","Retail","Consultoría","SaaS","Agroindustria","Turismo"].map(s => (
              <button key={s} onClick={() => setSector(prev => prev === s ? "" : s)}
                style={{ padding: "10px 8px", borderRadius: 8, border: `1.5px solid ${sector === s ? "#2563EB" : "#E2E8F0"}`,
                  background: sector === s ? "#EFF6FF" : "#FAFAFA", color: sector === s ? "#1D4ED8" : "#64748B",
                  fontWeight: sector === s ? 700 : 400, fontSize: 13, cursor: "pointer", fontFamily: "Georgia", transition: "all 0.15s" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setFase("preguntas")}
          style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: "#1B2A4A",
            color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia",
            boxShadow: "0 4px 20px rgba(27,42,74,0.3)", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#2563EB"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,99,235,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#1B2A4A"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(27,42,74,0.3)"; }}>
          Comenzar diagnóstico →
        </button>
        <p style={{ fontSize: 11, color: "#CBD5E1", textAlign: "center", marginTop: 14 }}>Sin registro · Sin correo · Resultado inmediato</p>
      </div>
    </div>
  );

  // ── PREGUNTAS ──────────────────────────────────────────────────────────────
  if (fase === "preguntas") {
    const p = PREGUNTAS[preguntaActual];
    return (
      <div style={{ minHeight: "100vh", background: "#FFFBF5", display: "flex", flexDirection: "column", fontFamily: "Georgia, serif" }}>
        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9" }}>
          <button onClick={retroceder} style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 14, fontFamily: "Georgia", padding: 0 }}>← atrás</button>
          <ProgressDots total={PREGUNTAS.length} current={preguntaActual} />
          <span style={{ fontSize: 12, color: "#94A3B8" }}>{preguntaActual + 1} / {PREGUNTAS.length}</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 24px 0",
          maxWidth: 520, margin: "0 auto", width: "100%",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "all 0.22s ease" }}>

          <div style={{ fontSize: 80, fontWeight: 800, color: "#F1F5F9", lineHeight: 1, marginBottom: -10, userSelect: "none" }}>{p.numero}</div>
          <h2 style={{ fontSize: 21, fontWeight: 700, color: "#1B2A4A", margin: "0 0 8px", lineHeight: 1.4 }}>{p.pregunta}</h2>
          <p style={{ fontSize: 14, color: "#94A3B8", margin: "0 0 26px", fontStyle: "italic", lineHeight: 1.5 }}>{p.subtexto}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {p.opciones.map((op, idx) => (
              <button key={idx} onClick={() => setSeleccionada(idx)}
                style={{ padding: "15px 18px", borderRadius: 12, border: `2px solid ${seleccionada === idx ? "#2563EB" : "#E2E8F0"}`,
                  background: seleccionada === idx ? "#EFF6FF" : "#fff",
                  color: seleccionada === idx ? "#1E3A8A" : "#374151",
                  textAlign: "left", cursor: "pointer", fontSize: 14, fontFamily: "Georgia",
                  fontWeight: seleccionada === idx ? 700 : 400, lineHeight: 1.45, transition: "all 0.15s",
                  boxShadow: seleccionada === idx ? "0 0 0 4px rgba(37,99,235,0.1)" : "none",
                  display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${seleccionada === idx ? "#2563EB" : "#CBD5E1"}`,
                  background: seleccionada === idx ? "#2563EB" : "transparent",
                  flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {seleccionada === idx && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "block" }} />}
                </span>
                {op.texto}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 24px", maxWidth: 520, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
          <button onClick={avanzar} disabled={seleccionada === null}
            style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none",
              background: seleccionada !== null ? "#1B2A4A" : "#E2E8F0",
              color: seleccionada !== null ? "#fff" : "#94A3B8",
              fontSize: 16, fontWeight: 700, cursor: seleccionada !== null ? "pointer" : "not-allowed",
              fontFamily: "Georgia", transition: "all 0.2s",
              boxShadow: seleccionada !== null ? "0 4px 16px rgba(27,42,74,0.25)" : "none" }}>
            {preguntaActual === PREGUNTAS.length - 1 ? "Ver mi diagnóstico →" : "Siguiente →"}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTADO ──────────────────────────────────────────────────────────────
  if (fase === "resultado" && resultado && paqueteInfo) {
    const { scores, global, dolorPrincipal, dolorSecundario, hallazgo, paquete, crisisFlags, insightSect, cta } = resultado;
    const dimPpal = DIM_META[dolorPrincipal];
    const dimSec = DIM_META[dolorSecundario];

    return (
      <div style={{ minHeight: "100vh", background: "#FFFBF5", fontFamily: "Georgia, serif" }}>

        {/* HEADER */}
        <div style={{ background: paqueteInfo.bg, padding: "32px 24px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", marginBottom: 12 }}>
            {empresa || "Tu empresa"}{sector ? ` · ${sector}` : ""}
          </div>
          <span style={{ display: "inline-block", background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "4px 16px", fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: 3, textTransform: "uppercase", marginBottom: 18 }}>
            {paqueteInfo.urgencia}
          </span>
          <div style={{ fontSize: 80, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{global}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 18 }}>score global / 100</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>{paqueteInfo.emoji} Paquete {paqueteInfo.nombre}</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "8px 0 0", fontStyle: "italic" }}>{paqueteInfo.tagline}</p>
        </div>

        <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px" }}>

          {/* DOLOR PRINCIPAL — AJUSTE 3: hallazgo específico */}
          <div style={{ background: "#fff", borderRadius: 16, border: `2px solid ${dimPpal.color}25`, padding: "22px", marginBottom: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: dimPpal.color, fontWeight: 800, marginBottom: 10 }}>
              {dimPpal.icon} Dolor principal · {dimPpal.label}
            </div>
            <p style={{ fontSize: 15, color: "#1E293B", lineHeight: 1.7, margin: 0 }}>{hallazgo}</p>
            {scores[dolorSecundario] < 55 && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed #E2E8F0", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>También en alerta:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: dimSec.color }}>{dimSec.icon} {dimSec.label}</span>
                <span style={{ fontSize: 11, background: "#FEF3C7", color: "#D97706", borderRadius: 10, padding: "1px 8px", fontWeight: 700 }}>{scores[dolorSecundario]}/100</span>
              </div>
            )}
          </div>

          {/* INSIGHT SECTORIAL — AJUSTE 5 */}
          {insightSect && (
            <div style={{ background: "#F0FDF4", borderRadius: 12, border: "1px solid #BBF7D0", padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#16A34A", fontWeight: 800, marginBottom: 8 }}>
                💡 Dato de tu sector · {sector}
              </div>
              <p style={{ fontSize: 13, color: "#15803D", lineHeight: 1.6, margin: 0 }}>{insightSect}</p>
            </div>
          )}

          {/* RADAR */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: "22px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#94A3B8", fontWeight: 700, marginBottom: 18 }}>Mapa de salud empresarial</div>
            {Object.entries(DIM_META).map(([k, meta], i) => (
              <RadarBar key={k} label={meta.label} value={scores[k]} color={meta.color} icon={meta.icon} delay={i * 100} />
            ))}
          </div>

          {/* CTA PERSONALIZADO — AJUSTE 4 */}
          <div style={{ background: "#1B2A4A", borderRadius: 16, padding: "22px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#93C5FD", fontWeight: 700, marginBottom: 6 }}>El siguiente paso</div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 0 18px", fontStyle: "italic" }}>{cta.sub}</p>
            <button style={{ width: "100%", padding: "15px", borderRadius: 10, border: "none",
              background: paqueteInfo.color === "#DC2626" ? "#DC2626" : paqueteInfo.color === "#D97706" ? "#D97706" : paqueteInfo.color === "#2563EB" ? "#2563EB" : "#0D9488",
              color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia",
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
              {cta.titulo} →
            </button>
          </div>

          {/* QUÉ INCLUYE */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "#94A3B8", fontWeight: 700, marginBottom: 14 }}>El diagnóstico completo incluye</div>
            {[
              ["DQN", "35 KPIs medidos con tus datos reales", "#2563EB"],
              ["DQL", "49 factores organizacionales en entrevista de 90 min", "#7C3AED"],
              ["DQS", `Benchmark contra tu sector: ${sector || "los 6 sectores disponibles"}`, "#0D9488"],
              ["Plan", "Ruta de solución priorizada con paquete de servicios activado", "#1B2A4A"],
            ].map(([tag, desc, col]) => (
              <div key={tag} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 11 }}>
                <span style={{ background: col, color: "#fff", borderRadius: 5, padding: "2px 8px", fontSize: 10, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{tag}</span>
                <span style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{desc}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, color: "#CBD5E1", textAlign: "center", lineHeight: 1.7, margin: "0 0 16px" }}>
            Este diagnóstico express identifica el dolor principal con ~80% de certeza.<br />
            El diagnóstico tridimensional completo lo confirma con datos reales.
          </p>

          <button onClick={reiniciar} style={{ width: "100%", padding: "12px", borderRadius: 10,
            border: "1.5px solid #E2E8F0", background: "transparent", color: "#94A3B8",
            fontSize: 14, cursor: "pointer", fontFamily: "Georgia" }}>
            ↺ Nuevo diagnóstico
          </button>
        </div>
      </div>
    );
  }

  return null;
}
