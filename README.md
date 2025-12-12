# 💻 Below_the_Surface: Un Viaje a la Soberanía Digital

Este proyecto es una **plataforma interactiva de educación y análisis** que simula una terminal de seguridad. Su objetivo es sumergir al usuario en los temas críticos que definen el futuro de Internet, centrándose en la **soberanía individual, la ciberseguridad avanzada y la descentralización**.

## 🌐 Temática Central de la Web

La web se estructura en módulos de contenido que exploran lo que realmente sucede "debajo de la superficie" de la tecnología moderna:

* **Ciberseguridad Práctica:** Guías esenciales sobre 2FA, gestores de contraseñas y hábitos de navegación segura.
* **Anonimato y Privacidad:** Exploración profunda del uso de VPNs, el Internet Profundo (Deep Web) y la tecnología Tor.
* **Descentralización y el Futuro:** Análisis de las tecnologías Web3, Blockchain, criptomonedas y los riesgos del control centralizado (como las CBDC).
* **Amenazas de la IA:** Discusión sobre Deepfakes, fraude por IA y la vigilancia masiva.

## ⭐ El Analista Central: Mole AI

El núcleo interactivo de la plataforma es **Mole AI**, un Analista de Inteligencia Artificial integrado en la terminal. Mole AI está diseñado para responder a las dudas del usuario y guiarlo a través del contenido de la web con un tono experto y conciso.

### 🧠 ¿Cómo funciona Mole AI?

Mole AI no utiliza respuestas pre-escritas. Su inteligencia proviene de la **API de Google Gemini**, integrada de forma segura a través de Netlify Functions (un *backend serverless*). Esto permite a Mole:

1. **Respuesta Dinámica:** Responder con precisión a cualquier pregunta de tecnología o seguridad digital.
2. **Tono Experto:** Mantener un rol como analista, proporcionando consejos prácticos y fiables.

### ⚙️ Funcionalidad Interactiva

Mole AI opera en dos modos clave:

1. **Modo de Diálogo Abierto:** Mole responde a cualquier consulta del usuario, actuando como un asistente de conocimiento infinito.
2. **Modo de Evaluación (`TEST`):** El usuario puede escribir el comando `TEST` para desbloquear una evaluación de seguridad. Al completarla, Mole calcula el "Nivel de Protección Digital" y ofrece consejos de mejora personalizados.

## 🛠️ Estructura Técnica

La arquitectura del proyecto está dividida para garantizar la seguridad de la clave API:

| Archivo/Carpeta | Rol | Descripción |
| :--- | :--- | :--- |
| `index.html` / `style.css` | Frontend (UI) | Estructura de la web y estética de la terminal. |
| `mole_script.js` | Frontend (Lógica) | Maneja el chat, el test, y la llamada de red (`fetch`) al backend. |
| `netlify/` | **Backend Seguro (Netlify Functions)** | Contiene el código Node.js (`gemini.js`) que usa la clave API para hablar con Gemini. |
| `package.json` | Dependencias | Define la librería del SDK de Google Gemini para su instalación en Netlify. |

## 🚀 Despliegue

Este proyecto se despliega en **Netlify** para habilitar la funcionalidad de las Netlify Functions, lo cual es esencial para conectar de forma segura el frontend con la API de Gemini.
