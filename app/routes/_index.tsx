import { useState } from "react";

const models = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama-guard-3-8b",
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
  "whisper-large-v3",
  "whisper-large-v3-turbo",
  "qwen-2.5-32b",
  "deepseek-r1-distill-qwen-32b",
  "deepseek-r1-distill-llama-70b-specdec",
  "deepseek-r1-distill-llama-70b",
  "llama-3.3-70b-specdec",
  "llama-3.2-1b-preview",
  "llama-3.2-3b-preview",
  "llama-3.2-11b-vision-preview",
  "llama-3.2-90b-vision-preview",
];

export default function Index() {
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [temperature, setTemperature] = useState(1);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [stream, setStream] = useState(false);
  const [jsonMode, setJsonMode] = useState(false);
  const [moderation, setModeration] = useState(false);
  const [topP, setTopP] = useState(1);
  const [seed, setSeed] = useState("");
  const [stopSequence, setStopSequence] = useState("");
  const [viewCode, setViewCode] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [codeFormat, setCodeFormat] = useState("python");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    const res = await fetch("https://tiny-tallulah-unsungfields-03d169d3.koyeb.app/generate-text/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        prompt,
        max_tokens: maxTokens,
        temperature,
        stream,
        json_mode: jsonMode,
        moderation,
        top_p: topP,
        seed: seed ? Number(seed) : null,
        stop: stopSequence || null,
      }),
    });

    if (stream) {
      const reader = res.body?.getReader();
      if (!reader) {
        setLoading(false);
        setResponse("Error: Streaming not supported.");
        return;
      }
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setResponse(fullText);
      }
    } else {
      const data = await res.json();
      setResponse(data.choices?.[0]?.message?.content || "Error fetching response");
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white p-4 shadow-md flex flex-col">
        <h1 className="text-lg font-bold mb-4">Unsungfields<span className="text-red-500"> Cloud</span></h1>
        <nav className="flex flex-col gap-3">
          <a href="#" className="text-red-500 font-medium">Playground</a>
          <a href="#" className="text-gray-600">Documentation</a>
          <a href="#" className="text-gray-600">Metrics</a>
          <a href="#" className="text-gray-600">API Keys</a>
          <a href="#" className="text-gray-600">Settings</a>
        </nav>
      </div>
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Playground</h2>
          <button onClick={() => setViewCode(!viewCode)} className="bg-gray-500 text-white p-2 rounded">
            {viewCode ? "Hide Code" : "View Code"}
          </button>
        </div>
        <div className="flex-1 bg-white shadow-md rounded p-4 mt-4">
          {response ? <div className="p-4 border rounded bg-gray-100">{response}</div> : <p className="text-gray-400 text-center">Enter a prompt to get started.</p>}
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col">
          <textarea className="border p-2 rounded w-full" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Type your message..." />
          <div className="mt-4 p-4 bg-white rounded shadow-md">
            <h3 className="font-bold mb-2">Parameters</h3>
            <label>Temperature: <input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} /></label>
            <label>Max Tokens: <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} /></label>
            <label>Stream: <input type="checkbox" checked={stream} onChange={() => setStream(!stream)} /></label>
            <label>JSON Mode: <input type="checkbox" checked={jsonMode} onChange={() => setJsonMode(!jsonMode)} /></label>
            <button type="button" onClick={() => setAdvancedOpen(!advancedOpen)}>Advanced Settings</button>
            {advancedOpen && (
              <>
                <label>Moderation: <input type="checkbox" checked={moderation} onChange={() => setModeration(!moderation)} /></label>
                <label>Top P: <input type="range" value={topP} onChange={(e) => setTopP(Number(e.target.value))} /></label>
                <label>Seed: <input type="text" value={seed} onChange={(e) => setSeed(e.target.value)} /></label>
                <label>Stop Sequence: <input type="text" value={stopSequence} onChange={(e) => setStopSequence(e.target.value)} /></label>
              </>
            )}
          </div>
          <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded">{loading ? "Generating..." : "Submit"}</button>
        </form>
      </div>
    </div>
  );
}
